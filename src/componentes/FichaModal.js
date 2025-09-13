// src/componentes/FichaModal.js
import React, { useState, useEffect } from 'react';
import './FichaModal.css';
import { atualizarFichaCompleta, atualizarStatusAoVivo } from '../firebase/dataService';

function FichaModal({ ficha, fichaId, onClose, onExcluir, onUpdate }) {
  const [editedFicha, setEditedFicha] = useState(ficha);

  useEffect(() => { setEditedFicha(ficha); }, [ficha]);

  const handleChange = (e, section) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? parseInt(value) || 0 : value;

    setEditedFicha(prev => {
        if (section) {
            return { ...prev, [section]: { ...prev[section], [name]: parsedValue }};
        }
        return { ...prev, [name]: parsedValue };
    });
  };

  const handleStatChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = parseInt(value, 10) || 0;

    setEditedFicha(prev => ({
        ...prev,
        [name]: parsedValue,
        [`${name}Max`]: parsedValue 
    }));
  };

  const handleSave = async () => {
    const sucessoFirestore = await atualizarFichaCompleta(fichaId, editedFicha);
    if (sucessoFirestore) {
      const statusAoVivo = { vida: editedFicha.vida, sanidade: editedFicha.sanidade, esforco: editedFicha.esforco };
      atualizarStatusAoVivo(fichaId, statusAoVivo);
      onUpdate();
    }
  };

  if (!editedFicha) return null;

  const renderPericias = () => {
    const pericias = editedFicha.pericias || {};
    return Object.keys(pericias).map(key => (
      <div className="pericia-item" key={key}>
          <label>
              {key.charAt(0).toUpperCase() + key.slice(1)}
              <span>({pericias[key].atributo.substring(0, 3).toUpperCase()})</span>
          </label>
          <input 
            type="number" 
            name={key} 
            value={pericias[key].valor} 
            onChange={(e) => setEditedFicha({...editedFicha, pericias: {...editedFicha.pericias, [key]: {...editedFicha.pericias[key], valor: parseInt(e.target.value) || 0}}})}
          />
        </div>
    ));
  };

  return (
    <div className="modal">
      <div className="modal-content op-style">
        <div className="sheet-title-box">FICHA DE AGENTE</div>

        <div className="sheet-content-wrapper">
            <span className="close-btn op-style" onClick={onClose}>×</span>
            
            <header className="sheet-header">
                <input type="text" className="game-title-input" defaultValue="CULTO DE SARIAT RPG" />
            </header>

            <div className="player-info-bar">
                <div className="info-field">
                    <input type="text" name="nome" value={editedFicha.nome} onChange={(e) => handleChange(e, null)} />
                    <label>PERSONAGEM</label>
                </div>
                {/* ATUALIZADO: Conectado para exibir e salvar o nome do jogador */}
                <div className="info-field">
                    <input 
                        type="text" 
                        name="jogador" 
                        value={editedFicha.jogador || ''} 
                        onChange={(e) => handleChange(e, null)}
                        placeholder="Nome do Jogador"
                    />
                    <label>JOGADOR</label>
                </div>
            </div>

            <main className="sheet-body">
                {/* ... (o resto do JSX continua o mesmo) ... */}
                 <div className="sheet-column-left">
                    <section className="attributes-section">
                        <div className="attributes-hexagon-container">
                            <div className="hexagon-bg"></div>
                            <div className="attr-hex-border hex-forca"><div className="attr-hex"><span>FOR</span><input type="number" name="forca" value={editedFicha.atributos.forca} onChange={(e) => handleChange(e, 'atributos')} /></div></div>
                            <div className="attr-hex-border hex-agilidade"><div className="attr-hex"><span>AGI</span><input type="number" name="agilidade" value={editedFicha.atributos.agilidade} onChange={(e) => handleChange(e, 'atributos')} /></div></div>
                            <div className="attr-hex-border hex-vigor"><div className="attr-hex"><span>VIG</span><input type="number" name="vigor" value={editedFicha.atributos.vigor} onChange={(e) => handleChange(e, 'atributos')} /></div></div>
                            <div className="attr-hex-border hex-presenca"><div className="attr-hex"><span>PRE</span><input type="number" name="presenca" value={editedFicha.atributos.presenca} onChange={(e) => handleChange(e, 'atributos')} /></div></div>
                            <div className="attr-hex-border hex-inteligencia"><div className="attr-hex"><span>INT</span><input type="number" name="inteligencia" value={editedFicha.atributos.inteligencia} onChange={(e) => handleChange(e, 'atributos')} /></div></div>
                        </div>
                    </section>
                    
                    <section className="stats-grid">
                        <div className="stat-box"><label>PV (VIDA)</label><input type="number" name="vida" value={editedFicha.vida} onChange={handleStatChange} /></div>
                        <div className="stat-box"><label>SAN (SANIDADE)</label><input type="number" name="sanidade" value={editedFicha.sanidade} onChange={handleStatChange} /></div>
                        <div className="stat-box"><label>PE (ESFORÇO)</label><input type="number" name="esforco" value={editedFicha.esforco} onChange={handleStatChange} /></div>
                        <div className="stat-box"><label>ESQUIVA</label><input type="number" name="esquiva" value={editedFicha.esquiva} onChange={(e) => handleChange(e, null)} /></div>
                    </section>
                </div>

                <div className="sheet-column-right">
                    <section className="pericias-section">
                        <header className="pericias-header"><h2>PERÍCIAS</h2></header>
                        <div className="pericias-grid">
                            {renderPericias()}
                        </div>
                    </section>
                </div>
            </main>
            
            <div className="modal-actions">
                <button className="save-btn op-style" onClick={handleSave}>Salvar Alterações</button>
                <button id="excluirFichaBtn" className="op-style" onClick={onExcluir}>Excluir Ficha</button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default FichaModal;