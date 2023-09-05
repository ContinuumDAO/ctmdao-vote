// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.19;


contract CTMDAOVOTE { 

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event Mint(address indexed _to, uint256 _amount);
    event ContinuumDAOMintEnded();

    string public constant name = "Continuum DAO Vote";
    string public constant symbol = "CTMDAOVOTE";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    uint256 public holders;
 
    address public admin;

    bool public mintingOver;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() {
        admin = msg.sender;
    }

    // empty transfer function kept in for ERC20 compliance
    function transfer(address _to, uint256 _value) public returns (bool success) {
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // empty transferFrom function kept in for ERC20 compliance
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        emit Transfer(_from, _to, _value);
        return true;
    }

    // empty approve function kept in for ERC20 compliance
    function approve(address _spender, uint256 _value) public returns (uint256 remaining) {
        emit Approval(msg.sender, _spender, _value);
        return 0;
    }

    function mint(address _to, uint256 _amount) public {
        require(!mintingOver, "Minting is over");
        require(msg.sender == admin, "Admin only minting");

        if(balanceOf[_to] == 0) holders++;
        balanceOf[_to] += _amount;
        totalSupply += _amount;

        emit Mint(_to, _amount);
    }

    function endMinting() public {
        require(msg.sender == admin, "Admin only");
        require(!mintingOver, "Minting is over");

        mintingOver = true;

        emit ContinuumDAOMintEnded();
    }
}