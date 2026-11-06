const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

async function runTests() {
  console.log('====================================================');
  console.log('Running AccessExpiry Test & Verification Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Verify Artifacts
  console.log('Test Suite 1: Smart Contract Compilation Artifacts');
  const artifactPath = path.join(__dirname, '..', 'src', 'contracts', 'AccessExpiryArtifact.json');
  assert(fs.existsSync(artifactPath), 'AccessExpiryArtifact.json exists on disk');

  const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  assert(bytecode && bytecode.length > 100, `Bytecode generated (${bytecode.length / 2} bytes)`);

  const contractInterface = new ethers.Interface(abi);

  // 2. Verify Required Functions
  console.log('\nTest Suite 2: Required Smart Contract Functions');
  const requiredFunctions = [
    'registerResource(string,bytes32)',
    'grantAccess(bytes32,address,uint256)',
    'extendAccess(bytes32,address,uint256)',
    'revokeAccess(bytes32,address)',
    'hasAccess(bytes32,address)',
    'getPermission(bytes32,address)',
    'getResourcesByOwner(address)',
    'getPermissionsByResource(bytes32)',
    'getPermissionsByRecipient(address)',
    'getAllResources()',
    'getTotalResourcesCount()',
  ];

  for (const fn of requiredFunctions) {
    const fragment = contractInterface.getFunction(fn);
    assert(fragment !== null, `Function implemented: ${fn}`);
  }

  // 3. Verify Required Events
  console.log('\nTest Suite 3: Required Smart Contract Events');
  const requiredEvents = [
    'ResourceRegistered',
    'AccessGranted',
    'AccessRevoked',
    'AccessExtended',
  ];

  for (const ev of requiredEvents) {
    const fragment = contractInterface.getEvent(ev);
    assert(fragment !== null, `Event implemented: ${ev}`);
  }

  // 4. Verify Custom Errors (Gas Optimization)
  console.log('\nTest Suite 4: Custom Errors for Gas Optimization');
  const requiredErrors = [
    'ResourceAlreadyExists',
    'ResourceNotFound',
    'NotResourceOwner',
    'InvalidRecipientAddress',
    'InvalidDuration',
    'PermissionNotFound',
    'PermissionAlreadyRevoked',
    'EmptyResourceName',
  ];

  for (const err of requiredErrors) {
    const fragment = contractInterface.getError(err);
    assert(fragment !== null, `Custom error defined: ${err}`);
  }

  // 5. Test ABI Encoding & Decoding
  console.log('\nTest Suite 5: Function Call Encoding / Decoding');
  const sampleResId = ethers.keccak256(ethers.toUtf8Bytes('PROD_API_GATEWAY'));
  const sampleRecipient = '0x1111111111111111111111111111111111111111';
  const sampleDuration = 86400; // 24 hours

  const grantCallData = contractInterface.encodeFunctionData('grantAccess', [
    sampleResId,
    sampleRecipient,
    sampleDuration,
  ]);
  assert(
    grantCallData.startsWith('0x'),
    'grantAccess() encoded correctly'
  );

  const decodedGrant = contractInterface.decodeFunctionData('grantAccess', grantCallData);
  assert(decodedGrant[0] === sampleResId, 'Decoded resourceId matches');
  assert(decodedGrant[1].toLowerCase() === sampleRecipient.toLowerCase(), 'Decoded recipient matches');
  assert(Number(decodedGrant[2]) === sampleDuration, 'Decoded duration matches');

  // 6. Test BOT Chain Testnet RPC Connectivity
  console.log('\nTest Suite 6: BOT Chain Testnet Connectivity (Chain ID 968)');
  const rpcUrl = 'https://rpc.bohr.life';
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const start = Date.now();
    const network = await provider.getNetwork();
    const latency = Date.now() - start;

    assert(Number(network.chainId) === 968, `Chain ID matches BOT Chain testnet: ${network.chainId}`);
    console.log(`    RPC latency: ${latency}ms`);

    const blockNumber = await provider.getBlockNumber();
    assert(blockNumber > 0, `Live block height verified: Block #${blockNumber}`);

    // Read actual deployed contract address from deployedContract.json
    const deployedJsonPath = path.join(__dirname, '..', 'src', 'contracts', 'deployedContract.json');
    let deployedContractAddress = '0xd3f3e482e065Af680862a673b42E1EA44bFDeA2D';
    if (fs.existsSync(deployedJsonPath)) {
      deployedContractAddress = JSON.parse(fs.readFileSync(deployedJsonPath, 'utf8')).address;
    }
    const contract = new ethers.Contract(deployedContractAddress, abi, provider);

    const hasAccessResult = await contract.hasAccess(sampleResId, sampleRecipient);
    assert(
      hasAccessResult === false,
      `hasAccess() correctly returned false for non-granted address on-chain`
    );
  } catch (err) {
    console.error('RPC test error:', err.message);
    assert(false, `BOT Chain RPC connection failed: ${err.message}`);
  }

  // 7. Summary
  console.log('\n====================================================');
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal error in test runner:', e);
  process.exit(1);
});
