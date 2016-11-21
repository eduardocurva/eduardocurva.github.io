(function () {
  'use strict';

  // Initialize Firebase
  var firebaseCnfig = {
    apiKey: "AIzaSyB57CO3Jnqk1_L1XwHw0jQ1dPITcLv0YRQ",
    authDomain: "eduardocurva-github-io.firebaseapp.com",
    databaseURL: "https://eduardocurva-github-io.firebaseio.com",
    storageBucket: "eduardocurva-github-io.appspot.com",
    messagingSenderId: "674733616460"
  };
  firebase.initializeApp(firebaseCnfig);

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
  app.signIn = function () {
    var provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithPopup(provider);
  };

  app.signOut = function () {
    this.auth.signOut();
  };

  app.onAuthStateChanged = function (user) {
    if (user) {
      // Get profile pic and user's name from the Firebase user object.
      var profilePicUrl = user.photoURL;
      var userName = user.displayName;

      // Set the user's profile pic and name.
      this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
      this.userName.textContent = userName;

      // Show user's profile and sign-out button.
      this.userName.removeAttribute('hidden');
      this.userPic.removeAttribute('hidden');
      this.signOutButton.removeAttribute('hidden');

      // Hide sign-in button.
      this.signInButton.setAttribute('hidden', 'true');


      app.updateMessageList();
    } else {

      // Hide user's profile and sign-out button.
      this.userName.setAttribute('hidden', 'true');
      this.userPic.setAttribute('hidden', 'true');
      this.signOutButton.setAttribute('hidden', 'true');

      // Show sign-in button.
      this.signInButton.removeAttribute('hidden');
    }
  };

  app.initFirebase = function () {
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
    // Initiates Firebase auth and listen to auth state changes.
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));

  };

  app.initFirebase();

  document.getElementById('btnAddMessage').addEventListener('click', function () {

    app.AddMessage();

  });

  app.showMessage = function (key, userName, label, userPhoto) {

    var card = app.visibleCards[key];

    if (!card) {

      var textContainer = app.cardTemplate.querySelector('.section__text').cloneNode(true);
      var circle = app.circleContainer.cloneNode(true);

      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
      
      textContainer.querySelector('.messageText').textContent = label;
      textContainer.querySelector('.userName').textContent = userName;
      
      circle.removeAttribute('hidden');
      textContainer.removeAttribute('hidden');
      
      if (userPhoto) {
        circle.querySelector('.photoCircle').style.backgroundImage = 'url(' + userPhoto + ')';
      }
      
      app.messageCard.appendChild(circle);
      app.messageCard.appendChild(textContainer);
      app.visibleCards[key] = card;
    }
  };

  app.makeId = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;

  };

  app.Initialize = function (data) {

    this.userPic = document.getElementById('user-pic');
    this.userName = document.getElementById('user-name');
    this.signInButton = document.getElementById('sign-in');
    this.signOutButton = document.getElementById('sign-out');
    this.signInSnackbar = document.getElementById('must-signin-snackbar');
    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    this.signInButton.addEventListener('click', this.signIn.bind(this));


    app.updateMessageList();

    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };

  app.updateMessageList = function () {
    this.messagesRef = this.database.ref('messages');
    // Make sure we remove all previous listeners.
    this.messagesRef.off();

    app.sectionCards.removeAttribute('hidden');
    var setMessage = function (data) {

      var val = data.val();

      app.showMessage(data.key, val.name, val.text, val.photoUrl);
    }.bind(this);

    this.messagesRef.limitToLast(12).on('child_added', setMessage);
    this.messagesRef.limitToLast(12).on('child_changed', setMessage);
  };

  app.checkSignedInWithMessage = function () {
    if (this.auth.currentUser) {
      return true;
    }
  }

  app.AddMessage = function () {
    event.preventDefault();

    var txtMessage = document.getElementById('txtMessage');

    if (!app.messages) {
      app.messages = [];
    }

    app.messages.push({ key: app.makeId(), value: txtMessage.value });

    app.saveMessages();

    app.showSnackbar('Message added!');

    if (txtMessage.value && this.checkSignedInWithMessage()) {
      var currentUser = this.auth.currentUser;

      this.messagesRef.push({
        userId: currentUser.uid,
        name: currentUser.displayName,
        text: txtMessage.value,
        photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
      }).then(function () {
        
        txtMessage.value = "";
      
    }.bind(this)).catch(function (error) {
        console.error('Error writing new message to Firebase Database', error);
      });
    }
  };

  app.showSnackbar = function (message) {
    var snackbarContainer = document.querySelector('#demo-toast-example');
    var data = { message: message };

    snackbarContainer.MaterialSnackbar.showSnackbar(data);
  };

  app.saveMessages = function () {
    var messages = JSON.stringify(app.messages);
    localStorage.messages = messages;
  };

  app.Initialize();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(function () { console.log('Service Worker Registered :) '); });
  }
})();
