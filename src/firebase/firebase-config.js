// src/firebase/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyCubXJd9jgkmn0hJWXS67yKqzTGycMcC9w",
    authDomain: "anima-rpg.firebaseapp.com",
    databaseURL: "https://anima-rpg-default-rtdb.firebaseio.com",
    projectId: "anima-rpg",
    storageBucket: "anima-rpg.appspot.com",
    messagingSenderId: "524426526680",
    appId: "1:524426526680:web:ef17648b2155aff5587cad",
    measurementId: "G-N6ZT1FQRM6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const rtdb = getDatabase(app);

export { db, auth, rtdb };