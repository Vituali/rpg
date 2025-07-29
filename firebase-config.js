import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

/* Configuração do Firebase */
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

/* Inicializar Firebase */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* Função para autenticar anonimamente */
async function initializeAuth() {
    try {
        await signInAnonymously(auth);
        console.log('✅ Usuário anônimo logado');
    } catch (error) {
        console.error('❌ Erro ao logar anônimo:', error);
        alert('Erro ao autenticar: ' + error.message);
    }
}

export { db, auth, initializeAuth };