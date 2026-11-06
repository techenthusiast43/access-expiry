const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config();

const BOT_RPC = process.env.BOT_RPC_URL || 'https://rpc.bohr.life';
const EXPLORER_URL = 'https://scan.bohr.life';

async function main() {
  console.log('==================================================');
  console.log('AccessExpiry - Seeding Live Demo On-Chain Data');
  console.log('==================================================');

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('Error: No PRIVATE_KEY configured in .env');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(BOT_RPC);
  const wallet = new ethers.Wallet(privateKey.trim(), provider);

  const deployedJsonPath = path.join(__dirname, '..', 'src', 'contracts', 'deployedContract.json');
  const { address: contractAddress } = JSON.parse(fs.readFileSync(deployedJsonPath, 'utf8'));

  const artifactPath = path.join(__dirname, '..', 'src', 'contracts', 'AccessExpiryArtifact.json');
  const { abi } = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  console.log('Contract Address:', contractAddress);
  console.log('Deployer / Owner Address:', wallet.address);

  // 1. Register a demo resource
  const resourceName = 'Enterprise API Gateway Alpha';
  console.log(`\n1. Registering Resource: "${resourceName}"...`);
  const regTx = await contract.registerResource(resourceName, ethers.ZeroHash);
  console.log('Tx Submitted:', regTx.hash);
  console.log('Waiting for confirmation on BOT Chain...');
  const regReceipt = await regTx.wait();
  console.log('Confirmed in block #', regReceipt.blockNumber);
  console.log(`Explorer Link: ${EXPLORER_URL}/tx/${regTx.hash}`);

  // Find generated resourceId from events
  let resourceId = '';
  for (const log of regReceipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && parsed.name === 'ResourceRegistered') {
        resourceId = parsed.args[0];
        break;
      }
    } catch {}
  }

  console.log('Generated Resource ID:', resourceId);

  // 2. Grant temporary 24-hour access to a demo recipient address
  const demoRecipient = '0x2222222222222222222222222222222222222222';
  const duration = 86400; // 24 hours
  console.log(`\n2. Granting 24-Hour Access to: ${demoRecipient}...`);
  const grantTx = await contract.grantAccess(resourceId, demoRecipient, duration);
  console.log('Tx Submitted:', grantTx.hash);
  console.log('Waiting for confirmation...');
  const grantReceipt = await grantTx.wait();
  console.log('Confirmed in block #', grantReceipt.blockNumber);
  console.log(`Explorer Link: ${EXPLORER_URL}/tx/${grantTx.hash}`);

  // 3. Verify on-chain access
  const hasAcc = await contract.hasAccess(resourceId, demoRecipient);
  const [perm, isActive, secondsRemaining] = await contract.getPermission(resourceId, demoRecipient);

  console.log('\n3. Real-Time On-Chain Verification:');
  console.log('- hasAccess():', hasAcc);
  console.log('- isActive:', isActive);
  console.log('- Seconds Remaining until expiry:', Number(secondsRemaining), `(~${(Number(secondsRemaining)/3600).toFixed(1)} hours)`);
  console.log('- Expiry Date:', new Date(Number(perm.expiryTimestamp) * 1000).toLocaleString());

  console.log('\n==================================================');
  console.log('Live on-chain demo data seeded successfully!');
  console.log('Refresh your browser at http://localhost:5174/ to view:');
  console.log('- Dashboard: 1 registered resource');
  console.log('- Manage Permissions: 1 active permission with ticking countdown');
  console.log('- History: 2 recorded on-chain events with BOT Scan links');
  console.log('==================================================');
}

main().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
