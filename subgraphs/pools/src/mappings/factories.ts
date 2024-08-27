import { BigDecimal } from "@graphprotocol/graph-ts";
import { PoolCreated as WeightedPoolCreated } from "../types/WeightedPoolFactory/WeightedPoolFactory";
import { WeightedPool } from "../types/WeightedPoolFactory/WeightedPool";
import { StablePool } from "../types/StablePoolFactory/StablePool";
import { scaleDown } from "../helpers/misc";
import { getFactory } from "../helpers/entities";
import { Pool } from "../types/schema";

namespace PoolType {
  export const Weighted = "Weighted";
  export const Stable = "Stable";
}

/************************************
 ********* WEIGHTED POOLS ***********
 ************************************/

export function handleWeightedPoolCreated(event: WeightedPoolCreated): void {
  let poolAddress = event.params.pool;
  let pool = new Pool(poolAddress);
  pool.address = poolAddress;

  let factory = getFactory(event.address, PoolType.Weighted, 1);
  pool.factory = factory.id;

  let weightedPool = WeightedPool.bind(poolAddress);
  let weightsResult = weightedPool.try_getNormalizedWeights();
  if (weightsResult.reverted) return;
  pool.weights = weightsResult.value.map<BigDecimal>((weight) =>
    scaleDown(weight, 18)
  );

  pool.save();
}

/************************************
 ********* STABLE POOLS *************
 ************************************/

export function handleStablePoolCreated(event: WeightedPoolCreated): void {
  let poolAddress = event.params.pool;
  let pool = new Pool(poolAddress);
  pool.address = poolAddress;

  let factory = getFactory(event.address, PoolType.Stable, 1);
  pool.factory = factory.id;

  let stablePool = StablePool.bind(poolAddress);
  let ampResult = stablePool.try_getAmplificationParameter();
  if (ampResult.reverted) return;

  let ampValue = ampResult.value.value0;
  let ampPrecision = ampResult.value.value2;
  pool.amp = ampValue.div(ampPrecision);

  pool.save();
}
