App = {
  web3Provider: null,
  contracts: {},

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

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

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
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(document).ready(function() {
    App.init();
  });
});
