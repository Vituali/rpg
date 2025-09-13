// src/firebase/dataService.js
import { db, rtdb } from './firebase-config.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// 2. IMPORTE AS FUNÇÕES DO REALTIME DATABASE AQUI
import { ref, set, onValue, off } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

export async function carregarFichas() {
    try {
        const snapshot = await getDocs(collection(db, 'fichas'));
        const fichas = {};
        snapshot.forEach(doc => {
            fichas[doc.id] = doc.data();
        });
        return fichas;
    } catch (e) {
        console.error('Erro ao carregar fichas:', e);
        alert('Erro ao carregar fichas: ' + e.message);
        return {};
    }
}

// Função para ATUALIZAR os status no RTDB
export function atualizarStatusAoVivo(fichaId, novosStatus) {
  const referencia = ref(rtdb, `sessoes/sessao_teste/${fichaId}`);
  set(referencia, novosStatus);
}

// Função para ESCUTAR por mudanças nos status no RTDB
export function escutarStatusAoVivo(fichaId, callback) {
  const referencia = ref(rtdb, `sessoes/sessao_teste/${fichaId}`);
  onValue(referencia, (snapshot) => {
    const dados = snapshot.val();
    callback(dados);
  });

  // Retorna uma função para parar de escutar (evitar memory leaks)
  return () => off(referencia);
}