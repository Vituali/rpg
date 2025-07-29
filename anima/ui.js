import { BASE_URL } from '../utils.js';

export function atualizarBarras(fichas, currentFichaId) {
    const hpBar = document.getElementById('hpBar');
    const hpLabel = document.getElementById('hpLabel');
    const sanidadeBar = document.getElementById('sanidadeBar');
    const sanidadeLabel = document.getElementById('sanidadeLabel');
    const esforcoBar = document.getElementById('esforcoBar');
    const esforcoLabel = document.getElementById('esforcoLabel');

    if (!currentFichaId) {
        hpBar.style.width = '0%';
        hpLabel.textContent = 'Vida: 0/0';
        sanidadeBar.style.width = '0%';
        sanidadeLabel.textContent = 'Sanidade: 0/0';
        esforcoBar.style.width = '0%';
        esforcoLabel.textContent = 'Ponto de Esforço: 0/0';
        return;
    }

    const ficha = fichas[currentFichaId];
    hpBar.style.width = `${(ficha.vida / ficha.vidaMax) * 100}%`;
    hpLabel.textContent = `Vida: ${ficha.vida}/${ficha.vidaMax}`;
    sanidadeBar.style.width = `${(ficha.sanidade / ficha.sanidadeMax) * 100}%`;
    sanidadeLabel.textContent = `Sanidade: ${ficha.sanidade}/${ficha.sanidadeMax}`;
    esforcoBar.style.width = `${(ficha.esforco / ficha.esforcoMax) * 100}%`;
    esforcoLabel.textContent = `Ponto de Esforço: ${ficha.esforco}/${ficha.esforcoMax}`;
}

export function atualizarInterface(fichas, currentFichaId) {
    const nomePersonagem = document.getElementById('nomePersonagem');
    const characterImg = document.getElementById('characterImg');
    const verFichaBtn = document.getElementById('verFichaBtn');

    if (!currentFichaId) {
        nomePersonagem.textContent = 'Nenhuma Ficha Selecionada';
        characterImg.src = 'personagens/dante.png';
        verFichaBtn.disabled = true;
        atualizarBarras(fichas, currentFichaId);
        return;
    }

    const ficha = fichas[currentFichaId];
    nomePersonagem.textContent = ficha.nome;
    characterImg.src = BASE_URL + (ficha.imagem || 'personagens/dante.png');
    verFichaBtn.disabled = false;
    atualizarBarras(fichas, currentFichaId);
    atualizarFicha(fichas, currentFichaId);
}

export function atualizarFicha(fichas, currentFichaId) {
    if (!currentFichaId) return;
    const ficha = fichas[currentFichaId];
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

export function toggleFicha(fichas, currentFichaId) {
    const modal = document.getElementById('fichaModal');
    const visualizarFicha = document.getElementById('visualizarFicha');
    const criarFicha = document.getElementById('criarFicha');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
        visualizarFicha.style.display = 'none';
        criarFicha.style.display = 'none';
    } else if (currentFichaId) {
        modal.style.display = 'block';
        visualizarFicha.style.display = 'block';
        criarFicha.style.display = 'none';
        atualizarFicha(fichas, currentFichaId);
    }
}

export function mostrarCriarFicha() {
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
}