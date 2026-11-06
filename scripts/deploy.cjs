const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("--------------------------------------------------");
  console.log("Deploying AccessExpiry to network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId || 968);
  console.log("--------------------------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  if (deployer) {
    console.log("Deployer address:", deployer.address);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", hre.ethers.formatEther(balance), "tBOT");
  } else {
    console.log("No deployer signer configured. Ensure PRIVATE_KEY is set in .env if deploying to live network.");
  }

  const AccessExpiry = await hre.ethers.getContractFactory("AccessExpiry");
  const contract = await AccessExpiry.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("AccessExpiry successfully deployed to:", contractAddress);
  console.log("Explorer URL:", `https://scan.bohr.life/address/${contractAddress}`);

  // Export contract address & ABI to frontend src directory
  const contractArtifact = await hre.artifacts.readArtifact("AccessExpiry");
  const contractsDir = path.join(__dirname, "..", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const deploymentData = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 968,
    deployedAt: new Date().toISOString(),
    abi: contractArtifact.abi,
  };

  fs.writeFileSync(
    path.join(contractsDir, "deployedContract.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("Exported ABI and deployment data to src/contracts/deployedContract.json");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

