import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export function tokenToDecimal(amount: BigInt, decimals: i32): BigDecimal {
    let scale = BigInt.fromI32(10)
      .pow(decimals as u8)
      .toBigDecimal();
    return amount.toBigDecimal().div(scale);
}