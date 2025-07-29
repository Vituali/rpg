import * as UI from './ui.js';
import * as Data from './data.js';
import * as Ficha from './ficha.js';

const Anima = {
    ...UI,
    ...Data,
    ...Ficha,
    currentFichaId: null,
    fichas: {},
    alteracoesPendentes: false,
    marcarAlteracao() {
        this.alteracoesPendentes = true;
        document.getElementById('salvarBtn').disabled = false;
    },
    async salvarAlteracoes() {
        if (this.alteracoesPendentes && this.currentFichaId) {
            await this.salvarDados(this.fichas, this.currentFichaId);
            this.alteracoesPendentes = false;
            document.getElementById('salvarBtn').disabled = true;
        }
    }
};

export default Anima;