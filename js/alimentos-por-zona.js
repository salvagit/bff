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
  itemsPerPage: 10,
  pageActive: 0,

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
    // @todo resolve from server side.
    var arrProds = [];
    data.providers.forEach(function (el) {
      if(!el.products) return false;
      el.products.forEach(function(prod) {
        prod.providerId = el._id;
        if(!prod.price || !prod.brand || !prod.line) return false;
        arrProds.push(prod);
      });
    });
    this.products = arrProds;
    this.renderFood();
  },

  renderFood: function (products) {
    window.scrollTo(0,0);
    document.getElementsByClassName('content-list')[0].innerHTML = '';
    products = products || this.products.slice(0,this.itemsPerPage);
    products.forEach(function(prod){
      Main.renderFoodItem(prod);
    });
    this.products = this.products.sort(function(a,b) {return a.price > b.price;});
    this.renderPaginator();
  },

  renderFoodItem: function (prod) {
    var tpl = document.querySelector('#foodItem').innerHTML,
        el = document.createElement('div');
    el.innerHTML = tpl;
    el.getElementsByTagName('a')[0].dataset.prov_id = prod.providerId;
    el.getElementsByTagName('a')[0].dataset.prod_id = prod._id;
    el.getElementsByTagName('a')[0].addEventListener('click', this.clickFoodItem);

    el.querySelector('.title').innerHTML = prod.brand + ' ' + prod.line;
    el.querySelector('.description').innerHTML = '$' + prod.price;

    document.getElementsByClassName('content-list')[0].appendChild(el.getElementsByTagName('a')[0]);
  },

  renderPaginator: function () {
    var ul = document.createElement('ul');
    ul.className = 'pagination center';
    pages = Math.floor(Main.products.length / this.itemsPerPage);
    for (var i = 0; i < pages; i++) {
      var li = document.createElement('li');
      if (i === Main.pageActive - 1) li.className = "active";
      var a = document.createElement('a');
      a.href = "#";
      a.addEventListener('click', this.doPaginate);
      a.innerHTML = i + 1;
      li.appendChild(a);
      ul.appendChild(li);
    }
    document.getElementsByClassName('content-list')[0].appendChild(ul);
  },

  doPaginate: function(e) {
    e.preventDefault();
    Main.pageActive = e.target.innerHTML;
    var to = Main.pageActive * Main.itemsPerPage;
    var from = to - Main.itemsPerPage;
    Main.renderFood(Main.products.slice(from, to));
  },

  clickFoodItem: function (e) {
    var data = this.dataset;
    var prodObj = Main.products.filter(function(el) {
      //console.log ( (el.providerId === data.prov_id) && (el._id === parseInt(data.prod_id)) );
      return (el.providerId === data.prov_id) && (el._id === parseInt(data.prod_id));
    });
    // var prodObj = prov[0].products[data.prod_id - 1],
    var $modal = $($('#pichiModal').html());
    Main.selectedItem = prodObj[0];

    Main.selectedItem.title = prodObj[0].description;
    Main.selectedItem.unit_price = prodObj[0].price;
    Main.selectedItem.quantity = 1;
    Main.selectedItem.currency_id = "ARS";
    $modal.find('.modal-title').html(prodObj[0].brand +' '+ prodObj[0].line);
    $modal.find('.price').html('$' + prodObj[0].price);
    $modal.find('.addToCart').on('click', Main.addToCart);

    $modal
    .on('hidden.bs.modal', function(){
      document.querySelector('body').removeChild(document.querySelector('.modal-backdrop'));
      document.querySelector('body').removeChild(document.querySelector('#modal'));
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
