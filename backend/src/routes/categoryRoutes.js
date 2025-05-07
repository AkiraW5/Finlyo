const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Definição das rotas de categorias
router.get('/', categoryController.getAllCategories);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.get('/:id/transactions', categoryController.getCategoryTransactions);

module.exports = router;