// --- src\firebase\dataService.js ---

import { db, rtdb, auth } from './firebase-config.js';
import { collection, getDocs, addDoc, doc, deleteDoc, setDoc, getDoc, query, where } from 'firebase/firestore';
import { ref, set, onValue, off, remove } from 'firebase/database';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';

// --- Funções de Utilizador e Cargos ---

// NOVO: Carrega todos os utilizadores registados
export async function carregarTodosUsuarios() {
    try {
        const snapshot = await getDocs(collection(db, 'users'));
        const usuarios = [];
        snapshot.forEach(doc => {
            usuarios.push({ uid: doc.id, ...doc.data() });
        });
        return usuarios;
    } catch (e) {
        console.error("Erro ao carregar todos os utilizadores:", e);
        return [];
    }
}

export async function getUserData(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        return userDoc.exists() ? userDoc.data() : null;
    } catch (e) {
        console.error("Erro ao buscar dados do utilizador:", e);
        return null;
    }
}

export async function criarUsuarioDB(uid, email) {
    try {
        await setDoc(doc(db, 'users', uid), {
            email: email,
            isGM: false,
            createdAt: new Date()
        });
    } catch (e) {
        console.error("Erro ao criar utilizador no DB:", e);
    }
}

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

export async function carregarFichasDoUsuario(temporada, userId) {
    if (!temporada || !userId) return {};
    try {
        const path = `temporadas/${temporada}/fichas`;
        const fichasCollectionRef = collection(db, path);
        const q = query(fichasCollectionRef, where("ownerId", "==", userId));
        const snapshot = await getDocs(q);
        const fichas = {};
        snapshot.forEach(doc => {
            fichas[doc.id] = doc.data();
        });
        return fichas;
    } catch (e) {
        console.error(`Erro ao carregar fichas do utilizador ${userId}:`, e);
        return {};
    }
}


export async function salvarFichaCompleta(dadosFicha) {
    try {
        const path = `temporadas/${dadosFicha.temporada || 'pacto'}/fichas`;
        const docRef = await addDoc(collection(db, path), dadosFicha);
        
        const statusIniciais = {
            vida: dadosFicha.vida,
            vidaMax: dadosFicha.vidaMax,
            sanidade: dadosFicha.sanidade,
            sanidadeMax: dadosFicha.sanidadeMax,
            esforco: dadosFicha.esforco,
            esforcoMax: dadosFicha.esforcoMax
        };
        await set(ref(rtdb, `sessoes/${dadosFicha.temporada || 'pacto'}/${docRef.id}`), statusIniciais);
        
        return docRef.id;
    } catch (e) {
        console.error('Erro ao salvar nova ficha:', e);
        return null;
    }
}

export async function excluirFicha(temporada, fichaId) {
    if (!temporada || !fichaId) return false;
    try {
        await deleteDoc(doc(db, `temporadas/${temporada}/fichas`, fichaId));
        await remove(ref(rtdb, `sessoes/${temporada}/${fichaId}`));
        return true;
    } catch (error) {
        console.error("Erro ao excluir ficha: ", error);
        return false;
    }
}

export async function atualizarFichaCompleta(temporada, fichaId, fichaData) {
    try {
        await setDoc(doc(db, `temporadas/${temporada}/fichas`, fichaId), fichaData);
        return true;
    } catch (error) {
        console.error("Erro ao atualizar ficha: ", error);
        return false;
    }
}

// --- Funções de Status em Tempo Real ---

export function escutarTodosStatusDaTemporada(temporada, callback) {
  if (!temporada) return () => {};
  const referencia = ref(rtdb, `sessoes/${temporada}`);
  onValue(referencia, (snapshot) => {
    callback(snapshot.val() || {});
  });
  return () => off(referencia);
}

