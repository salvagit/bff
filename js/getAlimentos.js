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
  addr: '',
  data: {},
  selectedItem: {},
  init: function () {
    this.getProviders();
    Main.addr = decodeURIComponent(getParameterByName('q'));
  },

  getProviders: function () {
    fetch('http://salva.io/bff/food.json')
    .then(function(response){return response.json();})
    .then(function(data){Main.filterFood(data);});
  },

  filterFood: function (data) {
    this.data = data;
    var filterData = data.providers.filter(function(el){
      return el.address === Main.addr;
    });
    this.renderFood(filterData);
  },

  renderFood: function (data) {
    data.forEach(function(el){
      el.products.forEach(function(prod){
        Main.renderFoodItem(prod, el);
      });
    });
  },

  renderFoodItem: function (prod, provider) {
    var tpl = document.querySelector('#foodItem').innerHTML,
        el = document.createElement('div');

    el.innerHTML = tpl;
    el.getElementsByTagName('a')[0].dataset.prov_id = provider.id;
    el.getElementsByTagName('a')[0].dataset.prod_id = prod._id;
    el.getElementsByTagName('a')[0].addEventListener('click', this.clickFoodItem);

    el.querySelector('.title').innerHTML = prod.description;
    el.querySelector('.description').innerHTML = '$' + prod.price;

    document.getElementsByClassName('content-list')[0].appendChild(el.getElementsByTagName('a')[0]);
  },

  clickFoodItem: function (e) {
    var data = e.target.dataset,
        prodObj = Main.data.providers[data.prov_id - 1].products[data.prod_id - 1],
        $modal = $($('#pichiModal').html());
    Main.selectedItem = prodObj;
    Main.selectedItem.cantidad = 1;
    Main.modal = $modal;
    $modal.find('.modal-title').html(prodObj.description);
    $modal.find('.price').html('$' + prodObj.price);
    $modal.find('.addToCart').on('click', Main.addToCart);

    $modal
    .on('hidden.bs.modal', function(){
      document.querySelector('body').removeChild(document.querySelector('.modal-backdrop'))
      document.querySelector('body').removeChild(document.querySelector('#modal'))
    })
    .modal('show');
  },

  addToCart: function() {
    // if (undefined === localStorage['pichikout']) localStorage['pichikout'] = JSON.stringify([]);
    localStorage['pichikout'] = JSON.stringify(Object.assign({}, JSON.parse(localStorage['pichikout']), Main.selectedItem));
    Main.modal.modal('hide');
  },

  doCheckoutMobile: function () {
    document.querySelector('main').classList.toggle('checkout-mobile');
  },

  updatePrice: function (e, add) {
    if (add) Main.selectedItem.cantidad++;
    else if (Main.selectedItem.cantidad > 0) Main.selectedItem.cantidad--;
    e.parentNode.querySelector('#cantidad').value = Main.selectedItem.cantidad;
    document.querySelector('.price').innerHTML = '$' + e.parentNode.querySelector('#cantidad').value * Main.selectedItem.price;
  }

};

(function () {
  Main.init();
})();
