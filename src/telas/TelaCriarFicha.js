// src/telas/TelaCriarFicha.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salvarFichaCompleta } from '../firebase/dataService';
import './TelaCriarFicha.css';

const periciasPadrao = {
    acrobacia: { valor: 0, atributo: 'agilidade' },
    adestramento: { valor: 0, atributo: 'presenca' },
    artes: { valor: 0, atributo: 'presenca' },
    atletismo: { valor: 0, atributo: 'forca' },
    atualidades: { valor: 0, atributo: 'inteligencia' },
    ciencias: { valor: 0, atributo: 'inteligencia' },
    crime: { valor: 0, atributo: 'agilidade' },
    cultura: { valor: 0, atributo: 'inteligencia' },
    diplomacia: { valor: 0, atributo: 'presenca' },
    enganacao: { valor: 0, atributo: 'presenca' },
    fortitude: { valor: 0, atributo: 'vigor' },
    furtividade: { valor: 0, atributo: 'agilidade' },
    iniciativa: { valor: 0, atributo: 'agilidade' },
    intimidacao: { valor: 0, atributo: 'presenca' },
    intuicao: { valor: 0, atributo: 'presenca' },
    investigacao: { valor: 0, atributo: 'inteligencia' },
    luta: { valor: 0, atributo: 'forca' },
    medicina: { valor: 0, atributo: 'inteligencia' },
    ocultismo: { valor: 0, atributo: 'presenca' },
    oficio: { valor: 0, atributo: 'inteligencia' },
    percepcao: { valor: 0, atributo: 'presenca' },
    pilotagem: { valor: 0, atributo: 'agilidade' },
    pontaria: { valor: 0, atributo: 'agilidade' },
    reflexos: { valor: 0, atributo: 'agilidade' },
    religiao: { valor: 0, atributo: 'inteligencia' },
    sobrevivencia: { valor: 0, atributo: 'inteligencia' },
    tatica: { valor: 0, atributo: 'inteligencia' },
    tecnologia: { valor: 0, atributo: 'inteligencia' },
    vontade: { valor: 0, atributo: 'presenca' }
};

function TelaCriarFicha() {
    const navigate = useNavigate();
    const [ficha, setFicha] = useState({
        nome: '',
        jogador: '',
        profissao: 'investigador',
        profissaoPersonalizada: '',
        caminho: 'combatente',
        caminhoPersonalizado: '',
        vida: 10, vidaMax: 10,
        sanidade: 10, sanidadeMax: 10,
        esforco: 10, esforcoMax: 10,
        esquiva: 10,
        imagem: '/personagens/dante.png',
        atributos: { forca: 1, agilidade: 1, inteligencia: 1, vigor: 1, presenca: 1 },
        pericias: periciasPadrao
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFicha(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
    };
    const handleAttributeChange = (e) => {
        const { name, value } = e.target;
        const valorNumerico = parseInt(value, 10) || 0;
        const valorLimitado = Math.min(valorNumerico, 19);
        setFicha(prev => ({
            ...prev,
            atributos: { ...prev.atributos, [name]: valorLimitado }
        }));
    };
    const handlePericiaChange = (nomePericia, campo, valor) => {
        setFicha(prev => ({
            ...prev,
            pericias: {
                ...prev.pericias,
                [nomePericia]: {
                    ...prev.pericias[nomePericia],
                    [campo]: campo === 'valor' ? parseInt(valor) || 0 : valor
                }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!ficha.nome) {
            alert('O nome do personagem é obrigatório!');
            return;
        }
        const novoId = await salvarFichaCompleta(ficha);
        if (novoId) {
            alert('Ficha criada com sucesso!');
            navigate('/jogar');
        }
    };

    return (
        <div className="form-container">
            <h2>Criar Nova Ficha</h2>
            <form onSubmit={handleSubmit}>
                {/* ... (o resto do formulário antes das perícias continua o mesmo) ... */}
                <label>Nome do Personagem:</label>
                <input type="text" name="nome" value={ficha.nome} onChange={handleChange} required />
                <label>Nome do Jogador:</label>
                <input type="text" name="jogador" value={ficha.jogador} onChange={handleChange} />
                <label>Profissão:</label>
                <select name="profissao" value={ficha.profissao} onChange={handleChange}>
                    <option value="investigador">Investigador</option>
                    <option value="medico_legista">Médico Legista</option>
                    <option value="agente_de_campo">Agente de Campo</option>
                    <option value="ocultista_teorico">Ocultista Teórico</option>
                    <option value="personalizado">Outra (Personalizada)</option>
                </select>
                {ficha.profissao === 'personalizado' && ( <div className="campo-personalizado"><input type="text" name="profissaoPersonalizada" placeholder="Digite a profissão personalizada" value={ficha.profissaoPersonalizada} onChange={handleChange}/></div>)}
                <label>Caminho:</label>
                <select name="caminho" value={ficha.caminho} onChange={handleChange}>
                    <option value="combatente">Combatente</option>
                    <option value="especialista">Especialista</option>
                    <option value="ocultista">Ocultista</option>
                    <option value="personalizado">Outro (Personalizado)</option>
                </select>
                {ficha.caminho === 'personalizado' && (<div className="campo-personalizado"><input type="text" name="caminhoPersonalizado" placeholder="Digite o caminho personalizado" value={ficha.caminhoPersonalizado} onChange={handleChange}/></div>)}
                <h3>Atributos</h3>
                <div className="stats-grid">
                    <label>Força:</label><input type="number" name="forca" value={ficha.atributos.forca} onChange={handleAttributeChange} max="19" />
                    <label>Agilidade:</label><input type="number" name="agilidade" value={ficha.atributos.agilidade} onChange={handleAttributeChange} max="19" />
                    <label>Inteligência:</label><input type="number" name="inteligencia" value={ficha.atributos.inteligencia} onChange={handleAttributeChange} max="19" />
                    <label>Vigor:</label><input type="number" name="vigor" value={ficha.atributos.vigor} onChange={handleAttributeChange} max="19" />
                    <label>Presença:</label><input type="number" name="presenca" value={ficha.atributos.presenca} onChange={handleAttributeChange} max="19" />
                </div>


                <h3>Perícias</h3>
                <div className="pericias-grid">
                    {Object.keys(ficha.pericias).map((nomePericia) => (
                        <div key={nomePericia} className="pericia-item">
                            <label>{nomePericia.charAt(0).toUpperCase() + nomePericia.slice(1)}</label>
                            
                            {/* NOVO: Wrapper para os controles */}
                            <div className="pericia-controls">
                                <input
                                    type="number"
                                    value={ficha.pericias[nomePericia].valor}
                                    onChange={(e) => handlePericiaChange(nomePericia, 'valor', e.target.value)}
                                />
                                <select
                                    value={ficha.pericias[nomePericia].atributo}
                                    onChange={(e) => handlePericiaChange(nomePericia, 'atributo', e.target.value)}
                                >
                                    <option value="forca">Força</option>
                                    <option value="agilidade">Agilidade</option>
                                    <option value="inteligencia">Inteligência</option>
                                    <option value="vigor">Vigor</option>
                                    <option value="presenca">Presença</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>

                <button type="submit">Salvar Ficha</button>
                <button type="button" onClick={() => navigate('/jogar')}>Cancelar</button>
            </form>
        </div>
    );
}

export default TelaCriarFicha;