const { body, validationResult } = require('express-validator');

// Règles de validation pour la création d'une transaction
const validateTransaction = [
    body('title')
        .notEmpty().withMessage('Le titre est obligatoire')
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage('Le titre doit contenir entre 1 et 100 caractères'),
    
    body('amount')
        .notEmpty().withMessage('Le montant est obligatoire')
        .isFloat({ gt: 0 }).withMessage('Le montant doit être un nombre strictement positif'),
    
    body('type')
        .notEmpty().withMessage('Le type est obligatoire')
        .isIn(['income', 'expense']).withMessage('Le type doit être "income" ou "expense"'),
    
    body('category')
        .if(body('type').equals('expense'))
        .notEmpty().withMessage('La catégorie est obligatoire pour une dépense')
        .trim(),
    
    body('date')
        .notEmpty().withMessage('La date est obligatoire')
        .isISO8601().withMessage('La date doit être valide (format ISO8601)')
        .toDate(),
    
    // Middleware pour vérifier les résultats de validation
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => ({
                    field: err.param,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

module.exports = { validateTransaction };