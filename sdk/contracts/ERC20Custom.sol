pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "./lib/ERC677Receiver.sol";

/**
 * @title ERC20Custom token
 * @dev A typical ERC20 as it would be encountered in the wild. Includes token details, and the ability to mind and burn tokens.
 */
contract ERC20Custom is ERC20Detailed, ERC20Mintable, ERC20Burnable {

  event Transfer(address from, address to, uint value, bytes data);

  constructor(string name, string symbol, uint8 decimals, uint256 totalSupply) public ERC20Detailed(name, symbol, decimals) {
    super.mint(msg.sender, totalSupply);
  }
  /**
   * @dev Transfer tokens, and call on tokenTransfer on the target if the target is a contract.
   *      If the target is a contract, it must implement the ERC677Receiver interface.
   */
  function transferAndCall(address _to, uint _value, bytes _data) public returns (bool success) {
    emit Transfer(msg.sender, _to, _value, _data);

    if (isContract(_to)) {
      super.approve(_to, _value);
      contractFallback(_to, _value, _data);
    } else {
      super.transfer(_to, _value);
    }

    return true;
  }

  function contractFallback(address _to, uint _value, bytes _data) private returns (bool) {
    ERC677Receiver receiver = ERC677Receiver(_to);
    require(receiver.onTokenTransfer(msg.sender, _value, _data));
  }

  function isContract(address _addr) private view returns (bool hasCode) {
    uint length;
    assembly { length := extcodesize(_addr) }
    return length > 0;
  }
}
