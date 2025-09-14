// src/telas/TelaOpcoes.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; // Importa nosso hook de tema
import './TelaOpcoes.css';

function TelaOpcoes() {
    const navigate = useNavigate();
    const { setTheme } = useTheme(); // Pega a função para trocar o tema

    return (
        <div className="opcoes-container">
            <h2>Opções de Tema</h2>
            <p>Escolha um tema visual para o aplicativo.</p>
            <div className="theme-buttons">
                {/* Cada botão chama setTheme com o nome do tema */}
                <button onClick={() => setTheme('sariat')}>Culto de Sariat</button>
                <button onClick={() => setTheme('parchment')}>Pergaminho Antigo</button>
                <button onClick={() => setTheme('neon')}>Neon Retrô</button>
            </div>
            <button className="voltar-btn" onClick={() => navigate('/')}>Voltar ao Menu</button>
        </div>
    );
}

export default TelaOpcoes;