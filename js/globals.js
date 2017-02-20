
Main.globals = {
  init: function () {
    'use strict';
    this.bindActions();
  },
  bindActions: function() {
    document.getElementById('getModalVete').addEventListener('click', Main.globals.openVeteModal);
  },
  openVeteModal: function (e) {
    e.preventDefault();
    $($('#addVeteModal').html())
    .on('hidden.bs.modal', function(){
      document.querySelector('body').removeChild(document.querySelector('.modal-backdrop'));
      document.querySelector('body').removeChild(document.querySelector('#modal'));
    })
    .on('shown.bs.modal', function(e) {
      document.getElementById('saveVeteForm').addEventListener('submit', Main.globals.saveVete);
      document.getElementsByClassName('saveVete')[0].addEventListener('click', Main.globals.doSave);

      var autocomplete2 = new google.maps.places.Autocomplete(document.querySelector('#addrModal'), {
        types: ['geocode'],
        componentRestrictions: {country: 'ar'}
      });
      // When the user selects an address from the dropdown, populate the address
      // fields in the form.
      autocomplete2.addListener('place_changed', function (a,b) {
        // Get the place details from the autocomplete object.
        var place = this.getPlace();
        document.querySelector('#latitude').value = place.geometry.location.lat();
        document.querySelector('#longitude').value = place.geometry.location.lng();
      });

    })
    .modal('show');
  },
  doSave:function (e) {
    e.preventDefault();
    var submitForm = new Event('submit');
    document.getElementById('saveVeteForm').dispatchEvent(submitForm);
  },
  saveVete: function (e) {

    e.preventDefault();
    var mock = {};

    this.querySelectorAll('input').forEach(function (el) {
      mock[el.name] = el.value;
    });

    mock.comments = document.querySelector('#comments').value;

    var apiUrl = ('localhost' === window.location.hostname) ?
                        'http://localhost:8086' :
                        'https://pichifood.herokuapp.com';

    $.ajax({
      url: apiUrl + '/createByContact/',
      method: 'post',
      data: mock,
      success: function(status, data) {
        console.log(status, data);
      }
    });
    $('#modal').modal('hide');

  }
};

(function () {
  Main.globals.init();
})();
