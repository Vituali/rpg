// src/telas/jogador/TelaInventario.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { carregarFicha, carregarModelosDeItens, carregarInventarioDoPersonagem, atualizarEquipamento, atualizarItemNoInventario } from '../../firebase/dataService';
import styles from './TelaInventario.module.css'; // Importa o CSS Module

// Recebe props (onClose, fichaId, temporada) em vez de usar useParams
function TelaInventario({ fichaId, temporada, onClose }) {
    const navigate = useNavigate();

    const [ficha, setFicha] = useState(null);
    const [modelosDeItens, setModelosDeItens] = useState({});
    const [inventario, setInventario] = useState({});
    const [equipamento, setEquipamento] = useState({});
    const [loading, setLoading] = useState(true);
    const logoPath = `${process.env.PUBLIC_URL}/assets/logo.png`;

    useEffect(() => {
        const buscarDados = async () => {
            setLoading(true);
            const fichaData = await carregarFicha(temporada, fichaId);
            const modelosData = await carregarModelosDeItens();
            const inventarioData = await carregarInventarioDoPersonagem(temporada, fichaId);

            if (fichaData) {
                setFicha(fichaData);
                setEquipamento(fichaData.equipamento || {});
            }
            setModelosDeItens(modelosData);
            setInventario(inventarioData);
            setLoading(false);
        };
        // Depende de fichaId e temporada passados como props
        if (fichaId && temporada) {
            buscarDados();
        }
    }, [fichaId, temporada]);

    const pesoAtual = useMemo(() => {
        return Object.values(inventario).reduce((acc, item) => {
            const dadosDoItem = item.itemId ? modelosDeItens[item.itemId] : item.customData;
            const pesoItem = dadosDoItem?.espacos || 0;
            return acc + (pesoItem * (item.quantidade || 1));
        }, 0);
    }, [inventario, modelosDeItens]);

    const getPesoClasse = () => {
        if (!ficha || !ficha.pesoMax || ficha.pesoMax === 0) return '';
        const percentual = (pesoAtual / ficha.pesoMax) * 100;

        if (percentual >= 100) return styles.sobrecarregado;
        if (percentual >= 90) return styles.pesado;
        if (percentual >= 70) return styles.atencao;
        return '';
    };

    const handleDragStart = (e, dragInfo) => {
        e.dataTransfer.setData("dragInfo", JSON.stringify(dragInfo));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add(styles.dragOver);
    };
    
    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove(styles.dragOver);
    };

    const handleDropOnSlot = async (e, slotAlvo) => {
        e.preventDefault();
        e.currentTarget.classList.remove(styles.dragOver);
        const dragInfo = JSON.parse(e.dataTransfer.getData("dragInfo"));

        if (dragInfo.origem === 'slot') return; 

        const inventarioItemId = dragInfo.inventarioItemId; 
        const itemArrastado = inventario[inventarioItemId];
        
        if (!itemArrastado || itemArrastado.equipado) return;

        const itemJaEquipadoId = equipamento[slotAlvo]; 
        const inventarioUpdates = {};

        if (itemJaEquipadoId) {
            await atualizarItemNoInventario(temporada, fichaId, itemJaEquipadoId, { equipado: false });
            inventarioUpdates[itemJaEquipadoId] = { ...inventario[itemJaEquipadoId], equipado: false };
        }

        const novoEquipamento = { ...equipamento, [slotAlvo]: inventarioItemId };
        await atualizarItemNoInventario(temporada, fichaId, inventarioItemId, { equipado: true });
        inventarioUpdates[inventarioItemId] = { ...inventario[inventarioItemId], equipado: true };
        
        await atualizarEquipamento(temporada, fichaId, novoEquipamento);

        setEquipamento(novoEquipamento);
        setInventario(prev => ({
            ...prev,
            ...inventarioUpdates
        }));
    };

    const handleDropOnMochila = async (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove(styles.dragOver);
        const dragInfo = JSON.parse(e.dataTransfer.getData("dragInfo"));

        if (dragInfo.origem !== 'slot') return;

        const { inventarioItemId, slotOrigem } = dragInfo;

        const novoEquipamento = { ...equipamento, [slotOrigem]: null };

        await atualizarItemNoInventario(temporada, fichaId, inventarioItemId, { equipado: false });
        await atualizarEquipamento(temporada, fichaId, novoEquipamento);

        setEquipamento(novoEquipamento);
        setInventario(prev => ({
            ...prev,
            [inventarioItemId]: { ...prev[inventarioItemId], equipado: false }
        }));
    };
    
    if (loading) {
        // Mostra um loader simples dentro do modal
        return (
            <div className={styles.modal}>
                <div className={styles.inventarioJanela}>
                    <p>A carregar inventário...</p>
                </div>
            </div>
        );
    }

    const handleItemImageError = (e) => {
        e.target.src = logoPath;
        e.target.style.padding = '5px';
    };
    
    const renderizarItem = (invId, itemData) => {
        let dadosDoItem;
        if (itemData.itemId) {
            dadosDoItem = modelosDeItens[itemData.itemId];
        } else if (itemData.customData) {
            dadosDoItem = itemData.customData;
        }
        if (!dadosDoItem) return <span className={styles.slotNome}>Inválido</span>;

        const raridadeClass = styles[`raridade${dadosDoItem.raridade.charAt(0).toUpperCase() + dadosDoItem.raridade.slice(1)}`] || styles.raridadeComum;

        return (
            <div className={`${styles.itemInventario} ${raridadeClass}`} title={dadosDoItem.descricao}>
                {dadosDoItem.imagem ? (
                    <img 
                        src={`${process.env.PUBLIC_URL}/assets/itens/${dadosDoItem.imagem}`} 
                        alt={dadosDoItem.nome}
                        className={styles.itemSprite}
                        onError={handleItemImageError}
                    />
                ) : (
                    <div className={styles.itemNome}>{dadosDoItem.nome}</div>
                )}
            </div>
        );
    };

    const slotsEquipamento = [
        { nome: 'capacete', area: styles.slotCapacete }, 
        { nome: 'armadura', area: styles.slotArmadura },
        { nome: 'arma', area: styles.slotArma }, 
        { nome: 'municao', area: styles.slotMunicao }, 
        { nome: 'botas', area: styles.slotBotas },
        { nome: 'acessorio1', area: styles.slotAcessorio1 }, 
        { nome: 'acessorio2', area: styles.slotAcessorio2 }, 
        { nome: 'acessorio3', area: styles.slotAcessorio3 },
        { nome: 'acessorio4', area: styles.slotAcessorio4 }, 
        { nome: 'cinto', area: styles.slotCinto }
    ];

    return (
        // Container principal é o modal
        <div className={styles.modal}>
            <div className={styles.inventarioJanela}>
                <div className={styles.inventarioCabecalho}>
                    <h3>Inventário</h3>
                    <div className={styles.cabecalhoBotoes}>
                        <button className={styles.gerenciarBtn} onClick={() => navigate(`/editar-agente/${fichaId}`)}>Gerenciar</button>
                        {/* Botão de fechar agora usa a prop onClose */}
                        <button className={styles.fecharBtn} onClick={onClose}>X</button>
                    </div>
                </div>

                <div className={styles.equipamentoPainelVisual}>
                    {slotsEquipamento.map(slot => {
                        const inventarioItemId = equipamento[slot.nome];
                        const itemNoSlot = inventarioItemId ? inventario[inventarioItemId] : null;
                        const nomeSlotCapitalizado = slot.nome.charAt(0).toUpperCase() + slot.nome.slice(1).replace(/[0-9]/g, ' $&');

                        return (
                            <div 
                                key={slot.nome}
                                className={`${styles.slot} ${slot.area}`} // Usa a classe de área do grid
                                onDragOver={handleDragOver} 
                                onDragLeave={handleDragLeave} 
                                onDrop={(e) => handleDropOnSlot(e, slot.nome)}
                                draggable={!!itemNoSlot}
                                onDragStart={(e) => itemNoSlot && handleDragStart(e, { origem: 'slot', inventarioItemId, slotOrigem: slot.nome })}
                            >
                                {itemNoSlot ? renderizarItem(inventarioItemId, itemNoSlot) : <span className={styles.slotNome}>{nomeSlotCapitalizado}</span>}
                            </div>
                        );
                    })}
                </div>

                <div 
                    className={styles.mochilaPainelGrid}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDropOnMochila}
                >
                     {Object.entries(inventario).map(([invId, item]) => {
                        if (item.equipado) return null;
                        return (
                            <div 
                                key={invId} 
                                className={styles.slot}
                                draggable={true}
                                onDragStart={(e) => handleDragStart(e, { origem: 'mochila', inventarioItemId: invId })}
                            >
                               {renderizarItem(invId, item)}
                            </div>
                        );
                    })}
                    {Array.from({ length: 30 - Object.values(inventario).filter(i => !i.equipado).length }).map((_, index) => (
                        <div key={`empty-${index}`} className={styles.slot}></div>
                    ))}
                </div>
                
                <div className={styles.inventarioRodape}>
                    <div className={`${styles.rodapeStat} ${styles.dinheiroDisplay}`}>
                        <img src={`${process.env.PUBLIC_URL}/assets/gold.png`} alt="Gold" className={styles.rodapeIcon} />
                        <span>{ficha?.dinheiro?.toLocaleString('pt-BR') || 0}</span>
                    </div>
                    <div className={`${styles.rodapeStat} ${styles.prestigioDisplay}`}>
                        <img src={`${process.env.PUBLIC_URL}/assets/prestige.png`} alt="Prestige" className={styles.rodapeIcon} />
                        <span>{ficha?.prestigio || 0}</span>
                    </div>
                    <div className={`${styles.rodapeStat} ${styles.pesoDisplay} ${getPesoClasse()}`}>
                        <img src={`${process.env.PUBLIC_URL}/assets/peso.png`} alt="Peso" className={styles.rodapeIcon} />
                        <span>{pesoAtual} / {ficha?.pesoMax || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TelaInventario;
