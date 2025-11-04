// src/telas/jogador/TelaInventario.js
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carregarFicha, carregarModelosDeItens, carregarInventarioDoPersonagem, atualizarEquipamento, atualizarItemNoInventario } from '../../firebase/dataService';
import './TelaInventario.css';

function TelaInventario() {
    const { fichaId } = useParams();
    const navigate = useNavigate();
    const temporada = 'pacto';

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
        buscarDados();
    }, [fichaId]);

    const pesoAtual = useMemo(() => {
        return Object.values(inventario).reduce((acc, item) => {
            const dadosDoItem = item.itemId ? modelosDeItens[item.itemId] : item.customData;
            const pesoItem = dadosDoItem?.espacos || 0;
            return acc + (pesoItem * (item.quantidade || 1));
        }, 0);
    }, [inventario, modelosDeItens]);

    // NOVA FUNÇÃO: Determina a classe CSS com base no peso
    const getPesoClasse = () => {
        if (!ficha || !ficha.pesoMax || ficha.pesoMax === 0) return '';
        const percentual = (pesoAtual / ficha.pesoMax) * 100;

        if (percentual >= 100) return 'sobrecarregado';
        if (percentual >= 90) return 'pesado';
        if (percentual >= 70) return 'atencao';
        return '';
    };

    const handleDragStart = (e, dragInfo) => {
        e.dataTransfer.setData("dragInfo", JSON.stringify(dragInfo));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    };
    
    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('drag-over');
    };

    const handleDropOnSlot = async (e, slotAlvo) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
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
        e.currentTarget.classList.remove('drag-over');
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
        return <div className="pagina-container">A carregar inventário...</div>;
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
        if (!dadosDoItem) return <span className="slot-nome">Inválido</span>;

        const raridadeClass = `raridade-${dadosDoItem.raridade || 'comum'}`;

        return (
            <div className={`item-inventario ${raridadeClass}`} title={dadosDoItem.descricao}>
                {dadosDoItem.imagem ? (
                    <img 
                        src={`${process.env.PUBLIC_URL}/assets/itens/${dadosDoItem.imagem}`} 
                        alt={dadosDoItem.nome}
                        className="item-sprite"
                        onError={handleItemImageError}
                    />
                ) : (
                    <div className="item-nome">{dadosDoItem.nome}</div>
                )}
            </div>
        );
    };

    const slotsEquipamento = [
        { nome: 'capacete' }, { nome: 'armadura' },
        { nome: 'arma' }, { nome: 'municao' }, { nome: 'botas' },
        { nome: 'acessorio1' }, { nome: 'acessorio2' }, { nome: 'acessorio3' },
        { nome: 'acessorio4' }, { nome: 'cinto' }
    ];

    return (
        <div className="inventario-screen-container">
            <div className="inventario-janela">
                <div className="inventario-cabecalho">
                    <h3>Inventário</h3>
                    <div className="cabecalho-botoes">
                        <button className="gerenciar-btn" onClick={() => navigate(`/editar-agente/${fichaId}`)}>Gerenciar</button>
                        <button className="fechar-btn" onClick={() => navigate(`/jogar`)}>X</button>
                    </div>
                </div>

                <div className="equipamento-painel-visual">
                    {slotsEquipamento.map(slot => {
                        const inventarioItemId = equipamento[slot.nome];
                        const itemNoSlot = inventarioItemId ? inventario[inventarioItemId] : null;
                        const nomeSlotCapitalizado = slot.nome.charAt(0).toUpperCase() + slot.nome.slice(1).replace(/[0-9]/g, ' $&');

                        return (
                            <div 
                                key={slot.nome}
                                className={`slot slot-${slot.nome}`} 
                                onDragOver={handleDragOver} 
                                onDragLeave={handleDragLeave} 
                                onDrop={(e) => handleDropOnSlot(e, slot.nome)}
                                draggable={!!itemNoSlot}
                                onDragStart={(e) => itemNoSlot && handleDragStart(e, { origem: 'slot', inventarioItemId, slotOrigem: slot.nome })}
                            >
                                {itemNoSlot ? renderizarItem(inventarioItemId, itemNoSlot) : <span className="slot-nome">{nomeSlotCapitalizado}</span>}
                            </div>
                        );
                    })}
                </div>

                <div 
                    className="mochila-painel-grid"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDropOnMochila}
                >
                     {Object.entries(inventario).map(([invId, item]) => {
                        if (item.equipado) return null;
                        return (
                            <div 
                                key={invId} 
                                className="slot"
                                draggable={true}
                                onDragStart={(e) => handleDragStart(e, { origem: 'mochila', inventarioItemId: invId })}
                            >
                               {renderizarItem(invId, item)}
                            </div>
                        );
                    })}
                    {Array.from({ length: 30 - Object.values(inventario).filter(i => !i.equipado).length }).map((_, index) => (
                        <div key={`empty-${index}`} className="slot"></div>
                    ))}
                </div>
                
                <div className="inventario-rodape">
                    <div className="rodape-stat dinheiro-display">
                        <img src={`${process.env.PUBLIC_URL}/assets/gold.png`} alt="Gold" className="rodape-icon" />
                        <span>{ficha?.dinheiro?.toLocaleString('pt-BR') || 0}</span>
                    </div>
                    <div className="rodape-stat prestigio-display">
                        <img src={`${process.env.PUBLIC_URL}/assets/prestige.png`} alt="Prestige" className="rodape-icon" />
                        <span>{ficha?.prestigio || 0}</span>
                    </div>
                    <div className={`rodape-stat peso-display ${getPesoClasse()}`}>
                        <img src={`${process.env.PUBLIC_URL}/assets/peso.png`} alt="Peso" className="rodape-icon" />
                        <span>{pesoAtual} / {ficha?.pesoMax || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TelaInventario;
