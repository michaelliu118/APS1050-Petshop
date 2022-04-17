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
  

  function returnPet(uint petId) public returns (uint) {
    require(petId >= 0 && petId <= 15);

    // If the animal has been adopted by msg.sender, the pet can be returned
    if (adopters[petId] == msg.sender) {
      // "Return" an pet by setting the address of it's adopter back to 0
      adopters[petId] = address(0);
    }
    return petId;
  }

  // Contract for the new voting feature.
	// Model a Candidate
	struct Candidate {
		//uint id;
		//string name;
		//uint voteCount;

		uint id; //Added by Luke
        string name; //Added by Luke
        string breed; //Added by Luke
        uint age; //Added by Luke
        string loc; //Added by Luke
        string img; //Added by Luke
        uint voteCount; //Added by Luke
	}

	// Store accounts that have voted
	mapping(address => bool) public voters;
	// Store Candidates
	// Fetch Candidate
	mapping(uint => Candidate) public candidates;
	// Store Candidates Count
	uint public candidatesCount;

	// voted event
	event votedEvent (
		uint indexed _candidateId
	);

	//Added by luke
	event registeredEvent (
        uint indexed candidatesCount
    );

	constructor () public {
		//addCandidate("Frieda");
		//addCandidate("Gina");
		//addCandidate("Collins");
		//addCandidate("Melissa");
		//addCandidate("Jeanine");
		//addCandidate("Elvia");
		//addCandidate("Latisha");
		//addCandidate("Coleman");
		//addCandidate("Nichole");
		//addCandidate("Fran");
		//addCandidate("Leonor");
		//addCandidate("Dean");
		//addCandidate("Stevenson");
		//addCandidate("Kristina");
		//addCandidate("Ethel");
		//addCandidate("Terry");

		addCandidate("Frieda", "Scottish Terrier", 3, "Lisco, Alabama", "images/scottish-terrier.jpeg");
		addCandidate("Gina", "Scottish Terrier", 3, "Tooleville, West Virginia", "images/scottish-terrier.jpeg");
		addCandidate("Collins", "French Bulldog", 2, "Freeburn, Idaho", "images/french-bulldog.jpeg");
		addCandidate("Melissa", "Boxer", 2, "Camas, Pennsylvania", "images/boxer.jpeg");
		addCandidate("Jeanine", "French Bulldog", 2, "Gerber, South Dakota", "images/french-bulldog.jpeg");
		addCandidate("Elvia", "French Bulldog", 3, "Innsbrook, Illinois", "images/french-bulldog.jpeg");
		addCandidate("Latisha", "Golden Retriever", 3, "Soudan, Louisiana", "images/golden-retriever.jpeg");
		addCandidate("Coleman", "Golden Retriever", 3, "Jacksonwald, Palau", "images/golden-retriever.jpeg");
		addCandidate("Nichole", "French Bulldog", 2, "Honolulu, Hawaii", "images/french-bulldog.jpeg");
		addCandidate("Fran", "Boxer", 3, "Matheny, Utah", "images/boxer.jpeg");
		addCandidate("Leonor", "Boxer", 2, "Tyhee, Indiana", "images/boxer.jpeg");
		addCandidate("Dean", "Scottish Terrier", 3, "Windsor, Montana", "images/scottish-terrier.jpeg");
		addCandidate("Stevenson", "French Bulldog", 3, "Kingstowne, Nevada", "images/french-bulldog.jpeg");
		addCandidate("Kristina", "Golden Retriever", 4, "Sultana, Massachusetts", "images/golden-retriever.jpeg");
		addCandidate("Ethel", "Golden Retriever", 2, "Broadlands, Oregon", "images/golden-retriever.jpeg");
		addCandidate("Terry", "Golden Retriever", 2, "Dawn, Wisconsin", "images/golden-retriever.jpeg");
	}

	function addCandidate (string memory _name, string memory _breed, uint _age, string memory _loc, string memory _img) private { //Added by luke
	//function addCandidate (string memory _name) private {
		candidatesCount ++;
		//candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);  //commented out to put in full info
		candidates[candidatesCount] = Candidate(candidatesCount, _name, _breed, _age, _loc, _img, 0); //added by Luke
	}

	function vote (uint _candidateId) public {
		// require that they haven't voted before
		require(!voters[msg.sender]);

		// require a valid candidate
		require(_candidateId > 0 && _candidateId <= candidatesCount);

		// record that voter has voted
		voters[msg.sender] = true;

		// update candidate vote Count
		candidates[_candidateId].voteCount ++;

		// trigger voted event
		emit votedEvent(_candidateId);
	}

	function register (string memory _name, string memory _breed, uint _age, string memory _loc, string memory _img) public {

        addCandidate(_name, _breed, _age, _loc, _img); //Added by Luke
		//addCandidate(_name);

        emit registeredEvent(candidatesCount);
    }
}