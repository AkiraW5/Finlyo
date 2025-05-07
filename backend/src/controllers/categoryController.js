const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ message: 'Erro ao buscar categorias' });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({ message: 'Erro ao criar categoria' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const [updated] = await Category.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    
    const updatedCategory = await Category.findByPk(req.params.id);
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({ message: 'Erro ao atualizar categoria' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Erro ao excluir categoria' });
  }
};

// Get transactions by category
exports.getCategoryTransactions = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    const transactions = await Transaction.findAll({
      where: { category: categoryId },
      order: [['date', 'DESC']],
      limit: 10
    });
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error getting category transactions:', error);
    res.status(500).json({ message: 'Erro ao buscar transações da categoria' });
  }
};