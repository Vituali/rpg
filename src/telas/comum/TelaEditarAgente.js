// src/telas/comum/TelaEditarAgente.js
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    carregarFicha,
    carregarModelosDeItens,
    carregarInventarioDoPersonagem,
    adicionarItemAoInventario,
    removerItemDoInventario,
    atualizarAtributosBaseFicha
} from '../../firebase/dataService';
import CriarItemModal from '../../componentes/CriarItemModal';
import './TelaEditarAgente.css';

const MAX_INVENTARIO = 30;

function TelaEditarAgente() {
    const { fichaId } = useParams();
    const navigate = useNavigate();
    const temporada = 'pacto';

    const [ficha, setFicha] = useState(null);
    const [modelosDeItens, setModelosDeItens] = useState({});
    const [inventario, setInventario] = useState({});
    const [loading, setLoading] = useState(true);
    const [modalCriarItemVisivel, setModalCriarItemVisivel] = useState(false);
    const logoPath = `${process.env.PUBLIC_URL}/assets/logo.png`;

    useEffect(() => {
        const buscarDados = async () => {
            setLoading(true);
            const [fichaData, modelosData, inventarioData] = await Promise.all([
                carregarFicha(temporada, fichaId),
                carregarModelosDeItens(),
                carregarInventarioDoPersonagem(temporada, fichaId)
            ]);
    
            if (fichaData) setFicha(fichaData);
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

    const percentualInventario = useMemo(() => {
        return (Object.keys(inventario).length / MAX_INVENTARIO) * 100;
    }, [inventario]);

    const recarregarInventario = async () => {
        const inventarioData = await carregarInventarioDoPersonagem(temporada, fichaId);
        setInventario(inventarioData);
    };

    const handleItemCustomCriado = () => {
        setModalCriarItemVisivel(false);
        recarregarInventario();
    };

    const handleFichaChange = (e) => {
        const { name, value } = e.target;
        const valorNumerico = parseInt(value, 10);
        setFicha(prev => ({ ...prev, [name]: isNaN(valorNumerico) ? 0 : valorNumerico }));
    };
    
    const handleSalvarAtributos = async () => {
        const updates = {
            dinheiro: ficha.dinheiro || 0,
            prestigio: ficha.prestigio || 0,
            pesoMax: ficha.pesoMax || 0
        };
        const sucesso = await atualizarAtributosBaseFicha(temporada, fichaId, updates);
        if (sucesso) alert("Atributos salvos com sucesso!");
        else alert("Falha ao salvar os atributos.");
    };

    const handleDragStart = (e, dragInfo) => e.dataTransfer.setData("dragInfo", JSON.stringify(dragInfo));

    const handleDropNoInventario = async (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const dragInfo = JSON.parse(e.dataTransfer.getData("dragInfo"));

        if (dragInfo.origem !== 'bau') return;
        if (Object.keys(inventario).length >= MAX_INVENTARIO) {
            alert("Inventário cheio!");
            return;
        }

        const itemParaInventario = { itemId: dragInfo.itemId, quantidade: 1, equipado: false };
        const novoId = await adicionarItemAoInventario(temporada, fichaId, itemParaInventario);
        if (novoId) recarregarInventario();
    };
    
    const handleDropNoBau = async (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const dragInfo = JSON.parse(e.dataTransfer.getData("dragInfo"));

        if (dragInfo.origem !== 'inventario') return;
        
        const sucesso = await removerItemDoInventario(temporada, fichaId, dragInfo.inventarioItemId);
        if (sucesso) recarregarInventario();
    };

    const handleDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); };
    const handleDragLeave = (e) => { e.currentTarget.classList.remove('drag-over'); };
    const handleItemImageError = (e) => { e.target.src = logoPath; e.target.style.padding = '5px'; };
    
    const RenderizarItem = ({ itemModel }) => {
        if (!itemModel) return null;
        const raridadeClass = `raridade-${itemModel.raridade || 'comum'}`;
        return (
            <div className={`item-visual ${raridadeClass}`} title={itemModel.descricao}>
                {itemModel.imagem ? (
                    <img src={`${process.env.PUBLIC_URL}/assets/itens/${itemModel.imagem}`} alt={itemModel.nome} className="item-sprite" onError={handleItemImageError} />
                ) : (
                    <div className="item-nome-visual">{itemModel.nome}</div>
                )}
            </div>
        );
    };

    if (loading) return <div className="pagina-container">Carregando editor do agente...</div>;
    if (!ficha) return <div className="pagina-container">Ficha não encontrada.</div>;

    return (
        <>
            <div className="pagina-container editor-agente-container">
                <h1>Editar Agente: {ficha.nome}</h1>
                
                {/* SEÇÃO SUPERIOR: BAÚ E INVENTÁRIO */}
                <div className="editor-layout-superior">
                    <div 
                        className="painel-bau"
                        onDrop={handleDropNoBau}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <h2>Baú de Itens (Arraste para devolver)</h2>
                        <div className="bau-grid">
                            {Object.entries(modelosDeItens).map(([id, item]) => (
                                <div
                                    key={id}
                                    className="slot-visual"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, { origem: 'bau', itemId: id })}
                                >
                                    <RenderizarItem itemModel={item} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div 
                        className="painel-inventario-jogador"
                        onDrop={handleDropNoInventario}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <h2>Inventário do Personagem (Arraste para cá)</h2>
                        {percentualInventario >= 70 && (
                            <div className="aviso-inventario">
                                Atenção: Inventário com {Math.round(percentualInventario)}% da capacidade!
                            </div>
                        )}
                        <div className="inventario-grid">
                            {Object.entries(inventario).map(([invId, item]) => {
                                const dadosDoItem = item.itemId ? modelosDeItens[item.itemId] : item.customData;
                                return (
                                    <div 
                                        key={invId}
                                        className="slot-visual"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, { origem: 'inventario', inventarioItemId: invId })}
                                    >
                                        <RenderizarItem itemModel={dadosDoItem} />
                                    </div>
                                );
                            })}
                            {Array.from({ length: MAX_INVENTARIO - Object.keys(inventario).length }).map((_, index) => (
                                <div key={`empty-${index}`} className="slot-visual"></div>
                            ))}
                        </div>
                        {/* RODAPÉ DE STATUS ADICIONADO AQUI */}
                        <div className="inventario-rodape-edicao">
                            <div className="rodape-stat dinheiro-display">
                                <img src={`${process.env.PUBLIC_URL}/assets/gold.png`} alt="Gold" className="rodape-icon" />
                                <span>{ficha?.dinheiro?.toLocaleString('pt-BR') || 0}</span>
                            </div>
                            <div className="rodape-stat prestigio-display">
                                <img src={`${process.env.PUBLIC_URL}/assets/prestige.png`} alt="Prestige" className="rodape-icon" />
                                <span>{ficha?.prestigio || 0}</span>
                            </div>
                            <div className="rodape-stat peso-display">
                                <img src={`${process.env.PUBLIC_URL}/assets/peso.png`} alt="Peso" className="rodape-icon" />
                                <span>{pesoAtual} / {ficha?.pesoMax || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEÇÃO INFERIOR: GERENCIAMENTO */}
                <div className="painel-gerenciamento-inferior">
                    <div className="adicionar-item-custom">
                        <h3>Criar Item Personalizado</h3>
                        <button onClick={() => setModalCriarItemVisivel(true)}>Criar Item Homebrew</button>
                    </div>
                    <div className="painel-edicao-stats">
                        <h3>Atributos Base</h3>
                        <div className="stats-inputs">
                            <div>
                                <label>Dinheiro (Gold):</label>
                                <input type="number" name="dinheiro" value={ficha.dinheiro || 0} onChange={handleFichaChange} />
                            </div>
                            <div>
                                <label>Pontos de Prestígio:</label>
                                <input type="number" name="prestigio" value={ficha.prestigio || 0} onChange={handleFichaChange} />
                            </div>
                            <div>
                                <label>Peso Máximo:</label>
                                <input type="number" name="pesoMax" value={ficha.pesoMax || 0} onChange={handleFichaChange} />
                            </div>
                        </div>
                        <button onClick={handleSalvarAtributos}>Salvar Atributos</button>
                    </div>
                </div>

                <button onClick={() => navigate(-1)} style={{ marginTop: '30px' }}>Voltar</button>
            </div>

            {modalCriarItemVisivel && (
                <CriarItemModal
                    onClose={() => setModalCriarItemVisivel(false)}
                    onItemCriado={handleItemCustomCriado}
                    temporada={temporada}
                    fichaId={fichaId}
                />
            )}
        </>
    );
}

export default TelaEditarAgente;
