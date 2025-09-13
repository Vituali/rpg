// src/telas/TelaRituais.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MenuPaginas.css';

function TelaRituais() {
    const { fichaId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="pagina-container">
            <h1>Rituais</h1>
            <p>Rituais para o personagem com ID: {fichaId}</p>
            <button onClick={() => navigate('/jogar')}>Voltar</button>
        </div>
    );
}

export default TelaRituais;