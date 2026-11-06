const fs = require('fs');
const path = require('path');
const solc = require('solc');

console.log('Compiling AccessExpiry.sol with solc', solc.version());

const contractPath = path.join(__dirname, '..', 'contracts', 'AccessExpiry.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'AccessExpiry.sol': {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode'],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasErrors = false;
  for (const err of output.errors) {
    if (err.severity === 'error') {
      console.error(err.formattedMessage);
      hasErrors = true;
    } else {
      console.warn(err.formattedMessage);
    }
  }
  if (hasErrors) {
    console.error('Compilation failed with errors.');
    process.exit(1);
  }
}

const contract = output.contracts['AccessExpiry.sol']['AccessExpiry'];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

console.log('AccessExpiry compiled successfully!');
console.log('ABI functions count:', abi.filter(x => x.type === 'function').length);
console.log('Bytecode size (bytes):', bytecode.length / 2);

const outputDir = path.join(__dirname, '..', 'src', 'contracts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, 'AccessExpiryArtifact.json'),
  JSON.stringify({ abi, bytecode }, null, 2)
);

console.log('Saved artifact to src/contracts/AccessExpiryArtifact.json');