export function escutarStatusDeUmPersonagem(temporada, fichaId, callback) {
    if (!temporada || !fichaId) return () => {};
    const referencia = ref(rtdb, `sessoes/${temporada}/${fichaId}`);
    onValue(referencia, (snapshot) => {
        callback(snapshot.val());
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
        await criarUsuarioDB(userCredential.user.uid, email);
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
        return { error: error.message };
    }
}

// --- Funções de Itens e Inventário ---

export async function carregarModelosDeItens() {
    try {
        const snapshot = await getDocs(collection(db, 'itens'));
        const itens = {};
        snapshot.forEach(doc => {
            itens[doc.id] = doc.data();
        });
        return itens;
    } catch (e) {
        console.error('Erro ao carregar modelos de itens:', e);
        return {};
    }
}

export async function salvarItemModelo(itemId, dadosItem) {
    try {
        const docRef = doc(db, 'itens', itemId || `item_${Date.now()}`);
        await setDoc(docRef, dadosItem);
        return docRef.id;
    } catch (e) {
        console.error("Erro ao salvar modelo de item:", e);
        return null;
    }
}

export async function removerItemModelo(itemId) {
    try {
        await deleteDoc(doc(db, 'itens', itemId));
        return true;
    } catch (e) {
        console.error("Erro ao remover modelo de item:", e);
        return false;
    }
}

export async function carregarInventarioDoPersonagem(temporada, fichaId) {
    try {
        const path = `temporadas/${temporada}/fichas/${fichaId}/inventario`;
        const snapshot = await getDocs(collection(db, path));
        const inventario = {};
        snapshot.forEach(doc => {
            inventario[doc.id] = doc.data();
        });
        return inventario;
    } catch (e) {
        console.error('Erro ao carregar inventário do personagem:', e);
        return {};
    }
}

export async function adicionarItemAoInventario(temporada, fichaId, dadosItem) {
    try {
        const path = `temporadas/${temporada}/fichas/${fichaId}/inventario`;
        const docRef = await addDoc(collection(db, path), dadosItem);
        return docRef.id;
    } catch (e) {
        console.error('Erro ao adicionar item ao inventário:', e);
        return null;
    }
}

export async function removerItemDoInventario(temporada, fichaId, inventarioItemId) {
    try {
        const path = `temporadas/${temporada}/fichas/${fichaId}/inventario/${inventarioItemId}`;
        await deleteDoc(doc(db, path));
        return true;
    } catch (e) {
        console.error('Erro ao remover item do inventário:', e);
        return false;
    }
}

export async function atualizarItemNoInventario(temporada, fichaId, inventarioItemId, updates) {
    try {
        const path = `temporadas/${temporada}/fichas/${fichaId}/inventario/${inventarioItemId}`;
        await setDoc(doc(db, path), updates, { merge: true });
        return true;
    } catch (e) {
        console.error('Erro ao atualizar item:', e);
        return false;
    }
}

export async function atualizarEquipamento(temporada, fichaId, novoEquipamento) {
    try {
        const path = `temporadas/${temporada}/fichas/${fichaId}`;
        await setDoc(doc(db, path), { equipamento: novoEquipamento }, { merge: true });
        return true;
    } catch (e) {
        console.error('Erro ao atualizar equipamento:', e);
        return false;
    }
}

export async function carregarFicha(temporada, fichaId) {
    try {
        const docRef = doc(db, `temporadas/${temporada}/fichas`, fichaId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (e) {
        console.error("Erro ao carregar ficha:", e);
        return null;
    }
}

export async function atualizarAtributosBaseFicha(temporada, fichaId, updates) {
    try {
        const path = `temporadas/${temporada}/fichas/${fichaId}`;
        await setDoc(doc(db, path), updates, { merge: true });
        return true;
    } catch (e) {
        console.error('Erro ao atualizar atributos base da ficha:', e);
        return false;
    }
}

// --- Funções de Habilidades ---

export async function carregarHabilidades(temporada, fichaId) {
    try {
        const path = `temporadas/${temporada}/fichas/${fichaId}/habilidades`;
        const snapshot = await getDocs(collection(db, path));
        const habilidades = {};
        snapshot.forEach(doc => {
            habilidades[doc.id] = doc.data();
        });
        return habilidades;
    } catch (e) {
        console.error('Erro ao carregar habilidades:', e);
        return {};
    }
}

export async function adicionarHabilidade(temporada, fichaId, dadosHabilidade) {
    try {
        const path = `temporadas/${temporada}/fichas/${fichaId}/habilidades`;
        const docRef = await addDoc(collection(db, path), dadosHabilidade);
        return docRef.id;
    } catch (e) {
        console.error('Erro ao adicionar habilidade:', e);
        return null;
    }
}

export async function atualizarHabilidade(temporada, fichaId, habilidadeId, updates) {
    try {
        const path = `temporadas/${temporada}/fichas/${fichaId}/habilidades/${habilidadeId}`;
        await setDoc(doc(db, path), updates);
        return true;
    } catch (e) {
        console.error('Erro ao atualizar habilidade:', e);
        return false;
    }
}

export async function removerHabilidade(temporada, fichaId, habilidadeId) {
    try {
        const path = `temporadas/${temporada}/fichas/${fichaId}/habilidades/${habilidadeId}`;
        await deleteDoc(doc(db, path));
        return true;
    } catch (e) {
        console.error('Erro ao remover habilidade:', e);
        return false;
    }
}

// --- Funções de Rituais ---

export async function carregarRituais(temporada, fichaId) {
    try {
        const path = `temporadas/${temporada}/fichas/${fichaId}/rituais`;
        const snapshot = await getDocs(collection(db, path));
        const rituais = {};
        snapshot.forEach(doc => {
            rituais[doc.id] = doc.data();
        });
        return rituais;
    } catch (e) {
        console.error('Erro ao carregar rituais:', e);
        return {};
    }
}

export async function adicionarRitual(temporada, fichaId, dadosRitual) {
    try {
        const path = `temporadas/${temporada}/fichas/${fichaId}/rituais`;
        const docRef = await addDoc(collection(db, path), dadosRitual);
        return docRef.id;
    } catch (e) {
        console.error('Erro ao adicionar ritual:', e);
        return null;
    }
}

export async function atualizarRitual(temporada, fichaId, ritualId, updates) {
    try {
        const path = `temporadas/${temporada}/fichas/${fichaId}/rituais/${ritualId}`;
        await setDoc(doc(db, path), updates);
        return true;
    } catch (e) {
        console.error('Erro ao atualizar ritual:', e);
        return false;
    }
}

export async function removerRitual(temporada, fichaId, ritualId) {
    try {
        const path = `temporadas/${temporada}/fichas/${fichaId}/rituais/${ritualId}`;
        await deleteDoc(doc(db, path));
        return true;
    } catch (e) {
        console.error('Erro ao remover ritual:', e);
        return false;
    }
}
