// This example displays an address form, using the autocomplete feature
// of the Google Places API to help users fill in the information.

var placeSearch, autocomplete;
var componentForm = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  country: 'long_name',
  postal_code: 'short_name'
};

function initAutocomplete() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
      {types: ['geocode'],
      componentRestrictions: {country: 'ar'}});

  // When the user selects an address from the dropdown, populate the address
  // fields in the form.
  autocomplete.addListener('place_changed', fillInAddress);
}

// [START region_fillform]
function fillInAddress() {
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();

  Main.location = {
    latitude: place.geometry.location.lat(),
    longitude: place.geometry.location.lng()
  };

}

var Main = {
  init: function () {
    var bgImg = "url('images/image" + Math.ceil(Math.random() * 5) +".jpg' )";
    document.getElementsByClassName('content')[0].style.backgroundImage = bgImg;
    this.bindActions();
    this.updateCart();
  },
  bindActions: function () {
    var form = document.getElementById('searchForm');

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      window.location = './alimentos-por-zona.html?q=' +
                         encodeURI(this.getElementsByTagName('input')[0].value) +
                         '&lat=' + Main.location.latitude + '&lng=' + Main.location.longitude;
    });

    document.querySelector('.search-food').addEventListener('click', function(e){
      e.preventDefault();
      console.log(this, form);
      var submitForm = new Event('submit');
      form.dispatchEvent(submitForm);
      // document.getElementById('searchForm').submit();
    });
  }
};

(function () {
  "use strict";
  Main.init();
})();
