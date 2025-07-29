import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SUA_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// URL base para imagens no GitHub Pages
const BASE_URL = 'https://vituali.github.io/rpg/';

const Anima = {
    currentFichaId: null,
    fichas: {},

    atualizarBarras() {
        const hpBar = document.getElementById('hpBar');
        const hpLabel = document.getElementById('hpLabel');
        const sanidadeBar = document.getElementById('sanidadeBar');
        const sanidadeLabel = document.getElementById('sanidadeLabel');
        const esforcoBar = document.getElementById('esforcoBar');
        const esforcoLabel = document.getElementById('esforcoLabel');

        if (!this.currentFichaId) {
            hpBar.style.width = '0%';
            hpLabel.textContent = 'Vida: 0/0';
            sanidadeBar.style.width = '0%';
            sanidadeLabel.textContent = 'Sanidade: 0/0';
            esforcoBar.style.width = '0%';
            esforcoLabel.textContent = 'Ponto de Esforço: 0/0';
            return;
        }

        const ficha = this.fichas[this.currentFichaId];
        hpBar.style.width = `${(ficha.vida / ficha.vidaMax) * 100}%`;
        hpLabel.textContent = `Vida: ${ficha.vida}/${ficha.vidaMax}`;
        sanidadeBar.style.width = `${(ficha.sanidade / ficha.sanidadeMax) * 100}%`;
        sanidadeLabel.textContent = `Sanidade: ${ficha.sanidade}/${ficha.sanidadeMax}`;
        esforcoBar.style.width = `${(ficha.esforco / ficha.esforcoMax) * 100}%`;
        esforcoLabel.textContent = `Ponto de Esforço: ${ficha.esforco}/${ficha.esforcoMax}`;
    },

    alterarVida(valor) {
        if (!this.currentFichaId) return;
        const ficha = this.fichas[this.currentFichaId];
        ficha.vida = Math.max(0, Math.min(ficha.vidaMax, ficha.vida + valor));
        this.atualizarBarras();
        this.salvarDados();
    },

    alterarSanidade(valor) {
        if (!this.currentFichaId) return;
        const ficha = this.fichas[this.currentFichaId];
        ficha.sanidade = Math.max(0, Math.min(ficha.sanidadeMax, ficha.sanidade + valor));
        this.atualizarBarras();
        this.salvarDados();
    },

    alterarEsforco(valor) {
        if (!this.currentFichaId) return;
        const ficha = this.fichas[this.currentFichaId];
        ficha.esforco = Math.max(0, Math.min(ficha.esforcoMax, ficha.esforco + valor));
        this.atualizarBarras();
        this.salvarDados();
    },

    editarAtributo(nome, elemento) {
        if (!this.currentFichaId) return;
        const ficha = this.fichas[this.currentFichaId];
        const valorAtual = ficha[nome] !== undefined ? ficha[nome] : (ficha.atributos[nome] || 0);
        const input = document.createElement('input');
        input.type = 'number';
        input.value = valorAtual;
        input.style.width = '60px';
        input.style.background = '#250135';
        input.style.color = '#e0e0e0';
        input.style.border = '1px solid #9d00ff';
        input.style.borderRadius = '4px';
        input.style.padding = '2px';
        input.style.fontFamily = "'Courier New', Courier, monospace";

        elemento.replaceWith(input);
        input.focus();

        const salvarEdicao = () => {
            const novoValor = parseInt(input.value) || 0;
            if (ficha[nome] !== undefined) {
                ficha[nome] = Math.max(0, Math.min(20, novoValor));
            } else {
                ficha.atributos[nome] = Math.max(0, Math.min(20, novoValor));
            }
            elemento.textContent = novoValor;
            input.replaceWith(elemento);
            this.salvarDados();
        };

        input.addEventListener('blur', salvarEdicao);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                salvarEdicao();
            }
        });
    },

    editarPericia(nome, elemento) {
        if (!this.currentFichaId) return;
        const ficha = this.fichas[this.currentFichaId];
        const valorAtual = ficha.pericias[nome] || 0;
        const input = document.createElement('input');
        input.type = 'number';
        input.value = valorAtual;
        input.style.width = '60px';
        input.style.background = '#250135';
        input.style.color = '#e0e0e0';
        input.style.border = '1px solid #9d00ff';
        input.style.borderRadius = '4px';
        input.style.padding = '2px';
        input.style.fontFamily = "'Courier New', Courier, monospace";

        elemento.replaceWith(input);
        input.focus();

        const salvarEdicao = () => {
            const novoValor = parseInt(input.value) || 0;
            ficha.pericias[nome] = Math.max(0, Math.min(20, novoValor));
            elemento.textContent = novoValor;
            input.replaceWith(elemento);
            this.salvarDados();
        };

        input.addEventListener('blur', salvarEdicao);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                salvarEdicao();
            }
        });
    },

    editarTexto(nome, elemento) {
        if (!this.currentFichaId) return;
        const ficha = this.fichas[this.currentFichaId];
        const valorAtual = ficha[nome] || '';
        const input = document.createElement('input');
        input.type = 'text';
        input.value = valorAtual;
        input.style.width = '200px';
        input.style.background = '#250135';
        input.style.color = '#e0e0e0';
        input.style.border = '1px solid #9d00ff';
        input.style.borderRadius = '4px';
        input.style.padding = '2px';
        input.style.fontFamily = "'Courier New', Courier, monospace";

        elemento.replaceWith(input);
        input.focus();

        const salvarEdicao = () => {
            const novoValor = input.value.trim();
            ficha[nome] = novoValor;
            elemento.textContent = novoValor || `Sem ${nome}`;
            input.replaceWith(elemento);
            this.salvarDados();
        };

        input.addEventListener('blur', salvarEdicao);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                salvarEdicao();
            }
        });
    },

    iniciarRitual() {
        alert('Tô sentindo uma energia poderosa, cria! Ritual iniciado!');
    },

    explorarMisterios() {
        alert('Partiu desbravar os mistérios, Victor! Fica ligado nos sinais!');
    },

    async salvarDados() {
        if (!this.currentFichaId) return;
        const ficha = this.fichas[this.currentFichaId];
        try {
            await setDoc(doc(db, 'fichas', this.currentFichaId), ficha);
            console.log('Ficha salva no Firestore:', ficha);
        } catch (e) {
            console.error('Erro ao salvar ficha:', e);
        }
    },

    async carregarDados() {
        try {
            const snapshot = await getDocs(collection(db, 'fichas'));
            this.fichas = {};
            snapshot.forEach(doc => {
                this.fichas[doc.id] = doc.data();
            });
            const seletor = document.getElementById('seletorFichas');
            seletor.innerHTML = '<option value="">Selecione uma ficha</option>';
            Object.keys(this.fichas).forEach(id => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = this.fichas[id].nome;
                seletor.appendChild(option);
            });
            this.currentFichaId = null;
            this.atualizarInterface();
        } catch (e) {
            console.error('Erro ao carregar fichas:', e);
            this.fichas = {};
            this.atualizarInterface();
        }
    },

    selecionarFicha(id) {
        this.currentFichaId = id;
        this.atualizarInterface();
    },

    async excluirFicha() {
        if (!this.currentFichaId) return;
        if (confirm('Tem certeza que deseja excluir esta ficha?')) {
            try {
                await deleteDoc(doc(db, 'fichas', this.currentFichaId));
                delete this.fichas[this.currentFichaId];
                this.currentFichaId = null;
                this.carregarDados();
                document.getElementById('fichaModal').style.display = 'none';
            } catch (e) {
                console.error('Erro ao excluir ficha:', e);
            }
        }
    },

    toggleFicha() {
        if (!this.currentFichaId) return;
        const modal = document.getElementById('fichaModal');
        modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
        if (modal.style.display === 'block') {
            this.atualizarFicha();
        }
    },

    atualizarInterface() {
        const nomePersonagem = document.getElementById('nomePersonagem');
        const characterImg = document.getElementById('characterImg');
        const verFichaBtn = document.getElementById('verFichaBtn');

        if (!this.currentFichaId) {
            nomePersonagem.textContent = 'Nenhuma Ficha Selecionada';
            characterImg.src = 'https://via.placeholder.com/120';
            verFichaBtn.disabled = true;
            this.atualizarBarras();
            return;
        }

        const ficha = this.fichas[this.currentFichaId];
        nomePersonagem.textContent = ficha.nome;
        characterImg.src = BASE_URL + (ficha.imagem || 'https://via.placeholder.com/120');
        verFichaBtn.disabled = false;
        this.atualizarBarras();
        this.atualizarFicha();
    },

    atualizarFicha() {
        if (!this.currentFichaId) return;
        const ficha = this.fichas[this.currentFichaId];
        document.getElementById('modalNomePersonagem').textContent = ficha.nome;
        document.getElementById('profissaoInfo').textContent = ficha.profissaoInfo || "Sem profissão";
        document.getElementById('caminhos').textContent = ficha.caminhos || "Sem caminhos";
        document.getElementById('oculto').textContent = ficha.oculto || "Sem oculto";
        document.getElementById('natural').textContent = ficha.natural || "Sem natural";
        document.getElementById('forca').textContent = ficha.atributos.forca || 0;
        document.getElementById('agilidade').textContent = ficha.atributos.agilidade || 0;
        document.getElementById('inteligencia').textContent = ficha.atributos.inteligencia || 0;
        document.getElementById('vigor').textContent = ficha.atributos.vigor || 0;
        document.getElementById('presenca').textContent = ficha.atributos.presenca || 0;
        document.getElementById('pv').textContent = ficha.vida || 0;
        document.getElementById('pe').textContent = ficha.esforco || 0;
        document.getElementById('sanidadeStat').textContent = ficha.sanidade || 0;
        document.getElementById('defesa').textContent = ficha.defesa || 0;
        document.getElementById('nex').textContent = (ficha.nex || 0) + '%';
        document.getElementById('vontade').textContent = ficha.pericias.vontade || 0;
        document.getElementById('tecnologia').textContent = ficha.pericias.tecnologia || 0;
        document.getElementById('tatica').textContent = ficha.pericias.tatica || 0;
        document.getElementById('sobrevivencia').textContent = ficha.pericias.sobrevivencia || 0;
        document.getElementById('religiao').textContent = ficha.pericias.religiao || 0;
        document.getElementById('reflexos').textContent = ficha.pericias.reflexos || 0;
        document.getElementById('profissao').textContent = ficha.pericias.profissao || 0;
        document.getElementById('pontaria').textContent = ficha.pericias.pontaria || 0;
        document.getElementById('pilotagem').textContent = ficha.pericias.pilotagem || 0;
        document.getElementById('percepcao').textContent = ficha.pericias.percepcao || 0;
        document.getElementById('ocultismo').textContent = ficha.pericias.ocultismo || 0;
        document.getElementById('medicina').textContent = ficha.pericias.medicina || 0;
        document.getElementById('luta').textContent = ficha.pericias.luta || 0;
        document.getElementById('investigacao').textContent = ficha.pericias.investigacao || 0;
        document.getElementById('intuicao').textContent = ficha.pericias.intuicao || 0;
        document.getElementById('intimidacao').textContent = ficha.pericias.intimidacao || 0;
        document.getElementById('iniciativa').textContent = ficha.pericias.iniciativa || 0;
        document.getElementById('furtividade').textContent = ficha.pericias.furtividade || 0;
        document.getElementById('fortitude').textContent = ficha.pericias.fortitude || 0;
        document.getElementById('enganacao').textContent = ficha.pericias.enganacao || 0;
        document.getElementById('diplomacia').textContent = ficha.pericias.diplomacia || 0;
        document.getElementById('crime').textContent = ficha.pericias.crime || 0;
        document.getElementById('ciencias').textContent = ficha.pericias.ciencias || 0;
        document.getElementById('atualidades').textContent = ficha.pericias.atualidades || 0;
        document.getElementById('atletismo').textContent = ficha.pericias.atletismo || 0;
        document.getElementById('artes').textContent = ficha.pericias.artes || 0;
        document.getElementById('adestramento').textContent = ficha.pericias.adestramento || 0;
        document.getElementById('acrobacia').textContent = ficha.pericias.acrobacia || 0;
        document.getElementById('acoesMais').textContent = ficha.pericias.acoesMais || 0;
        const itensList = document.getElementById('itens');
        itensList.innerHTML = '';
        ficha.itens.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            itensList.appendChild(li);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Anima.carregarDados();
});