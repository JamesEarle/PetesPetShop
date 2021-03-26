// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0 <= 0.8.3;

contract Adoption {
    address[16] public adopters;

    // Adopt a pet
    function adopt(uint petId) public returns (uint name) {
        require(petId >= 0 && petId <= 15, "Invalid petId range");

        adopters[petId] = msg.sender;

        return petId;
    }

    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }
}