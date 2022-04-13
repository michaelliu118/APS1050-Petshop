App = {
  web3Provider: null,
  contracts: {},
  // the current user account number.
  account: '0x0', //arsh's addtion
  hasVoted: false, //arsh's addition

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      var breedDropdown = $("#breedFilter");
      var breedList = [];
      var ageDropdown = $("#ageFilter");
      var ageList = [];
      var locationDropdown = $("#locationFilter");
      var locationList = [];


      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
        petTemplate.find('.btn-return').attr('data-id', data[i].id);

        breedList.push(data[i].breed);
        ageList.push(data[i].age);
        locationList.push(data[i].location);

        petsRow.append(petTemplate.html());
      }
      breedList = breedList.filter((item, i, ar) => ar.indexOf(item) === i);
      ageList = ageList.filter((item, i, ar) => ar.indexOf(item) === i);
      locationList = locationList.filter((item, i, ar) => ar.indexOf(item) === i);
      breedList.forEach(function(e, i){
        breedDropdown.append($('<option></option>').text(e)); 
      });
      ageList.forEach(function(e, i){
        ageDropdown.append($('<option></option>').text(e)); 
      });
      locationList.forEach(function(e, i){
        locationDropdown.append($('<option></option>').text(e)); 
      });

      //The filter for pets
      $(document).on('click', '.btn-filter', function(){
        var theBreed = document.getElementById("breedFilter").value;
        var theAge = document.getElementById("ageFilter").value;
        var theLocation = document.getElementById("locationFilter").value;
        petsRow.empty();
        
        console.log(theLocation=="All")
        for (i = 0; i < data.length; i ++) {
          //console.log(i)
          if ((data[i].breed==theBreed || theBreed=="All") && (data[i].age==theAge || theAge=="All") && (data[i].location==theLocation || theLocation=="All")){
            petTemplate.find('.panel-title').text(data[i].name);
            petTemplate.find('img').attr('src', data[i].picture);
            petTemplate.find('.pet-breed').text(data[i].breed);
            petTemplate.find('.pet-age').text(data[i].age);
            petTemplate.find('.pet-location').text(data[i].location);
            petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

            petsRow.append(petTemplate.html());
          }
        }
      });
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });;
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
        /**
        * Feature: Show current user and balance. Arsh
        */
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      const account = accounts[0];
      $('.currUser').text("Current user: " + account);
      // Store the current account number to the gobal variable.
      App.account = accounts[0]
      //Arsh's Addition
      web3.eth.getBalance(account, function(error, balance) {
          if (error) {
            console.log(error);
          }
          var currBalance = web3.fromWei(balance.toNumber(), 'Ether')
          $('.currBalance').text("Current balance: " + currBalance + ' ETH')
      });
    });
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // update info after user made a vote. Arsh
      App.listenForEvents();
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    //binding return pet
    $(document).on("click", '.btn-return', App.handleReturn);
  },

  // Listen for events emitted from the contract Arsh
  listenForEvents: function() {
    App.contracts.Adoption.deployed().then(function(instance) {
      instance.votedEvent({}, {
        // subscribe event for the whole blockchain.
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        // console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.markAdopted();
      });
    });
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;
    
    // for voting and count of adopted and clients visited Arsh
    var num_adopted = 0;
    var clients = new Set();


    var content = $("#content");
    content.hide();
    $('#voteDropList').hide();
    $("#loader").show();

    var petNameList = ["Frieda", "Gina", "Collins", "Melissa", "Jeanine", "Elvia",
                       "Latisha", "Coleman", "Nichole", "Fran", "Leonor", "Dean",
                       "Stevenson", "Kristina", "Ethel", "Terry"];

    $('#petsAdoptedNum').text("Total number of pets adopted: " + num_adopted)
    $('#clientsAdoptedNum').text("Total number of clients: " + clients.size)

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          
          num_adopted++; //increment count Arsh
          clients.add(adopters[i])  //increment count Arsh

          $(".panel-pet").eq(i).find(".btn-adopt").text('Success').attr('disabled', true);
          $(".panel-pet").eq(i).find(".btn-return").removeProp("disabled").addClass("btn-danger");
          $(".panel-pet").eq(i).find(".adopter-address").html(adopters[i]);
        }
      }

      // Show info (balance, pets adopted so far) for the current user Arsh.
      web3.eth.getAccounts(function(error, accounts) {
        // accounts[0] is the current user.
        if (error) {
          console.log(error);
        }
        var currentPetsList = [];
        for (i = 0; i < adopters.length; i++) {
          if (adopters[i] === accounts[0]) {
              currentPetsList.push(petNameList[i]);
          }
        }
        $('.currentPets').text("The pets you have adopted: " + currentPetsList);
        web3.eth.getBalance(accounts[0], function(error, balance) {

            if (error) {
              console.log(error);
            }
            var currBalance = web3.fromWei(balance.toNumber(), 'Ether')
            $('.currBalance').text("Current balance: " + currBalance + ' ETH')
            // show the candidate pets ballot option if currentBalance > 0 (allow the user to vote). Arsh
            if (currBalance > 0) {
                var candArray = [];
                for (var i = 1; i <= 16; i++) { // candidatesCount=16
                    candArray.push(adoptionInstance.candidates(i));
                }

                Promise.all(candArray).then(function(values) {
                    var candidatesResults = $("#candidatesResults");
                    candidatesResults.empty();

                    var candidatesSelect = $('#candidatesSelect');
                    candidatesSelect.empty();

                  for (var i = 0; i < 16; i++) { // candidatesCount=16
                    var id = values[i][0];
                    var name = values[i][1];
                    var voteCount = values[i][2];

                    if (voteCount.toNumber()>0) {
                        // Render candidate Result only if the vote is non-zero.
                        var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
                        candidatesResults.append(candidateTemplate);
                    }

                    // Render candidate ballot option
                    var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
                    candidatesSelect.append(candidateOption);
                  }
                });
                // show the voting components.
                content.show();
                // $('#voteDropList').show();
                // check if user has already voted.
                adoptionInstance.voters(accounts[0]).then(function(hasVoted) {
                  if (hasVoted) {
                      // Do not allow a user to vote twice.
                      $("#voteDropList").hide();
                      $("#hasVoted").show();
                  } else {
                      $("#voteDropList").show();
                  }
                  $("#loader").hide();
                }).catch(function(error) {
                  console.warn(error);
                });
            } else {
                // no balance
                $("#noBalanceForVote").show();
            }
        });
      });

      /**
      * Feature 2: Record number of pets adopted, number of clients
      */
      $("#petsAdoptedNum").text("Total number of pets adopted: " + num_adopted)
      $("#clientsAdoptedNum").text("Total number of clients: " + clients.size)

      
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petNameList = ["Frieda", "Gina", "Collins", "Melissa", "Jeanine", "Elvia",
                       "Latisha", "Coleman", "Nichole", "Fran", "Leonor", "Dean",
                       "Stevenson", "Kristina", "Ethel", "Terry"];  //Arsh

    var petId = parseInt($(event.target).data('id'));
    var petName = petNameList[petId];

    /*
     * Replace me...
     */
    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        
        // Show the name of the pet the user have just adopted. Arsh
        $('.alert').text('You have successfully adopted ' + petName + '!');

        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

