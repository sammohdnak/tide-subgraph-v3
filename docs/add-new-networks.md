# Adding Support for New Networks

To add support for a new network in the Balancer v3 subgraphs, follow these steps:

## 1. Update networks.json

Add the new network configuration to the `networks.json` file in the root of the repository.

Example:

```json
{
  "network-name": {
    "Vault": {
      "address": "0x...",
      "startBlock": 0
    },
    "WeightedPoolFactory": {
      "address": "0x...",
      "startBlock": 0
    },
    "StablePoolFactory": {
      "address": "0x...",
      "startBlock": 0
    }
  }
}
```

Replace `"network-name"` with the CLI name found in TheGraph docs, and fill in the correct contract addresses and starting block numbers for the new network.

For more information on supported networks and their naming conventions, refer to [The Graph's documentation](https://thegraph.com/docs/en/developing/supported-networks/).

## 2. Update GitHub Actions Workflow

Duplicate the existing deployment jobs in the `.github/workflows/graph.yml` file for the new network. Here's an example of how to add deployment jobs for a new network:

```yaml
deploy-pools-network-name:
  needs: generate-configs
  runs-on: ubuntu-latest
  environment: graph
  defaults:
    run:
      working-directory: subgraphs/pools
  steps:
    # ... (copy steps from existing deploy-pools-sepolia job)
    - uses: balancer-labs/graph-deploy@v0.0.1
      with:
        graph_deploy_key: ${{secrets.GRAPH_DEPLOY_KEY}}
        graph_version_label: ${GITHUB_SHA::8}
        graph_subgraph_name: "balancer-v3-network-name" # Update the Subgraph name
        graph_account: "balancer-labs"
        graph_config_file: "subgraph.network-name.yaml" # Make sure this matches the manifest file name
        graph_deploy_studio: true

deploy-vault-network-name:
  needs: generate-configs
  runs-on: ubuntu-latest
  environment: graph
  defaults:
    run:
      working-directory: subgraphs/vault
  steps:
    # ... (copy steps from existing deploy-vault-sepolia job)
    - uses: balancer-labs/graph-deploy@v0.0.1
      with:
        graph_deploy_key: ${{secrets.GRAPH_DEPLOY_KEY}}
        graph_version_label: ${GITHUB_SHA::8}
        graph_subgraph_name: "balancer-pools-v3-network-name" # Update the Subgraph name
        graph_account: "balancer-labs"
        graph_config_file: "subgraph.network-name.yaml" # Make sure this matches the manifest file name
        graph_deploy_studio: true
```

Make sure to replace `network-name` with your actual network name and update the `graph_subgraph_name` and `graph_config_file` for the new network.

## 3. Generate Configs and Deploy

After updating `networks.json` and the GitHub Actions files:

1. Run `pnpm generate-manifests` to create the new manifests.
2. Commit and push the changes to trigger the Actions workflow.
3. The new subgraphs will be built and deployed automatically.
