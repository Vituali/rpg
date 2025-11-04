// src/TelaInicial.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './TelaInicial.css';

function TelaInicial() {
  const { isGM } = useAuth();
  const logoPath = `${process.env.PUBLIC_URL}/assets/logo.png`;

  return (
    <div className="tela-container">
      <img src={logoPath} alt="Logo do Jogo" className="game-logo" />
      <nav className="main-menu">
        <ul>
          <li><Link to="/jogar">Jogar</Link></li>
          <li><Link to="/ver-itens">Ver Itens</Link></li>
          {isGM && (
            <>
              <li><Link to="/grupo">Ver Grupo</Link></li>
              <li><Link to="/mestrar">Painel do Mestre</Link></li>
              <li><Link to="/criar-itens">Criar Itens</Link></li>
            </>
          )}
          <li><Link to="/opcoes">Opções</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default TelaInicial;
