import React, { useState, useEffect } from 'react';

const CategoryModal = ({ isOpen, onClose, onSubmit, category = null, defaultType = 'expense' }) => {
    const [categoryType, setCategoryType] = useState(defaultType);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('fa-utensils');
    const [color, setColor] = useState('red');
    const [parentCategory, setParentCategory] = useState('');
    const [notes, setNotes] = useState('');

    // Lista de ícones disponíveis
    const availableIcons = [
        { name: 'fa-utensils', label: 'Alimentação' },
        { name: 'fa-home', label: 'Moradia' },
        { name: 'fa-car', label: 'Transporte' },
        { name: 'fa-film', label: 'Lazer' },
        { name: 'fa-heartbeat', label: 'Saúde' },
        { name: 'fa-graduation-cap', label: 'Educação' },
        { name: 'fa-shopping-bag', label: 'Compras' },
        { name: 'fa-plane', label: 'Viagem' },
        { name: 'fa-money-bill-wave', label: 'Dinheiro' },
        { name: 'fa-piggy-bank', label: 'Poupança' },
        { name: 'fa-bus', label: 'Ônibus' },
        { name: 'fa-tshirt', label: 'Roupas' }
    ];

    // Cores disponíveis
    const availableColors = [
        { name: 'red', label: 'Vermelho' },
        { name: 'green', label: 'Verde' },
        { name: 'blue', label: 'Azul' },
        { name: 'purple', label: 'Roxo' },
        { name: 'yellow', label: 'Amarelo' },
        { name: 'indigo', label: 'Índigo' }
    ];

    // Preenche o formulário quando estiver editando uma categoria
    useEffect(() => {
        if (category) {
            setCategoryType(category.type || defaultType);
            setName(category.name || '');
            setDescription(category.description || '');
            setIcon(category.icon || 'fa-utensils');
            setColor(category.color || 'red');
            setParentCategory(category.parentId || '');
            setNotes(category.notes || '');
        } else {
            resetForm();
            setCategoryType(defaultType);
        }
    }, [category, defaultType]);

    const resetForm = () => {
        setCategoryType(defaultType);
        setName('');
        setDescription('');
        setIcon('fa-utensils');
        setColor('red');
        setParentCategory('');
        setNotes('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const categoryData = {
            type: categoryType,
            name,
            description,
            icon,
            color,
            parentId: parentCategory || null,
            notes
        };
        
        onSubmit(categoryData);
        resetForm();
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {category ? 'Editar Categoria' : 'Nova Categoria'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Category type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Categoria</label>
                                <div className="flex space-x-4">
                                    <label className="inline-flex items-center">
                                        <input 
                                            type="radio" 
                                            name="categoryType" 
                                            value="expense" 
                                            checked={categoryType === 'expense'}
                                            onChange={() => setCategoryType('expense')}
                                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-gray-700">Despesa</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input 
                                            type="radio" 
                                            name="categoryType" 
                                            value="income"
                                            checked={categoryType === 'income'} 
                                            onChange={() => setCategoryType('income')}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-gray-700">Receita</span>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Category name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Categoria</label>
                                <input 
                                    type="text" 
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary" 
                                    placeholder="Ex: Alimentação"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required 
                                />
                            </div>
                            
                            {/* Category description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <input 
                                    type="text" 
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary" 
                                    placeholder="Ex: Supermercado, restaurantes, etc."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            
                            {/* Category icon */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {availableIcons.map((iconOption) => (
                                        <button
                                            key={iconOption.name}
                                            type="button"
                                            className={`p-2 rounded-lg hover:bg-gray-100 border-2 ${icon === iconOption.name ? 'border-indigo-500' : 'border-transparent'}`}
                                            onClick={() => setIcon(iconOption.name)}
                                            title={iconOption.label}
                                        >
                                            <i className={`fas ${iconOption.name} text-gray-700`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Color picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                                <div className="flex space-x-2">
                                    {availableColors.map((colorOption) => (
                                        <button
                                            key={colorOption.name}
                                            type="button"
                                            className={`w-8 h-8 rounded-full bg-${colorOption.name}-500 border-2 ${color === colorOption.name ? `border-${colorOption.name}-700` : 'border-transparent'} focus:outline-none`}
                                            onClick={() => setColor(colorOption.name)}
                                            title={colorOption.label}
                                        ></button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Parent category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria Pai (Opcional)</label>
                                <select 
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                    value={parentCategory}
                                    onChange={(e) => setParentCategory(e.target.value)}
                                >
                                    <option value="">Nenhuma</option>
                                    {/* Aqui você pode listar categorias existentes que possam servir como pai */}
                                </select>
                            </div>
                            
                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notas (Opcional)</label>
                                <textarea 
                                    rows="2" 
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary" 
                                    placeholder="Detalhes adicionais sobre esta categoria..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-3">
                            <button 
                                type="button" 
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700"
                            >
                                {category ? 'Salvar Alterações' : 'Salvar Categoria'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;