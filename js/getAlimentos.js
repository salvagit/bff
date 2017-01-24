'use stricts';

function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var Main = {
  addr: '',
  init: function () {
    this.getProviders();
    Main.addr = decodeURIComponent(getParameterByName('q'));
  },
  bindActions: function () {
    document.querySelector('.search-food').addEventListener('click', function(e){
      e.preventDefault();
      console.log('serching ..');
    });
  },
  getProviders: function () {
    fetch('http://salva.io/bff/food.json')
    .then(function(response){return response.json();})
    .then(function(data){Main.filterFood(data)});
  },
  filterFood: function (data) {
    console.log(data);
    var filterData = data.providers.filter(function(el){
      return el.address === Main.addr
    });
    this.renderFood(filterData);
  },
  renderFood: function (data) {
    console.log(data);
  }
};

(function () {
  Main.init();
})();
