// src/componentes/CriarItemModal.js
import React, { useState } from 'react';
import { adicionarItemAoInventario } from '../firebase/dataService';
import './CriarItemModal.css'; 

const modeloItemVazio = {
    nome: '',
    descricao: '',
    tipo: 'geral',
    espacos: 1,
    imagem: '', // Campo para a imagem
    raridade: 'comum', // Campo para a raridade
    modificadores: []
};

function CriarItemModal({ onClose, onItemCriado, temporada, fichaId }) {
    const [item, setItem] = useState(modeloItemVazio);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const valor = type === 'number' ? parseInt(value) || 0 : value;
        setItem(prev => ({ ...prev, [name]: valor }));
    };

    const handleAdicionarModificador = () => {
        const novoModificador = { tipo: 'pericia', alvo: '', valor: 1 };
        setItem(prev => ({
            ...prev,
            modificadores: [...(prev.modificadores || []), novoModificador]
        }));
    };
    
    const handleModificadorChange = (index, e) => {
        const { name, value } = e.target;
        const novosModificadores = [...item.modificadores];
        novosModificadores[index] = { ...novosModificadores[index], [name]: value };
        setItem(prev => ({ ...prev, modificadores: novosModificadores }));
    };

    const handleRemoverModificador = (index) => {
        const novosModificadores = item.modificadores.filter((_, i) => i !== index);
        setItem(prev => ({ ...prev, modificadores: novosModificadores }));
    };

    const handleCriarEDarItem = async () => {
        if (!item.nome) {
            alert("O nome do item é obrigatório!");
            return;
        }

        const itemParaInventario = {
            customData: item,
            quantidade: 1,
            equipado: false
        };

        const novoId = await adicionarItemAoInventario(temporada, fichaId, itemParaInventario);

        if (novoId) {
            alert(`Item "${item.nome}" criado e entregue ao jogador!`);
            onItemCriado();
        } else {
            alert("Falha ao entregar o item.");
        }
    };

    return (
        <div className="modal">
            <div className="criar-item-content">
                <span className="close-btn" onClick={onClose}>×</span>
                <h2>Criar Item Personalizado</h2>
                <div className="editor-item-painel">
                    <label>Nome do Item:</label>
                    <input type="text" name="nome" value={item.nome} onChange={handleChange} />
                    
                    <label>Nome do Arquivo da Imagem (opcional, ex: item.png):</label>
                    <input type="text" name="imagem" value={item.imagem} onChange={handleChange} />
                    
                    <label>Raridade:</label>
                    <select name="raridade" value={item.raridade} onChange={handleChange}>
                        <option value="comum">Comum</option>
                        <option value="incomum">Incomum</option>
                        <option value="raro">Raro</option>
                        <option value="epico">Épico</option>
                        <option value="lendario">Lendário</option>
                        <option value="satanico">Satânico</option>
                    </select>

                    <label>Descrição:</label>
                    <textarea name="descricao" value={item.descricao} onChange={handleChange}></textarea>
                    
                    <label>Tipo:</label>
                    <select name="tipo" value={item.tipo} onChange={handleChange}>
                        <option value="geral">Geral</option>
                        <option value="arma">Arma</option>
                        <option value="municao">Munição</option>
                        <option value="armadura">Armadura</option>
                        <option value="capacete">Capacete</option>
                        <option value="capa">Capa</option>
                        <option value="cinto">Cinto</option>
                        <option value="botas">Botas</option>
                        <option value="acessorio">Acessório</option>
                    </select>
                    
                    <label>Espaços/Peso:</label>
                    <input type="number" name="espacos" value={item.espacos} onChange={handleChange} />

                    <h4>Modificadores</h4>
                    {item.modificadores && item.modificadores.map((mod, index) => (
                        <div key={index} className="modificador-item">
                            <select name="tipo" value={mod.tipo} onChange={(e) => handleModificadorChange(index, e)}>
                                <option value="pericia">Perícia</option>
                                <option value="atributo">Atributo</option>
                            </select>
                            <input type="text" placeholder="Alvo (ex: adestramento)" name="alvo" value={mod.alvo} onChange={(e) => handleModificadorChange(index, e)} />
                            <input type="number" placeholder="Valor" name="valor" value={mod.valor} onChange={(e) => handleModificadorChange(index, e)} />
                            <button onClick={() => handleRemoverModificador(index)}>X</button>
                        </div>
                    ))}
                    <button onClick={handleAdicionarModificador}>+ Adicionar Modificador</button>
                    
                    <div className="modal-actions">
                        <button className="save-btn" onClick={handleCriarEDarItem}>Criar e Entregar Item</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CriarItemModal;
