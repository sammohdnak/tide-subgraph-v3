#!/usr/bin/env node

const { execSync } = require('child_process');

const [,, address, networkName] = process.argv;

if (!address || !networkName) {
  console.error('Usage: pnpm cli <address> <networkName>');
  process.exit(1);
}

const subgraphManifest = `subgraph.${networkName}.yaml`;

try {
  execSync('git stash push --include-untracked', { stdio: 'inherit' });

  execSync(`graph add ${address} ${subgraphManifest}`, { stdio: 'inherit' });

  const changedFiles = execSync('git diff --name-only').toString().trim().split('\n');

  // Keep only the downloaded ABI
  const filesToKeep = [
    'abis',
  ];

  changedFiles.forEach(file => {
    if (!filesToKeep.includes(file)) {
      execSync(`git checkout -- "${file}"`, { stdio: 'inherit' });
    }
  });

  console.log(`Added pool factory ${address} to ${subgraphManifest}`);
  console.log('Kept changes in:', filesToKeep.join(', '));

  execSync('git stash pop', { stdio: 'inherit' });

} catch (error) {
  console.error(`Failed: ${error.message}`);
  try {
    execSync('git stash pop', { stdio: 'inherit' });
  } catch (stashError) {
    console.error('Failed to restore stashed changes:', stashError.message);
  }
  process.exit(1);
}