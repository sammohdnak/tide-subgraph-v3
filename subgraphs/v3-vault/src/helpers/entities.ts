import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Buffer,
  Pool,
  PoolSnapshot,
  PoolToken,
  RateProvider,
  Token,
  User,
  Vault,
} from "../types/schema";
import { PoolShare } from "../types/schema";
import { ONE_BD, ZERO_ADDRESS, ZERO_BD } from "./constants";
import { PoolRegisteredTokenConfigStruct } from "../types/Vault/Vault";
import { ERC20 } from "../types/Vault/ERC20";
import { VaultExtension } from "../types/Vault/VaultExtension";
import { scaleDown } from "./misc";

const DAY = 24 * 60 * 60;

export function getVault(vaultAddress: Bytes): Vault {
  let vault: Vault | null = Vault.load(vaultAddress);
  if (vault != null) return vault;

  let vaultContract = VaultExtension.bind(changetype<Address>(vaultAddress));
  let protocolFeeControllerCall = vaultContract.try_getProtocolFeeController();

  vault = new Vault(vaultAddress);
  vault.isPaused = false;
  vault.authorizer = ZERO_ADDRESS;
  vault.protocolSwapFee = ZERO_BD;
  vault.protocolYieldFee = ZERO_BD;
  vault.protocolFeeController = protocolFeeControllerCall.reverted
    ? ZERO_ADDRESS
    : protocolFeeControllerCall.value;
  vault.save();

  return vault;
}

export function getPoolShareId(
  poolAddress: Address,
  userAddress: Address
): string {
  return poolAddress.toHex().concat("-").concat(userAddress.toHex());
}

export function getPoolShare(
  poolAddress: Address,
  userAddress: Address
): PoolShare {
  let poolShareId = getPoolShareId(poolAddress, userAddress);
  let poolShare = PoolShare.load(poolShareId);

  if (!poolShare) {
    poolShare = createPoolShare(poolAddress, userAddress);
  }

  return poolShare;
}

export function createPoolSnapshot(pool: Pool, timestamp: i32): void {
  let poolAddress = pool.id;
  let dayTimestamp = timestamp - (timestamp % DAY);

  let snapshotId = poolAddress.toHex() + "-" + dayTimestamp.toString();
  let snapshot = PoolSnapshot.load(snapshotId);

  if (!snapshot) {
    snapshot = new PoolSnapshot(snapshotId);
  }

  let poolTokens = pool.tokens.load();
  let balances = new Array<BigDecimal>(poolTokens.length);
  let totalSwapFees = new Array<BigDecimal>(poolTokens.length);
  let totalSwapVolumes = new Array<BigDecimal>(poolTokens.length);
  let totalProtocolSwapFees = new Array<BigDecimal>(poolTokens.length);
  let totalProtocolYieldFees = new Array<BigDecimal>(poolTokens.length);
  for (let i = 0; i < poolTokens.length; i++) {
    totalSwapVolumes[i] = poolTokens[i].volume;
    balances[i] = poolTokens[i].balance;
    totalSwapFees[i] = poolTokens[i].totalProtocolSwapFee;
    totalProtocolSwapFees[i] = poolTokens[i].totalProtocolSwapFee;
    totalProtocolYieldFees[i] = poolTokens[i].totalProtocolYieldFee;
  }

  snapshot.pool = poolAddress;
  snapshot.balances = balances;
  snapshot.timestamp = dayTimestamp;
  snapshot.swapsCount = pool.swapsCount;
  snapshot.totalShares = pool.totalShares;
  snapshot.holdersCount = pool.holdersCount;
  snapshot.totalSwapFees = totalSwapFees;
  snapshot.totalSwapVolumes = totalSwapVolumes;
  snapshot.totalProtocolSwapFees = totalProtocolSwapFees;
  snapshot.totalProtocolYieldFees = totalProtocolYieldFees;
  snapshot.save();
}

