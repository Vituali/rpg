import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyCubXJd9jgkmn0hJWXS67yKqzTGycMcC9w",
    authDomain: "anima-rpg.firebaseapp.com",
    databaseURL: "https://anima-rpg-default-rtdb.firebaseio.com",
    projectId: "anima-rpg",
    storageBucket: "anima-rpg.firebasestorage.app",
    messagingSenderId: "524426526680",
    appId: "1:524426526680:web:ef17648b2155aff5587cad",
    measurementId: "G-N6ZT1FQRM6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const rtdb = getDatabase(app);

export { db, auth, rtdb };