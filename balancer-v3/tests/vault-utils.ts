import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  AuthorizerChanged,
  ExternalBalanceTransfer,
  FlashLoan,
  InternalBalanceChanged,
  PausedStateChanged,
  PoolBalanceChanged,
  PoolBalanceManaged,
  PoolRegistered,
  RelayerApprovalChanged,
  Swap,
  TokensDeregistered,
  TokensRegistered
} from "../generated/Vault/Vault"

export function createAuthorizerChangedEvent(
  newAuthorizer: Address
): AuthorizerChanged {
  let authorizerChangedEvent = changetype<AuthorizerChanged>(newMockEvent())

  authorizerChangedEvent.parameters = new Array()

  authorizerChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAuthorizer",
      ethereum.Value.fromAddress(newAuthorizer)
    )
  )

  return authorizerChangedEvent
}

export function createExternalBalanceTransferEvent(
  token: Address,
  sender: Address,
  recipient: Address,
  amount: BigInt
): ExternalBalanceTransfer {
  let externalBalanceTransferEvent = changetype<ExternalBalanceTransfer>(
    newMockEvent()
  )

  externalBalanceTransferEvent.parameters = new Array()

  externalBalanceTransferEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  externalBalanceTransferEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  externalBalanceTransferEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )
  externalBalanceTransferEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return externalBalanceTransferEvent
}

export function createFlashLoanEvent(
  recipient: Address,
  token: Address,
  amount: BigInt,
  feeAmount: BigInt
): FlashLoan {
  let flashLoanEvent = changetype<FlashLoan>(newMockEvent())

  flashLoanEvent.parameters = new Array()

  flashLoanEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )
  flashLoanEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  flashLoanEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  flashLoanEvent.parameters.push(
    new ethereum.EventParam(
      "feeAmount",
      ethereum.Value.fromUnsignedBigInt(feeAmount)
    )
  )

  return flashLoanEvent
}

export function createInternalBalanceChangedEvent(
  user: Address,
  token: Address,
  delta: BigInt
): InternalBalanceChanged {
  let internalBalanceChangedEvent = changetype<InternalBalanceChanged>(
    newMockEvent()
  )

  internalBalanceChangedEvent.parameters = new Array()

  internalBalanceChangedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  internalBalanceChangedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  internalBalanceChangedEvent.parameters.push(
    new ethereum.EventParam("delta", ethereum.Value.fromSignedBigInt(delta))
  )

  return internalBalanceChangedEvent
}

export function createPausedStateChangedEvent(
  paused: boolean
): PausedStateChanged {
  let pausedStateChangedEvent = changetype<PausedStateChanged>(newMockEvent())

  pausedStateChangedEvent.parameters = new Array()

  pausedStateChangedEvent.parameters.push(
    new ethereum.EventParam("paused", ethereum.Value.fromBoolean(paused))
  )

  return pausedStateChangedEvent
}

export function createPoolBalanceChangedEvent(
  poolId: Bytes,
  liquidityProvider: Address,
  tokens: Array<Address>,
  deltas: Array<BigInt>,
  protocolFeeAmounts: Array<BigInt>
): PoolBalanceChanged {
  let poolBalanceChangedEvent = changetype<PoolBalanceChanged>(newMockEvent())

  poolBalanceChangedEvent.parameters = new Array()

  poolBalanceChangedEvent.parameters.push(
    new ethereum.EventParam("poolId", ethereum.Value.fromFixedBytes(poolId))
  )
  poolBalanceChangedEvent.parameters.push(
    new ethereum.EventParam(
      "liquidityProvider",
      ethereum.Value.fromAddress(liquidityProvider)
    )
  )
  poolBalanceChangedEvent.parameters.push(
    new ethereum.EventParam("tokens", ethereum.Value.fromAddressArray(tokens))
  )
  poolBalanceChangedEvent.parameters.push(
    new ethereum.EventParam(
      "deltas",
      ethereum.Value.fromSignedBigIntArray(deltas)
    )
  )
  poolBalanceChangedEvent.parameters.push(
    new ethereum.EventParam(
      "protocolFeeAmounts",
      ethereum.Value.fromUnsignedBigIntArray(protocolFeeAmounts)
    )
  )

  return poolBalanceChangedEvent
}