export function createPoolToken(
  poolAddress: Address,
  tokenConfig: PoolRegisteredTokenConfigStruct,
  index: i32
): void {
  let poolTokenId = poolAddress.concat(tokenConfig.token);
  let poolToken = PoolToken.load(poolTokenId);

  if (!poolToken) {
    poolToken = new PoolToken(poolTokenId);
  }

  let nestedPool = Pool.load(tokenConfig.token);

  let token = getToken(tokenConfig.token);

  poolToken.name = token.name;
  poolToken.symbol = token.symbol;
  poolToken.decimals = token.decimals;

  let buffer = Buffer.load(tokenConfig.token);

  let decimalDiff = 18 - poolToken.decimals;
  poolToken.scalingFactor = BigInt.fromI32(10).pow(u8(decimalDiff));

  poolToken.pool = poolAddress;
  poolToken.address = tokenConfig.token;
  poolToken.index = index;
  poolToken.priceRate = ONE_BD;
  poolToken.balance = ZERO_BD;
  poolToken.volume = ZERO_BD;
  poolToken.totalProtocolSwapFee = ZERO_BD;
  poolToken.totalProtocolYieldFee = ZERO_BD;
  poolToken.buffer = buffer ? buffer.id : null;
  poolToken.nestedPool = nestedPool ? nestedPool.id : null;
  poolToken.paysYieldFees = tokenConfig.paysYieldFees;
  poolToken.save();
}

export function createRateProvider(
  poolAddress: Address,
  tokenConfig: PoolRegisteredTokenConfigStruct
): void {
  let rateProviderId = poolAddress
    .concat(tokenConfig.token)
    .concat(tokenConfig.rateProvider);
  let rateProvider = RateProvider.load(rateProviderId);

  if (!rateProvider) {
    rateProvider = new RateProvider(rateProviderId);
  }

  rateProvider.pool = poolAddress;
  rateProvider.address = tokenConfig.rateProvider;
  rateProvider.token = poolAddress.concat(tokenConfig.token);
  rateProvider.save();
}

export function loadPoolToken(
  poolAddress: Address,
  tokenAddress: Address
): PoolToken {
  let poolTokenId = poolAddress.concat(tokenAddress);
  let poolToken = PoolToken.load(poolTokenId) as PoolToken;

  return poolToken;
}

export function createUser(userAddress: Address): void {
  let user = User.load(userAddress);

  if (!user) {
    user = new User(userAddress);
    user.save();
  }
}

export function createToken(tokenAddress: Address): void {
  let tokenContract = ERC20.bind(tokenAddress);

  let nameCall = tokenContract.try_name();
  let symbolCall = tokenContract.try_symbol();
  let decimalsCall = tokenContract.try_decimals();

  let token = new Token(tokenAddress);
  token.name = nameCall.reverted ? "" : nameCall.value;
  token.symbol = symbolCall.reverted ? "" : symbolCall.value;
  token.decimals = decimalsCall.reverted ? 0 : decimalsCall.value;
  token.address = tokenAddress;
  token.save();
}

export function getToken(tokenAddress: Address): Token {
  let token = Token.load(tokenAddress);

  if (!token) {
    createToken(tokenAddress);
    token = Token.load(tokenAddress);
  }

  return token as Token;
}

export function createPoolShare(
  poolAddress: Address,
  userAddress: Address
): PoolShare {
  createUser(userAddress);

  let poolShareId = getPoolShareId(poolAddress, userAddress);
  let poolShare = new PoolShare(poolShareId);
  poolShare.user = userAddress;
  poolShare.pool = poolAddress;
  poolShare.balance = ZERO_BD;
  poolShare.save();

  return poolShare;
}

export function updateProtocolFeeAmounts(pool: Pool): void {
  let poolAddress = changetype<Address>(pool.address);
  let vaultAddress = changetype<Address>(pool.vault);
  let vault = VaultExtension.bind(vaultAddress);

  let poolTokens = pool.tokens.load();
  for (let i = 0; i < poolTokens.length; i++) {
    let poolToken = poolTokens[i];
    let poolTokenAddress = changetype<Address>(poolToken.address);

    let swapFeeAmount = vault.try_getAggregateSwapFeeAmount(
      poolAddress,
      poolTokenAddress
    );
    let yieldFeeAmount = vault.try_getAggregateYieldFeeAmount(
      poolAddress,
      poolTokenAddress
    );

    if (!swapFeeAmount.reverted) {
      poolToken.totalProtocolSwapFee = poolToken.totalProtocolSwapFee.plus(
        scaleDown(swapFeeAmount.value, poolToken.decimals)
      );
    }

    if (!yieldFeeAmount.reverted) {
      poolToken.totalProtocolYieldFee = poolToken.totalProtocolYieldFee.plus(
        scaleDown(yieldFeeAmount.value, poolToken.decimals)
      );
    }
  }
}
