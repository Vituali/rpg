import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

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
const auth = getAuth(app);

// Login anônimo
signInAnonymously(auth)
    .then(() => console.log('Usuário anônimo logado'))
    .catch(e => console.error('Erro ao logar anônimo:', e));

// URL base para imagens no GitHub Pages
const BASE_URL = 'https://vituali.github.io/rpg/';

// Função para gerar UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

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
            alert('Erro ao salvar ficha: ' + e.message);
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
            alert('Erro ao carregar fichas: ' + e.message);
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
                alert('Erro ao excluir ficha: ' + e.message);
            }
        }
    },

    toggleFicha() {
        const modal = document.getElementById('fichaModal');
        const visualizarFicha = document.getElementById('visualizarFicha');
        const criarFicha = document.getElementById('criarFicha');
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
            visualizarFicha.style.display = 'none';
            criarFicha.style.display = 'none';
        } else if (this.currentFichaId) {
            modal.style.display = 'block';
            visualizarFicha.style.display = 'block';
            criarFicha.style.display = 'none';
            this.atualizarFicha();
        }
    },

    mostrarCriarFicha() {
        const modal = document.getElementById('fichaModal');
        const visualizarFicha = document.getElementById('visualizarFicha');
        const criarFicha = document.getElementById('criarFicha');
        modal.style.display = 'block';
        visualizarFicha.style.display = 'none';
        criarFicha.style.display = 'block';
        // Limpar formulário
        document.getElementById('novoNome').value = '';
        document.getElementById('novoProfissaoInfo').value = '';
        document.getElementById('novoCaminhos').value = '';
        document.getElementById('novoOculto').value = '';
        document.getElementById('novoNatural').value = '';
        document.getElementById('novoImagem').value = 'personagens/nome.png';
        document.getElementById('novoVidaMax').value = '100';
        document.getElementById('novoSanidadeMax').value = '100';
        document.getElementById('novoEsforcoMax').value = '100';
        document.getElementById('novoDefesa').value = '10';
        document.getElementById('novoNex').value = '0';
        document.getElementById('novoForca').value = '0';
        document.getElementById('novoAgilidade').value = '0';
        document.getElementById('novoInteligencia').value = '0';
        document.getElementById('novoVigor').value = '0';
        document.getElementById('novoPresenca').value = '0';
        document.getElementById('novoItens').value = '';
        document.getElementById('novoAcoesMais').value = '0';
        document.getElementById('novoAcrobacia').value = '0';
        document.getElementById('novoAdestramento').value = '0';
        document.getElementById('novoArtes').value = '0';
        document.getElementById('novoAtletismo').value = '0';
        document.getElementById('novoAtualidades').value = '0';
        document.getElementById('novoCiencias').value = '0';
        document.getElementById('novoCrime').value = '0';
        document.getElementById('novoDiplomacia').value = '0';
        document.getElementById('novoEnganacao').value = '0';
        document.getElementById('novoFortitude').value = '0';
        document.getElementById('novoFurtividade').value = '0';
        document.getElementById('novoIniciativa').value = '0';
        document.getElementById('novoIntimidacao').value = '0';
        document.getElementById('novoIntuicao').value = '0';
        document.getElementById('novoInvestigacao').value = '0';
        document.getElementById('novoLuta').value = '0';
        document.getElementById('novoMedicina').value = '0';
        document.getElementById('novoOcultismo').value = '0';
        document.getElementById('novoPercepcao').value = '0';
        document.getElementById('novoPilotagem').value = '0';
        document.getElementById('novoPontaria').value = '0';
        document.getElementById('novoProfissao').value = '0';
        document.getElementById('novoReflexos').value = '0';
        document.getElementById('novoReligiao').value = '0';
        document.getElementById('novoSobrevivencia').value = '0';
        document.getElementById('novoTatica').value = '0';
        document.getElementById('novoTecnologia').value = '0';
        document.getElementById('novoVontade').value = '0';
    },

    async criarFicha() {
        const nome = document.getElementById('novoNome').value.trim();
        if (!nome) {
            alert('O nome do personagem é obrigatório!');
            return;
        }

        const novaFicha = {
            nome,
            profissaoInfo: document.getElementById('novoProfissaoInfo').value.trim() || 'Sem profissão',
            caminhos: document.getElementById('novoCaminhos').value.trim() || 'Sem caminhos',
            oculto: document.getElementById('novoOculto').value.trim() || 'Nenhum',
            natural: document.getElementById('novoNatural').value.trim() || 'Nenhum',
            imagem: document.getElementById('novoImagem').value.trim() || 'personagens/default.png',
            vida: parseInt(document.getElementById('novoVidaMax').value) || 100,
            vidaMax: parseInt(document.getElementById('novoVidaMax').value) || 100,
            sanidade: parseInt(document.getElementById('novoSanidadeMax').value) || 100,
            sanidadeMax: parseInt(document.getElementById('novoSanidadeMax').value) || 100,
            esforco: parseInt(document.getElementById('novoEsforcoMax').value) || 100,
            esforcoMax: parseInt(document.getElementById('novoEsforcoMax').value) || 100,
            defesa: parseInt(document.getElementById('novoDefesa').value) || 10,
            nex: parseInt(document.getElementById('novoNex').value) || 0,
            atributos: {
                forca: parseInt(document.getElementById('novoForca').value) || 0,
                agilidade: parseInt(document.getElementById('novoAgilidade').value) || 0,
                inteligencia: parseInt(document.getElementById('novoInteligencia').value) || 0,
                vigor: parseInt(document.getElementById('novoVigor').value) || 0,
                presenca: parseInt(document.getElementById('novoPresenca').value) || 0
            },
            pericias: {
                acoesMais: parseInt(document.getElementById('novoAcoesMais').value) || 0,
                acrobacia: parseInt(document.getElementById('novoAcrobacia').value) || 0,
                adestramento: parseInt(document.getElementById('novoAdestramento').value) || 0,
                artes: parseInt(document.getElementById('novoArtes').value) || 0,
                atletismo: parseInt(document.getElementById('novoAtletismo').value) || 0,
                atualidades: parseInt(document.getElementById('novoAtualidades').value) || 0,
                ciencias: parseInt(document.getElementById('novoCiencias').value) || 0,
                crime: parseInt(document.getElementById('novoCrime').value) || 0,
                diplomacia: parseInt(document.getElementById('novoDiplomacia').value) || 0,
                enganacao: parseInt(document.getElementById('novoEnganacao').value) || 0,
                fortitude: parseInt(document.getElementById('novoFortitude').value) || 0,
                furtividade: parseInt(document.getElementById('novoFurtividade').value) || 0,
                iniciativa: parseInt(document.getElementById('novoIniciativa').value) || 0,
                intimidacao: parseInt(document.getElementById('novoIntimidacao').value) || 0,
                intuicao: parseInt(document.getElementById('novoIntuicao').value) || 0,
                investigacao: parseInt(document.getElementById('novoInvestigacao').value) || 0,
                luta: parseInt(document.getElementById('novoLuta').value) || 0,
                medicina: parseInt(document.getElementById('novoMedicina').value) || 0,
                ocultismo: parseInt(document.getElementById('novoOcultismo').value) || 0,
                percepcao: parseInt(document.getElementById('novoPercepcao').value) || 0,
                pilotagem: parseInt(document.getElementById('novoPilotagem').value) || 0,
                pontaria: parseInt(document.getElementById('novoPontaria').value) || 0,
                profissao: parseInt(document.getElementById('novoProfissao').value) || 0,
                reflexos: parseInt(document.getElementById('novoReflexos').value) || 0,
                religiao: parseInt(document.getElementById('novoReligiao').value) || 0,
                sobrevivencia: parseInt(document.getElementById('novoSobrevivencia').value) || 0,
                tatica: parseInt(document.getElementById('novoTatica').value) || 0,
                tecnologia: parseInt(document.getElementById('novoTecnologia').value) || 0,
                vontade: parseInt(document.getElementById('novoVontade').value) || 0
            },
            itens: document.getElementById('novoItens').value.split(',').map(item => item.trim()).filter(item => item) || [],
            ataques: {},
            origem: '',
            classe: ''
        };

        const id = generateUUID();
        try {
            await setDoc(doc(db, 'fichas', id), novaFicha);
            this.fichas[id] = novaFicha;
            this.currentFichaId = id;
            await this.carregarDados();
            document.getElementById('fichaModal').style.display = 'none';
            this.atualizarInterface();
        } catch (e) {
            console.error('Erro ao criar ficha:', e);
            alert('Erro ao criar ficha: ' + e.message);
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