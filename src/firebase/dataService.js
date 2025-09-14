import { db, rtdb, auth } from './firebase-config.js';
import { collection, getDocs, addDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, set, onValue, off, remove } from 'firebase/database';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';

const ACTIVE_SEASON = 'pacto';

// --- Funções de Temporada e Ficha ---

export async function carregarNomesDasTemporadas() {
    try {
        const snapshot = await getDocs(collection(db, 'temporadas'));
        const nomes = snapshot.docs.map(doc => doc.id);
        return nomes;
    } catch (e) {
        console.error('Erro ao carregar nomes das temporadas:', e);
        return [];
    }
}

export async function carregarFichasPorTemporada(temporada) {
    if (!temporada) return {};
    try {
        const path = `temporadas/${temporada}/fichas`;
        const snapshot = await getDocs(collection(db, path));
        const fichas = {};
        snapshot.forEach(doc => {
            fichas[doc.id] = doc.data();
        });
        return fichas;
    } catch (e) {
        console.error(`Erro ao carregar fichas da temporada ${temporada}:`, e);
        return {};
    }
}

export async function salvarFichaCompleta(dadosFicha) {
    try {
        const path = `temporadas/${ACTIVE_SEASON}/fichas`;
        const docRef = await addDoc(collection(db, path), dadosFicha);
        console.log(`Ficha salva na temporada ${ACTIVE_SEASON} com ID: `, docRef.id);
        
        // CORRIGIDO AQUI: Adiciona os valores máximos e salva na temporada correta
        const statusIniciais = {
            vida: dadosFicha.vida,
            vidaMax: dadosFicha.vidaMax,
            sanidade: dadosFicha.sanidade,
            sanidadeMax: dadosFicha.sanidadeMax,
            esforco: dadosFicha.esforco,
            esforcoMax: dadosFicha.esforcoMax
        };
        // Garante que está salvando na ACTIVE_SEASON
        await set(ref(rtdb, `sessoes/${ACTIVE_SEASON}/${docRef.id}`), statusIniciais);
        
        return docRef.id;
    } catch (e) {
        console.error('Erro ao salvar nova ficha:', e);
        return null;
    }
}

export async function excluirFicha(temporada, fichaId) {
    if (!temporada || !fichaId) {
        console.error("Temporada ou ID da ficha não fornecido.");
        return false;
    }
    try {
        // Caminho correto para o Firestore
        const fichaDocRef = doc(db, `temporadas/${temporada}/fichas`, fichaId);
        await deleteDoc(fichaDocRef);
        console.log("Ficha excluída do Firestore com sucesso.");

        // Caminho correto para o Realtime Database
        const statusRtdbRef = ref(rtdb, `sessoes/${temporada}/${fichaId}`);
        await remove(statusRtdbRef);
        console.log("Status excluído do Realtime Database com sucesso.");

        return true;
    } catch (error) {
        console.error("Erro ao excluir ficha: ", error);
        alert("Erro ao excluir a ficha: " + error.message);
        return false;
    }
}



export async function atualizarFichaCompleta(temporada, fichaId, fichaData) {
    try {
        const fichaDocRef = doc(db, `temporadas/${temporada}/fichas`, fichaId);
        await setDoc(fichaDocRef, fichaData);
        return true;
    } catch (error) {
        console.error("Erro ao atualizar ficha: ", error);
        return false;
    }
}

// --- Funções de Status em Tempo Real ---

export function escutarStatusDaTemporada(temporada, callback) {
  if (!temporada) return () => {};
  const referencia = ref(rtdb, `sessoes/${temporada}`);
  onValue(referencia, (snapshot) => {
    const dados = snapshot.val() || {};
    callback(dados);
  });
  return () => off(referencia);
}

export function atualizarStatusAoVivo(temporada, fichaId, novosStatus) {
  const referencia = ref(rtdb, `sessoes/${temporada}/${fichaId}`);
  set(referencia, novosStatus);
}

// --- Funções de Autenticação ---

export async function cadastrarUsuario(email, senha) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        return { user: userCredential.user };
    } catch (error) {
        return { error: error.message };
    }
}

export async function loginUsuario(email, senha) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        return { user: userCredential.user };
    } catch (error) {
        return { error: error.message };
    }
}

export async function logoutUsuario() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
    }
}

export async function enviarEmailRedefinicaoSenha(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error("Erro ao enviar e-mail de redefinição:", error);
        return { error: error.message };
    }
}
export function escutarTodosStatusDaTemporada(temporada, callback) {
  if (!temporada) return () => {};
  const referencia = ref(rtdb, `sessoes/${temporada}`);
  onValue(referencia, (snapshot) => {
    const dados = snapshot.val() || {};
    callback(dados);
  });
  return () => off(referencia);
}

// Escuta o status de UM personagem de uma temporada (para TelaJogar)
export function escutarStatusDeUmPersonagem(temporada, fichaId, callback) {
    if (!temporada || !fichaId) return () => {};
    const referencia = ref(rtdb, `sessoes/${temporada}/${fichaId}`);
    onValue(referencia, (snapshot) => {
        const dados = snapshot.val();
        callback(dados);
    });
    return () => off(referencia);
}