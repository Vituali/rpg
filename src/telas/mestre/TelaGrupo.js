// src/telas/mestre/TelaGrupo.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carregarFichasPorTemporada, escutarTodosStatusDaTemporada } from '../../firebase/dataService.js';
import logo from '../../assets/logo.png';
import './TelaGrupo.css';

function TelaGrupo() {
    const navigate = useNavigate();
    const [fichas, setFichas] = useState({});
    const [statusAoVivo, setStatusAoVivo] = useState({});
    const [loading, setLoading] = useState(true);
    
    const temporadaAtiva = 'pacto';

    useEffect(() => {
        let pararDeEscutar;

        const buscaDados = async () => {
            setLoading(true);
            
            const dadosFichas = await carregarFichasPorTemporada(temporadaAtiva);
            setFichas(dadosFichas);

            // Ativa o "ouvinte" de tempo real para os status
            pararDeEscutar = escutarTodosStatusDaTemporada(temporadaAtiva, (dados) => {
                setStatusAoVivo(dados);
            });
            
            // Considera a página carregada após configurar tudo
            setLoading(false);
        };

        buscaDados();

        return () => {
            if (pararDeEscutar) {
                pararDeEscutar();
            }
        };
    }, []);

    const getImagemPersonagem = (nome) => {
        if (!nome) return logo;
        try {
            return require(`../../assets/personagens/${nome.toLowerCase()}.png`);
        } catch (err) {
            return logo;
        }
    };

    if (loading) {
        return <div className="loading-container">Carregando painel do grupo...</div>;
    }

    return (
        <div className="mestrar-container">
            <div className="mestrar-header">
                <h1>Painel do Grupo</h1>
                <button onClick={() => navigate('/')}>Voltar ao Menu</button>
            </div>
            <div className="grid-jogadores">
                {Object.keys(fichas).length === 0 ? (
                    <p>Nenhuma ficha encontrada para a temporada "{temporadaAtiva}".</p>
                ) : (
                    Object.entries(fichas).map(([id, ficha]) => {
                        const status = statusAoVivo[id] || { 
                            vida: ficha.vida, 
                            vidaMax: ficha.vidaMax,
                            sanidade: ficha.sanidade,
                            sanidadeMax: ficha.sanidadeMax,
                            esforco: ficha.esforco,
                            esforcoMax: ficha.esforcoMax
                        };
                        
                        return (
                            <div key={id} className="jogador-card">
                                <h2>{ficha.nome}</h2>
                                <div className="imagem-container">
                                    <img src={getImagemPersonagem(ficha.nome)} alt={ficha.nome} className="jogador-img" />
                                    <div className="stat-overlay stat-vida" title={`Vida: ${status.vida} / ${status.vidaMax}`}>
                                        {`${status.vida ?? '?'}/${status.vidaMax || '?'}`}
                                    </div>
                                    <div className="stat-overlay stat-sanidade" title={`Sanidade: ${status.sanidade} / ${status.sanidadeMax}`}>
                                        {`${status.sanidade ?? '?'}/${status.sanidadeMax || '?'}`}
                                    </div>
                                    <div className="stat-overlay stat-esforco" title={`Esforço: ${status.esforco} / ${status.esforcoMax}`}>
                                        {`${status.esforco ?? '?'}/${status.esforcoMax || '?'}`}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default TelaGrupo;