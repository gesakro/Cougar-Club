// src/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyC1BsaZwpp2dPO98EH2Hktw3zY_e3ex8kk",
  authDomain: "cougarclub-31161.firebaseapp.com",
  projectId: "cougarclub-31161",
  storageBucket: "cougarclub-31161.firebasestorage.app",
  messagingSenderId: "834260525418",
  appId: "1:834260525418:web:e2687b3fbe18f02a70c513"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app)

export { storage, db }