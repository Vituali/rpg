import Anima from './anima.js';
import { initializeAuth } from './firebase-config.js';

/* Configura os eventos após o carregamento do DOM */
document.addEventListener('DOMContentLoaded', async () => {
    /* Inicializar autenticação anônima */
    await initializeAuth();

    /* Carrega as fichas do Firestore */
    await Anima.carregarDados();

    /* Adiciona evento para selecionar ficha */
    document.getElementById('seletorFichas').addEventListener('change', (e) => {
        Anima.selecionarFicha(e.target.value);
    });

    /* Adiciona eventos aos botões */
    document.getElementById('verFichaBtn').addEventListener('click', () => Anima.toggleFicha());
    document.getElementById('criarFichaBtn').addEventListener('click', () => Anima.mostrarCriarFicha());
    document.getElementById('iniciarRitualBtn').addEventListener('click', () => Anima.iniciarRitual());
    document.getElementById('explorarMisteriosBtn').addEventListener('click', () => Anima.explorarMisterios());
    document.getElementById('fecharModalBtn').addEventListener('click', () => Anima.toggleFicha());
    document.getElementById('excluirFichaBtn').addEventListener('click', () => Anima.excluirFicha());
    document.getElementById('submitCriarFichaBtn').addEventListener('click', () => Anima.criarFicha());

    /* Adiciona eventos para os botões das barras */
    document.getElementById('vidaMenos5').addEventListener('click', () => Anima.alterarVida(-5));
    document.getElementById('vidaMenos1').addEventListener('click', () => Anima.alterarVida(-1));
    document.getElementById('vidaMais1').addEventListener('click', () => Anima.alterarVida(1));
    document.getElementById('vidaMais5').addEventListener('click', () => Anima.alterarVida(5));
    document.getElementById('sanidadeMenos5').addEventListener('click', () => Anima.alterarSanidade(-5));
    document.getElementById('sanidadeMenos1').addEventListener('click', () => Anima.alterarSanidade(-1));
    document.getElementById('sanidadeMais1').addEventListener('click', () => Anima.alterarSanidade(1));
    document.getElementById('sanidadeMais5').addEventListener('click', () => Anima.alterarSanidade(5));
    document.getElementById('esforcoMenos5').addEventListener('click', () => Anima.alterarEsforco(-5));
    document.getElementById('esforcoMenos1').addEventListener('click', () => Anima.alterarEsforco(-1));
    document.getElementById('esforcoMais1').addEventListener('click', () => Anima.alterarEsforco(1));
    document.getElementById('esforcoMais5').addEventListener('click', () => Anima.alterarEsforco(5));

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
                Anima.editarTexto(id, target);
            } else if (camposAtributos.includes(id)) {
                Anima.editarAtributo(id, target);
            } else if (camposPericias.includes(id)) {
                Anima.editarPericia(id, target);
            }
        }
    });
});