// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AccessExpiry
 * @dev Lightweight decentralized access control with automatic time-based expiry on BOT Chain.
 * Allows resource owners to grant temporary access permissions to wallet addresses.
 * Permissions automatically expire based on block.timestamp and can be extended or manually revoked.
 */
contract AccessExpiry {
    // --- Structs ---

    struct Resource {
        bytes32 id;
        string name;
        address owner;
        uint256 createdAt;
        bool exists;
    }

    struct Permission {
        address recipient;
        bytes32 resourceId;
        address grantor;
        uint256 expiryTimestamp;
        bool revoked;
        bool exists;
    }

    // --- State Variables ---

    // resourceId => Resource
    mapping(bytes32 => Resource) public resources;
    bytes32[] private _allResourceIds;

    // owner => array of resourceIds
    mapping(address => bytes32[]) private _ownerResources;

    // resourceId => recipient => Permission
    mapping(bytes32 => mapping(address => Permission)) public permissions;

    // resourceId => array of recipient addresses
    mapping(bytes32 => address[]) private _resourceRecipients;

    // recipient => array of resourceIds granted to this recipient
    mapping(address => bytes32[]) private _recipientResources;

    // Helper mapping to prevent duplicate addresses in _resourceRecipients list
    mapping(bytes32 => mapping(address => bool)) private _isRecipientTracked;

    // Helper mapping to prevent duplicate resources in _recipientResources list
    mapping(address => mapping(bytes32 => bool)) private _isResourceTrackedForRecipient;

    // --- Events ---

    event ResourceRegistered(
        bytes32 indexed resourceId,
        string name,
        address indexed owner,
        uint256 timestamp
    );

    event AccessGranted(
        bytes32 indexed resourceId,
        address indexed recipient,
        address indexed grantor,
        uint256 expiryTimestamp,
        uint256 duration
    );

    event AccessRevoked(
        bytes32 indexed resourceId,
        address indexed recipient,
        address indexed revoker,
        uint256 timestamp
    );

    event AccessExtended(
        bytes32 indexed resourceId,
        address indexed recipient,
        uint256 oldExpiryTimestamp,
        uint256 newExpiryTimestamp,
        address indexed grantor
    );

    // --- Custom Errors ---

    error ResourceAlreadyExists(bytes32 resourceId);
    error ResourceNotFound(bytes32 resourceId);
    error NotResourceOwner(bytes32 resourceId, address caller);
    error InvalidRecipientAddress();
    error InvalidDuration();
    error PermissionNotFound(bytes32 resourceId, address recipient);
    error PermissionAlreadyRevoked(bytes32 resourceId, address recipient);
    error EmptyResourceName();

    // --- Modifiers ---

    modifier onlyResourceOwner(bytes32 resourceId) {
        if (!resources[resourceId].exists) {
            revert ResourceNotFound(resourceId);
        }
        if (resources[resourceId].owner != msg.sender) {
            revert NotResourceOwner(resourceId, msg.sender);
        }
        _;
    }

    // --- Resource Management ---

    /**
     * @notice Registers a new resource.
     * @param name Name of the resource (e.g., "API Server 01", "Private Dataset A").
     * @param customId Optional unique ID. If bytes32(0), an ID is automatically generated.
     * @return resourceId The unique identifier of the registered resource.
     */
    function registerResource(string calldata name, bytes32 customId) external returns (bytes32) {
        if (bytes(name).length == 0) {
            revert EmptyResourceName();
        }

        bytes32 resourceId = customId;
        if (resourceId == bytes32(0)) {
            resourceId = keccak256(
                abi.encodePacked(msg.sender, name, block.timestamp, _ownerResources[msg.sender].length)
            );
        }

        if (resources[resourceId].exists) {
            revert ResourceAlreadyExists(resourceId);
        }

        Resource memory newResource = Resource({
            id: resourceId,
            name: name,
            owner: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });

        resources[resourceId] = newResource;
        _allResourceIds.push(resourceId);
        _ownerResources[msg.sender].push(resourceId);

        emit ResourceRegistered(resourceId, name, msg.sender, block.timestamp);

        return resourceId;
    }

    // --- Permission Management ---

    /**
     * @notice Grants temporary access permission for a resource to a recipient wallet.
     * @param resourceId Unique identifier of the resource.
     * @param recipient Target wallet address receiving access.
     * @param duration Access duration in seconds (e.g. 3600 for 1h, 86400 for 24h, 604800 for 7d, 2592000 for 30d).
     */
    function grantAccess(
        bytes32 resourceId,
        address recipient,
        uint256 duration
    ) external onlyResourceOwner(resourceId) {
        if (recipient == address(0)) {
            revert InvalidRecipientAddress();
        }
        if (duration == 0) {
            revert InvalidDuration();
        }

        uint256 expiryTimestamp = block.timestamp + duration;

        permissions[resourceId][recipient] = Permission({
            recipient: recipient,
            resourceId: resourceId,
            grantor: msg.sender,
            expiryTimestamp: expiryTimestamp,
            revoked: false,
            exists: true
        });

        if (!_isRecipientTracked[resourceId][recipient]) {
            _isRecipientTracked[resourceId][recipient] = true;
            _resourceRecipients[resourceId].push(recipient);
        }

        if (!_isResourceTrackedForRecipient[recipient][resourceId]) {
            _isResourceTrackedForRecipient[recipient][resourceId] = true;
            _recipientResources[recipient].push(resourceId);
        }

        emit AccessGranted(resourceId, recipient, msg.sender, expiryTimestamp, duration);
    }

    /**
     * @notice Extends an existing permission by additional seconds.
     * @param resourceId Unique identifier of the resource.
     * @param recipient Target wallet address.
     * @param additionalDuration Additional seconds to add to the access duration.
     */
    function extendAccess(
        bytes32 resourceId,
        address recipient,
        uint256 additionalDuration
    ) external onlyResourceOwner(resourceId) {
        if (recipient == address(0)) {
            revert InvalidRecipientAddress();
        }
        if (additionalDuration == 0) {
            revert InvalidDuration();
        }

        Permission storage perm = permissions[resourceId][recipient];
        if (!perm.exists) {
            revert PermissionNotFound(resourceId, recipient);
        }

        uint256 oldExpiry = perm.expiryTimestamp;
        uint256 newExpiry;

        // If currently valid and not revoked, extend from existing expiry
        if (!perm.revoked && oldExpiry > block.timestamp) {
            newExpiry = oldExpiry + additionalDuration;
        } else {
            // If already expired or was revoked, reset expiry from current block.timestamp and unrevoke
            newExpiry = block.timestamp + additionalDuration;
            perm.revoked = false;
        }

        perm.expiryTimestamp = newExpiry;
        perm.grantor = msg.sender;

        emit AccessExtended(resourceId, recipient, oldExpiry, newExpiry, msg.sender);
    }

    /**
     * @notice Manually revokes access for a recipient before its natural expiry.
     * @param resourceId Unique identifier of the resource.
     * @param recipient Target wallet address whose permission is being revoked.
     */
    function revokeAccess(
        bytes32 resourceId,
        address recipient
    ) external onlyResourceOwner(resourceId) {
        Permission storage perm = permissions[resourceId][recipient];
        if (!perm.exists) {
            revert PermissionNotFound(resourceId, recipient);
        }
        if (perm.revoked) {
            revert PermissionAlreadyRevoked(resourceId, recipient);
        }

        perm.revoked = true;

        emit AccessRevoked(resourceId, recipient, msg.sender, block.timestamp);
    }

    // --- Access Verification (Read-Only) ---

    /**
     * @notice Checks whether a wallet address currently holds valid, unexpired, unrevoked access to a resource.
     * @param resourceId Identifier of the resource.
     * @param recipient Wallet address to verify.
     * @return bool True if permission exists, is not revoked, and block.timestamp < expiryTimestamp.
     */
    function hasAccess(bytes32 resourceId, address recipient) external view returns (bool) {
        Permission storage perm = permissions[resourceId][recipient];
        if (!perm.exists || perm.revoked) {
            return false;
        }
        return block.timestamp < perm.expiryTimestamp;
    }

    /**
     * @notice Fetches permission details along with computed active status and seconds remaining.
     * @param resourceId Identifier of the resource.
     * @param recipient Wallet address.
     * @return perm Permission record.
     * @return isActive Whether access is actively valid right now.
     * @return secondsRemaining Number of seconds remaining until expiry (0 if expired or revoked).
     */
    function getPermission(
        bytes32 resourceId,
        address recipient
    )
        external
        view
        returns (
            Permission memory perm,
            bool isActive,
            uint256 secondsRemaining
        )
    {
        perm = permissions[resourceId][recipient];
        if (!perm.exists || perm.revoked || block.timestamp >= perm.expiryTimestamp) {
            isActive = false;
            secondsRemaining = 0;
        } else {
            isActive = true;
            secondsRemaining = perm.expiryTimestamp - block.timestamp;
        }
    }

    // --- Query Helpers for Frontend UI ---

    /**
     * @notice Returns all resources registered by a specific owner.
     */
    function getResourcesByOwner(address owner) external view returns (Resource[] memory) {
        bytes32[] memory ids = _ownerResources[owner];
        Resource[] memory list = new Resource[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            list[i] = resources[ids[i]];
        }
        return list;
    }

    /**
     * @notice Returns all permissions granted under a specific resource.
     */
    function getPermissionsByResource(bytes32 resourceId) external view returns (Permission[] memory) {
        address[] memory recipients = _resourceRecipients[resourceId];
        Permission[] memory list = new Permission[](recipients.length);
        for (uint256 i = 0; i < recipients.length; i++) {
            list[i] = permissions[resourceId][recipients[i]];
        }
        return list;
    }

    /**
     * @notice Returns all permissions granted to a recipient across all resources.
     */
    function getPermissionsByRecipient(address recipient) external view returns (Permission[] memory) {
        bytes32[] memory ids = _recipientResources[recipient];
        Permission[] memory list = new Permission[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            list[i] = permissions[ids[i]][recipient];
        }
        return list;
    }

    /**
     * @notice Returns total number of registered resources.
     */
    function getTotalResourcesCount() external view returns (uint256) {
        return _allResourceIds.length;
    }

    /**
     * @notice Returns all registered resources in the system.
     */
    function getAllResources() external view returns (Resource[] memory) {
        uint256 total = _allResourceIds.length;
        Resource[] memory list = new Resource[](total);
        for (uint256 i = 0; i < total; i++) {
            list[i] = resources[_allResourceIds[i]];
        }
        return list;
    }
}

