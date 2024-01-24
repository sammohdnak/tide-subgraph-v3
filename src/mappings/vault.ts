import { BigInt, Bytes, log } from "@graphprotocol/graph-ts"
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
import { ZERO_BI } from "../helpers/constants"
import { createPoolSnapshot, createPoolToken, createRateProvider, loadPoolToken } from "../helpers/entities"

/************************************
 ******* POOLS REGISTRATIONS ********
 ************************************/

export function handlePoolRegistered(event: PoolRegisteredEvent): void {
  const poolAddress = event.params.pool;

  let pool = new Pool(poolAddress)
  pool.factory = event.params.factory
  pool.tokensList = changetype<Bytes[]>(event.params.tokens)
  pool.rateProvidersList = changetype<Bytes[]>(event.params.rateProviders)
  pool.pauseWindowEndTime = event.params.pauseWindowEndTime
  pool.pauseManager = event.params.pauseManager
  pool.totalShares = ZERO_BI

  pool.blockNumber = event.block.number
  pool.blockTimestamp = event.block.timestamp
  pool.transactionHash = event.transaction.hash

  pool.save();

  for (let i: i32 = 0; i < pool.tokensList.length; i++) {
    let tokenAddress = event.params.tokens[i];
    let rateProviderAddress = event.params.rateProviders[i];
    createPoolToken(poolAddress, tokenAddress);
    createRateProvider(poolAddress, tokenAddress, rateProviderAddress);
  }

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

  let tokensList = pool.tokensList;

  let joinId = transactionHash.toHexString().concat(logIndex.toString());
  let join = new JoinExit(joinId);

  let poolTokens = pool.tokens.load();
  let joinAmounts = new Array<BigInt>(amounts.length);

  for (let i: i32 = 0; i < poolTokens.length; i++) {
    joinAmounts[i] = event.params.deltas[i];

    let poolToken = poolTokens[i];
    poolToken.balance = poolToken.balance.plus(joinAmounts[i]);
    poolToken.save();
  }

  join.type = 'Join';
  join.sender = event.params.liquidityProvider;
  join.amounts = joinAmounts;
  join.pool = poolAddress;
  join.user = event.params.liquidityProvider.toHex();
  join.blockTimestamp = event.block.timestamp;
  join.save();

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

  let tokensList = pool.tokensList;

  let exitId = transactionHash.toHexString().concat(logIndex.toString());
  let exit = new JoinExit(exitId);

  let poolTokens = pool.tokens.load();
  let exitAmounts = new Array<BigInt>(amounts.length);

  for (let i: i32 = 0; i < poolTokens.length; i++) {
    exitAmounts[i] = event.params.deltas[i].neg();

    let poolToken = poolTokens[i];
    poolToken.balance = poolToken.balance.minus(exitAmounts[i]);
    poolToken.save();
  }

  exit.type = 'Exit';
  exit.sender = event.params.liquidityProvider;
  exit.amounts = exitAmounts;
  exit.pool = poolAddress;
  exit.user = event.params.liquidityProvider.toHex();
  exit.blockTimestamp = event.block.timestamp;
  exit.save();

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
