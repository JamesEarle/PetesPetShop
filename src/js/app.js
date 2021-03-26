App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;

      try {
        await window.ethereum.enable();
      } catch (err) {
        console.error("User denied account access")
      }
    } else if (window.web3) {
      // Legacy browsers
      App.web3Provider = window.web3.currentProvider;
    } else {
      // If no web3 instance provided fall back to Ganache
      App.web3Provider = new Web3.providers.HttpRequest("http://localhost:7545");
    }

    web3 = new Web3(App.web3Provider)

    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Adoption.json", function(data) {
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
      App.contracts.Adoption.setProvider(App.web3Provider);

      return App.markAdopted();
    });

    return App.bindEvents(); // replace this too?
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      // Using call() allows us to read data from the blockchain without having 
      // to send a full transaction, meaning we won't have to spend any ether.
      return adoptionInstance.getAdopters.call();
    }).then(adopters => {
      // adopters.forEach ??
      for (i = 0; i < adopters.length; i++) {
        // Intentionally check empty address, not Null or other falsey value
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          // gross...
          $('.panel-pet').eq(i).find('button').text('Adopted!').attr('disabled', true);
        }
      }
    }).catch(function(error) {
      console.log(err.message); // log not error?
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(err, accounts) { // do we get a new account per thing?
      if (err) console.log(err.message);

      var account = accounts[0];

      // can't we just pass the instance into the next function?
      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance; // why assign a variable?

        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(res) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
