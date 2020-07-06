import {settings, select} from '../settings.js';
import {BaseWidget} from './BaseWidget.js';

export class AmountWidget extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.amountWidget.defaultValue);
    
    const thisWidget = this;

    thisWidget.getElements();
    thisWidget.initActions();


    // console.log('AmountWidget: ', thisWidget);
    // console.log('constructor arguments: ', element);
  }

  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(newValue) { 
    return !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax;
  }

  
  //wersja nowa kodillowa
  /*
  initActions() {
    const thisWidget = this;
    
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });
    
    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.value = thisWidget.value -1;
    });
    
    
    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.value = thisWidget.value +1;
    });
  } 
  
  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  } */

  /* ------------------------------moja stara wersja ----------- */
  initActions() {
    const thisWidget = this;


    thisWidget.dom.input.addEventListener('change', function () {
      //thisWidget.setValue(thisWidget.input.value);
      thisWidget.value = thisWidget.dom.input.value;
    });


    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.value = --thisWidget.dom.input.value; //predekrementacja - mój patent :-)
    });
    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.value = ++thisWidget.dom.input.value; //preinkrementacja
    });
    
  //co ciekawe mnie działa poprawnie BEZ renderValue(), domyślam się, że to dlatego, że ono jest w BaseWidget, z którego dziedziczymy oraz że używam bezpośrednio thisWidget.dom.input.value a nie thisWidget.value. 
  //Zakomentowanie tam tej funkcji, czyli renderValue(), powoduje, że nie wyświetla nam się wartość w konsoli,
  // w inpucie wyświetla mi się wszystko doskonale :-) no może poza tym, że można wpisać wartość ujemną albo więcej niż 9, ale do koszyka przejdzie i tak od 1 do 9 :-)
  }
 
  
  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  } 
  
  // z renderValue() wyświetla się już w pełni poprawnie, czyli zakres produktów 1-9

  
}