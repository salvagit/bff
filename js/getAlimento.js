"use strict";

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
  init: function () {
    this.getProviders();
  },
  getProviders: function () {
    fetch('http://salva.io/bff/food.json')
    .then(function(response){return response.json();})
    .then(function(data){Main.filterFood(data);});
  },
  filterFood: function (data) {
    var filterData = data.providers.filter(function(el){
      return el.id === getParameterByName('id');
    });
    this.renderFood(filterData);
  },
  renderFood: function (data) {
    document.getElementsByClassName('food-container')[0].innerHTML = JSON.stringify(data);
    /*
    data.forEach(function(el){
      el.products.forEach(function(prod){
        Main.renderFoodItem(prod, el);
      });
    });
    */
  },
  renderFoodItem: function (prod, provider) {
    var tpl = document.querySelector('#foodItem').innerHTML,
        el = document.createElement('div');
    el.innerHTML = tpl;
    el.getElementsByTagName('a')[0].href = './alimento.html?id=' + provider.id;
    el.querySelector('.title').innerHTML = prod.description;
    el.querySelector('.description').innerHTML = '$' + prod.price;
    document.getElementsByClassName('food-container')[0].appendChild(el);
  }
};

(function () {
  Main.init();
})();
