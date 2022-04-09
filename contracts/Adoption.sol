pragma solidity ^0.5.0;

contract Adoption {
	address[16] public adopters;


  // Adopting a pet
  function adopt(uint petId) public returns (uint) {
    require(petId >= 0 && petId <= 15);

    adopters[petId] = msg.sender;

    return petId;
  }

  // Retrieving the adopters
  function getAdopters() public view returns (address[16] memory) {
    return adopters;
  }
  
  //Returning a pet
  function returnPer(uint petId) public returns(uint){
    require(petId >=0 && petId <=15);
    
	//if the animal has been adopted by msg.sender, the animal can be returned
	if (adopters[petId]==msg.sender){
		//"Return" an animal by setting the address of it's adopter back to 0
		adopters[petId]=address(0);
	}

	return petId;    
  }
}