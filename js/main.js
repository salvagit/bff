'use stricts';

var Main = {
  init: function () {
    console.log('Main Init');
    var bgImg = "url('images/image" + Math.ceil(Math.random() * 5) +".jpg' )";
    document.getElementsByClassName('container-fluid')[0].style.backgroundImage = bgImg;
    this.bindActions();
  },
  bindActions: function () {
    var form = document.getElementById('searchForm');

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      window.location = './alimentos-por-zona.html?q=' +
      encodeURI(this.getElementsByTagName('input')[0].value);
    });

    document.querySelector('.search-food').addEventListener('click', function(e){
      e.preventDefault();
      form.dispatchEvent('submit');
    });
  }
};

(function () {
  Main.init();
})();
