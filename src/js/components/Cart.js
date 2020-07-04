import {settings, select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {CartProduct} from './CartProduct.js';

export class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.getElements(element);
    thisCart.initActions();
    // console.log('new cart: ', thisCart);
  }

  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList); // zdefiniowane w 8.3
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form); //zdefiniowano w 8.8 
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone); //zdefiniowano w 8.8 
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address); //zdefiniowano w 8.8 


    //dodane w module 8.4
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for (let key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }

  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('myEvent', function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function () {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function () {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: thisCart.dom.address,
      phone: thisCart.dom.phone,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      totalPrice: thisCart.totalPrice,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for (let product of thisCart.products) {
      payload.products.push(product.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsed response: ', parsedResponse);
      });

  }

  add(menuProduct) {
    const thisCart = this;
    //console.log ('adding product: ', menuProduct);

    /* tworzymy kod HTML i zapisujemy go w stałej generatedHTML */
    const generatedHTML = templates.cartProduct(menuProduct);

    /*  ten kod zamieniamy na elementy DOM i zapisujemy w następnej stałej – generatedDOM */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    /* Dodajemy te elementy DOM do thisCart.dom.productList */
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //console.log('thisCart.products: ', thisCart.products)

    thisCart.update();
  }

  update() {
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.subtotalPrice = thisCart.subtotalPrice + product.price;
      thisCart.totalNumber = thisCart.totalNumber + product.amount;
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    console.log('subtotal price is: ', thisCart.subtotalPrice);
    console.log('total number is: ', thisCart.totalNumber);
    console.log('total price is: ', thisCart.totalPrice);

    for (let key of thisCart.renderTotalsKeys) {
      for (let elem of thisCart.dom[key]) {
        elem.innerHTML = thisCart[key];
      }
    }
  }

  remove(cartProduct) {
    //deklaruję stałą thisCart, tak samo jak w innych metodach
    const thisCart = this;
    //deklaruję stałą index, której wartością będzie indeks cartProduct w tablicy thisCart.products,
    const index = thisCart.products[cartProduct];
    //używam metody splice do usunięcia elementu o tym indeksie z tablicy thisCart.products
    thisCart.products.splice(index, 1);
    //usuwam z DOM element cartProduct.dom.wrapper
    cartProduct.dom.wrapper.remove();
    //wywołuję metodę update w celu przeliczenia sum po usunięciu produktu
    thisCart.update();
  }
}  