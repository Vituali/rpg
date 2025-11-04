// src/telas/jogador/TelaJogar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TelaJogar.css';
import { useAuth } from '../../context/AuthContext'; // Importa o hook de autenticação
import { carregarFichasDoUsuario, atualizarStatusAoVivo, escutarStatusDeUmPersonagem, excluirFicha } from '../../firebase/dataService.js';
import FichaModal from '../../componentes/FichaModal.js';

function TelaJogar() {
    const navigate = useNavigate();
    const { currentUser } = useAuth(); // Obtém o utilizador atual
    const [fichas, setFichas] = useState({});
    const [loading, setLoading] = useState(true);
    const [fichaIdAtual, setFichaIdAtual] = useState(localStorage.getItem('ultimaFichaJogar') || '');
    const [statusAoVivo, setStatusAoVivo] = useState(null);
    const [modalVisivel, setModalVisivel] = useState(false);
    const [numDados, setNumDados] = useState(1);
    const [ladosDado, setLadosDado] = useState(20);
    const [resultadoDado, setResultadoDado] = useState(null);

    const temporadaAtiva = 'pacto';
    const logoPath = `${process.env.PUBLIC_URL}/assets/logo.png`;

    // Carrega as fichas DO UTILIZADOR LOGADO
    useEffect(() => {
        if (!currentUser) return;

        const buscaDados = async () => {
            setLoading(true);
            const dados = await carregarFichasDoUsuario(temporadaAtiva, currentUser.uid);
            setFichas(dados);

            const ultimaFicha = localStorage.getItem('ultimaFichaJogar');
            if (ultimaFicha && !dados[ultimaFicha]) {
                setFichaIdAtual('');
                localStorage.removeItem('ultimaFichaJogar');
            }
            setLoading(false);
        };
        buscaDados();
    }, [currentUser]);

    useEffect(() => {
        if (!fichaIdAtual || !currentUser) {
            setStatusAoVivo(null);
            return;
        }
        
        localStorage.setItem('ultimaFichaJogar', fichaIdAtual);
        const pararDeEscutar = escutarStatusDeUmPersonagem(temporadaAtiva, fichaIdAtual, (dados) => {
            if (dados) {
                setStatusAoVivo(dados);
            } else {
                const fichaInicial = fichas[fichaIdAtual];
                if (fichaInicial) {
                    const statusInicial = { 
                        vida: fichaInicial.vida, vidaMax: fichaInicial.vidaMax,
                        sanidade: fichaInicial.sanidade, sanidadeMax: fichaInicial.sanidadeMax,
                        esforco: fichaInicial.esforco, esforcoMax: fichaInicial.esforcoMax
                    };
                    atualizarStatusAoVivo(temporadaAtiva, fichaIdAtual, statusInicial);
                    setStatusAoVivo(statusInicial);
                }
            }
        });
        
        return () => pararDeEscutar();
    }, [fichaIdAtual, fichas, currentUser]);

    const handleFichaUpdate = async () => {
        if (!currentUser) return;
        const dados = await carregarFichasDoUsuario(temporadaAtiva, currentUser.uid);
        setFichas(dados);
        fecharModal();
        alert("Ficha atualizada com sucesso!");
    };

    const handleExcluirFicha = async () => {
        if (!fichaIdAtual || !currentUser) return;
        if (window.confirm(`Tem certeza que deseja excluir a ficha de ${fichas[fichaIdAtual].nome}?`)) {
            const sucesso = await excluirFicha(temporadaAtiva, fichaIdAtual);
            if (sucesso) {
                alert("Ficha excluída com sucesso!");
                fecharModal();
                setFichaIdAtual('');
                localStorage.removeItem('ultimaFichaJogar');
                const dados = await carregarFichasDoUsuario(temporadaAtiva, currentUser.uid);
                setFichas(dados);
            }
        }
    };
    
    const handleSelecaoFicha = (event) => { setFichaIdAtual(event.target.value); };
    const fichaSelecionada = fichas[fichaIdAtual] || null;
    const abrirModal = () => setModalVisivel(true);
    const fecharModal = () => setModalVisivel(false);
    
    const handleAlterarStatus = (stat, valor) => {
        if (!fichaSelecionada || !statusAoVivo) return;
        const maxStat = statusAoVivo[`${stat}Max`];
        const currentStat = statusAoVivo[stat];
        const novoValor = Math.max(0, Math.min(maxStat, currentStat + valor));
        atualizarStatusAoVivo(temporadaAtiva, fichaIdAtual, { ...statusAoVivo, [stat]: novoValor });
    };

    const handleInputStatusChange = (stat, novoValor) => {
        if (!fichaSelecionada || !statusAoVivo) return;
        const maxStat = statusAoVivo[`${stat}Max`];
        const valorNumerico = parseInt(novoValor, 10);
        
        if (isNaN(valorNumerico)) {
            setStatusAoVivo(prev => ({...prev, [stat]: 0}));
            return;
        }

        const valorFinal = Math.max(0, Math.min(maxStat, valorNumerico));
        atualizarStatusAoVivo(temporadaAtiva, fichaIdAtual, { ...statusAoVivo, [stat]: valorFinal });
    };

    const rolarDados = () => {
        if (numDados <= 0 || ladosDado <= 0) return;
        let rolagens = [];
        for (let i = 0; i < numDados; i++) {
            rolagens.push(Math.floor(Math.random() * ladosDado) + 1);
        }
        const soma = rolagens.reduce((a, b) => a + b, 0);
        setResultadoDado(`Rolagens (${numDados}d${ladosDado}): [${rolagens.join(', ')}] = ${soma}`);
    };
    
    // FUNÇÃO DE IMAGEM ATUALIZADA
    const getImagemPersonagem = (ficha) => {
        if (!ficha) return logoPath;
        
        // 1. Verifica se existe um nome de arquivo customizado no campo 'imagem'
        if (ficha.imagem) {
            return `${process.env.PUBLIC_URL}/assets/personagens/${ficha.imagem}`;
        }
        
        // 2. Se não, usa o nome do personagem como fallback
        if (ficha.nome) {
            const nomeArquivo = ficha.nome.toLowerCase().replace(/ /g, '_') + '.png';
            return `${process.env.PUBLIC_URL}/assets/personagens/${nomeArquivo}`;
        }
        
        // 3. Se não tiver nenhum, usa o logo padrão
        return logoPath;
    };
    
    const imagemExibida = getImagemPersonagem(fichaSelecionada); // Passa a ficha inteira
    
    const getCharacterImageClasses = () => {
        let classes = 'character-img';
        if (!statusAoVivo) return classes;

        if (statusAoVivo.vida <= 0) classes += ' sem-vida';
        if (statusAoVivo.sanidade <= 0) classes += ' sem-sanidade';
        if (statusAoVivo.esforco <= 0) classes += ' sem-esforco';
        
        return classes;
    };

    const handleImageError = (e) => {
        e.target.src = logoPath;
    };

    // Ecrã de carregamento
    if (loading) {
        return <div className="pagina-container">A carregar os seus agentes...</div>
    }

    // Ecrã para novos utilizadores sem fichas
    if (Object.keys(fichas).length === 0) {
        return (
            <div className="menu-container">
                 <img src={logoPath} alt="Logo" className="character-img" />
                 <h2>Nenhum Agente Encontrado</h2>
                 <p>Você ainda não tem um personagem. Crie um para começar a jogar!</p>
                 <div className="footer-actions">
                     <button onClick={() => navigate('/criar-ficha')}>Criar Nova Ficha</button>
                     <button onClick={() => navigate('/')}>Voltar ao Menu</button>
                 </div>
            </div>
        );
    }

    return (
        <>
            <div className="menu-container">
                {!fichaSelecionada ? (
                    <div className="selecao-agente-view">
                        <img src={logoPath} alt="Logo" className="character-img" />
                        <h2>Selecione o seu Agente</h2>
                        <select value={fichaIdAtual} onChange={handleSelecaoFicha}>
                            <option value="">-- SELECIONAR AGENTE --</option>
                            {Object.keys(fichas).map(id => (<option key={id} value={id}>{fichas[id].nome}</option>))}
                        </select>
                        <div className="footer-actions">
                            <button onClick={() => navigate('/criar-ficha')}>Criar Novo Agente</button>
                            <button onClick={() => navigate('/')}>Voltar ao Menu</button>
                        </div>
                    </div>
                ) : (
                    <div className="personagem-view">
                        <img src={imagemExibida} alt="Personagem" className={getCharacterImageClasses()} onError={handleImageError} />
                        <h2>{fichaSelecionada.nome}</h2>

                        {/* Bloco de Vida */}
                        <div className="status-block">
                            <span className="bar-info">Vida</span>
                            <div className="status-bar">
                                <div className="hp-bar" style={{ width: `${(statusAoVivo?.vida / statusAoVivo?.vidaMax) * 100}%` }}></div>
                                <div className="bar-label">
                                    <input type="number" className="status-input" value={statusAoVivo?.vida ?? 0} onChange={(e) => handleInputStatusChange('vida', e.target.value)} />
                                    / {statusAoVivo?.vidaMax || 0}
                                </div>
                                <div className="bar-controls left-controls"><button onClick={() => handleAlterarStatus('vida', -10)}>&lt;&lt;&lt;</button><button onClick={() => handleAlterarStatus('vida', -5)}>&lt;&lt;</button><button onClick={() => handleAlterarStatus('vida', -1)}>&lt;</button></div>
                                <div className="bar-controls right-controls"><button onClick={() => handleAlterarStatus('vida', 1)}>&gt;</button><button onClick={() => handleAlterarStatus('vida', 5)}>&gt;&gt;</button><button onClick={() => handleAlterarStatus('vida', 10)}>&gt;&gt;&gt;</button></div>
                            </div>
                        </div>

                        {/* Bloco de Sanidade */}
                        <div className="status-block">
                            <span className="bar-info">Sanidade</span>
                            <div className="status-bar">
                                <div className="sanidade-bar" style={{ width: `${(statusAoVivo?.sanidade / statusAoVivo?.sanidadeMax) * 100}%` }}></div>
                                <div className="bar-label">
                                    <input type="number" className="status-input" value={statusAoVivo?.sanidade ?? 0} onChange={(e) => handleInputStatusChange('sanidade', e.target.value)} />
                                    / {statusAoVivo?.sanidadeMax || 0}
                                </div>
                                <div className="bar-controls left-controls"><button onClick={() => handleAlterarStatus('sanidade', -10)}>&lt;&lt;&lt;</button><button onClick={() => handleAlterarStatus('sanidade', -5)}>&lt;&lt;</button><button onClick={() => handleAlterarStatus('sanidade', -1)}>&lt;</button></div>
                                <div className="bar-controls right-controls"><button onClick={() => handleAlterarStatus('sanidade', 1)}>&gt;</button><button onClick={() => handleAlterarStatus('sanidade', 5)}>&gt;&gt;</button><button onClick={() => handleAlterarStatus('sanidade', 10)}>&gt;&gt;&gt;</button></div>
                            </div>
                        </div>
                        
                        {/* Bloco de Esforço */}
                        <div className="status-block">
                            <span className="bar-info">Esforço</span>
                            <div className="status-bar">
                                <div className="esforco-bar" style={{ width: `${(statusAoVivo?.esforco / statusAoVivo?.esforcoMax) * 100}%` }}></div>
                                <div className="bar-label">
                                    <input type="number" className="status-input" value={statusAoVivo?.esforco ?? 0} onChange={(e) => handleInputStatusChange('esforco', e.target.value)} />
                                    / {statusAoVivo?.esforcoMax || 0}
                                </div>
                                <div className="bar-controls left-controls"><button onClick={() => handleAlterarStatus('esforco', -10)}>&lt;&lt;&lt;</button><button onClick={() => handleAlterarStatus('esforco', -5)}>&lt;&lt;</button><button onClick={() => handleAlterarStatus('esforco', -1)}>&lt;</button></div>
                                <div className="bar-controls right-controls"><button onClick={() => handleAlterarStatus('esforco', 1)}>&gt;</button><button onClick={() => handleAlterarStatus('esforco', 5)}>&gt;&gt;</button><button onClick={() => handleAlterarStatus('esforco', 10)}>&gt;&gt;&gt;</button></div>
                            </div>
                        </div>
                        
                        <div className="actions-container">
                            <button onClick={abrirModal}>Ficha</button>
                            <button onClick={() => navigate(`/inventario/${fichaIdAtual}`)}>Inventário</button>
                            <button onClick={() => navigate(`/habilidades/${fichaIdAtual}`)}>Habilidades</button>
                            <button onClick={() => navigate(`/rituais/${fichaIdAtual}`)}>Rituais</button>
                        </div>
                        <div className="dice-roller">
                            <h3>Rolador de Dados</h3>
                            <div className="dice-inputs">
                                <label>Qtd:</label> <input type="number" value={numDados} onChange={(e) => setNumDados(parseInt(e.target.value))} min="1"/>
                                <span>d</span>
                                <label>Lados:</label> <input type="number" value={ladosDado} onChange={(e) => setLadosDado(parseInt(e.target.value))} min="2"/>
                                <button onClick={rolarDados}>Rolar</button>
                            </div>
                            <div className="dice-result">{resultadoDado || "Role os dados..."}</div>
                        </div>
                        <div className="footer-actions">
                            <button onClick={() => { setFichaIdAtual(''); localStorage.removeItem('ultimaFichaJogar'); }}>Trocar Agente</button>
                            <button onClick={() => navigate('/')}>Voltar ao Menu</button>
                        </div>
                    </div>
                )}
            </div>
            {modalVisivel && <FichaModal ficha={fichaSelecionada} fichaId={fichaIdAtual} temporada={temporadaAtiva} onClose={fecharModal} onExcluir={handleExcluirFicha} onUpdate={handleFichaUpdate} />}
        </>
    );
}

export default TelaJogar;
