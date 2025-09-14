// src/telas/TelaMestrar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carregarFichas, escutarTodosStatusAoVivo } from '../firebase/dataService.js';
import logo from '../assets/logo.png';
import './TelaMestrar.css';

function TelaMestrar() {
    const navigate = useNavigate();
    const [fichas, setFichas] = useState({});
    const [statusAoVivo, setStatusAoVivo] = useState({});

    useEffect(() => {
        const buscaDados = async () => {
            const dadosFichas = await carregarFichas();
            setFichas(dadosFichas);
        };
        buscaDados();

        const pararDeEscutar = escutarTodosStatusAoVivo((dados) => {
            setStatusAoVivo(dados);
        });

        return () => pararDeEscutar();
    }, []);

    const getImagemPersonagem = (nome) => {
        if (!nome) return logo;
        try {
            return require(`../assets/personagens/${nome.toLowerCase()}.png`);
        } catch (err) {
            return logo;
        }
    };

    return (
        <div className="mestrar-container">
            <div className="mestrar-header">
                <h1>Painel do Mestre</h1>
                <button onClick={() => navigate('/')}>Voltar ao Menu</button>
            </div>
            
            <div className="grid-jogadores">
                {Object.entries(fichas).map(([id, ficha]) => {
                    const status = statusAoVivo[id] || { vida: ficha.vida, sanidade: ficha.sanidade, esforco: ficha.esforco };
                    return (
                        <div key={id} className="jogador-card">
                            {/* ORDEM ALTERADA AQUI */}
                            <h2>{ficha.nome}</h2>
                            <div className="imagem-container">
                                <img src={getImagemPersonagem(ficha.nome)} alt={ficha.nome} className="jogador-img" />
                                
                                <div className="stat-overlay stat-vida">
                                    {`${status.vida ?? 0}/${ficha.vidaMax || 0}`}
                                </div>
                                <div className="stat-overlay stat-sanidade">
                                    {`${status.sanidade ?? 0}/${ficha.sanidadeMax || 0}`}
                                </div>
                                <div className="stat-overlay stat-esforco">
                                    {`${status.esforco ?? 0}/${ficha.esforcoMax || 0}`}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TelaMestrar;