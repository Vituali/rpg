// src/telas/mestre/TelaMestrar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carregarNomesDasTemporadas, carregarFichasPorTemporada, escutarTodosStatusDaTemporada, atualizarStatusAoVivo } from '../../firebase/dataService';
import FichaModal from '../../componentes/FichaModal';
// A importação do logo foi removida daqui
import './TelaMestrar.css';

function TelaMestrar() {
    const navigate = useNavigate();
    const [temporadas, setTemporadas] = useState([]);
    const [temporadaSelecionada, setTemporadaSelecionada] = useState('');
    const [fichas, setFichas] = useState({});
    const [statusAoVivo, setStatusAoVivo] = useState({});
    const [fichaParaEditar, setFichaParaEditar] = useState(null);
    const [idFichaEditando, setIdFichaEditando] = useState(null);
    const [modalFichaVisivel, setModalFichaVisivel] = useState(false);
    const logoPath = `${process.env.PUBLIC_URL}/assets/logo.png`; // Caminho correto para o logo

    useEffect(() => {
        carregarNomesDasTemporadas().then(nomes => {
            setTemporadas(nomes);
            if (nomes.length > 0) {
                const ultimaTemporada = localStorage.getItem('ultimaTemporadaMestre');
                if (ultimaTemporada && nomes.includes(ultimaTemporada)) {
                    setTemporadaSelecionada(ultimaTemporada);
                } else {
                    setTemporadaSelecionada(nomes[0]);
                }
            } else {
                setFichas({});
                setStatusAoVivo({});
            }
        });
    }, []);

    useEffect(() => {
        if (!temporadaSelecionada) {
            setFichas({});
            setStatusAoVivo({});
            return;
        }
        localStorage.setItem('ultimaTemporadaMestre', temporadaSelecionada);
        carregarFichasPorTemporada(temporadaSelecionada).then(setFichas);
        const pararDeEscutar = escutarTodosStatusDaTemporada(temporadaSelecionada, setStatusAoVivo);
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

    const handleInputStatusChange = (fichaId, stat, novoValor) => {
        const ficha = fichas[fichaId];
        const status = statusAoVivo[fichaId];
        if (!ficha || !status) return;
        const maxStat = ficha[`${stat}Max`];
        const valorNumerico = parseInt(novoValor, 10);
        
        if (isNaN(valorNumerico)) return;

        const valorFinal = Math.max(0, Math.min(maxStat, valorNumerico));
        atualizarStatusAoVivo(temporadaSelecionada, fichaId, { ...status, [stat]: valorFinal });
    };

    const abrirModalParaEditar = (id, ficha) => {
        setIdFichaEditando(id);
        setFichaParaEditar(ficha);
        setModalFichaVisivel(true);
    };
    
    const fecharModalFicha = () => {
        setModalFichaVisivel(false);
    };

    const handleFichaUpdate = () => {
        fecharModalFicha();
        carregarFichasPorTemporada(temporadaSelecionada).then(setFichas);
        alert("Ficha atualizada com sucesso!");
    };
    
    // FUNÇÃO DE IMAGEM ATUALIZADA
    const getImagemPersonagem = (ficha) => {
        if (!ficha) return logoPath;
        
        if (ficha.imagem) {
            return `${process.env.PUBLIC_URL}/assets/personagens/${ficha.imagem}`;
        }
        
        if (ficha.nome) {
            const nomeArquivo = ficha.nome.toLowerCase().replace(/ /g, '_') + '.png';
            return `${process.env.PUBLIC_URL}/assets/personagens/${nomeArquivo}`;
        }
        
        return logoPath;
    };
    
    const handleImageError = (e) => {
        e.target.src = logoPath;
    };

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
                                <img 
                                    src={getImagemPersonagem(ficha)} // Passa a ficha inteira
                                    alt={ficha.nome} 
                                    className="jogador-img"
                                    onError={handleImageError}
                                />
                                <h2>{ficha.nome}</h2>
                                
                                {/* Bloco de Vida */}
                                <div className="status-block">
                                    <span className="bar-info">Vida</span>
                                    <div className="status-bar">
                                        <div className="hp-bar" style={{ width: `${(status.vida / ficha.vidaMax) * 100}%` }}></div>
                                        <div className="bar-label">
                                            <input 
                                                type="number" 
                                                className="status-input"
                                                value={status.vida ?? 0}
                                                onChange={(e) => handleInputStatusChange(id, 'vida', e.target.value)}
                                            />
                                            / {ficha.vidaMax || '?'}
                                        </div>
                                        <div className="bar-controls left-controls">
                                            <button onClick={() => handleAlterarStatus(id, 'vida', -10)}>&lt;&lt;</button>
                                            <button onClick={() => handleAlterarStatus(id, 'vida', -1)}>&lt;</button>
                                        </div>
                                        <div className="bar-controls right-controls">
                                            <button onClick={() => handleAlterarStatus(id, 'vida', 1)}>&gt;</button>
                                            <button onClick={() => handleAlterarStatus(id, 'vida', 10)}>&gt;&gt;</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Bloco de Sanidade */}
                                <div className="status-block">
                                    <span className="bar-info">Sanidade</span>
                                    <div className="status-bar">
                                        <div className="sanidade-bar" style={{ width: `${(status.sanidade / ficha.sanidadeMax) * 100}%` }}></div>
                                        <div className="bar-label">
                                            <input 
                                                type="number" 
                                                className="status-input"
                                                value={status.sanidade ?? 0}
                                                onChange={(e) => handleInputStatusChange(id, 'sanidade', e.target.value)}
                                            />
                                            / {ficha.sanidadeMax || '?'}
                                        </div>
                                        <div className="bar-controls left-controls">
                                            <button onClick={() => handleAlterarStatus(id, 'sanidade', -10)}>&lt;&lt;</button>
                                            <button onClick={() => handleAlterarStatus(id, 'sanidade', -1)}>&lt;</button>
                                        </div>
                                        <div className="bar-controls right-controls">
                                            <button onClick={() => handleAlterarStatus(id, 'sanidade', 1)}>&gt;</button>
                                            <button onClick={() => handleAlterarStatus(id, 'sanidade', 10)}>&gt;&gt;</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Bloco de Esforço */}
                                <div className="status-block">
                                    <span className="bar-info">Esforço</span>
                                    <div className="status-bar">
                                        <div className="esforco-bar" style={{ width: `${(status.esforco / ficha.esforcoMax) * 100}%` }}></div>
                                        <div className="bar-label">
                                            <input 
                                                type="number" 
                                                className="status-input"
                                                value={status.esforco ?? 0}
                                                onChange={(e) => handleInputStatusChange(id, 'esforco', e.target.value)}
                                            />
                                            / {ficha.esforcoMax || '?'}
                                        </div>
                                        <div className="bar-controls left-controls">
                                            <button onClick={() => handleAlterarStatus(id, 'esforco', -10)}>&lt;&lt;</button>
                                            <button onClick={() => handleAlterarStatus(id, 'esforco', -1)}>&lt;</button>

                                        </div>
                                        <div className="bar-controls right-controls">
                                            <button onClick={() => handleAlterarStatus(id, 'esforco', 1)}>&gt;</button>
                                            <button onClick={() => handleAlterarStatus(id, 'esforco', 10)}>&gt;&gt;</button>
                                        </div>
                                    </div>
                                </div>

                                <button className="edit-btn" onClick={() => abrirModalParaEditar(id, ficha)}>Editar Ficha</button>
                                <button className="edit-btn" style={{marginTop: '10px'}} onClick={() => navigate(`/editar-agente/${id}`)}>
                                    Editar Inventário
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {modalFichaVisivel && <FichaModal ficha={fichaParaEditar} fichaId={idFichaEditando} temporada={temporadaSelecionada} onClose={fecharModalFicha} onUpdate={handleFichaUpdate} />}
        </>
    );
}

export default TelaMestrar;
