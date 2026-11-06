# 🛡️ AccessExpiry

**AccessExpiry** is a lightweight, decentralized time-bounded access control dApp built on **BOT Chain**. 

It allows resource owners to cryptographically grant temporary permissions to wallet addresses. Each permission has an expiry timestamp and automatically becomes invalid after the expiry time using `block.timestamp`, without requiring manual cleanup transactions or off-chain cron jobs.

---

## 🌐 BOT Chain Network Configuration

AccessExpiry is tailored for **BOT Chain Testnet**:

| Parameter | Value |
| :--- | :--- |
| **Network Name** | BOT Chain Testnet |
| **Chain ID** | `968` (`0x3c8`) |
| **RPC Endpoint** | `https://rpc.bohr.life` |
| **Native Token** | `BOT` (or `tBOT`) |
| **Total Supply** | 150 Million |
| **Block Explorer** | [https://scan.bohr.life](https://scan.bohr.life) |
| **Testnet Faucet** | [https://faucet.botchain.ai/basic](https://faucet.botchain.ai/basic) |

---

## 🚀 Key Features

* **Self-Expiring Authorizations**: Permissions automatically expire when `block.timestamp >= expiryTimestamp`.
* **Zero Gas Checks**: Verification is performed through the read-only view function `hasAccess(resourceId, recipient)` with 0 gas cost.
* **Owner Sovereignty**: Only the resource creator (owner) can grant, extend, or revoke access permissions.
* **Granular Durations**: Preset durations (`1 hour`, `24 hours`, `7 days`, `30 days`) or custom hour inputs.
* **Premature Revocation & Extension**: Owners can revoke access at any time before natural expiry or extend existing access.
* **Real-time Live Countdowns**: Responsive visual countdown timers for every permission.
* **Full Audit Trail**: Emits events for every resource registration, grant, revocation, and extension with direct links to BOT Scan.
* **No Speculative Tokens / Fees**: Strictly pure access control logic with zero token minting, NFTs, or fee tolling.

---

## 📑 Smart Contract Architecture

The smart contract is written in Solidity `^0.8.20` at [`contracts/AccessExpiry.sol`](./contracts/AccessExpiry.sol):

### Core Functions

1. **`registerResource(string calldata name, bytes32 customId) external returns (bytes32)`**
   * Registers a new resource. The caller (`msg.sender`) becomes the immutable owner.
   * Auto-generates a unique `bytes32` identifier if `customId` is `bytes32(0)`.
   * Emits `ResourceRegistered`.

2. **`grantAccess(bytes32 resourceId, address recipient, uint256 duration) external`**
   * Only callable by the resource owner.
   * Validates non-zero recipient address and positive duration.
   * Computes `expiryTimestamp = block.timestamp + duration`.
   * Emits `AccessGranted`.

3. **`extendAccess(bytes32 resourceId, address recipient, uint256 additionalDuration) external`**
   * Extends the permission duration.
   * If still active, appends to existing expiry; if expired or revoked, renews from `block.timestamp`.
   * Emits `AccessExtended`.

4. **`revokeAccess(bytes32 resourceId, address recipient) external`**
   * Manually invalidates access before natural expiration.
   * Emits `AccessRevoked`.

5. **`hasAccess(bytes32 resourceId, address recipient) external view returns (bool)`**
   * Returns `true` iff permission exists, is not revoked, and `block.timestamp < expiryTimestamp`.

6. **`getPermission(bytes32 resourceId, address recipient) external view returns (...)`**
   * Returns the full permission struct, active boolean status, and remaining seconds.

---

## 💻 Frontend Application

Built with **React**, **Vite**, **Ethers.js**, **Tailwind CSS**, and **@reown/appkit** + **Wagmi**:

1. **Landing Page**: Platform overview, 4-step lifecycle, network metrics, and direct action triggers.
2. **Connect Wallet Page**: Wallet connection, account balance (`tBOT`), network verification, and one-click BOT Chain switch.
3. **Resource Registration Page**: Form to register resources with live keccak256 hash previews.
4. **Owner Dashboard**: KPI stats, overview of owned resources, and quick action buttons.
5. **Grant Access Page**: Form with recipient address validation, duration selector (1h, 24h, 7d, 30d), and calculated local expiry preview.
6. **Manage Permissions Page**: Live table with real-time ticking countdown timers, status badges (Active, Expired, Revoked), filter tabs, and instant Revoke / Extend action modals.
7. **User Access-Check Page**: Public verification tool allowing any user to test `hasAccess()` with a 3-line Solidity snippet for developer integrations.
8. **Permission History Page**: Audit log tracking all past events on BOT Chain with direct links to `https://scan.bohr.life/tx/...`.

---

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional for Deploying)
Create a `.env` file in the root directory:
```env
BOT_RPC_URL=https://rpc.bohr.life
PRIVATE_KEY=your_private_key_here
VITE_REOWN_PROJECT_ID=your_reown_project_id
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
```

### 3. Run Unit Tests
```bash
npx hardhat test
```

### 4. Deploy Smart Contract to BOT Chain Testnet
```bash
npx hardhat run scripts/deploy.cjs --network botTestnet
```
*The script will print the deployed contract address and automatically export the ABI to `src/contracts/deployedContract.json`.*

### 5. Start Frontend Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🔒 Security & Optimization Highlights

* **Reentrancy Immunity**: No external Ether/token transfers; all state updates follow Check-Effects-Interactions.
* **No Unbounded Loop Storage**: Getter functions operate on discrete indexed arrays.
* **Strict Parameter Guards**: Prevents zero address (`address(0)`) grants and invalid zero-second durations.
* **Deterministic Expiry**: Expiry evaluation uses immutable EVM block timestamps (`block.timestamp`).
* **Privacy Conscious**: Sensitive off-chain data (files, keys, API secrets) are never committed to the blockchain.

---

## 📄 License
MIT License. Open-source and permissionless.