markReturned: function(adopters, account){
 
	var adoptionInstance;

	App.contracts.Adoption.deployed().then(function (instance) {
	  adoptionInstance = instance;
    

	  return adoptionInstance.getAdopters.call();
	})
  .then(function(adopters){

	  for (i=0;i<adopters.length;i++){
	    if (adopters[i]=='0x0000000000000000000000000000000000000000') {
        console.log('ahahahaah3');
        $(".panel-pet").eq(i).find(".btn-adopt").text('Adopt').removeProp("disabled");
        $(".panel-pet").eq(i).find(".btn-return").prop("disabled", true).removeClass("btn-danger");
        $(".panel-pet").eq(i).find(".adopter-address").html('');
    }
	}
  }).catch(function(err) {
	console.log(err.message);
});
},
//handleReturn
handleReturn: function(event) {
  event.preventDefault();

  var petId = parseInt($(event.target).data('id'));

  var returningInstance;

  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];

    App.contracts.Adoption.deployed().then(function(instance) {
      returningInstance = instance;

      // Execute adopt as a transaction by sending account
      return returningInstance.returnPet(petId, {from: account});
    }).then(function(result) {
      return App.markReturned();
    }).catch(function(err) {
      console.log(err.message);
    });
  });
},

  // handle the voting process when user click the vote button. Arsh
  castVote: function() {
    // the candidate petID
    var candidateId = $('#candidatesSelect').val();

    App.contracts.Adoption.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $('#voteDropList').hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }


};

$(function() {

  //$(window).load(function() { Arsh
  $(document).ready(function() {
    App.init();
  });
});
