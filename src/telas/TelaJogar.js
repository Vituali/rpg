import React, { useState, useEffect } from 'react';
import './TelaJogar.css';
import { carregarFichas } from '../firebase/dataService.js';
import { atualizarStatusAoVivo, escutarStatusAoVivo } from '../firebase/dataService.js'; // Nossas novas funções
import FichaModal from '../componentes/FichaModal.js';

function TelaJogar() {
    const [fichas, setFichas] = useState({});
    const [fichaIdAtual, setFichaIdAtual] = useState('');
    const [statusAoVivo, setStatusAoVivo] = useState(null);
    const [modalVisivel, setModalVisivel] = useState(false);

    // Carrega os dados base do Firestore uma vez
    useEffect(() => {
        const buscaDados = async () => {
            const dados = await carregarFichas();
            setFichas(dados);
        };
        buscaDados();
    }, []);

    // Este useEffect reage à seleção de uma nova ficha
    useEffect(() => {
        // Se nenhuma ficha estiver selecionada, não faz nada
        if (!fichaIdAtual) {
            setStatusAoVivo(null);
            return;
        }

        // Começa a escutar por mudanças no RTDB para a ficha selecionada
        const pararDeEscutar = escutarStatusAoVivo(fichaIdAtual, (dados) => {
            if (dados) {
                setStatusAoVivo(dados);
            } else {
                // Se não há dados no RTDB, inicializa com os dados do Firestore
                const fichaInicial = fichas[fichaIdAtual];
                const statusInicial = {
                    vida: fichaInicial.vida,
                    sanidade: fichaInicial.sanidade,
                    esforco: fichaInicial.esforco
                };
                atualizarStatusAoVivo(fichaIdAtual, statusInicial);
                setStatusAoVivo(statusInicial);
            }
        });

        // Função de limpeza: para de escutar quando o componente é desmontado ou a ficha muda
        return () => pararDeEscutar();

    }, [fichaIdAtual, fichas]);


    const handleSelecaoFicha = (event) => {
        setFichaIdAtual(event.target.value);
    };

    const fichaSelecionada = fichas[fichaIdAtual] || null;

    const calcularLarguraBarra = (valor, max) => {
        if (!valor || !max) return '0%';
        return `${(valor / max) * 100}%`;
    };
    
    // NOVO: Função para alterar a vida em tempo real
    const handleAlterarVida = (valor) => {
        if (!fichaSelecionada || !statusAoVivo) return;
        const vidaMax = fichaSelecionada.vidaMax;
        const novaVida = Math.max(0, Math.min(vidaMax, statusAoVivo.vida + valor));
        
        // Atualiza o RTDB (e todos que estiverem escutando receberão a mudança!)
        atualizarStatusAoVivo(fichaIdAtual, {
            ...statusAoVivo,
            vida: novaVida
        });
    };
    return (
        <div className="menu-container">
            <img 
                id="characterImg" 
                src={fichaSelecionada?.imagem || "/personagens/dante.png"} 
                alt="Personagem" 
                className="character-img" 
            />
            <h2 id="nomePersonagem">
                {fichaSelecionada?.nome || 'Nenhuma Ficha Selecionada'}
            </h2>
            
            {/* O seletor agora é populado dinamicamente */}
            <select id="seletorFichas" value={fichaIdAtual} onChange={handleSelecaoFicha}>
                <option value="">Selecione uma ficha</option>
                {Object.keys(fichas).map(id => (
                    <option key={id} value={id}>
                        {fichas[id].nome}
                    </option>
                ))}
            </select>

            {/* Barras de Status Dinâmicas */}
            <div className="status-bar">
                {/* Botões (a lógica virá depois) */}
                <div className="bar-bg">
                    <div id="hpBar" className="hp-bar" style={{ width: calcularLarguraBarra(fichaSelecionada?.vida, fichaSelecionada?.vidaMax) }}></div>
                </div>
                <span id="hpLabel" className="bar-label">Vida: {fichaSelecionada?.vida || 0}/{fichaSelecionada?.vidaMax || 0}</span>
            </div>

            <div className="status-bar">
                <div className="bar-bg">
                    <div id="sanidadeBar" className="sanidade-bar" style={{ width: calcularLarguraBarra(fichaSelecionada?.sanidade, fichaSelecionada?.sanidadeMax) }}></div>
                </div>
                <span id="sanidadeLabel" className="bar-label">Sanidade: {fichaSelecionada?.sanidade || 0}/{fichaSelecionada?.sanidadeMax || 0}</span>
            </div>

            <div className="status-bar">
                <div className="bar-bg">
                    <div id="esforcoBar" className="esforco-bar" style={{ width: calcularLarguraBarra(fichaSelecionada?.esforco, fichaSelecionada?.esforcoMax) }}></div>
                </div>
                <span id="esforcoLabel" className="bar-label">Esforço: {fichaSelecionada?.esforco || 0}/{fichaSelecionada?.esforcoMax || 0}</span>
            </div>
            
            <button id="verFichaBtn" disabled={!fichaSelecionada}>Ver Ficha</button>
            <button id="criarFichaBtn">Criar Ficha</button>
            
            <a href="/" style={{marginTop: '10px', display: 'inline-block'}}>Voltar ao Menu</a>
        </div>
    );
}

export default TelaJogar;