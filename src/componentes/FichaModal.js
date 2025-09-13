import React from 'react';
import './FichaModal.css'; // Vamos criar este CSS a seguir

function FichaModal({ ficha, onClose }) {
  if (!ficha) {
    return null; // Não renderiza nada se não houver ficha
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>×</span>
        
        <h2 id="modalNomePersonagem">{ficha.nome}</h2>
        <button id="excluirFichaBtn">Excluir Ficha</button>

        <div className="modal-layout">
          <div className="modal-main">
            <h3>Informações</h3>
            <p><label>Profissão: <span id="profissaoInfo">{ficha.profissaoInfo || "Sem profissão"}</span></label></p>
            <p><label>Caminhos: <span id="caminhos">{ficha.caminhos || "Sem caminhos"}</span></label></p>
            <p><label>Oculto: <span id="oculto">{ficha.oculto || "Sem oculto"}</span></label></p>
            <p><label>Natural: <span id="natural">{ficha.natural || "Sem natural"}</span></label></p>
            
            <h3>Atributos</h3>
            <p><label>Força: <span id="forca">{ficha.atributos?.forca || 0}</span></label></p>
            <p><label>Agilidade: <span id="agilidade">{ficha.atributos?.agilidade || 0}</span></label></p>
            <p><label>Inteligência: <span id="inteligencia">{ficha.atributos?.inteligencia || 0}</span></label></p>
            <p><label>Vigor: <span id="vigor">{ficha.atributos?.vigor || 0}</span></label></p>
            <p><label>Presença: <span id="presenca">{ficha.atributos?.presenca || 0}</span></label></p>
            
            <h3>Estatísticas</h3>
            <p><label>PV: <span id="pv">{ficha.vida || 0}</span></label></p>
            <p><label>PE: <span id="pe">{ficha.esforco || 0}</span></label></p>
            <p><label>Sanidade: <span id="sanidadeStat">{ficha.sanidade || 0}</span></label></p>
            <p><label>Defesa: <span id="defesa">{ficha.defesa || 0}</span></label></p>
            <p><label>NEX: <span id="nex">{(ficha.nex || 0) + '%'}</span></label></p>
            
            <h3>Itens</h3>
            <ul id="itens">
              {ficha.itens?.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
          <div className="modal-sidebar">
            <h3>Perícias</h3>
            {/* Adicionando algumas perícias como exemplo */}
            <p><label>Acrobacia: <span>{ficha.pericias?.acrobacia || 0}</span></label></p>
            <p><label>Atletismo: <span>{ficha.pericias?.atletismo || 0}</span></label></p>
            <p><label>Investigação: <span>{ficha.pericias?.investigacao || 0}</span></label></p>
            <p><label>Ocultismo: <span>{ficha.pericias?.ocultismo || 0}</span></label></p>
            <p><label>Vontade: <span>{ficha.pericias?.vontade || 0}</span></label></p>
            {/* Você pode adicionar todas as outras perícias aqui, seguindo o mesmo padrão */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FichaModal;