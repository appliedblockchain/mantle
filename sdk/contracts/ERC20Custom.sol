pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

/**
 * @title ERC20Detailed token
 * @dev The decimals are only for visualization purposes.
 * All the operations are done using the smallest and indivisible token unit,
 * just as on Ethereum all the operations are done in wei.
 */
contract ERC20Custom is ERC20Detailed, ERC20Mintable, ERC20Burnable {
  constructor(string name, string symbol, uint8 decimals, uint256 totalSupply) public ERC20Detailed(name, symbol, decimals) {
    mint(msg.sender, totalSupply);
  }
}
