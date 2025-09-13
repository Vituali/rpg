// src/firebase/dataService.js
import { db, rtdb } from './firebase-config.js';
// CORREÇÃO: Adicionado 'setDoc' à importação
import { collection, getDocs, addDoc, doc, deleteDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { ref, set, onValue, off, remove } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

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

export async function salvarFichaCompleta(dadosFicha) {
    try {
        const docRef = await addDoc(collection(db, 'fichas'), dadosFicha);
        console.log("Ficha salva no Firestore com ID: ", docRef.id);

        const statusIniciais = {
            vida: dadosFicha.vida,
            sanidade: dadosFicha.sanidade,
            esforco: dadosFicha.esforco
        };
        await set(ref(rtdb, `sessoes/sessao_teste/${docRef.id}`), statusIniciais);
        console.log("Status inicial salvo no RTDB.");

        return docRef.id;
    } catch (e) {
        console.error('Erro ao salvar nova ficha:', e);
        alert('Erro ao salvar a ficha: ' + e.message);
        return null;
    }
}

export function atualizarStatusAoVivo(fichaId, novosStatus) {
  const referencia = ref(rtdb, `sessoes/sessao_teste/${fichaId}`);
  set(referencia, novosStatus);
}

export function escutarStatusAoVivo(fichaId, callback) {
  const referencia = ref(rtdb, `sessoes/sessao_teste/${fichaId}`);
  onValue(referencia, (snapshot) => {
    const dados = snapshot.val();
    callback(dados);
  });
  return () => off(referencia);
}
export async function excluirFicha(fichaId) {
    try {
        const fichaDocRef = doc(db, 'fichas', fichaId);
        await deleteDoc(fichaDocRef);
        console.log("Ficha excluída do Firestore com sucesso.");

        const statusRtdbRef = ref(rtdb, `sessoes/sessao_teste/${fichaId}`);
        await remove(statusRtdbRef);
        console.log("Status excluído do Realtime Database com sucesso.");

        return true;
    } catch (error) {
        console.error("Erro ao excluir ficha: ", error);
        alert("Erro ao excluir a ficha: " + error.message);
        return false;
    }
}
export async function atualizarFichaCompleta(fichaId, fichaData) {
    try {
        const fichaDocRef = doc(db, 'fichas', fichaId);
        await setDoc(fichaDocRef, fichaData);
        console.log("Ficha atualizada no Firestore com sucesso.");
        return true;
    } catch (error) {
        console.error("Erro ao atualizar ficha: ", error);
        alert("Erro ao atualizar a ficha: " + error.message);
        return false;
    }
}
export function escutarTodosStatusAoVivo(callback) {
  const referencia = ref(rtdb, 'sessoes/sessao_teste');
  onValue(referencia, (snapshot) => {
    const dados = snapshot.val() || {};
    callback(dados);
  });
  // Retorna a função para parar de escutar
  return () => off(referencia);
}