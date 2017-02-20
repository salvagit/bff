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

    mock.comments = document.querySelector('#comments').value;

    // fetch("http://localhost:8086/createByContact/", {
    fetch("https://pichifood.herokuapp.com/createByContact/", {
        method: "POST",
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(mock)
    })
    .then(function(res){ return res.json(); })
    .then(function(data){ console.log( data ); });

  }
};

(function () {
  Main.globals.init();
})();
