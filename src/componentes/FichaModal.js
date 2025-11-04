// src/componentes/FichaModal.js
import React, { useState, useEffect } from 'react';
import modalStyles from './FichaModal.module.css'; // Importa o CSS Module
import { atualizarFichaCompleta, atualizarStatusAoVivo, carregarTodosUsuarios } from '../firebase/dataService';
import { useAuth } from '../context/AuthContext';

function FichaModal({ ficha, fichaId, temporada, onClose, onExcluir, onUpdate }) {
  const [editedFicha, setEditedFicha] = useState(ficha);
  const { isGM } = useAuth();

  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [usuarioSelecionadoId, setUsuarioSelecionadoId] = useState('');

  useEffect(() => {
    // Clona a ficha para evitar mutação direta e garante que pericias exista
    setEditedFicha(prev => ({ ...ficha, pericias: ficha.pericias || {} }));

    if (isGM) {
        const buscarUsuarios = async () => {
            const usuarios = await carregarTodosUsuarios();
            setTodosUsuarios(usuarios);
        };
        buscarUsuarios();
    }
  }, [ficha, isGM]); // Dependência em 'ficha' garante atualização se a prop mudar

  const handleChange = (e, section) => {
    const { name, value, type } = e.target;
    // Tenta converter para número, se falhar ou for NaN, usa 0
    const parsedValue = type === 'number' ? (parseInt(value) || 0) : value;

    setEditedFicha(prev => {
        // Verifica se 'prev' existe e tem a seção esperada
        if (!prev) return null; // Ou retorna um estado inicial padrão

        if (section) {
            // Garante que a seção exista antes de tentar espalhar
            const currentSection = prev[section] || {};
            return {
                ...prev,
                [section]: { ...currentSection, [name]: parsedValue }
            };
        }
        // Para campos no nível raiz
        return { ...prev, [name]: parsedValue };
    });
  };


  const handleStatChange = (e) => {
    const { name, value } = e.target;
    // Converte para número, tratando NaN como 0
    const parsedValue = parseInt(value, 10) || 0;

    setEditedFicha(prev => {
        if (!prev) return null; // Verifica se prev existe
        return {
            ...prev,
            [name]: parsedValue,
            [`${name}Max`]: parsedValue // Atualiza o Max também
        }
    });
  };

  // Handler para mudança no input de perícia
  const handlePericiaInputChange = (key, e) => {
      const valor = parseInt(e.target.value) || 0; // Converte para número, default 0
      // Limita o valor se necessário (ex: entre 0 e 99)
      const valorLimitado = Math.max(0, Math.min(valor, 99));

      setEditedFicha(prev => {
           if (!prev || !prev.pericias) return prev; // Proteção extra
           const periciaAtual = prev.pericias[key] || { atributo: '?', valor: 0 }; // Default se não existir
           return {
                ...prev,
                pericias: {
                    ...prev.pericias,
                    [key]: { ...periciaAtual, valor: valorLimitado }
                }
           }
      });
  };

    const handleSave = async () => {
        // Garante que editedFicha existe antes de salvar
        if (!editedFicha) {
            console.error("Tentativa de salvar ficha nula.");
            return;
        }
        const sucessoFirestore = await atualizarFichaCompleta(temporada, fichaId, editedFicha);

        if (sucessoFirestore) {
            // Recalcula o status para RTDB baseado no estado ATUALIZADO
            const statusParaRTDB = {
                vida: editedFicha.vida,
                vidaMax: editedFicha.vidaMax,
                sanidade: editedFicha.sanidade,
                sanidadeMax: editedFicha.sanidadeMax,
                esforco: editedFicha.esforco,
                esforcoMax: editedFicha.esforcoMax
            };
            atualizarStatusAoVivo(temporada, fichaId, statusParaRTDB);
            if(onUpdate) onUpdate(); // Chama onUpdate se existir
        } else {
             alert("Falha ao salvar as alterações.");
        }
    };


  const handleTransferirDono = async () => {
    if (!usuarioSelecionadoId) {
        alert("Por favor, selecione um jogador para transferir a ficha.");
        return;
    }
     // Garante que editedFicha existe
    if (!editedFicha) return;

    const usuarioAlvo = todosUsuarios.find(u => u.uid === usuarioSelecionadoId);
    if (!usuarioAlvo) {
        alert("Jogador selecionado não encontrado.");
        return;
    }

    if (window.confirm(`Tem certeza que deseja transferir a ficha de ${editedFicha.nome} para ${usuarioAlvo.email}?`)) {
        const fichaAtualizada = {
            ...editedFicha,
            ownerId: usuarioAlvo.uid,
            ownerEmail: usuarioAlvo.email
        };

        const sucesso = await atualizarFichaCompleta(temporada, fichaId, fichaAtualizada);
        if (sucesso) {
            alert("Ficha transferida com sucesso!");
            if(onUpdate) onUpdate(); // Chama onUpdate para fechar/atualizar a lista
        } else {
            alert("Ocorreu um erro ao transferir a ficha.");
        }
    }
  };


  // Verifica se editedFicha é nulo antes de tentar renderizar
  if (!editedFicha) return null;

  const renderPericias = () => {
    // Garante que editedFicha.pericias exista e seja um objeto
    const pericias = editedFicha.pericias || {};
    const chavesOrdenadas = Object.keys(pericias).sort((a, b) => a.localeCompare(b));

    return chavesOrdenadas.map(key => {
        // Garante que cada perícia tenha 'valor' e 'atributo'
        const periciaAtual = pericias[key] || { valor: 0, atributo: '?' };
        return (
          // Usa classes do CSS Module
          <div className={modalStyles.periciaItem} key={key}>
              <label title={key.charAt(0).toUpperCase() + key.slice(1)}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                   {/* Garante que atributo exista antes de tentar acessá-lo */}
                  <span>({periciaAtual.atributo?.substring(0, 3).toUpperCase() || 'N/A'})</span>
              </label>
              <input
                type="number" // Mantém number aqui para semântica e validação básica
                name={key}
                value={periciaAtual.valor ?? 0} // Usa ?? 0 para fallback se valor for undefined/null
                onChange={(e) => handlePericiaInputChange(key, e)} // Usa o handler específico
                // Adiciona min/max se quiser forçar limites no HTML também
                min="0"
                max="99"
              />
            </div>
        );
    });
  };

  return (
    // Aplica classes do CSS Module
    <div className={modalStyles.modal}>
      <div className={modalStyles.modalContent}> {/* Combina as classes */}
        <div className={modalStyles.sheetTitleBox}>FICHA DE AGENTE</div>

        <div className={modalStyles.sheetContentWrapper}>
            {/* Usa classe do CSS Module para o botão fechar */}
            <button className={modalStyles.closeBtn} onClick={onClose}>×</button>

            <header className={modalStyles.sheetHeader}>
                {/* Alterado de input para div para ser fixo e centralizado */}
                <div className={modalStyles.gameTitleInput}>CULTO DE SARIAT RPG</div>
            </header>

            <div className={modalStyles.playerInfoBar}>
                <div className={modalStyles.infoField}>
                    <input type="text" name="nome" value={editedFicha.nome || ''} onChange={(e) => handleChange(e, null)} />
                    <label>PERSONAGEM</label>
                </div>
                <div className={modalStyles.infoField}>
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

            <main className={modalStyles.sheetBody}>
                 <div className={modalStyles.sheetColumnLeft}>
                    {/* Aplica classes do CSS Module */}
                    <section className={modalStyles.attributesSection}>
                        <div className={modalStyles.attributesHexagonContainer}>
                            <div className={modalStyles.hexagonBg}></div>
                            {/* Repete para todos os hexágonos */}
                            <div className={`${modalStyles.attrHexBorder} ${modalStyles.hexForca}`}>
                                <div className={modalStyles.attrHex}>
                                    <span>FOR</span>
                                    <input type="number" name="forca" value={editedFicha.atributos?.forca ?? 0} onChange={(e) => handleChange(e, 'atributos')} />
                                </div>
                            </div>
                             <div className={`${modalStyles.attrHexBorder} ${modalStyles.hexAgilidade}`}>
                                <div className={modalStyles.attrHex}>
                                    <span>AGI</span>
                                    <input type="number" name="agilidade" value={editedFicha.atributos?.agilidade ?? 0} onChange={(e) => handleChange(e, 'atributos')} />
                                </div>
                            </div>
                             <div className={`${modalStyles.attrHexBorder} ${modalStyles.hexVigor}`}>
                                <div className={modalStyles.attrHex}>
                                    <span>VIG</span>
                                    <input type="number" name="vigor" value={editedFicha.atributos?.vigor ?? 0} onChange={(e) => handleChange(e, 'atributos')} />
                                </div>
                            </div>
                             <div className={`${modalStyles.attrHexBorder} ${modalStyles.hexPresenca}`}>
                                <div className={modalStyles.attrHex}>
                                    <span>PRE</span>
                                    <input type="number" name="presenca" value={editedFicha.atributos?.presenca ?? 0} onChange={(e) => handleChange(e, 'atributos')} />
                                </div>
                            </div>
                             <div className={`${modalStyles.attrHexBorder} ${modalStyles.hexInteligencia}`}>
                                <div className={modalStyles.attrHex}>
                                    <span>INT</span>
                                    <input type="number" name="inteligencia" value={editedFicha.atributos?.inteligencia ?? 0} onChange={(e) => handleChange(e, 'atributos')} />
                                </div>
                            </div>
                        </div>
                    </section>

                     {/* Aplica classes do CSS Module */}
                    <section className={modalStyles.statsGrid}>
                        <div className={modalStyles.statBox}><label>PV (VIDA)</label><input type="number" name="vida" value={editedFicha.vida ?? 0} onChange={handleStatChange} /></div>
                        <div className={modalStyles.statBox}><label>SAN (SANIDADE)</label><input type="number" name="sanidade" value={editedFicha.sanidade ?? 0} onChange={handleStatChange} /></div>
                        <div className={modalStyles.statBox}><label>PE (ESFORÇO)</label><input type="number" name="esforco" value={editedFicha.esforco ?? 0} onChange={handleStatChange} /></div>
                        <div className={modalStyles.statBox}><label>ESQUIVA</label><input type="number" name="esquiva" value={editedFicha.esquiva ?? 0} onChange={(e) => handleChange(e, null)} /></div>
                    </section>
                </div>

                <div className={modalStyles.sheetColumnRight}>
                     {/* Aplica classes do CSS Module */}
                    <section className={modalStyles.periciasSection}>
                        <header className={modalStyles.periciasHeader}><h2>PERÍCIAS</h2></header>
                        <div className={modalStyles.periciasGrid}>
                            {renderPericias()}
                        </div>
                    </section>
                </div>
            </main>

            {/* Seção do Mestre */}
            {isGM && (
                // Aplica classes do CSS Module
                <div className={modalStyles.gmActionsSection}>
                    <h3>Gerenciar Ficha (Mestre)</h3>

                    <div className={modalStyles.gmFieldGroup}>
                        <label>Imagem do Personagem (ex: nome_personagem.png):</label>
                        <input
                            type="text"
                            name="imagem"
                            value={editedFicha.imagem || ''}
                            onChange={(e) => handleChange(e, null)}
                            placeholder="deixe em branco para usar o padrão"
                        />
                    </div>

                    <div className={modalStyles.gmFieldGroup}>
                        <label>Dono Atual: ({editedFicha.ownerEmail || 'Sem dono'})</label>
                        <div className={modalStyles.transferOwnerControls}>
                            <label>Transferir para:</label>
                            <select value={usuarioSelecionadoId} onChange={(e) => setUsuarioSelecionadoId(e.target.value)}>
                                <option value="">-- Selecione um jogador --</option>
                                {todosUsuarios.map(user => (
                                    <option key={user.uid} value={user.uid}>{user.email}</option>
                                ))}
                            </select>
                            <button onClick={handleTransferirDono} disabled={!usuarioSelecionadoId}>Transferir</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Aplica classes do CSS Module */}
            <div className={modalStyles.modalActions}>
                <button className={modalStyles.saveBtn} onClick={handleSave}>Salvar Alterações</button>
                {/* Garante que onExcluir exista antes de renderizar o botão */}
                {onExcluir && <button id="excluirFichaBtn" className={modalStyles.excluirFichaBtn} onClick={onExcluir}>Excluir Ficha</button>}
            </div>
        </div>
      </div>
    </div>
  );
}

export default FichaModal;
