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
    Main.updateCart();
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
    var data = this.dataset;
    var prodObj = Main.data.providers[data.prov_id - 1].products[data.prod_id - 1],
        $modal = $($('#pichiModal').html());
    Main.selectedItem = prodObj;
    Main.selectedItem.cantidad = 1;
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

  getLocalStorageObject: function () {
    return JSON.parse(localStorage['pichikout']);
  },

  saveLocalStorageObject: function (obj) {
    localStorage['pichikout'] = JSON.stringify(obj);
  },

  addToCart: function() {
    if (undefined === localStorage['pichikout']) Main.saveLocalStorageObject([]);
    var obj = Main.getLocalStorageObject();
    obj.push(Main.selectedItem);
    Main.saveLocalStorageObject(obj);
    Main.updateCart();
    $('#modal').modal('hide');
  },

  doCheckoutMobile: function () {
    document.querySelector('main').classList.toggle('checkout-mobile');
  },

  updatePrice: function (e, add) {
    if (add) Main.selectedItem.cantidad++;
    else if (Main.selectedItem.cantidad > 1) Main.selectedItem.cantidad--;
    e.parentNode.querySelector('#cantidad').value = Main.selectedItem.cantidad;
    document.querySelector('.price').innerHTML = '$' + e.parentNode.querySelector('#cantidad').value * Main.selectedItem.price;
  },

  updateCart: function () {
    var itemTpl = document.getElementById('cartItem').innerHTML,
        objCartItems = this.getLocalStorageObject();

    document.getElementsByClassName('address')[0].innerHTML = Main.addr;

    document.getElementById('productsContainer').innerHTML = '';
    objCartItems.forEach(function (el) {

      var elCont = document.createElement('div');
      elCont.innerHTML = itemTpl;
      elCont.dataset.id = objCartItems.indexOf(el);

      var limit = (el.cantidad > 10) ? el.cantidad : 10;
      for (var i = 1; i <= limit; i++) {
        var opt = document.createElement('option');
        opt.value = opt.innerHTML = i;
        elCont.querySelector('.cart-prod-cant').appendChild(opt);
      }

      elCont.querySelector('.cart-prod-cant').options[el.cantidad - 1].selected = true;
      elCont.querySelector('.cart-prod-title').innerHTML = el.description;
      elCont.querySelector('.cart-prod-price').innerHTML = '$' + el.price * el.cantidad;

      elCont.appendChild(document.createElement('hr'));
      document.getElementById('productsContainer').appendChild(elCont);
    });

    this.updateTotalPrice();
  },

  updateTotalPrice: function () {
    var obj = this.getLocalStorageObject(),
        total = 0;
    obj.forEach(function(el){total += el.price * el.cantidad});
    document.querySelectorAll('.total-cart').forEach(function(el){
      el.innerHTML = '$' + total;
    });
  },

  updateCounts: function (scope) {
    var cartItemIndex = scope.parentNode.parentNode.parentNode.dataset.id,
        objCartItems = this.getLocalStorageObject();
    objCartItems[cartItemIndex].cantidad = scope.value;
    this.saveLocalStorageObject(objCartItems);
    this.updateCart();
  },

  removeCartItem: function(scope) {
    var index = scope.parentNode.parentNode.dataset.id,
        obj = this.getLocalStorageObject();
    this.saveLocalStorageObject(obj.slice(0,index).concat(obj.slice(index + 1)));
    this.updateCart();
  }

};

(function () {
  Main.init();
})();
