import * as UI from './ui.js';
import * as Data from './data.js';
import * as Ficha from './ficha.js';

const Anima = {
    ...UI,
    ...Data,
    ...Ficha,
    currentFichaId: null,
    fichas: {}
};

export default Anima;