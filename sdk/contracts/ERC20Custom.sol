pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

/**
 * @title ERC20Custom token
 * @dev A typical ERC20 as it would be encountered in the wild. Includes token details, and the ability to mind and burn tokens.
 */
contract ERC20Custom is ERC20Detailed, ERC20Mintable, ERC20Burnable {
  constructor(string name, string symbol, uint8 decimals, uint256 totalSupply) public ERC20Detailed(name, symbol, decimals) {
    mint(msg.sender, totalSupply);
  }
}
