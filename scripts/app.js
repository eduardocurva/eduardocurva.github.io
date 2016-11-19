(function() {
  'use strict';

  var app = {
    isLoading: true,
    messages: [],
    visibleCards: [],
    spinner: document.querySelector('.loader'),
    container: document.querySelector('.mdl-layout__content'),
    cardTemplate: document.querySelector('.cardTemplate'),
    messageCard: document.querySelector('.messageCard'),
    sectionCards: document.querySelector('.sectionCards'),
    circleContainer: document.querySelector('.section__circle-container'),
  };

  document.getElementById('btnAddMessage').addEventListener('click', function() {

    app.AddMessage();

  });

  app.showMessage = function(key, label){
       
    var card = app.visibleCards[key];

    if (!card) {
      var textContainer = app.cardTemplate.querySelector('.section__text').cloneNode(true);
      var circle = app.circleContainer.cloneNode(true);

      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
      textContainer.textContent = label;
      circle.removeAttribute('hidden');
      textContainer.removeAttribute('hidden');
      
      app.messageCard.appendChild(circle);
      app.messageCard.appendChild(textContainer);
      app.visibleCards[key] = card;
    }
  };

 app.makeId = function(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;

 };

  app.Initialize = function(data) {
 
    app.updateMessageList();

    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };

  app.updateMessageList = function(){
        app.messages = localStorage.messages;
        if (app.messages) {
          app.sectionCards.removeAttribute('hidden');
          app.messages = JSON.parse(app.messages);
          
          app.messages.forEach(function(message) {
            app.showMessage(message.key, message.value);
          });
        }
  };


  app.AddMessage = function() {
    event.preventDefault();
    
    var txtMessage = document.getElementById('txtMessage');
    
      if (!app.messages) {
      app.messages = [];
    }
    
    app.messages.push({key: app.makeId(), value: txtMessage.value});
    
    app.saveMessages();

    app.showSnackbar('Message added!');
    txtMessage.value ="";
    app.updateMessageList();
  };
  
  app.showSnackbar = function(message){
    var snackbarContainer = document.querySelector('#demo-toast-example');
    var data = {message: message};

    snackbarContainer.MaterialSnackbar.showSnackbar(data);
  };

  app.saveMessages = function (){
     var messages = JSON.stringify(app.messages);
    localStorage.messages = messages;
 };

  app.Initialize();

  // TODO add service worker code here
   if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered :) '); });
  } 
})();
