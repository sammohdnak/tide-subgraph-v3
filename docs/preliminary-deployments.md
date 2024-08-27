# Preliminary Deployments

## Deployment Steps

1. Create both pools and vault subgraphs in TheGraph Studio.

2. Edit `networks.yaml` file with:
   - Vault address
   - StablePoolFactory address
   - WeightedPoolFactory address
   - Deployment blocks for each

3. Generate manifests:
   ```
   pnpm generate-manifests
   ```

4. Update GitHub Actions
