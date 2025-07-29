/* URL base para imagens no GitHub Pages */
const BASE_URL = 'https://vituali.github.io/rpg/';

/* Função para gerar UUID */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export { BASE_URL, generateUUID };