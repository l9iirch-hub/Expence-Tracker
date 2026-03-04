const Transaction = require('../models/Transaction');

const checkBalance = async (req, res, next) => {
    try {
        // Si ce n'est pas une dépense, on passe directement
        if (req.body.type !== 'expense') {
            return next();
        }

        // Calculer le solde actuel
        const result = await Transaction.aggregate([
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: {
                            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
                        }
                    },
                    totalExpense: {
                        $sum: {
                            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
                        }
                    }
                }
            }
        ]);

        const balance = result.length > 0 
            ? result[0].totalIncome - result[0].totalExpense 
            : 0;

        // Vérifier si la nouvelle dépense ferait passer le solde en négatif
        if (balance - req.body.amount < 0) {
            return res.status(400).json({
                success: false,
                message: 'Solde insuffisant pour effectuer cette dépense',
                currentBalance: balance
            });
        }

        req.currentBalance = balance;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { checkBalance };