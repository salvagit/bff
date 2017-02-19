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
    .on('shown.bs.modal', function(){
      document.getElementById('saveVeteForm').addEventListener('submit', Main.globals.saveVete);
      document.getElementsByClassName('saveVete')[0].addEventListener('click', Main.globals.doSave);
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

    mock.comments = document.querySelector('#comments').innerHTML;

    var formData = new FormData();
console.log(formData);
    for (var k in mock) {
        formData.append(k, mock[k]);
    }

    fetch("https://pichifood.herokuapp.com/createByContact/", {
    // fetch("http://localhost:8086/createByContact/", {
        method: "POST",
        headers: {
          'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
    .then(function(res){ return res.json(); })
    .then(function(data){ console.log( JSON.stringify( data ) ); });

  }
};

(function () {
  Main.globals.init();
})();
