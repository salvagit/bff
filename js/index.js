var Main = {
  init: function () {
    var bgImg = "url('images/image" + Math.ceil(Math.random() * 5) +".jpg' )";
    document.getElementsByClassName('content')[0].style.backgroundImage = bgImg;
    this.bindActions();
  },
  bindActions: function () {
    var form = document.getElementById('searchForm');

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.location = './alimentos-por-zona.html?q=' +
                         encodeURI(this.getElementsByTagName('input')[0].value);
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
