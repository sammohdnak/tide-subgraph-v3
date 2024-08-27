# Integrating New Pool Types

To integrate new pool types into the Balancer subgraph, follow these steps below. We kindly ask developers to start building on Sepolia and add support for pools there before moving to production networks.

## Setup

Navigate to the `subgraphs/pools` directory before starting the integration process.

## Adding the Factory

Run the following command to add your pool factory:

```
pnpm add-factory [factory-address] [network]
```

This command fetch the factory ABI, retrieves the deployment block, and adds it to the subgraph manifest. 

## Adding a Pool Instance

Execute this command to fetch the pool ABI:

```
pnpm add-pool [pool-address] [network]
```

Ensure you have a pool deployed from your factory before running this command.

## Generating Types

Run the codegen command to ensure that types from your ABIs are generated:

```
pnpm codegen
```

## Updating the GraphQL Schema

Edit the `schema.graphql` file to add any specific parameters based on your pool type to the `Pool` entity.

```graphql
type Pool @entity {
  # ... Existing fields

  " Your custom parameter "
  customParam: BigInt
}
```

Add your custom fields to this schema as needed for your specific pool type.

## Modifying the Pool Creation Handler

Navigate to `src/mappings/factories.ts` and update the handler function for the new pool type:


```typescript
import { YourPool } from "../types/YourPoolFactory/YourPool";

export function handleYourPoolCreated(event: PoolCreated): void {
  let poolAddress = event.params.pool;
  let pool = new Pool(poolAddress);
  pool.address = poolAddress;

  let factory = getFactory(event.address, PoolType.YourPoolType, 1);
  pool.factory = factory.id;


  // First, bind the pool address to its contract
  let yourPool = YourPool.bind(poolAddress);

  // Then fetch the pool-specific parameters
  let customParamResult = yourPool.try_getCustomParameter();
  if (!customParamResult.reverted) {
    pool.customParam = customParamResult.value;
  }

  // Add more parameter fetching logic as needed

  pool.save();
}
```

In this function, replace the example parameter fetching logic with calls to your pool's specific methods to retrieve and store the relevant parameters.
