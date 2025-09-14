// src/telas/mestre/TelaMestrar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carregarNomesDasTemporadas, carregarFichasPorTemporada, atualizarStatusAoVivo, escutarTodosStatusDaTemporada } from '../../firebase/dataService';
import FichaModal from '../../componentes/FichaModal';
import logo from '../../assets/logo.png';
import './TelaMestrar.css';

function TelaMestrar() {
    const navigate = useNavigate();
    const [temporadas, setTemporadas] = useState([]);
    const [temporadaSelecionada, setTemporadaSelecionada] = useState('');
    const [fichas, setFichas] = useState({});
    const [statusAoVivo, setStatusAoVivo] = useState({});
    const [fichaParaEditar, setFichaParaEditar] = useState(null);
    const [idFichaEditando, setIdFichaEditando] = useState(null);
    const [modalVisivel, setModalVisivel] = useState(false);

    useEffect(() => {
        const buscaTemporadas = async () => {
            const nomes = await carregarNomesDasTemporadas();
            setTemporadas(nomes);
            if (nomes.length > 0) {
                setTemporadaSelecionada(nomes[0]);
            }
        };
        buscaTemporadas();
    }, []);

    useEffect(() => {
        if (!temporadaSelecionada) return;
        const buscaDadosDaTemporada = async () => {
            const dadosFichas = await carregarFichasPorTemporada(temporadaSelecionada);
            setFichas(dadosFichas);
        };
        buscaDadosDaTemporada();
        const pararDeEscutar = escutarTodosStatusDaTemporada(temporadaSelecionada, (dados) => {
            setStatusAoVivo(dados);
        });
        return () => pararDeEscutar();
    }, [temporadaSelecionada]);
    
    const handleAlterarStatus = (fichaId, stat, valor) => {
        const ficha = fichas[fichaId];
        const status = statusAoVivo[fichaId];
        if (!ficha || !status) return;
        const maxStat = ficha[`${stat}Max`];
        const currentStat = status[stat];
        const novoValor = Math.max(0, Math.min(maxStat, currentStat + valor));
        atualizarStatusAoVivo(temporadaSelecionada, fichaId, { ...status, [stat]: novoValor });
    };

    const abrirModalParaEditar = (id, ficha) => {
        setIdFichaEditando(id);
        setFichaParaEditar(ficha);
        setModalVisivel(true);
    };

    const fecharModal = () => {
        setModalVisivel(false);
        setFichaParaEditar(null);
        setIdFichaEditando(null);
    };

    const handleFichaUpdate = () => {
        fecharModal();
        carregarFichasPorTemporada(temporadaSelecionada).then(setFichas);
        alert("Ficha atualizada com sucesso!");
    };
    
    const getImagemPersonagem = (nome) => {
        if (!nome) return logo;
        try {
            return require(`../../assets/personagens/${nome.toLowerCase()}.png`);
        } catch (err) {
            return logo;
        }
    };
    const calcularLarguraBarra = (valor, max) => !valor || !max ? '0%' : `${(valor / max) * 100}%`;

    return (
        <>
            <div className="mestrar-container">
                <div className="mestrar-header">
                    <h1>Painel do Mestre</h1>
                    <div className="temporada-seletor">
                        <label htmlFor="temporada">Temporada:</label>
                        <select id="temporada" value={temporadaSelecionada} onChange={(e) => setTemporadaSelecionada(e.target.value)}>
                            {temporadas.map(nome => <option key={nome} value={nome}>{nome.toUpperCase()}</option>)}
                        </select>
                    </div>
                    <button onClick={() => navigate('/')}>Voltar ao Menu</button>
                </div>
                
                <div className="grid-jogadores">
                    {Object.entries(fichas).map(([id, ficha]) => {
                        const status = statusAoVivo[id] || { vida: ficha.vida, sanidade: ficha.sanidade, esforco: ficha.esforco };
                        return (
                            <div key={id} className="jogador-card">
                                <img src={getImagemPersonagem(ficha.nome)} alt={ficha.nome} className="jogador-img" />
                                <h2>{ficha.nome}</h2>
                                
                                <div className="status-block">
                                    <span className="bar-info">Vida</span>
                                    <div className="status-bar">
                                        <div className="hp-bar" style={{ width: calcularLarguraBarra(status.vida, ficha.vidaMax) }}></div>
                                        <span className="bar-label">{status.vida ?? 0}/{ficha.vidaMax || 0}</span>
                                        <div className="bar-controls left-controls"><button onClick={() => handleAlterarStatus(id, 'vida', -5)}>&lt;&lt;</button><button onClick={() => handleAlterarStatus(id, 'vida', -1)}>&lt;</button></div>
                                        <div className="bar-controls right-controls"><button onClick={() => handleAlterarStatus(id, 'vida', 1)}>&gt;</button><button onClick={() => handleAlterarStatus(id, 'vida', 5)}>&gt;&gt;</button></div>
                                    </div>
                                </div>
                                {/* Repetir .status-block para Sanidade e Esforço */}
                                
                                <button className="edit-btn" onClick={() => abrirModalParaEditar(id, ficha)}>Editar Ficha</button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {modalVisivel && <FichaModal ficha={fichaParaEditar} fichaId={idFichaEditando} temporada={temporadaSelecionada} onClose={fecharModal} onUpdate={handleFichaUpdate} />}
        </>
    );
}

export default TelaMestrar;