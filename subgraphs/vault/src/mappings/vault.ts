import { BigDecimal, BigInt, Bytes, log } from "@graphprotocol/graph-ts"
import {
  PoolBalanceChanged as PoolBalanceChangedEvent,
  PoolRegistered as PoolRegisteredEvent,
  Swap as SwapEvent,
} from "../types/Vault/Vault"
import {
  Pool,
  Swap,
  JoinExit
} from "../types/schema"
import { ZERO_BD, ZERO_BI } from "../helpers/constants"
import { createPoolSnapshot } from "../helpers/entities"

/************************************
 ******* POOLS REGISTRATIONS ********
 ************************************/

export function handlePoolRegistered(event: PoolRegisteredEvent): void {
  let pool = new Pool(event.params.pool)
  pool.factory = event.params.factory
  pool.tokens = changetype<Bytes[]>(event.params.tokens)
  pool.rateProviders = changetype<Bytes[]>(event.params.rateProviders)
  pool.balances = new Array<BigInt>(event.params.tokens.length)
  pool.pauseWindowEndTime = event.params.pauseWindowEndTime
  pool.pauseManager = event.params.pauseManager
  pool.totalShares = ZERO_BD

  pool.blockNumber = event.block.number
  pool.blockTimestamp = event.block.timestamp
  pool.transactionHash = event.transaction.hash

  pool.save();

  createPoolSnapshot(pool, event.block.timestamp.toI32());
}

/************************************
 ****** DEPOSITS & WITHDRAWALS ******
 ************************************/

 export function handlePoolBalanceChanged(event: PoolBalanceChangedEvent): void {
  let amounts: BigInt[] = event.params.deltas;

  if (amounts.length === 0) {
    return;
  }

  let total: BigInt = amounts.reduce<BigInt>((sum, amount) => sum.plus(amount), new BigInt(0));
  if (total.gt(ZERO_BI)) {
    handlePoolJoined(event);
  } else {
    handlePoolExited(event);
  }
}

function handlePoolJoined(event: PoolBalanceChangedEvent): void {
  let poolAddress = event.params.pool;
  let amounts: BigInt[] = event.params.deltas;

  let transactionHash = event.transaction.hash;
  let logIndex = event.logIndex;

  let pool = Pool.load(poolAddress);
  if (pool == null) {
    log.warning('Pool not found in handlePoolJoined: {} {}', [poolAddress.toHex(), transactionHash.toHex()]);
    return;
  }

  let tokenAddresses = pool.tokens;

  let joinId = transactionHash.toHexString().concat(logIndex.toString());
  let join = new JoinExit(joinId);

  let poolBalances = pool.balances;
  let joinAmounts = new Array<BigInt>(amounts.length);

  for (let i: i32 = 0; i < tokenAddresses.length; i++) {
    joinAmounts[i] = event.params.deltas[i];
    poolBalances[i] = poolBalances[i].plus(joinAmounts[i]);
  }

  join.type = 'Join';
  join.sender = event.params.liquidityProvider;
  join.amounts = joinAmounts;
  join.pool = poolAddress;
  join.user = event.params.liquidityProvider.toHex();
  join.blockTimestamp = event.block.timestamp;
  join.save();

  pool.balances = poolBalances;
  pool.save();

  createPoolSnapshot(pool, event.block.timestamp.toI32());
}

function handlePoolExited(event: PoolBalanceChangedEvent): void {
  let poolAddress = event.params.pool;
  let amounts: BigInt[] = event.params.deltas;

  let transactionHash = event.transaction.hash;
  let logIndex = event.logIndex;

  let pool = Pool.load(poolAddress);
  if (pool == null) {
    log.warning('Pool not found in handlePoolJoined: {} {}', [poolAddress.toHex(), transactionHash.toHex()]);
    return;
  }

  let tokenAddresses = pool.tokens;

  let exitId = transactionHash.toHexString().concat(logIndex.toString());
  let exit = new JoinExit(exitId);

  let poolBalances = pool.balances;
  let exitAmounts = new Array<BigInt>(amounts.length);

  for (let i: i32 = 0; i < tokenAddresses.length; i++) {
    exitAmounts[i] = event.params.deltas[i].neg();
    poolBalances[i] = poolBalances[i].minus(exitAmounts[i]);
  }

  exit.type = 'Exit';
  exit.sender = event.params.liquidityProvider;
  exit.amounts = exitAmounts;
  exit.pool = poolAddress;
  exit.user = event.params.liquidityProvider.toHex();
  exit.blockTimestamp = event.block.timestamp;
  exit.save();

  pool.balances = poolBalances;
  pool.save();

  createPoolSnapshot(pool, event.block.timestamp.toI32());
}

/************************************
 ************** SWAPS ***************
 ************************************/

export function handleSwap(event: SwapEvent): void {
  let swap = new Swap(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  swap.pool = event.params.pool
  swap.tokenIn = event.params.tokenIn
  swap.tokenOut = event.params.tokenOut
  swap.tokenAmountIn = event.params.amountIn
  swap.tokenAmountOut = event.params.amountOut
  swap.swapFeeAmount = event.params.swapFeeAmount

  swap.blockNumber = event.block.number
  swap.blockTimestamp = event.block.timestamp
  swap.transactionHash = event.transaction.hash

  swap.save();

  let pool = Pool.load(event.params.pool);
  if (pool == null) {
    log.warning('Pool not found in handleSwap: {} {}', [event.params.pool.toHex(), event.transaction.hash.toHex()]);
    return;
  }

  createPoolSnapshot(pool, event.block.timestamp.toI32());
}
