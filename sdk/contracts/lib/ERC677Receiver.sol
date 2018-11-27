pragma solidity ^0.4.18;

contract ERC677Receiver {

  function onTokenTransfer(address from, uint256 amount, bytes data) public returns (bool success);
}
