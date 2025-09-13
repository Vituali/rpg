import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TelaInicial from './TelaInicial'; // Nossa tela de menu
import TelaJogar from './telas/TelaJogar'; // A nova tela de jogo

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rota para a página inicial */}
          <Route path="/" element={<TelaInicial />} />

          {/* Rota para a página de jogo */}
          <Route path="/jogar" element={<TelaJogar />} />

          {/* Futuramente, você adicionará as outras rotas aqui: */}
          {/* <Route path="/jogadores" element={<TelaJogadores />} /> */}
          {/* <Route path="/opcoes" element={<TelaOpcoes />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;