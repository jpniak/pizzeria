import {templates, select, settings} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';
import {utils} from '../utils.js';



export class Booking {
  constructor(booking) {
    const thisBooking = this;

    thisBooking.render(booking);
    thisBooking.initWidgets();
    thisBooking.getData();

  }

  render(booking){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = booking;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    
    
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
  
  getData() {
    const thisBooking = this;
    
    /* obiekt zawierający minDate i maxDate*/
    const startEndDates = {}; 

    startEndDates[settings.db.dateStartParamKey] = //parametry z settings.db to klucz obiektu
    utils.dateToStr(thisBooking.datePicker.minDate); //utils.dateToStr służy do zamiany daty na string
    startEndDates[settings.db.dateEndParamKey] =
    utils.dateToStr(thisBooking.datePicker.maxDate);
    
    /* obiekt zawierający datą końcową */
    const endDate = {};

    endDate[settings.db.dateEndParamKey] = 
    startEndDates[settings.db.dateEndParamKey];

    /* obiekt scalający potrzebne dane */
    const params = { 
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    console.log('getData params: ', params);
    
    /* trzyprzygotowane adresy, pod które wysyłamy później zapytania */
    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls', urls);
    
    /* z pomocą promise i fetch wysyłamy zapytania pod powyższe adresy */
    Promise.all([ 
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([ 
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });    
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    console.log('current events: ', eventsCurrent);
    console.log('repeated events: ', eventsRepeat);

    /* pętla iterująca po eventsCurrent - odpala metodę makeBooked na current eventach */
    
    for(let eventCurrent of eventsCurrent) {
      //console.log('eventCurrent: ', eventCurrent);
      thisBooking.makeBooked(eventCurrent.date, eventCurrent.hour, eventCurrent.duration, eventCurrent.table);
    }    
  
    for(let booking of bookings) {
      //console.log('booking: ', booking);
      thisBooking.makeBooked(booking.date, booking.hour, booking.duration, booking.table);
    }

    /* minDate oraz maxDate zdefiniowane w datePicker */
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
    //console.log('minDate: ', minDate);
    //console.log('maxDate: ', maxDate);

    /* pętla iterująca po eventsRepeat - odpalametodę makeBooked na repeat eventach, ale pod poniższym warunkiem */
    
    for(let eventRepeat of eventsRepeat) {
      //console.log('eventRepeat ', eventRepeat);
      
      if(eventRepeat.repeat == 'daily') {//jeśli event ma właściwość repeat równą daily (w app.json jest, który event ma jaki repeat) 
        //pętla iterująca po powtarzającym dniu z zakresu dni (datePicker) 
        for(let repeatDay = minDate; repeatDay <= maxDate; repeatDay = utils.addDays(repeatDay, 1)) {
          //console.log('repeatDay: ', repeatDay);
          thisBooking.makeBooked(eventRepeat.date, eventRepeat.hour, eventRepeat.duration, eventRepeat.table);
        }
      }
    }
  }
  
  makeBooked(date, hour, duration, table){
    const thisBooking = this;
    
    const bookedHour = utils.hourToNumber(hour); //zapisanie godziny jako liczby

    //jeśli nie ma thisBooking.booked z kluczem date takim jak w app.json, to jest tworzony
    if(!thisBooking.booked[date]){
      thisBooking.booked[date] = {};
    }

    /* pętla iterująca po każdym półgodzinnym bloku z zabookowanej godziny, zwiększa blok o pół godziny */
    for(let blockHour = bookedHour; blockHour < bookedHour + duration; blockHour += 0.5){
      //console.log('blockHour: ', blockHour);
      
      if(!thisBooking.booked[date][blockHour]){ //jeżeli nie istnieje taki półgodzinny blok
        thisBooking.booked[date][blockHour] = []; //to teraz jest tworzony
      } 
      //do klucza blockHour w kluczu date w obiekcie thisBooking.booked dodajemy numer zabookowanego stolika 
      thisBooking.booked[date][blockHour].push(table);
    }
    console.log(thisBooking.booked);
  }
} 