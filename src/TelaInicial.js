import React from 'react';
import { Link } from 'react-router-dom'; // 1. Importe o Link
import './TelaInicial.css';
import logo from './assets/logo.png';

function TelaInicial() {
  return (
    <div className="tela-container">
      <img src={logo} alt="Logo do Jogo" className="game-logo" />

      <nav className="main-menu">
        <ul>
          {/* 2. Substitua <a> por <Link> e href por to */}
          <li><Link to="/jogar">Jogar</Link></li>
          <li><Link to="/jogadores">Jogadores</Link></li>
          <li><Link to="/opcoes">Opções</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default TelaInicial;