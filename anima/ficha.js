import { generateUUID } from '../utils.js';
import Anima from './index.js';

export function alterarVida(fichas, currentFichaId, valor) {
    if (!currentFichaId) return;
    const ficha = fichas[currentFichaId];
    ficha.vida = Math.max(0, Math.min(ficha.vidaMax, ficha.vida + valor));
    Anima.marcarAlteracao();
}

export function alterarSanidade(fichas, currentFichaId, valor) {
    if (!currentFichaId) return;
    const ficha = fichas[currentFichaId];
    ficha.sanidade = Math.max(0, Math.min(ficha.sanidadeMax, ficha.sanidade + valor));
    Anima.marcarAlteracao();
}

export function alterarEsforco(fichas, currentFichaId, valor) {
    if (!currentFichaId) return;
    const ficha = fichas[currentFichaId];
    ficha.esforco = Math.max(0, Math.min(ficha.esforcoMax, ficha.esforco + valor));
    Anima.marcarAlteracao();
}

export function editarAtributo(fichas, currentFichaId, nome, elemento) {
    if (!currentFichaId) return;
    const ficha = fichas[currentFichaId];
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
        Anima.marcarAlteracao();
    };

    input.addEventListener('blur', salvarEdicao);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') salvarEdicao();
    });
}

export function editarPericia(fichas, currentFichaId, nome, elemento) {
    if (!currentFichaId) return;
    const ficha = fichas[currentFichaId];
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
        Anima.marcarAlteracao();
    };

    input.addEventListener('blur', salvarEdicao);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') salvarEdicao();
    });
}

export function editarTexto(fichas, currentFichaId, nome, elemento) {
    if (!currentFichaId) return;
    const ficha = fichas[currentFichaId];
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
        Anima.marcarAlteracao();
    };

    input.addEventListener('blur', salvarEdicao);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') salvarEdicao();
    });
}

export function iniciarRitual() {
    alert('Tô sentindo uma energia poderosa, cria! Ritual iniciado!');
}

export function explorarMisterios() {
    alert('Partiu desbravar os mistérios, Victor! Fica ligado nos sinais!');
}

export async function criarFicha(fichas, currentFichaId) {
    const nome = document.getElementById('novoNome').value.trim();
    if (!nome) {
        alert('O nome do personagem é obrigatório!');
        return currentFichaId;
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
        fichas[id] = novaFicha;
        document.getElementById('fichaModal').style.display = 'none';
        Anima.marcarAlteracao();
        return id;
    } catch (e) {
        console.error('Erro ao criar ficha:', e);
        alert('Erro ao criar ficha: ' + e.message);
        return currentFichaId;
    }
}

export function selecionarFicha(fichas, id) {
    return id;
}