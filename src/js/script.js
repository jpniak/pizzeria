/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
  // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
  // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
  // CODE ADDED END
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  // CODE ADDED END
  };
    
  class Product {
    constructor(id, data){
      const thisProduct = this;
          
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
         // console.log ('new Product:', thisProduct);
    }
      
    renderInMenu(){
      const thisProduct = this;
      
          /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);               
          /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
          
          /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
          /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
            
      
    }
      
    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
            
    }
      
      
      
    initAccordion(){
      const thisProduct = this;
          
    /* find the clickable trigger (the element that should react to clicking) */
      const trigger = thisProduct.element.querySelector(select.menuProduct.clickable);

    /* START: click event listener to trigger */
      trigger.addEventListener('click', function (event){ 
        //zamiast trigger może byc thisProduct.accordionTrigger zdefiniowany wyżej - działa, sprawdziłem :-)
        //trigger to moja nazwa zmiennej, dlatego na razie zostaje :-)
                                  
      /* prevent default action for event */
        event.preventDefault();

      /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');

      /* find all active products */
        const activeProducts = document.querySelectorAll('.product');

      /* START LOOP: for each active product */
        for (let activeProduct of activeProducts) {

        /* START: if the active product isn't the element of thisProduct */
          if ( activeProduct !== thisProduct.element){

          /* remove class active for the active product */
            activeProduct.classList.remove('active');

        /* END: if the active product isn't the element of thisProduct */
          }

      /* END LOOP: for each active product */
        }

    /* END: click event listener to trigger */
      });
    }
      
    initOrderForm (){
      const thisProduct = this;
         // console.log('initOrderForm has started')
          
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.addToCart();
        thisProduct.processOrder();
      });

          
    }
      
    processOrder() {
      const thisProduct = this;
          //console.log('processOrder has started ', thisProduct);
          
            /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
          //console.log('formData: ', formData);
          
      thisProduct.params = {};
  /* set variable price to equal thisProduct.data.price */
      let price = thisProduct.data.price;
          //console.log('cena: ', price);

  /* START LOOP: for each paramId in thisProduct.data.params */
      let params = thisProduct.data.params;
          //console.log('params: ', params)
          
      for (let paramId in params){
    /* save the element in thisProduct.data.params with key paramId as const param */
        const param = thisProduct.data.params[paramId];
          //console.log('param: ', param);

    /* START LOOP: for each optionId in param.options */
        for(let optionId in param.options) {
              
      /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];

      /* START IF: if option is selected and option is not default */
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
             //console.log('optionSelected is:', optionSelected)
              
          if(optionSelected && !option.default){ // nie piszę optionSelected == true, bo jeśli nie jest pusta to jest true
        /* add price of option to variable price */
            price = price + option.price;
      /* END IF: if option is selected and option is not default */
          }
      /* START ELSE IF: if option is not selected and option is default */
          else if (!optionSelected && option.default ) {
        /* deduct price of option from price */
            price = price - option.price;
      /* END ELSE IF: if option is not selected and option is default */
          }
                            //kod z submodułu 7.6 - obrazki
          const images = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
          if (optionSelected){ 
            if(!thisProduct.params[paramId]){
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;
                  
                  
            for(let image of images) {
              image.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            for(let image of images) {
              image.classList.remove(classNames.menuProduct.imageVisible);
            }
                  
          }

    /* END LOOP: for each optionId in param.options */
        }
              
  /* END LOOP: for each paramId in thisProduct.data.params */
      }
            /* multiple price by amount */ // pochodzi z modułu o dodawaniu ilości - widgety...
            //price = price * thisProduct.amountWidget.value;
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

            
  /* set the contents of thisProduct.priceElem to HAVE THE SAME VALUE AS the variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;

         //thisProduct.priceElem.innerHTML = price
         // console.log('the final price is: ', price);
            //console.log('thisProduct.params: ', thisProduct.params)

    } 
      
    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
          
      thisProduct.amountWidgetElem.addEventListener('myEvent', function(event){
        thisProduct.processOrder();
      });
    }
    addToCart(){
      const thisProduct = this;
          
      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;
              
      app.cart.add(thisProduct);
    }
  }

  class AmountWidget {
    constructor(element){
      const thisWidget = this;
                       
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();


             // console.log('AmountWidget: ', thisWidget);
             // console.log('constructor arguments: ', element);
    }
          
    getElements(element){
      const thisWidget = this;
          
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
          
          
    setValue(value){
      const thisWidget = this;
              
      const newValue = parseInt(value);
              
              /* TODO: add validation */
      if (newValue !== AmountWidget.default && newValue>=settings.amountWidget.defaultMin && newValue<=settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
        thisWidget.announce();
      } else {
        thisWidget.value = settings.amountWidget.defaultValue;
        thisWidget.announce();
                //    console.log('it was fake, so thisWidget.value is: ', thisWidget.value);
      }
      thisWidget.input.value = thisWidget.value;
                
                          
              
    }
          
    initActions(){
      const thisWidget = this;

              
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });             
                  
                  
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value-1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value+1);
      });
            
    }
          
    announce(){
      const thisWidget = this;
              
              //const event = new Event('myEvent');
      const event = new CustomEvent('myEvent', {bubbles: true});
      thisWidget.element.dispatchEvent(event);
              
    }
      }
      
  class Cart{
    constructor(element){
      const thisCart = this;
      thisCart.products = [];
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.getElements(element);
      thisCart.initActions();
           // console.log('new cart: ', thisCart);
    }
        
    getElements(element){
      const thisCart =  this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList); // zdefiniowane w 8.3
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
            
            //dodane w module 8.4
      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

      for(let key of thisCart.renderTotalsKeys){
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }

    }
        
    initActions(){
      const thisCart = this;
            
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);              
      });
      thisCart.dom.productList.addEventListener('myEvent', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(){
        thisCart.remove(event.detail.cartProduct);
      });
    }
        
    add(menuProduct){
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
        
    update(){
      const thisCart = this;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
         
      for (let product of thisCart.products){
        thisCart.subtotalPrice = thisCart.subtotalPrice + product.price;
        thisCart.totalNumber = thisCart.totalNumber + product.amount;
      }
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      console.log('subtotal price is: ', thisCart.subtotalPrice);
      console.log('total number is: ', thisCart.totalNumber);
      console.log('total price is: ', thisCart.totalPrice);
            
      for (let key of thisCart.renderTotalsKeys){
        for(let elem of thisCart.dom[key]){
          elem.innerHTML = thisCart[key];
        }
      }
    }
        
    remove(cartProduct){
            //deklaruję stałą thisCart, tak samo jak w innych metodach
      const thisCart = this;
            //deklaruję stałą index, której wartością będzie indeks cartProduct w tablicy thisCart.products,
      const index = thisCart.products[cartProduct];
            //używam metody splice do usunięcia elementu o tym indeksie z tablicy thisCart.products
      thisCart.products.splice(thisCart.products[cartProduct], 1); //albo index, zdefiniowany wyżej :-)
            //usuwam z DOM element cartProduct.dom.wrapper
      cartProduct.dom.wrapper.remove();
            //wywołuję metodę update w celu przeliczenia sum po usunięciu produktu
      thisCart.update();
    }
    }  
    
  class CartProduct {
    constructor(menuProduct, element){
      const thisCartProduct = this;
            
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
            //console.log('new cartProduct: ', thisCartProduct);
            //console.log('productData: ', menuProduct);            
    }
        
    getElements(element){
      const thisCartProduct = this;
      thisCartProduct.dom = {};
            
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }
        
    initAmountWidget(){
      const thisCartProduct = this;
            
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
          
      thisCartProduct.dom.amountWidget.addEventListener('myEvent', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
        
    remove(){
      const thisCartProduct = this;
      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
      console.log('metoda remove wystartowała');
    }
    initActions(){
      const thisCartProduct = this;
            
      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault;
        console.log('kliknieto guzik edit');
      });
      thisCartProduct.dom.remove.addEventListener('click', function (event){
        event.preventDefault;
        console.log('kliknieto guzik remove');
        thisCartProduct.remove();
                
      });
    }
    }
    
  const app = {
    initMenu: function(){
      const thisApp = this;
        
        //console.log('thisApp.data:', thisApp.data);
        
      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },
      
    initData: function(){
      const thisApp = this;
        
      thisApp.data = {};
      
      const url = settings.db.url + '/' + settings.db.product;
      
      fetch(url)
        .then(function(rawResponse) {
          return rawResponse.json();
        })
        .then(function(parsedResponse) {
          console.log('parsed response: ', parsedResponse);
        /* save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;
        /* execute initMenu method*/
          thisApp.initMenu();
        });

      console.log('thisApp.data: ', JSON.stringify(thisApp.data));
    

    },
      
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
    
      thisApp.initData();
      //thisApp.initMenu();
    },
        
    initCart: function(){
      const thisApp = this;
        
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    }
  };

  app.init();
  app.initCart();

}
