// src/telas/TelaHabilidades.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MenuPaginas.css';

function TelaHabilidades() {
    const { fichaId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="pagina-container">
            <h1>Habilidades</h1>
            <p>Habilidades para o personagem com ID: {fichaId}</p>
            <button onClick={() => navigate('/jogar')}>Voltar</button>
        </div>
    );
}

export default TelaHabilidades;