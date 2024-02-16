import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Pool, PoolSnapshot, PoolToken, RateProvider, Vault } from "../types/schema";
import { PoolShare } from "../types/schema";
import { ZERO_ADDRESS, ZERO_BD, ZERO_BI } from "./constants";

const DAY = 24 * 60 * 60;

export function getVault(vaultAddress: Bytes): Vault {
    let vault: Vault | null = Vault.load(vaultAddress);
    if (vault != null) return vault;
  
    vault = new Vault(vaultAddress);
    vault.isPaused = false;
    vault.authorizer = ZERO_ADDRESS;
    vault.protocolSwapFee = ZERO_BD;
    vault.protocolYieldFee = ZERO_BD;
    vault.save();
    
    return vault;
  }

export function getPoolShareId(poolAddress: Address, userAddress: Address): string {
    return poolAddress.toHex().concat('-').concat(userAddress.toHex());
}
  
export function getPoolShare(poolAddress: Address, userAddress: Address): PoolShare {
    let poolShareId = getPoolShareId(poolAddress, userAddress);
    let poolShare = PoolShare.load(poolShareId) as PoolShare;
    return poolShare;
}

export function createPoolSnapshot(pool: Pool, timestamp: i32): void {
    let poolAddress = pool.id;
    let dayTimestamp = timestamp - (timestamp % DAY);
    
    let snapshotId = poolAddress.toHex() + '-' + dayTimestamp.toString();
    let snapshot = PoolSnapshot.load(snapshotId);
  
    if (!snapshot) {
      snapshot = new PoolSnapshot(snapshotId);
    }

    let poolTokens = pool.tokens.load();
    let balances = new Array<BigInt>(poolTokens.length);
    let totalProtocolSwapFees = new Array<BigInt>(poolTokens.length);
    let totalProtocolYieldFees = new Array<BigInt>(poolTokens.length);
    for (let i = 0; i < poolTokens.length; i++) {
        balances[i] = poolTokens[i].balance;
        totalProtocolSwapFees[i] = poolTokens[i].totalProtocolSwapFee;
        totalProtocolYieldFees[i] = poolTokens[i].totalProtocolYieldFee;
    }
  
    snapshot.pool = poolAddress;
    snapshot.balances = balances;
    snapshot.timestamp = dayTimestamp;
    snapshot.totalShares = pool.totalShares;
    snapshot.totalProtocolSwapFees = totalProtocolSwapFees;
    snapshot.totalProtocolYieldFees = totalProtocolYieldFees;
    snapshot.save();
}

export function createPoolToken(poolAddress: Address, tokenAddress: Address): void {
    let poolTokenId = poolAddress.concat(tokenAddress);
    let poolToken = PoolToken.load(poolTokenId);

    if (!poolToken) {
        poolToken = new PoolToken(poolTokenId);
    }

    poolToken.pool = poolAddress;
    poolToken.address = tokenAddress;
    poolToken.balance = ZERO_BI;
    poolToken.totalProtocolSwapFee = ZERO_BI;
    poolToken.totalProtocolYieldFee = ZERO_BI;
    poolToken.save();
}

export function createRateProvider(poolAddress: Address, tokenAddress: Address, rateProviderAddress: Address): void {
    let rateProviderId = poolAddress.concat(tokenAddress).concat(rateProviderAddress);
    let rateProvider = RateProvider.load(rateProviderId);

    if (!rateProvider) {
        rateProvider = new RateProvider(rateProviderId);
    }

    rateProvider.pool = poolAddress;
    rateProvider.token = tokenAddress;
    rateProvider.address = rateProviderAddress;
    rateProvider.save();
}

export function loadPoolToken(poolAddress: Address, tokenAddress: Address): PoolToken {
    let poolTokenId = poolAddress.concat(tokenAddress);
    let poolToken = PoolToken.load(poolTokenId) as PoolToken;

    return poolToken;
}