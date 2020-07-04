import {settings, select} from '../settings.js';

export class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();


    // console.log('AmountWidget: ', thisWidget);
    // console.log('constructor arguments: ', element);
  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }


  setValue(value) {
    const thisWidget = this;

    const newValue = parseInt(value);

    /* TODO: add validation */
    if (newValue !== AmountWidget.default && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
      thisWidget.value = newValue;
      thisWidget.announce();
    } else {
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.announce();
      //    console.log('it was fake, so thisWidget.value is: ', thisWidget.value);
    }
    thisWidget.input.value = thisWidget.value;



  }

  initActions() {
    const thisWidget = this;


    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.input.value);
    });


    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });

  }

  announce() {
    const thisWidget = this;

    //const event = new Event('myEvent');
    const event = new CustomEvent('myEvent', { bubbles: true });
    thisWidget.element.dispatchEvent(event);

  }
}