export function createPoolBalanceManagedEvent(
  poolId: Bytes,
  assetManager: Address,
  token: Address,
  cashDelta: BigInt,
  managedDelta: BigInt
): PoolBalanceManaged {
  let poolBalanceManagedEvent = changetype<PoolBalanceManaged>(newMockEvent())

  poolBalanceManagedEvent.parameters = new Array()

  poolBalanceManagedEvent.parameters.push(
    new ethereum.EventParam("poolId", ethereum.Value.fromFixedBytes(poolId))
  )
  poolBalanceManagedEvent.parameters.push(
    new ethereum.EventParam(
      "assetManager",
      ethereum.Value.fromAddress(assetManager)
    )
  )
  poolBalanceManagedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  poolBalanceManagedEvent.parameters.push(
    new ethereum.EventParam(
      "cashDelta",
      ethereum.Value.fromSignedBigInt(cashDelta)
    )
  )
  poolBalanceManagedEvent.parameters.push(
    new ethereum.EventParam(
      "managedDelta",
      ethereum.Value.fromSignedBigInt(managedDelta)
    )
  )

  return poolBalanceManagedEvent
}

export function createPoolRegisteredEvent(
  poolId: Bytes,
  poolAddress: Address,
  specialization: i32
): PoolRegistered {
  let poolRegisteredEvent = changetype<PoolRegistered>(newMockEvent())

  poolRegisteredEvent.parameters = new Array()

  poolRegisteredEvent.parameters.push(
    new ethereum.EventParam("poolId", ethereum.Value.fromFixedBytes(poolId))
  )
  poolRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "poolAddress",
      ethereum.Value.fromAddress(poolAddress)
    )
  )
  poolRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "specialization",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(specialization))
    )
  )

  return poolRegisteredEvent
}

export function createRelayerApprovalChangedEvent(
  relayer: Address,
  sender: Address,
  approved: boolean
): RelayerApprovalChanged {
  let relayerApprovalChangedEvent = changetype<RelayerApprovalChanged>(
    newMockEvent()
  )

  relayerApprovalChangedEvent.parameters = new Array()

  relayerApprovalChangedEvent.parameters.push(
    new ethereum.EventParam("relayer", ethereum.Value.fromAddress(relayer))
  )
  relayerApprovalChangedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  relayerApprovalChangedEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return relayerApprovalChangedEvent
}

export function createSwapEvent(
  poolId: Bytes,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: BigInt,
  amountOut: BigInt
): Swap {
  let swapEvent = changetype<Swap>(newMockEvent())

  swapEvent.parameters = new Array()

  swapEvent.parameters.push(
    new ethereum.EventParam("poolId", ethereum.Value.fromFixedBytes(poolId))
  )
  swapEvent.parameters.push(
    new ethereum.EventParam("tokenIn", ethereum.Value.fromAddress(tokenIn))
  )
  swapEvent.parameters.push(
    new ethereum.EventParam("tokenOut", ethereum.Value.fromAddress(tokenOut))
  )
  swapEvent.parameters.push(
    new ethereum.EventParam(
      "amountIn",
      ethereum.Value.fromUnsignedBigInt(amountIn)
    )
  )
  swapEvent.parameters.push(
    new ethereum.EventParam(
      "amountOut",
      ethereum.Value.fromUnsignedBigInt(amountOut)
    )
  )

  return swapEvent
}

export function createTokensDeregisteredEvent(
  poolId: Bytes,
  tokens: Array<Address>
): TokensDeregistered {
  let tokensDeregisteredEvent = changetype<TokensDeregistered>(newMockEvent())

  tokensDeregisteredEvent.parameters = new Array()

  tokensDeregisteredEvent.parameters.push(
    new ethereum.EventParam("poolId", ethereum.Value.fromFixedBytes(poolId))
  )
  tokensDeregisteredEvent.parameters.push(
    new ethereum.EventParam("tokens", ethereum.Value.fromAddressArray(tokens))
  )

  return tokensDeregisteredEvent
}

export function createTokensRegisteredEvent(
  poolId: Bytes,
  tokens: Array<Address>,
  assetManagers: Array<Address>
): TokensRegistered {
  let tokensRegisteredEvent = changetype<TokensRegistered>(newMockEvent())

  tokensRegisteredEvent.parameters = new Array()

  tokensRegisteredEvent.parameters.push(
    new ethereum.EventParam("poolId", ethereum.Value.fromFixedBytes(poolId))
  )
  tokensRegisteredEvent.parameters.push(
    new ethereum.EventParam("tokens", ethereum.Value.fromAddressArray(tokens))
  )
  tokensRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "assetManagers",
      ethereum.Value.fromAddressArray(assetManagers)
    )
  )

  return tokensRegisteredEvent
}
