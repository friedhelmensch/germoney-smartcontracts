pragma solidity ^0.4.24;

import "./TokenERC20.sol";
import "./owned.sol";

contract Germoney is owned, TokenERC20 {

    uint256 public price;

    /* Initializes contract with initial supply tokens to the creator of the contract */
    constructor (uint256 _price) TokenERC20(13000000000, "Germoney", "GER") public {
        require (_price > 0, "price can not be 0");
        price = _price;
    }

    /* Internal transfer, only can be called by this contract */
    function _transfer(address _from, address _to, uint _value) internal {
        require (_to != 0x0, "not allowed. Use burn instead");      
        require (balanceOf[_from] >= _value, "balance insufficient");
        require (balanceOf[_to] + _value > balanceOf[_to], "overflow detected");
        balanceOf[_from] -= _value;                         // Subtract from the sender
        balanceOf[_to] += _value;                           // Add the same to the recipient
        emit Transfer(_from, _to, _value);
    }

    function _buy(uint256 ethToBuy) internal {
        uint amount = ethToBuy / price;               
        _transfer(this, msg.sender, amount);     
    }
    /// @notice Buy tokens from contract by sending ether
    function buy() public payable {
        _buy(msg.value);      
    }

    function() public payable {
        _buy(msg.value);      
    }

    function withdraw(address _to) external onlyOwner {
        _to.transfer(address(this).balance);
    }
}