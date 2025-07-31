// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ESTO ES LO QUE PEGASTE DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyA-zvWPFxJgx2V6zZiNjMRBYRI1Gur0nT0",
  authDomain: "vipcuts-3e143.firebaseapp.com",
  projectId: "vipcuts-3e143",
  storageBucket: "vipcuts-3e143.firebasestorage.app",
  messagingSenderId: "525048054703",
  appId: "1:525048054703:web:d25f03e6c36421b39b655a"
};

// INICIALIZAMOS Y EXPORTAMOS
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);