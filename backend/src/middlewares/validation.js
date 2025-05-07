const { body, validationResult } = require('express-validator');

const validateTransaction = [
    body('amount')
        .isNumeric().withMessage('O valor deve ser um número.')
        .notEmpty().withMessage('O valor é obrigatório.'),
    body('description')
        .isString().withMessage('A descrição deve ser uma string.')
        .notEmpty().withMessage('A descrição é obrigatória.'),
    body('category')
        .isString().withMessage('A categoria deve ser uma string.')
        .notEmpty().withMessage('A categoria é obrigatória.'),
    body('date')
        .isISO8601().withMessage('A data deve ser uma data válida.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateTransaction,
};