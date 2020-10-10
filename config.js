import * as firebase from 'firebase';
require('@firebase/firestore');

  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyCmh9T3fal_-a9kCY3LF-RsAr8szLzQ5C8",
    authDomain: "wily-app-ba3e4.firebaseapp.com",
    databaseURL: "https://wily-app-ba3e4.firebaseio.com",
    projectId: "wily-app-ba3e4",
    storageBucket: "wily-app-ba3e4.appspot.com",
    messagingSenderId: "229654963787",
    appId: "1:229654963787:web:2d0f4984a3d07fde23cfce"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();