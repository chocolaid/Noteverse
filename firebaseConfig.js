// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyAaC3XUlgkvtrthTY7iDHZPXDi6PB3MnQE",
    authDomain: "oecappsportfolio.firebaseapp.com",
    databaseURL: "https://oecappsportfolio-default-rtdb.firebaseio.com",
    projectId: "oecappsportfolio",
    storageBucket: "oecappsportfolio.appspot.com",
    messagingSenderId: "608626529628",
    appId: "1:608626529628:web:a23b2092511dc78685dd99",
    measurementId: "G-TMFYLL3GS8"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });

export { auth, app };