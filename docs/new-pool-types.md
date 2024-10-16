# Integrating New Pool Types

To integrate new pool types into the Balancer subgraph, follow these steps below. We kindly ask developers to start building on Sepolia and add support for pools there before moving to production networks.

## Setup

Navigate to the `subgraphs/v3-pools` directory and add your custom pool ABI to `abis` folder before starting the integration process.

## Updating the GraphQL Schema

1. Edit the `schema.graphql` file:

   a. Add your pool type to the `PoolType` enum:

   ```graphql
   enum PoolType {
     Weighted
     Stable
     Custom # Add your new pool type here
   }
   ```

   b. Create an entity for your pool-type specific parameters:

   ```graphql
   type CustomParams @entity {
     id: Bytes!
     customParam: BigInt!
     # Add other custom parameters as needed
   }
   ```

   c. Extend the `Pool` entity to expose your custom params:

   ```graphql
   type Pool @entity {
     id: Bytes!
     address: Bytes!
     factory: Factory!
     stableParams: StableParams
     weightedParams: WeightedParams
     customParams: CustomParams # Add the new entity here
   }
   ```

2. Save the file and run the codegen command to generate types for your schema:

   ```bash
   pnpm codegen
   ```

## Updating the Subgraph Manifest

1. Update the `subgraph.sepolia.yaml` file to include your new pool factory:

   ```yaml
   dataSources:
     # Existing data sources...
     - kind: ethereum/contract
       name: CustomPoolFactory
       network: sepolia
       source:
         abi: BasePoolFactory
         address: "0x..." # Your custom pool factory address
         startBlock: 000000 # Your custom pool deployment block
       mapping:
         kind: ethereum/events
         apiVersion: 0.0.7
         language: wasm/assemblyscript
         file: ./src/mappings/custom.ts
         entities:
           - Pool
         abis:
           - name: CustomPool
             file: ./abis/CustomPool.json
           - name: BasePoolFactory
             file: ./abis/BasePoolFactory.json
         eventHandlers:
           - event: PoolCreated(indexed address,bytes32)
             handler: handleCustomPoolCreated
   ```

2. Save the file and run the codegen command to generate types for your ABIs:

```bash
pnpm codegen
```

## Writing Mappings for the Pool Factory

1. Update `src/mappings/common.ts` to include your new pool type:

   ```typescript
   export namespace PoolType {
     export const Weighted = "Weighted";
     export const Stable = "Stable";
     export const Custom = "Custom"; // Add your new pool type here
   }
   ```

2. Create a new file in the `src/mappings` directory for your custom pool factory (e.g., `custom.ts`).

3. Implement the factory mapping. See Stable and Weighted implementations as reference.

   ```typescript
   import { Address } from "@graphprotocol/graph-ts";

   import { PoolCreated } from "../types/CustomPoolFactory/BasePoolFactory";
   import { handlePoolCreated } from "./factories";
   import { PoolType } from "./constants";

   export function handleCustomPoolCreated(event: CustomPoolCreated): void {
     handlePoolCreated(
       event.params.pool,
       event.address, // Factory
       PoolType.Custom,
       1, // version of your pool type factory
       handleCustomPoolParams,
       "customParams" // should be the name of the field you added to the Pool entity
     );
   }

   function handleCustomPoolParams(poolAddress: Address): Bytes {
     // Implement custom logic to fetch and save custom parameters
     // Return the ID of the saved CustomParams entity
   }
   ```
