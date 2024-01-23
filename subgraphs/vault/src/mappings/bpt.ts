import { Pool } from "../types/schema"
import { Transfer as TransferEvent } from "../types/templates/BPT/BPT"
import { ZERO_ADDRESS } from "../helpers/constants"
import { getPoolShare } from "../helpers/entities"
import { tokenToDecimal } from "../helpers/misc"

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
  
    let BPT_DECIMALS = 18;
  
    if (isMint) {
      poolShareTo.balance = poolShareTo.balance.plus(tokenToDecimal(event.params.value, BPT_DECIMALS));
      poolShareTo.save();
      pool.totalShares = pool.totalShares.plus(tokenToDecimal(event.params.value, BPT_DECIMALS));
    } else if (isBurn) {
      poolShareFrom.balance = poolShareFrom.balance.minus(tokenToDecimal(event.params.value, BPT_DECIMALS));
      poolShareFrom.save();
      pool.totalShares = pool.totalShares.minus(tokenToDecimal(event.params.value, BPT_DECIMALS));
    } else {
      poolShareTo.balance = poolShareTo.balance.plus(tokenToDecimal(event.params.value, BPT_DECIMALS));
      poolShareTo.save();
  
      poolShareFrom.balance = poolShareFrom.balance.minus(tokenToDecimal(event.params.value, BPT_DECIMALS));
      poolShareFrom.save();
    }
  
    pool.save();
}