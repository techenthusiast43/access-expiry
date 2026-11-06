const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config();

const BOT_RPC = process.env.BOT_RPC_URL || 'https://rpc.bohr.life';
const BOT_CHAIN_ID = 968;
const EXPLORER_URL = 'https://scan.bohr.life';

async function main() {
  console.log('==================================================');
  console.log('AccessExpiry - BOT Chain Testnet Deployment');
  console.log('==================================================');
  console.log('Target RPC:', BOT_RPC);
  console.log('Target Chain ID:', BOT_CHAIN_ID);

  const provider = new ethers.JsonRpcProvider(BOT_RPC);
  const network = await provider.getNetwork();
  console.log('Connected to network. Chain ID reported:', Number(network.chainId));

  if (Number(network.chainId) !== BOT_CHAIN_ID) {
    console.warn(`Warning: Network chainId ${network.chainId} does not match expected 968`);
  }

  const artifactPath = path.join(__dirname, '..', 'src', 'contracts', 'AccessExpiryArtifact.json');
  if (!fs.existsSync(artifactPath)) {
    console.error('Artifact not found. Please run: node scripts/compile.cjs first.');
    process.exit(1);
  }

  const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  let privateKey = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.trim() : '';
  if (privateKey && !privateKey.startsWith('0x') && privateKey.length === 64) {
    privateKey = '0x' + privateKey;
  }
  if (!privateKey) {
    console.log('\n[NOTICE] No PRIVATE_KEY found in .env.');
    console.log('To deploy to BOT Chain testnet:');
    console.log('1. Claim free testnet BOT tokens from https://faucet.botchain.ai/basic');
    console.log('2. Add PRIVATE_KEY=0x... to your .env file');
    console.log('3. Run: node scripts/deploy-bot.cjs\n');

    // Check pre-configured contract on testnet
    const deployedJsonPath = path.join(__dirname, '..', 'src', 'contracts', 'deployedContract.json');
    if (fs.existsSync(deployedJsonPath)) {
      const existing = JSON.parse(fs.readFileSync(deployedJsonPath, 'utf8'));
      console.log('Current active contract on BOT Chain testnet:', existing.address);
      console.log(`Explorer link: ${EXPLORER_URL}/address/${existing.address}`);
    }
    return;
  }

  const wallet = new ethers.Wallet(privateKey, provider);
  console.log('Deployer Wallet Address:', wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log('Deployer Balance:', ethers.formatEther(balance), 'tBOT');

  if (balance === 0n) {
    console.error('Error: Insufficient balance. Please claim testnet BOT from https://faucet.botchain.ai/basic');
    process.exit(1);
  }

  console.log('\nSubmitting AccessExpiry contract deployment transaction...');
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();

  console.log('Deployment Tx Hash:', contract.deploymentTransaction().hash);
  console.log('Waiting for block confirmation on BOT Chain...');

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log('\n AccessExpiry Successfully Deployed!');
  console.log('Contract Address:', contractAddress);
  console.log(`Explorer Link: ${EXPLORER_URL}/address/${contractAddress}`);

  // Save to deployedContract.json
  const deploymentInfo = {
    address: contractAddress,
    network: 'BOT Chain Testnet',
    chainId: BOT_CHAIN_ID,
    deployedAt: new Date().toISOString(),
    txHash: contract.deploymentTransaction().hash,
    rpcUrl: BOT_RPC,
    blockExplorer: EXPLORER_URL,
  };

  const deployedJsonPath = path.join(__dirname, '..', 'src', 'contracts', 'deployedContract.json');
  fs.writeFileSync(deployedJsonPath, JSON.stringify(deploymentInfo, null, 2));
  console.log('Updated src/contracts/deployedContract.json');
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});

