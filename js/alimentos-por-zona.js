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
  pageActive: 1,

  products: {
    original: [],
    filtered: []
  },

  filters: [],

  init: function () {
    Main.loc.lng = parseFloat(getParameterByName('lng'));
    Main.loc.lat = parseFloat(getParameterByName('lat'));
    Main.addr = decodeURIComponent(getParameterByName('q'));

    this.getProducts()
    .then(function(prods) {
      Main.products.original = prods;
      Main.filter.init(prods);
      Main.renderFood(prods);
    });

    this.updateCart();
    this.bindActions.init();
  },

  bindActions: {
    init: function () {
      this.checkout();
      this.sorts.init();
    },
    checkout: function () {
      function doCheckout(e) {
        e.preventDefault();
        var apiUrl = ('pichi.local' === window.location.hostname) ?
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
      }
      document.querySelectorAll('.btn-compra').forEach(function(el) {
        el.addEventListener('click', doCheckout);
      });
    },
    // bind filters
    filters: {
      init: function (prods) {
        this.render(prods);
      },
      render: function (prods) {
        var brands = Main.filter.getBrands(prods);
        document.querySelector('.filter-brand')
        .querySelector('.dropdown-menu').innerHTML='';
        brands.forEach(function(el) {
          var a = document.createElement('a');
          var li = document.createElement('li');
          a.innerHTML = el;
          a.role = "menuitem";
          a.href = "#";
          a.dataset.kind = "brand";
          a.dataset.name = el.replace(' ','_').toLowerCase();
          a.dataset.show = el;
          a.addEventListener('click', Main.bindActions.filters.pushFilter);
          // li.role = "presentation";
          li.appendChild(a);
          document.querySelector('.filter-brand')
          .querySelector('.dropdown-menu')
          .append(li);
        });
      },
      pushFilter: function () {
        var f = this.dataset;
        //
        if (Main.filters.filter(function(a) {
          return a.kind == f.kind &&
                 a.name == f.name;
        }).length) return false;

        var chip = document.createElement('span'),
            close = document.createElement('span'),
            name = document.createElement('small');

        chip.className = 'chip btn btn-default btn-xs';
        Object.assign(chip.dataset, this.dataset);

        close.className = 'close pull-left';

        close.addEventListener('click', Main.filter.remove);
        close.innerHTML = '&times;';

        name.className = 'name';
        name.innerHTML = this.dataset.show;

        chip.appendChild(close);
        chip.appendChild(name);

        document.getElementById('activeFilters').appendChild(chip);
        Main.bindActions.filters.refresh();
      },
      refresh: function () {
        var filters = [];
        document.querySelectorAll('#activeFilters > span').forEach(function(el){
          filters.push(el.dataset);
        });
        Main.filters = filters;
        if (!filters.length) Main.filter.reset();
        Main.filter.init(Main.products.filtered, filters, true);
        filters.forEach(function(el) {});
      }
    },
    // sorting.
    sorts: {
      init: function() {
        var filterBox = document.querySelector('#foodItemsFilter');
        filterBox.querySelectorAll('.price-sort').forEach(function(el){
          el.addEventListener('click', Main.sort.price);
        });
      }
    }
  },

  getProducts: function () {
    var url = 'https://pichifood.herokuapp.com/getFoodByLocation/' + Main.loc.lng + '/' + Main.loc.lat,
    headers = new Headers(),
    init = { method: 'GET',
    headers: headers,
    mode: 'cors',
    cache: 'default' };
    return new Promise (function (resolve, reject){
      fetch(url, init)
      .then(function(response){return response.json();})
      .then(function(data){resolve(data.prods);});
    });
  },

  filter: {
    init:function (data, filters, render) {
      if (filters && filters.length) {
        console.log(filters);
        Main.products.filtered = [];
        filters.forEach(function(filter) {
          console.log(Main.products.filtered);
          var arr = Main.products.original.filter(function(a) {
            return a[filter.kind]
            .replace(' ','_')
            .toLowerCase() == filter.name;
          });
          Main.products.filtered = Main.products.filtered.concat(arr);
        });
      } else {
        Main.products.filtered = data;
      }
      // get filter options.
      Main.bindActions.filters.init(Main.products.original);
      if(render) Main.renderFood(Main.products.filtered);
    },
    remove: function(el) {
      var chip = el.target.parentNode;
      chip.parentNode.removeChild(chip);
      Main.bindActions.filters.refresh();
    },
    reset: function () {
      console.log('reset ..');
      Main.renderFood(Main.products.original);
      Main.products.filtered = Main.products.original;
    },
    getBrands: function (prods) {
      var arrBrands = [];
      prods.forEach(function(p) {
        if (arrBrands.indexOf(p.brand) === -1) arrBrands.push(p.brand);
      });
      return arrBrands;
    }
  },

  sort: {
    price: function () {
      var isUp = (this.className.indexOf('up') > 0);
      Main.products.filtered = Main.products.filtered.sort(function(a,b) {
        if (isUp) return b.price - a.price;
        else return a.price - b.price;
      });
      Main.renderFood(Main.products.filtered);
    }
  },

  renderFood: function (products) {
    // do transition.
    window.scrollTo(0,0);
    if(products.length > this.itemsPerPage) {
      return this.paginate(products);
    }
    document.getElementsByClassName('content-list')[0].innerHTML = '';
    products.forEach(function(prod){
      Main.renderFoodItem(prod);
    });
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

  paginate: function (products, page = 1) {
    products = products || this.products.filtered;
    var to = page * Main.itemsPerPage;
    var from = to - Main.itemsPerPage;
    this.renderFood(products.slice(from, to));
    this.renderPaginator(products);
    document.querySelector('.pagination>li[data-page="'+page+'"]').className='active';
  },

  renderPaginator: function (prods) {
    var ul = document.createElement('ul');
    ul.className = 'pagination center';
    pages = Math.floor(prods.length / this.itemsPerPage);
    for (var i = 0; i < pages; i++) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = "#";
      a.addEventListener('click', this.doPaginate);
      li.dataset.page = a.innerHTML = i + 1;
      li.appendChild(a);
      ul.appendChild(li);
    }
    document.getElementsByClassName('content-list')[0].appendChild(ul);
  },

  doPaginate: function(e) {
    e.preventDefault();
    Main.paginate(false, e.target.parentNode.dataset.page);
  },

  clickFoodItem: function (e) {
    var data = this.dataset;
    var prodObj = Main.products.filtered.filter(function(el) {
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
    var cart = Main.getLocalStorageObject(),
        f = cart.filter(function(a,b) {
      a.pos = b;
      return a._id == Main.selectedItem._id &&
             a.partenId == Main.selectedItem.parentId;
    });
    if (f.length) cart[f[0].pos].quantity += Main.selectedItem.quantity;
    else cart.push(Main.selectedItem);

    Main.saveLocalStorageObject(cart);
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
