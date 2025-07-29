import Anima from './anima/index.js';
import { initializeAuth } from './firebase-config.js';

/* Configura os eventos após o carregamento do DOM */
document.addEventListener('DOMContentLoaded', async () => {
    /* Inicializar autenticação anônima */
    await initializeAuth();

    /* Carrega as fichas do Firestore */
    Anima.fichas = await Anima.carregarDados(Anima.fichas);

    /* Adiciona evento para selecionar ficha */
    document.getElementById('seletorFichas').addEventListener('change', (e) => {
        Anima.currentFichaId = Anima.selecionarFicha(Anima.fichas, e.target.value);
        Anima.atualizarInterface(Anima.fichas, Anima.currentFichaId);
    });

    /* Adiciona eventos aos botões */
    document.getElementById('verFichaBtn').addEventListener('click', () => Anima.toggleFicha(Anima.fichas, Anima.currentFichaId));
    document.getElementById('criarFichaBtn').addEventListener('click', () => Anima.mostrarCriarFicha());
    document.getElementById('iniciarRitualBtn').addEventListener('click', () => Anima.iniciarRitual());
    document.getElementById('explorarMisteriosBtn').addEventListener('click', () => Anima.explorarMisterios());
    document.getElementById('fecharModalBtn').addEventListener('click', () => Anima.toggleFicha(Anima.fichas, Anima.currentFichaId));
    document.getElementById('excluirFichaBtn').addEventListener('click', async () => {
        await Anima.excluirFicha(Anima.fichas, Anima.currentFichaId);
        Anima.fichas = await Anima.carregarDados(Anima.fichas);
        Anima.currentFichaId = null;
        Anima.atualizarInterface(Anima.fichas, Anima.currentFichaId);
    });
    document.getElementById('submitCriarFichaBtn').addEventListener('click', async () => {
        Anima.currentFichaId = await Anima.criarFicha(Anima.fichas, Anima.currentFichaId);
        Anima.fichas = await Anima.carregarDados(Anima.fichas);
        Anima.atualizarInterface(Anima.fichas, Anima.currentFichaId);
    });

    /* Adiciona eventos para os botões das barras */
    document.getElementById('vidaMenos5').addEventListener('click', () => {
        Anima.alterarVida(Anima.fichas, Anima.currentFichaId, -5);
        Anima.atualizarBarras(Anima.fichas, Anima.currentFichaId);
        Anima.salvarDados(Anima.fichas, Anima.currentFichaId);
    });
    document.getElementById('vidaMenos1').addEventListener('click', () => {
        Anima.alterarVida(Anima.fichas, Anima.currentFichaId, -1);
        Anima.atualizarBarras(Anima.fichas, Anima.currentFichaId);
        Anima.salvarDados(Anima.fichas, Anima.currentFichaId);
    });
    document.getElementById('vidaMais1').addEventListener('click', () => {
        Anima.alterarVida(Anima.fichas, Anima.currentFichaId, 1);
        Anima.atualizarBarras(Anima.fichas, Anima.currentFichaId);
        Anima.salvarDados(Anima.fichas, Anima.currentFichaId);
    });
    document.getElementById('vidaMais5').addEventListener('click', () => {
        Anima.alterarVida(Anima.fichas, Anima.currentFichaId, 5);
        Anima.atualizarBarras(Anima.fichas, Anima.currentFichaId);
        Anima.salvarDados(Anima.fichas, Anima.currentFichaId);
    });
    document.getElementById('sanidadeMenos5').addEventListener('click', () => {
        Anima.alterarSanidade(Anima.fichas, Anima.currentFichaId, -5);
        Anima.atualizarBarras(Anima.fichas, Anima.currentFichaId);
        Anima.salvarDados(Anima.fichas, Anima.currentFichaId);
    });
    document.getElementById('sanidadeMenos1').addEventListener('click', () => {
        Anima.alterarSanidade(Anima.fichas, Anima.currentFichaId, -1);
        Anima.atualizarBarras(Anima.fichas, Anima.currentFichaId);
        Anima.salvarDados(Anima.fichas, Anima.currentFichaId);
    });
    document.getElementById('sanidadeMais1').addEventListener('click', () => {
        Anima.alterarSanidade(Anima.fichas, Anima.currentFichaId, 1);
        Anima.atualizarBarras(Anima.fichas, Anima.currentFichaId);
        Anima.salvarDados(Anima.fichas, Anima.currentFichaId);
    });
    document.getElementById('sanidadeMais5').addEventListener('click', () => {
        Anima.alterarSanidade(Anima.fichas, Anima.currentFichaId, 5);
        Anima.atualizarBarras(Anima.fichas, Anima.currentFichaId);
        Anima.salvarDados(Anima.fichas, Anima.currentFichaId);
    });
    document.getElementById('esforcoMenos5').addEventListener('click', () => {
        Anima.alterarEsforco(Anima.fichas, Anima.currentFichaId, -5);
        Anima.atualizarBarras(Anima.fichas, Anima.currentFichaId);
        Anima.salvarDados(Anima.fichas, Anima.currentFichaId);
    });
    document.getElementById('esforcoMenos1').addEventListener('click', () => {
        Anima.alterarEsforco(Anima.fichas, Anima.currentFichaId, -1);
        Anima.atualizarBarras(Anima.fichas, Anima.currentFichaId);
        Anima.salvarDados(Anima.fichas, Anima.currentFichaId);
    });
    document.getElementById('esforcoMais1').addEventListener('click', () => {
        Anima.alterarEsforco(Anima.fichas, Anima.currentFichaId, 1);
        Anima.atualizarBarras(Anima.fichas, Anima.currentFichaId);
        Anima.salvarDados(Anima.fichas, Anima.currentFichaId);
    });
    document.getElementById('esforcoMais5').addEventListener('click', () => {
        Anima.alterarEsforco(Anima.fichas, Anima.currentFichaId, 5);
        Anima.atualizarBarras(Anima.fichas, Anima.currentFichaId);
        Anima.salvarDados(Anima.fichas, Anima.currentFichaId);
    });

    /* Delegação de eventos para elementos editáveis no modal */
    document.getElementById('visualizarFicha').addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('editable')) {
            const id = target.id;
            // Campos de texto
            const camposTexto = ['profissaoInfo', 'caminhos', 'oculto', 'natural'];
            // Campos de atributos
            const camposAtributos = ['forca', 'agilidade', 'inteligencia', 'vigor', 'presenca', 'pv', 'pe', 'sanidadeStat', 'defesa', 'nex'];
            // Campos de perícias
            const camposPericias = [
                'acoesMais', 'acrobacia', 'adestramento', 'artes', 'atletismo', 'atualidades', 'ciencias',
                'crime', 'diplomacia', 'enganacao', 'fortitude', 'furtividade', 'iniciativa', 'intimidacao',
                'intuicao', 'investigacao', 'luta', 'medicina', 'ocultismo', 'percepcao', 'pilotagem',
                'pontaria', 'profissao', 'reflexos', 'religiao', 'sobrevivencia', 'tatica', 'tecnologia', 'vontade'
            ];

            if (camposTexto.includes(id)) {
                Anima.editarTexto(Anima.fichas, Anima.currentFichaId, id, target);
                Anima.salvarDados(Anima.fichas, Anima.currentFichaId);
            } else if (camposAtributos.includes(id)) {
                Anima.editarAtributo(Anima.fichas, Anima.currentFichaId, id, target);
                Anima.salvarDados(Anima.fichas, Anima.currentFichaId);
            } else if (camposPericias.includes(id)) {
                Anima.editarPericia(Anima.fichas, Anima.currentFichaId, id, target);
                Anima.salvarDados(Anima.fichas, Anima.currentFichaId);
            }
        }
    });
});