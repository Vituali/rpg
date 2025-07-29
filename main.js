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
});