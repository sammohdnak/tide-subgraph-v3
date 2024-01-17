import { Address } from "@graphprotocol/graph-ts";
import { PoolShare } from "../../generated/schema";

export function getPoolShareId(poolAddress: Address, userAddress: Address): string {
    return poolAddress.toHex().concat('-').concat(userAddress.toHex());
}
  
export function getPoolShare(poolAddress: Address, userAddress: Address): PoolShare {
    let poolShareId = getPoolShareId(poolAddress, userAddress);
    let poolShare = PoolShare.load(poolShareId) as PoolShare;
    return poolShare;
}