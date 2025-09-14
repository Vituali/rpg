// src/firebase/dataService.js
import { db, rtdb } from './firebase-config.js';
import { collection, getDocs, addDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, set, onValue, off, remove } from 'firebase/database';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase-config.js';

const ACTIVE_SEASON = 'pacto';

export async function carregarFichas() {
    try {
        const path = `temporadas/${ACTIVE_SEASON}/fichas`;
        const snapshot = await getDocs(collection(db, path));
        const fichas = {};
        snapshot.forEach(doc => {
            fichas[doc.id] = doc.data();
        });
        return fichas;
    } catch (e) {
        console.error('Erro ao carregar fichas:', e);
        return {};
    }
}

export async function salvarFichaCompleta(dadosFicha) {
    try {
        const path = `temporadas/${ACTIVE_SEASON}/fichas`;
        const docRef = await addDoc(collection(db, path), dadosFicha);
        const statusIniciais = {
            vida: dadosFicha.vida,
            sanidade: dadosFicha.sanidade,
            esforco: dadosFicha.esforco
        };
        await set(ref(rtdb, `sessoes/${ACTIVE_SEASON}/${docRef.id}`), statusIniciais);
        return docRef.id;
    } catch (e) {
        console.error('Erro ao salvar nova ficha:', e);
        return null;
    }
}

export function atualizarStatusAoVivo(fichaId, novosStatus) {
  const referencia = ref(rtdb, `sessoes/${ACTIVE_SEASON}/${fichaId}`);
  set(referencia, novosStatus);
}

export function escutarTodosStatusAoVivo(callback) {
  const referencia = ref(rtdb, `sessoes/${ACTIVE_SEASON}`);
  onValue(referencia, (snapshot) => {
    const dados = snapshot.val() || {};
    callback(dados);
  });
  return () => off(referencia);
}

export function escutarStatusAoVivo(fichaId, callback) {
  const referencia = ref(rtdb, `sessoes/${ACTIVE_SEASON}/${fichaId}`);
  onValue(referencia, (snapshot) => {
    const dados = snapshot.val();
    callback(dados);
  });
  return () => off(referencia);
}

export async function excluirFicha(fichaId) {
    try {
        const fichaDocRef = doc(db, `temporadas/${ACTIVE_SEASON}/fichas`, fichaId);
        await deleteDoc(fichaDocRef);
        const statusRtdbRef = ref(rtdb, `sessoes/${ACTIVE_SEASON}/${fichaId}`);
        await remove(statusRtdbRef);
        return true;
    } catch (error) {
        console.error("Erro ao excluir ficha: ", error);
        alert("Erro ao excluir a ficha: " + error.message);
        return false;
    }
}
export async function atualizarFichaCompleta(fichaId, fichaData) {
    try {
        const fichaDocRef = doc(db, `temporadas/${ACTIVE_SEASON}/fichas`, fichaId);
        await setDoc(fichaDocRef, fichaData);
        return true;
    } catch (error) {
        console.error("Erro ao atualizar ficha: ", error);
        alert("Erro ao atualizar a ficha: " + error.message);
        return false;
    }
}

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