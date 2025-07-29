import { db } from '../firebase-config.js';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export async function salvarDados(fichas, currentFichaId) {
    if (!currentFichaId) return;
    const ficha = fichas[currentFichaId];
    try {
        await setDoc(doc(db, 'fichas', currentFichaId), ficha);
        console.log('Ficha salva no Firestore:', ficha);
    } catch (e) {
        console.error('Erro ao salvar ficha:', e);
        alert('Erro ao salvar ficha: ' + e.message);
    }
}

export async function carregarDados(fichas) {
    try {
        const snapshot = await getDocs(collection(db, 'fichas'));
        fichas = {};
        snapshot.forEach(doc => {
            fichas[doc.id] = doc.data();
        });
        const seletor = document.getElementById('seletorFichas');
        seletor.innerHTML = '<option value="">Selecione uma ficha</option>';
        Object.keys(fichas).forEach(id => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = fichas[id].nome;
            seletor.appendChild(option);
        });
        return fichas;
    } catch (e) {
        console.error('Erro ao carregar fichas:', e);
        alert('Erro ao carregar fichas: ' + e.message);
        return {};
    }
}

export async function excluirFicha(fichas, currentFichaId) {
    if (!currentFichaId) return;
    if (confirm('Tem certeza que deseja excluir esta ficha?')) {
        try {
            await deleteDoc(doc(db, 'fichas', currentFichaId));
            delete fichas[currentFichaId];
            document.getElementById('fichaModal').style.display = 'none';
        } catch (e) {
            console.error('Erro ao excluir ficha:', e);
            alert('Erro ao excluir ficha: ' + e.message);
        }
    }
}