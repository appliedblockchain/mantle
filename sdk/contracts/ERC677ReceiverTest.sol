pragma solidity ^0.4.24;

import "./lib/ERC677Receiver.sol";
import "./ERC20Custom.sol";

contract ERC677ReceiverTest is ERC677Receiver {

  ERC20Custom token;
  event Data(string data);

  constructor(address _tokenAddress) public {
    token = ERC20Custom(_tokenAddress);
  }

  function onTokenTransfer(address _from, uint256 _amount, bytes _data) public returns (bool success) {
    token.transferFrom(_from, address(this), _amount);
    emit Data(string(_data));
    return true;
  }
}
