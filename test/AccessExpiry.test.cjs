const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("AccessExpiry Contract", function () {
  let AccessExpiry;
  let accessExpiry;
  let owner;
  let user1;
  let user2;
  let stranger;

  const sampleResourceId = ethers.keccak256(ethers.toUtf8Bytes("API-KEY-001"));
  const ONE_HOUR = 3600;
  const ONE_DAY = 86400;

  beforeEach(async function () {
    [owner, user1, user2, stranger] = await ethers.getSigners();
    AccessExpiry = await ethers.getContractFactory("AccessExpiry");
    accessExpiry = await AccessExpiry.deploy();
    await accessExpiry.waitForDeployment();
  });

  describe("Resource Registration", function () {
    it("should allow a user to register a resource and become its owner", async function () {
      const tx = await accessExpiry.connect(owner).registerResource("Alpha Database", sampleResourceId);
      await expect(tx)
        .to.emit(accessExpiry, "ResourceRegistered")
        .withArgs(sampleResourceId, "Alpha Database", owner.address, (await ethers.provider.getBlock("latest")).timestamp);

      const res = await accessExpiry.resources(sampleResourceId);
      expect(res.name).to.equal("Alpha Database");
      expect(res.owner).to.equal(owner.address);
      expect(res.exists).to.be.true;
    });

    it("should auto-generate a resourceId if bytes32(0) is provided", async function () {
      const tx = await accessExpiry.connect(owner).registerResource("Auto ID Resource", ethers.ZeroHash);
      const receipt = await tx.wait();
      
      const registeredEvent = receipt.logs.find(log => {
        try {
          const parsed = accessExpiry.interface.parseLog(log);
          return parsed.name === "ResourceRegistered";
        } catch {
          return false;
        }
      });
      expect(registeredEvent).to.not.be.undefined;
    });

    it("should reject registering duplicate resource IDs", async function () {
      await accessExpiry.connect(owner).registerResource("Resource 1", sampleResourceId);
      await expect(
        accessExpiry.connect(owner).registerResource("Duplicate", sampleResourceId)
      ).to.be.revertedWithCustomError(accessExpiry, "ResourceAlreadyExists");
    });

    it("should reject empty resource names", async function () {
      await expect(
        accessExpiry.connect(owner).registerResource("", sampleResourceId)
      ).to.be.revertedWithCustomError(accessExpiry, "EmptyResourceName");
    });
  });

  describe("Granting Access", function () {
    beforeEach(async function () {
      await accessExpiry.connect(owner).registerResource("Production Gateway", sampleResourceId);
    });

    it("should allow the owner to grant access with a duration", async function () {
      const tx = await accessExpiry.connect(owner).grantAccess(sampleResourceId, user1.address, ONE_HOUR);
      const block = await ethers.provider.getBlock("latest");
      const expectedExpiry = block.timestamp + ONE_HOUR;

      await expect(tx)
        .to.emit(accessExpiry, "AccessGranted")
        .withArgs(sampleResourceId, user1.address, owner.address, expectedExpiry, ONE_HOUR);

      const hasAcc = await accessExpiry.hasAccess(sampleResourceId, user1.address);
      expect(hasAcc).to.be.true;

      const perm = await accessExpiry.permissions(sampleResourceId, user1.address);
      expect(perm.recipient).to.equal(user1.address);
      expect(perm.grantor).to.equal(owner.address);
      expect(perm.expiryTimestamp).to.equal(expectedExpiry);
      expect(perm.revoked).to.be.false;
      expect(perm.exists).to.be.true;
    });

    it("should reject non-owners from granting access", async function () {
      await expect(
        accessExpiry.connect(stranger).grantAccess(sampleResourceId, user1.address, ONE_HOUR)
      ).to.be.revertedWithCustomError(accessExpiry, "NotResourceOwner");
    });

    it("should reject invalid recipient address (zero address)", async function () {
      await expect(
        accessExpiry.connect(owner).grantAccess(sampleResourceId, ethers.ZeroAddress, ONE_HOUR)
      ).to.be.revertedWithCustomError(accessExpiry, "InvalidRecipientAddress");
    });

    it("should reject zero duration", async function () {
      await expect(
        accessExpiry.connect(owner).grantAccess(sampleResourceId, user1.address, 0)
      ).to.be.revertedWithCustomError(accessExpiry, "InvalidDuration");
    });
  });

  describe("Time Expiration & hasAccess()", function () {
    beforeEach(async function () {
      await accessExpiry.connect(owner).registerResource("Expiring Resource", sampleResourceId);
      await accessExpiry.connect(owner).grantAccess(sampleResourceId, user1.address, ONE_HOUR);
    });

    it("should report hasAccess as true before expiry", async function () {
      expect(await accessExpiry.hasAccess(sampleResourceId, user1.address)).to.be.true;
    });

    it("should automatically report hasAccess as false after expiry time", async function () {
      // Advance time beyond 1 hour
      await time.increase(ONE_HOUR + 5);

      expect(await accessExpiry.hasAccess(sampleResourceId, user1.address)).to.be.false;

      const [perm, isActive, secondsRemaining] = await accessExpiry.getPermission(sampleResourceId, user1.address);
      expect(isActive).to.be.false;
      expect(secondsRemaining).to.equal(0);
    });
  });

  describe("Manual Revocation", function () {
    beforeEach(async function () {
      await accessExpiry.connect(owner).registerResource("Revocable Resource", sampleResourceId);
      await accessExpiry.connect(owner).grantAccess(sampleResourceId, user1.address, ONE_DAY);
    });

    it("should allow owner to manually revoke permission before expiry", async function () {
      const tx = await accessExpiry.connect(owner).revokeAccess(sampleResourceId, user1.address);
      await expect(tx).to.emit(accessExpiry, "AccessRevoked");

      expect(await accessExpiry.hasAccess(sampleResourceId, user1.address)).to.be.false;

      const perm = await accessExpiry.permissions(sampleResourceId, user1.address);
      expect(perm.revoked).to.be.true;
    });

    it("should reject non-owners from revoking permission", async function () {
      await expect(
        accessExpiry.connect(stranger).revokeAccess(sampleResourceId, user1.address)
      ).to.be.revertedWithCustomError(accessExpiry, "NotResourceOwner");
    });

    it("should reject revoking an already revoked permission", async function () {
      await accessExpiry.connect(owner).revokeAccess(sampleResourceId, user1.address);
      await expect(
        accessExpiry.connect(owner).revokeAccess(sampleResourceId, user1.address)
      ).to.be.revertedWithCustomError(accessExpiry, "PermissionAlreadyRevoked");
    });
  });

  describe("Extending Access", function () {
    beforeEach(async function () {
      await accessExpiry.connect(owner).registerResource("Extendable Resource", sampleResourceId);
      await accessExpiry.connect(owner).grantAccess(sampleResourceId, user1.address, ONE_HOUR);
    });

    it("should allow owner to extend an active permission", async function () {
      const permBefore = await accessExpiry.permissions(sampleResourceId, user1.address);
      const oldExpiry = permBefore.expiryTimestamp;

      const tx = await accessExpiry.connect(owner).extendAccess(sampleResourceId, user1.address, ONE_HOUR);
      const newExpiry = oldExpiry + BigInt(ONE_HOUR);

      await expect(tx)
        .to.emit(accessExpiry, "AccessExtended")
        .withArgs(sampleResourceId, user1.address, oldExpiry, newExpiry, owner.address);

      const permAfter = await accessExpiry.permissions(sampleResourceId, user1.address);
      expect(permAfter.expiryTimestamp).to.equal(newExpiry);
    });

    it("should allow owner to renew an expired/revoked permission from current block.timestamp", async function () {
      await accessExpiry.connect(owner).revokeAccess(sampleResourceId, user1.address);
      expect(await accessExpiry.hasAccess(sampleResourceId, user1.address)).to.be.false;

      await accessExpiry.connect(owner).extendAccess(sampleResourceId, user1.address, ONE_DAY);
      expect(await accessExpiry.hasAccess(sampleResourceId, user1.address)).to.be.true;

      const permAfter = await accessExpiry.permissions(sampleResourceId, user1.address);
      expect(permAfter.revoked).to.be.false;
    });

    it("should reject non-owners from extending permissions", async function () {
      await expect(
        accessExpiry.connect(stranger).extendAccess(sampleResourceId, user1.address, ONE_HOUR)
      ).to.be.revertedWithCustomError(accessExpiry, "NotResourceOwner");
    });
  });
});

