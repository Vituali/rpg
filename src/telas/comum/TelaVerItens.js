// src/telas/comum/TelaVerItens.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carregarModelosDeItens } from '../../firebase/dataService';
import './TelaVerItens.css';

function TelaVerItens() {
    const navigate = useNavigate();
    const [itens, setItens] = useState({});
    const [itemSelecionado, setItemSelecionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const logoPath = `${process.env.PUBLIC_URL}/assets/logo.png`;

    useEffect(() => {
        const buscarItens = async () => {
            setLoading(true);
            const itensData = await carregarModelosDeItens();
            setItens(itensData);
            setLoading(false);
        };
        buscarItens();
    }, []);

    const handleSelecionarItem = (item) => {
        setItemSelecionado(item);
    };
    
    const handleImageError = (e) => {
        e.target.style.display = 'none';
    };

    if (loading) {
        return <div className="pagina-container">A carregar itens...</div>;
    }

    return (
        <div className="pagina-container">
            <div className="ver-itens-container">
                <div className="lista-itens-painel-visualizacao">
                    <h2>Compêndio de Itens</h2>
                    <ul className="lista-de-itens-visualizacao">
                        {Object.entries(itens).map(([id, item]) => (
                            <li key={id} onClick={() => handleSelecionarItem(item)}>
                                {item.imagem && (
                                    <img 
                                        src={`${process.env.PUBLIC_URL}/assets/itens/${item.imagem}`} 
                                        alt={item.nome}
                                        className="item-lista-icone"
                                        onError={handleImageError}
                                    />
                                )}
                                <span>{item.nome}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="detalhes-item-painel">
                    {itemSelecionado ? (
                        <>
                            <h2>{itemSelecionado.nome}</h2>

                            <div className="item-detalhe-cabecalho">
                                <div className="item-detalhe-info">
                                    <p className="item-detalhe-tipo">
                                        Tipo: {itemSelecionado.tipo || 'Geral'}
                                    </p>
                                    <p className={`raridade-texto raridade-${itemSelecionado.raridade || 'comum'}`}>
                                        Raridade: {itemSelecionado.raridade || 'comum'}
                                    </p>
                                </div>
                                {itemSelecionado.imagem && (
                                    <img 
                                        src={`${process.env.PUBLIC_URL}/assets/itens/${itemSelecionado.imagem}`} 
                                        alt={itemSelecionado.nome}
                                        className="item-detalhe-imagem"
                                        onError={handleImageError}
                                    />
                                )}
                            </div>

                            <p className="item-detalhe-descricao">{itemSelecionado.descricao}</p>
                            
                            {itemSelecionado.modificadores && itemSelecionado.modificadores.length > 0 && (
                                <div className="item-detalhe-modificadores">
                                    <h3>Modificadores</h3>
                                    <ul>
                                        {itemSelecionado.modificadores.map((mod, index) => (
                                            <li key={index}>
                                                +{mod.valor} em {mod.alvo} ({mod.tipo})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="selecione-um-item">
                            <img src={logoPath} alt="Logo" />
                            <p>Selecione um item da lista para ver os detalhes.</p>
                        </div>
                    )}
                </div>
            </div>
            <button onClick={() => navigate('/')} style={{ marginTop: '30px' }}>Voltar ao Menu</button>
        </div>
    );
}

export default TelaVerItens;
