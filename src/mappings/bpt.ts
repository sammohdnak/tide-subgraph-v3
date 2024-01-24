import { Pool } from "../types/schema"
import { Transfer as TransferEvent } from "../types/templates/BPT/BPT"
import { ZERO_ADDRESS } from "../helpers/constants"
import { getPoolShare } from "../helpers/entities"

/************************************
 ********** BPTS TRANSFERS **********
 ************************************/

export function handleTransfer(event: TransferEvent): void {  
    let isMint = event.params.from == ZERO_ADDRESS;
    let isBurn = event.params.to == ZERO_ADDRESS;

    const poolAddress = event.address;
  
    let poolShareFrom = getPoolShare(poolAddress, event.params.from);
    let poolShareTo = getPoolShare(poolAddress, event.params.to);
  
    let pool = Pool.load(event.address) as Pool;
    
    if (isMint) {
      poolShareTo.balance = poolShareTo.balance.plus(event.params.value);
      poolShareTo.save();
      pool.totalShares = pool.totalShares.plus(event.params.value);
    } else if (isBurn) {
      poolShareFrom.balance = poolShareFrom.balance.minus(event.params.value);
      poolShareFrom.save();
      pool.totalShares = pool.totalShares.minus(event.params.value);
    } else {
      poolShareTo.balance = poolShareTo.balance.plus(event.params.value);
      poolShareTo.save();
  
      poolShareFrom.balance = poolShareFrom.balance.minus(event.params.value);
      poolShareFrom.save();
    }
  
    pool.save();
}