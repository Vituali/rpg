// src/telas/TelaJogar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TelaJogar.css';
import { carregarFichas, atualizarStatusAoVivo, escutarStatusAoVivo, excluirFicha } from '../firebase/dataService.js';
import FichaModal from '../componentes/FichaModal.js';
import logo from '../assets/logo.png';

function TelaJogar() {
    const navigate = useNavigate();
    const [fichas, setFichas] = useState({});
    const [fichaIdAtual, setFichaIdAtual] = useState('');
    const [statusAoVivo, setStatusAoVivo] = useState(null);
    const [modalVisivel, setModalVisivel] = useState(false);
    
    // NOVOS STATES PARA O ROLADOR DE DADOS
    const [numDados, setNumDados] = useState(1);
    const [ladosDado, setLadosDado] = useState(20);
    const [resultadoDado, setResultadoDado] = useState(null);

    // ... (useEffect e outras funções permanecem as mesmas) ...
    useEffect(() => {
        const buscaDados = async () => {
            const dados = await carregarFichas();
            setFichas(dados);
        };
        buscaDados();
    }, []);

    useEffect(() => {
        if (!fichaIdAtual) {
            setStatusAoVivo(null);
            return;
        }
        const pararDeEscutar = escutarStatusAoVivo(fichaIdAtual, (dados) => {
            if (dados) { setStatusAoVivo(dados); } 
            else {
                const fichaInicial = fichas[fichaIdAtual];
                if (fichaInicial) {
                    const statusInicial = { vida: fichaInicial.vida, sanidade: fichaInicial.sanidade, esforco: fichaInicial.esforco };
                    atualizarStatusAoVivo(fichaIdAtual, statusInicial);
                    setStatusAoVivo(statusInicial);
                }
            }
        });
        return () => pararDeEscutar();
    }, [fichaIdAtual, fichas]);

    const handleFichaUpdate = async () => {
        const dados = await carregarFichas();
        setFichas(dados);
        fecharModal();
        alert("Ficha atualizada com sucesso!");
    };

    const handleExcluirFicha = async () => {
        if (!fichaIdAtual) return;
        const confirmado = window.confirm(`Tem certeza que deseja excluir a ficha de ${fichas[fichaIdAtual].nome}? Esta ação não pode ser desfeita.`);
        if (confirmado) {
            const sucesso = await excluirFicha(fichaIdAtual);
            if (sucesso) {
                alert("Ficha excluída com sucesso!");
                fecharModal();
                setFichaIdAtual('');
                const dados = await carregarFichas();
                setFichas(dados);
            }
        }
    };
    
    const handleSelecaoFicha = (event) => { setFichaIdAtual(event.target.value); };
    const fichaSelecionada = fichas[fichaIdAtual] || null;
    const calcularLarguraBarra = (valor, max) => {
        if (!valor || !max || max === 0) return '0%';
        return `${(valor / max) * 100}%`;
    };
    const abrirModal = () => setModalVisivel(true);
    const fecharModal = () => setModalVisivel(false);
    const handleAlterarStatus = (stat, valor) => {
        if (!fichaSelecionada || !statusAoVivo) return;
        const maxStat = fichaSelecionada[`${stat}Max`];
        const currentStat = statusAoVivo[stat];
        const novoValor = Math.max(0, Math.min(maxStat, currentStat + valor));
        atualizarStatusAoVivo(fichaIdAtual, { ...statusAoVivo, [stat]: novoValor });
    };
    
    // FUNÇÃO DE ROLAR DADOS ATUALIZADA
    const rolarDados = () => {
        if (numDados <= 0 || ladosDado <= 0) {
            setResultadoDado("Valores inválidos.");
            return;
        }
        let rolagens = [];
        let soma = 0;
        for (let i = 0; i < numDados; i++) {
            const resultado = Math.floor(Math.random() * ladosDado) + 1;
            rolagens.push(resultado);
            soma += resultado;
        }
        // Formata o resultado para exibição
        const textoResultado = `Rolagens (${numDados}d${ladosDado}): [${rolagens.join(', ')}] = ${soma}`;
        setResultadoDado(textoResultado);
    };

    const getImagemPersonagem = (nome) => {
        if (!nome) return logo;
        try {
            return require(`../assets/personagens/${nome.toLowerCase()}.png`);
        } catch (err) {
            return logo;
        }
    };
    const imagemExibida = getImagemPersonagem(fichaSelecionada?.nome);

    return (
        <>
            <div className="menu-container">
                <img src={imagemExibida} alt="Personagem" className="character-img" />
                <h2>{fichaSelecionada?.nome || 'Selecione um Agente'}</h2>
                <select value={fichaIdAtual} onChange={handleSelecaoFicha}>
                    <option value="">-- SELECIONAR AGENTE --</option>
                    {Object.keys(fichas).map(id => (<option key={id} value={id}>{fichas[id].nome}</option>))}
                </select>

                {/* As barras de status continuam as mesmas */}
                <div className="status-block"><span className="bar-info">Vida</span><div className="status-bar"><div className="hp-bar" style={{ width: calcularLarguraBarra(statusAoVivo?.vida, fichaSelecionada?.vidaMax) }}></div><span className="bar-label">{statusAoVivo?.vida ?? 0}/{fichaSelecionada?.vidaMax || 0}</span><div className="bar-controls left-controls"><button onClick={() => handleAlterarStatus('vida', -10)} disabled={!fichaSelecionada}>&lt;&lt;&lt;</button><button onClick={() => handleAlterarStatus('vida', -5)} disabled={!fichaSelecionada}>&lt;&lt;</button><button onClick={() => handleAlterarStatus('vida', -1)} disabled={!fichaSelecionada}>&lt;</button></div><div className="bar-controls right-controls"><button onClick={() => handleAlterarStatus('vida', 1)} disabled={!fichaSelecionada}>&gt;</button><button onClick={() => handleAlterarStatus('vida', 5)} disabled={!fichaSelecionada}>&gt;&gt;</button><button onClick={() => handleAlterarStatus('vida', 10)} disabled={!fichaSelecionada}>&gt;&gt;&gt;</button></div></div></div>
                <div className="status-block"><span className="bar-info">Sanidade</span><div className="status-bar"><div className="sanidade-bar" style={{ width: calcularLarguraBarra(statusAoVivo?.sanidade, fichaSelecionada?.sanidadeMax) }}></div><span className="bar-label">{statusAoVivo?.sanidade ?? 0}/{fichaSelecionada?.sanidadeMax || 0}</span><div className="bar-controls left-controls"><button onClick={() => handleAlterarStatus('sanidade', -10)} disabled={!fichaSelecionada}>&lt;&lt;&lt;</button><button onClick={() => handleAlterarStatus('sanidade', -5)} disabled={!fichaSelecionada}>&lt;&lt;</button><button onClick={() => handleAlterarStatus('sanidade', -1)} disabled={!fichaSelecionada}>&lt;</button></div><div className="bar-controls right-controls"><button onClick={() => handleAlterarStatus('sanidade', 1)} disabled={!fichaSelecionada}>&gt;</button><button onClick={() => handleAlterarStatus('sanidade', 5)} disabled={!fichaSelecionada}>&gt;&gt;</button><button onClick={() => handleAlterarStatus('sanidade', 10)} disabled={!fichaSelecionada}>&gt;&gt;&gt;</button></div></div></div>
                <div className="status-block"><span className="bar-info">Esforço</span><div className="status-bar"><div className="esforco-bar" style={{ width: calcularLarguraBarra(statusAoVivo?.esforco, fichaSelecionada?.esforcoMax) }}></div><span className="bar-label">{statusAoVivo?.esforco ?? 0}/{fichaSelecionada?.esforcoMax || 0}</span><div className="bar-controls left-controls"><button onClick={() => handleAlterarStatus('esforco', -10)} disabled={!fichaSelecionada}>&lt;&lt;&lt;</button><button onClick={() => handleAlterarStatus('esforco', -5)} disabled={!fichaSelecionada}>&lt;&lt;</button><button onClick={() => handleAlterarStatus('esforco', -1)} disabled={!fichaSelecionada}>&lt;</button></div><div className="bar-controls right-controls"><button onClick={() => handleAlterarStatus('esforco', 1)} disabled={!fichaSelecionada}>&gt;</button><button onClick={() => handleAlterarStatus('esforco', 5)} disabled={!fichaSelecionada}>&gt;&gt;</button><button onClick={() => handleAlterarStatus('esforco', 10)} disabled={!fichaSelecionada}>&gt;&gt;&gt;</button></div></div></div>
                
                <div className="actions-container">
                    <button onClick={abrirModal} disabled={!fichaSelecionada}>Ficha</button>
                    {/* BOTÕES NOVOS ADICIONADOS AQUI */}
                    <button onClick={() => navigate(`/inventario/${fichaIdAtual}`)} disabled={!fichaSelecionada}>Inventário</button>
                    <button onClick={() => navigate(`/habilidades/${fichaIdAtual}`)} disabled={!fichaSelecionada}>Habilidades</button>
                    <button onClick={() => navigate(`/rituais/${fichaIdAtual}`)} disabled={!fichaSelecionada}>Rituais</button>
                    

                </div>

                {/* ROLADOR DE DADOS ATUALIZADO */}
                <div className="dice-roller">
                    <h3>Rolador de Dados</h3>
                    <div className="dice-inputs">
                        <label>Qtd:</label>
                        <input type="number" value={numDados} onChange={(e) => setNumDados(parseInt(e.target.value))} min="1"/>
                        <span>d</span>
                        <label>Lados:</label>
                        <input type="number" value={ladosDado} onChange={(e) => setLadosDado(parseInt(e.target.value))} min="2"/>
                        <button onClick={rolarDados}>Rolar</button>
                    </div>
                    <div className="dice-result">
                        {resultadoDado || "Role os dados..."}
                    </div>

                    <div className="footer-actions">
                        <button onClick={() => navigate('/criar-ficha')}>Criar Ficha</button>
                        <button onClick={() => navigate('/')}>Voltar ao Menu</button>
                    </div>
                </div>
            </div>

            {modalVisivel && <FichaModal ficha={fichaSelecionada} fichaId={fichaIdAtual} onClose={fecharModal} onExcluir={handleExcluirFicha} onUpdate={handleFichaUpdate} />}
        </>
    );
}

export default TelaJogar;