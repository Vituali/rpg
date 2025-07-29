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
        console.log('Verificando salvamento automático: alteracoesPendentes=', this.alteracoesPendentes, 'currentFichaId=', this.currentFichaId);
        if (this.alteracoesPendentes && this.currentFichaId) {
            await this.salvarDados(this.fichas, this.currentFichaId);
            this.alteracoesPendentes = false;
            document.getElementById('salvarBtn').disabled = true;
            console.log('Alterações salvas no Firestore e alteracoesPendentes resetado.');
        } else {
            console.log('Nenhum salvamento realizado: sem alterações pendentes ou ficha selecionada.');
        }
    }
};

export default Anima;