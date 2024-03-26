// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore"
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebase from 'firebase/compat/app';
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage)
// });
const firebaseConfig = {
    apiKey: "AIzaSyCeZLlCPtEFYBelb0RPhHTddraTa8jxx88",
    authDomain: "omr-app-93d29.firebaseapp.com",
    projectId: "omr-app-93d29",
    storageBucket: "omr-app-93d29.appspot.com",
    messagingSenderId: "1060978576242",
    appId: "1:1060978576242:web:fe2247345899a05b9aabeb",
    measurementId: "G-Z1M7KD5B9Y"
  };
  
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
//export const auth = getAuth(app);
export const db = getFirestore(app);
/* Initialize Firebase */
if(!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
  
export { firebase };
//export const auth = firebase.auth();
// export const settings = firebase.auth().settings;
// settings.appVerificationDisabledForTesting = true;
// settings.forceRecaptchaFlowForTesting = false;
// console.log(settings.forceRecaptchaFlowForTesting);
// console.log(settings.appVerificationDisabledForTesting);