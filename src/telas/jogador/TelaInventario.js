// src/telas/TelaInventario.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../MenuPaginas.css'; // Usaremos um CSS compartilhado

function TelaInventario() {
    const { fichaId } = useParams(); // Pega o ID da ficha pela URL
    const navigate = useNavigate();

    return (
        <div className="pagina-container">
            <h1>Inventário</h1>
            <p>Conteúdo do inventário para o personagem com ID: {fichaId}</p>
            {/* Futuramente, aqui será exibida a lista de itens da ficha */}
            <button onClick={() => navigate('/jogar')}>Voltar</button>
        </div>
    );
}

export default TelaInventario;