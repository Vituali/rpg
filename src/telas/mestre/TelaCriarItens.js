// src/telas/mestre/TelaCriarItens.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carregarModelosDeItens, salvarItemModelo, removerItemModelo } from '../../firebase/dataService';
// Importa o CSS Module
import styles from './TelaCriarItens.module.css';

const modeloItemVazio = {
    nome: '',
    descricao: '',
    tipo: 'geral',
    espacos: 1,
    imagem: '',
    raridade: 'comum',
    modificadores: []
};

function TelaCriarItens() {
    const navigate = useNavigate();
    const [itens, setItens] = useState({});
    const [itemAtual, setItemAtual] = useState(modeloItemVazio);
    const [editandoId, setEditandoId] = useState(null);

    useEffect(() => {
        const buscarItens = async () => {
            const itensData = await carregarModelosDeItens();
            setItens(itensData);
        };
        buscarItens();
    }, []);

    const handleSelecionarItem = (itemId) => {
        setEditandoId(itemId);
        setItemAtual({ raridade: 'comum', ...itens[itemId] });
    };

    const handleNovoItem = () => {
        setEditandoId(null);
        setItemAtual(modeloItemVazio);
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const valor = type === 'number' ? parseInt(value) || 0 : value;
        setItemAtual(prev => ({ ...prev, [name]: valor }));
    };

    const handleAdicionarModificador = () => {
        const novoModificador = { tipo: 'pericia', alvo: '', valor: 1 };
        setItemAtual(prev => ({
            ...prev,
            modificadores: [...(prev.modificadores || []), novoModificador]
        }));
    };
    
    const handleModificadorChange = (index, e) => {
        const { name, value } = e.target;
        const novosModificadores = [...itemAtual.modificadores];
        novosModificadores[index] = { ...novosModificadores[index], [name]: value };
        setItemAtual(prev => ({ ...prev, modificadores: novosModificadores }));
    };

    const handleRemoverModificador = (index) => {
        const novosModificadores = itemAtual.modificadores.filter((_, i) => i !== index);
        setItemAtual(prev => ({ ...prev, modificadores: novosModificadores }));
    };

    const handleSalvar = async () => {
        if (!itemAtual.nome) {
            alert("O nome do item é obrigatório!");
            return;
        }
        const idSalvo = await salvarItemModelo(editandoId, itemAtual);
        if (idSalvo) {
            alert("Item salvo com sucesso!");
            const itensData = await carregarModelosDeItens();
            setItens(itensData);
            if (!editandoId) { 
                handleNovoItem();
            }
        }
    };

    const handleRemover = async () => {
        if (!editandoId) return;
        if (window.confirm(`Tem certeza que deseja remover o item "${itemAtual.nome}"?`)) {
            const sucesso = await removerItemModelo(editandoId);
            if (sucesso) {
                alert("Item removido com sucesso!");
                const itensData = await carregarModelosDeItens();
                setItens(itensData);
                handleNovoItem();
            }
        }
    };

    return (
        // Aplica classes do CSS Module
        <div className={styles.paginaContainer}>
            <div className={styles.gerenciadorItensContainer}>
                <div className={styles.listaItensPainel}>
                    <h2>Itens Globais</h2>
                    <button onClick={handleNovoItem}>+ Criar Novo Item</button>
                    <ul className={styles.listaDeItens}>
                        {Object.entries(itens).map(([id, item]) => (
                            <li 
                                key={id} 
                                onClick={() => handleSelecionarItem(id)} 
                                className={editandoId === id ? styles.selecionado : ''}
                            >
                                {item.nome}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={styles.editorItemPainel}>
                    <h3>{editandoId ? 'Editando Item' : 'Novo Item'}</h3>
                    <label>Nome do Item:</label>
                    <input type="text" name="nome" value={itemAtual.nome} onChange={handleChange} />
                    
                    <label>Nome do Arquivo da Imagem (ex: manopla.png):</label>
                    <input type="text" name="imagem" value={itemAtual.imagem || ''} onChange={handleChange} />

                    <label>Descrição:</label>
                    <textarea name="descricao" value={itemAtual.descricao || ''} onChange={handleChange}></textarea>

                    <label>Raridade:</label>
                    <select name="raridade" value={itemAtual.raridade} onChange={handleChange}>
                        <option value="comum">Comum</option>
                        <option value="incomum">Incomum</option>
                        <option value="raro">Raro</option>
                        <option value="epico">Épico</option>
                        <option value="lendario">Lendário</option>
                        <option value="satanico">Satânico</option>
                    </select>

                    <label>Tipo:</label>
                    <select name="tipo" value={itemAtual.tipo} onChange={handleChange}>
                        <option value="geral">Geral</option>
                        <option value="arma">Arma</option>
                        <option value="armadura">Armadura</option>
                        <option value="acessorio">Acessório</option>
                        <option value="capacete">Capacete</option>
                        <option value="peitoral">Peitoral</option>
                        <option value="calcas">Calças</option>
                        <option value="luvas">Luvas</option>
                        <option value="botas">Botas</option>
                        <option value="escudo">Escudo</option>
                        <option value="capa">Capa</option>
                        <option value="municao">Munição</option>
                        <option value="cinto">Cinto</option>
                        <option value="anel">Anel</option>
                    </select>
                    
                    <label>Espaços no Inventário:</label>
                    <input type="number" name="espacos" value={itemAtual.espacos} onChange={handleChange} />

                    <h3>Modificadores</h3>
                    {itemAtual.modificadores && itemAtual.modificadores.map((mod, index) => (
                        <div key={index} className={styles.modificadorItem}>
                            <select name="tipo" value={mod.tipo} onChange={(e) => handleModificadorChange(index, e)}>
                                <option value="pericia">Perícia</option>
                                <option value="atributo">Atributo</option>
                            </select>
                            <input type="text" placeholder="Alvo (ex: adestramento)" name="alvo" value={mod.alvo} onChange={(e) => handleModificadorChange(index, e)} />
                            <input type="number" placeholder="Valor" name="valor" value={mod.valor} onChange={(e) => handleModificadorChange(index, e)} />
                            <button className={styles.removerModBtn} onClick={() => handleRemoverModificador(index)}>X</button>
                        </div>
                    ))}
                    <button onClick={handleAdicionarModificador}>+ Adicionar Modificador</button>
                    
                    <div className={styles.editorActions}>
                        <button className={styles.salvarBtn} onClick={handleSalvar}>Salvar</button>
                        {editandoId && <button className={styles.removerBtn} onClick={handleRemover}>Remover Item</button>}
                    </div>
                </div>
            </div>
            <button onClick={() => navigate('/')} style={{ marginTop: '30px' }}>Voltar ao Menu</button>
        </div>
    );
}

export default TelaCriarItens;
