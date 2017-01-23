'use stricts';

var Main = {
  init: function () {
    console.log('Main Init');
    var bgImg = "url('images/image" + Math.ceil(Math.random() * 5) +".jpg' )";
    document.getElementsByClassName('container-fluid')[0].style.backgroundImage = bgImg;
    console.log(bgImg);
    this.bindActions();
  },
  bindActions: function () {
    document.querySelector('.search-food').addEventListener('click', function(e){
      e.preventDefault();
      console.log('serching ..');
      fetch('food.json')
      .then(function(response){return response.json();})
      .then(function(data){
        console.log(data);
      });
    });
  }
};

(function () {
  Main.init();
})();
