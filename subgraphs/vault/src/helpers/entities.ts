import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Pool, PoolSnapshot, PoolToken } from "../types/schema";
import { PoolShare } from "../types/schema";
import { ZERO_BI } from "./constants";

const DAY = 24 * 60 * 60;

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
    for (let i = 0; i < poolTokens.length; i++) {
        balances[i] = poolTokens[i].balance;
    }
  
    snapshot.pool = poolAddress;
    snapshot.balances = balances;
    snapshot.timestamp = dayTimestamp;
    snapshot.totalShares = pool.totalShares;
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
    poolToken.save();
}

export function loadPoolToken(poolAddress: Address, tokenAddress: Address): PoolToken {
    let poolTokenId = poolAddress.concat(tokenAddress);
    let poolToken = PoolToken.load(poolTokenId) as PoolToken;

    return poolToken;
}