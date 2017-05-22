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
  loc: {
    lng: '',
    lat: ''
  },
  data: {},
  selectedItem: {},

  init: function () {
    Main.loc.lng = parseFloat(getParameterByName('lng'));
    Main.loc.lat = parseFloat(getParameterByName('lat'));
    Main.addr = decodeURIComponent(getParameterByName('q'));
    this.getProviders();
    this.updateCart();
    this.bindActions();
  },

  bindActions: function () {
    document.querySelectorAll('.btn-compra').forEach(function(el){
      el.addEventListener('click', function (e){
        e.preventDefault();
        var apiUrl = ('localhost' === window.location.hostname) ?
                            'http://localhost:8086' :
                            'https://pichifood.herokuapp.com';

        $.ajax({
          url: apiUrl + '/checkout',
          method: 'post',
          data: {items: Main.getLocalStorageObject()},
          success: function (data) {
            window.location = data.redirectUrl;
          },
          error: function (err) {
            console.error(err);
          }
        });
        // window.location = apiUrl + '/checkout';
      });
    });
  },

  getProviders: function () {
    var url = 'https://pichifood.herokuapp.com/getFoodByLocation/' + Main.loc.lng + '/' + Main.loc.lat,
        misCabeceras = new Headers(),
        init = { method: 'GET',
               headers: misCabeceras,
               mode: 'cors',
               cache: 'default' };
    fetch(url, init)
    .then(function(response){return response.json();})
    .then(function(data){Main.filterFood(data);});
  },

  filterFood: function (data) {
    this.data = data;
    var filterData = data.providers.filter(function(el){
      return el.products;
    });
    this.renderFood(filterData);
  },

  renderFood: function (data) {
    data.forEach(function(el) {
      el.products.forEach(function(prod){
        Main.renderFoodItem(prod, el);
      });
    });
  },

  renderFoodItem: function (prod, provider) {
    var tpl = document.querySelector('#foodItem').innerHTML,
        el = document.createElement('div');
    el.innerHTML = tpl;
    el.getElementsByTagName('a')[0].dataset.prov_id = provider._id;
    el.getElementsByTagName('a')[0].dataset.prod_id = prod._id;
    el.getElementsByTagName('a')[0].addEventListener('click', this.clickFoodItem);

    el.querySelector('.title').innerHTML = (prod.brand + ' ' + prod.line) || prod.description;
    el.querySelector('.description').innerHTML = '$' + prod.price;

    document.getElementsByClassName('content-list')[0].appendChild(el.getElementsByTagName('a')[0]);
  },

  clickFoodItem: function (e) {
    var data = this.dataset;
    var prov = Main.data.providers.filter(function(el){return el._id === data.prov_id;});
    var prodObj = prov[0].products[data.prod_id - 1],
        $modal = $($('#pichiModal').html());
    Main.selectedItem = prodObj;

    Main.selectedItem.title = prodObj.description;
    Main.selectedItem.unit_price = prodObj.price;
    Main.selectedItem.quantity = 1;
    Main.selectedItem.currency_id = "ARS";
    $modal.find('.modal-title').html(prodObj.brand +' '+ prodObj.line);
    $modal.find('.price').html('$' + prodObj.price);
    $modal.find('.addToCart').on('click', Main.addToCart);

    $modal
    .on('hidden.bs.modal', function(){
      document.querySelector('body').removeChild(document.querySelector('.modal-backdrop'));
      document.querySelector('body').removeChild(document.querySelector('#modal'));
    })
    .on('loaded.bs.modal', function() {
      this.updatePrice(document.getElementById('cantidad'));
    })
    .modal('show');
  },

  getLocalStorageObject: function () {
    var storage = localStorage.pichikout || '[]';
    return JSON.parse(storage);
  },

  saveLocalStorageObject: function (obj) {
    localStorage.pichikout = JSON.stringify(obj);
  },

  addToCart: function() {
    if (undefined === localStorage.pichikout) Main.saveLocalStorageObject([]);
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
    if (add) Main.selectedItem.quantity++;
    else if (Main.selectedItem.quantity > 1) Main.selectedItem.quantity--;
    e.parentNode.querySelector('#cantidad').value = Main.selectedItem.quantity;
console.log(Main.selectedItem,e.parentNode.querySelector('#cantidad').value);
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

      var limit = (el.quantity > 10) ? el.quantity : 10;
      for (var i = 1; i <= limit; i++) {
        var opt = document.createElement('option');
        opt.value = opt.innerHTML = i;
        elCont.querySelector('.cart-prod-cant').appendChild(opt);
      }

      elCont.querySelector('.cart-prod-cant').options[el.quantity - 1].selected = true;
      elCont.querySelector('.cart-prod-title').innerHTML = el.brand +' '+ el.line;
      elCont.querySelector('.cart-prod-price').innerHTML = '$' + el.price * el.quantity;

      elCont.appendChild(document.createElement('hr'));
      document.getElementById('productsContainer').appendChild(elCont);
    });

    this.updateTotalPrice();
  },

  updateTotalPrice: function () {
    var obj = this.getLocalStorageObject(),
        total = 0;
    obj.forEach(function(el){total += el.price * el.quantity;});
    document.querySelectorAll('.total-cart').forEach(function(el){
      el.innerHTML = '$' + total;
    });
  },

  updateCounts: function (scope) {
    var cartItemIndex = scope.parentNode.parentNode.parentNode.dataset.id,
        objCartItems = this.getLocalStorageObject();
    objCartItems[cartItemIndex].quantity = scope.value;
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
  "use strict";
  Main.init();
})();
