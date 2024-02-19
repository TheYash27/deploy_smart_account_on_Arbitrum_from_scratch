// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/interfaces/IAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

contract Account is IAccount {
    uint8 public count;
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function validateUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256) external view returns (uint256 validationData) {
        address recovered_address = ECDSA.recover(ECDSA.toEthSignedMessageHash(userOpHash), userOp.signature);

        return (recovered_address == owner) ? 0 : 1;
    }

    function execute() external {
        count++;
    }
}

contract AccountFactory {
    function createAccount(address owner) external returns (address) {
        bytes32 salt = bytes32(uint256(uint160(owner)));
        bytes memory bytecode = abi.encodePacked(type(Account).creationCode, abi.encode(owner));

        address addressIfSmartAccountExists = Create2.computeAddress(salt, keccak256(bytecode));
        if (addressIfSmartAccountExists.code.length > 0) {
            return addressIfSmartAccountExists;
        }

        return deploy(salt, bytecode);
    }

    function deploy(bytes32 salt, bytes memory bytecode) internal returns (address addr) {
        require(bytecode.length != 0, "Create2: bytecode length is zero");
        /// @solidity memory-safe-assembly
        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        require(addr != address(0), "Create2: Failed on deploy");
    }
}