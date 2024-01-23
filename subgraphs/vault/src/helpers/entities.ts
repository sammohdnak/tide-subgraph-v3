import { Address } from "@graphprotocol/graph-ts";
import { Pool, PoolSnapshot } from "../types/schema";
import { PoolShare } from "../types/schema";

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
    
    let snapshotId = poolAddress + '-' + dayTimestamp.toString();
    let snapshot = PoolSnapshot.load(snapshotId);
  
    if (!snapshot) {
      snapshot = new PoolSnapshot(snapshotId);
    }
  
    snapshot.pool = poolAddress;
    snapshot.balances = pool.balances;
    snapshot.totalShares = pool.totalShares;
    snapshot.timestamp = dayTimestamp;
    snapshot.save();
}