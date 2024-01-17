import {
  PoolBalanceChanged as PoolBalanceChangedEvent,
  PoolRegistered as PoolRegisteredEvent,
  Swap as SwapEvent,
} from "../../generated/Vault/Vault"
import {
  PoolBalanceChanged,
  PoolRegistered,
  Swap,
} from "../../generated/schema"

export function handlePoolBalanceChanged(event: PoolBalanceChangedEvent): void {
  let entity = new PoolBalanceChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pool = event.params.pool
  entity.liquidityProvider = event.params.liquidityProvider
  entity.tokens = event.params.tokens
  entity.deltas = event.params.deltas

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePoolRegistered(event: PoolRegisteredEvent): void {
  let entity = new PoolRegistered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pool = event.params.pool
  entity.factory = event.params.factory
  entity.tokens = event.params.tokens
  entity.rateProviders = event.params.rateProviders

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSwap(event: SwapEvent): void {
  let entity = new Swap(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pool = event.params.pool
  entity.tokenIn = event.params.tokenIn
  entity.tokenOut = event.params.tokenOut
  entity.amountIn = event.params.amountIn
  entity.amountOut = event.params.amountOut
  entity.swapFeeAmount = event.params.swapFeeAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
