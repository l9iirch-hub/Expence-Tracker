const Transaction = require('../models/Transaction');
const Category = require("../models/Category");
const Budget = require("../models/Budget");
const createTransaction = async (req, res, next) => {
    try {
        const { category, amount, date } = req.body;

        //Vérifier si la catégorie existe
        const existingCategory = await Category.findById(category);

        if (!existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Catégorie invalide"
            });
        }

        // Créer la transaction
        const transaction = await Transaction.create(req.body);

        // ---Vérification du budget---

        const transactionDate = date ? new Date(date) : new Date();
        const month = transactionDate.getMonth() + 1;
        const year = transactionDate.getFullYear();

        const budget = await Budget.findOne({
            category,
            month,
            year
        });

        let warning = null;

        if (budget) {

            const totalSpent = await Transaction.aggregate([
                {
                    $match: {
                        category: existingCategory._id,
                        type: "expense",
                        date: {
                            $gte: new Date(year, month - 1, 1),
                            $lte: new Date(year, month, 0, 23, 59, 59)
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" }
                    }
                }
            ]);

            const currentTotal = totalSpent[0]?.total || 0;

            if (currentTotal > budget.limitAmount) {
                warning = "⚠ Budget dépassé pour cette catégorie !";
            }
        }

        res.status(201).json({
            success: true,
            data: transaction,
            warning
        });

    } catch (error) {
        next(error);
    }
};

const getTransactions = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, date, startDate, endDate, category, type } = req.query;
        
        const filter = {};
        
        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            filter.date = {
                $gte: searchDate,
                $lt: nextDay
            };
        }
        
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setDate(endOfDay.getDate() + 1);
                filter.date.$lt = endOfDay;
            }
        }
        
        if (category) filter.category = category;
        if (type) filter.type = type;
        
        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Exécution de la requête
        const transactions = await Transaction.find(filter)
        .populate("category", "name")
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit));
        
        // Compter le total pour la pagination
        const total = await Transaction.countDocuments(filter);
        
        res.json({
            success: true,
            count: transactions.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            data: transactions
        });
    } catch (error) {
        next(error);
    }
};

const getMonthlyStats = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        
        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Le mois et l\'année sont requis'
            });
        }
        
        // Définir le début et la fin du mois
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        
        // Agrégation pour les statistiques
        const stats = await Transaction.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $facet: {
                    totals: [
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
                    ],
                    categories: [
                            {
                                $match: { type: 'expense' }
                            },
                            {
                                $group: {
                                    _id: '$category',
                                    total: { $sum: '$amount' }
                                }
                            },
                            {
                                $lookup: {
                                    from: "categories",
                                    localField: "_id",
                                    foreignField: "_id",
                                    as: "categoryInfo"
                                }
                            },
                            {
                                $unwind: "$categoryInfo"
                            },
                            {
                                $project: {
                                    category: "$categoryInfo.name",
                                    total: 1
                                }
                            }
                    ]
                }
            }
        ]);
        
        const totals = stats[0].totals[0] || { totalIncome: 0, totalExpense: 0 };
        const categories = stats[0].categories;
        
        // Calculer le solde du mois
        const monthlyBalance = totals.totalIncome - totals.totalExpense;
        
        // Calculer les pourcentages par catégorie
        const categoriesWithPercentage = categories.map(cat => ({
            category: cat._id,
            total: cat.total,
            percentage: totals.totalExpense > 0 
                ? ((cat.total / totals.totalExpense) * 100).toFixed(2) 
                : 0
        }));
        
        res.json({
            success: true,
            month,
            year,
            stats: {
                totalIncome: totals.totalIncome,
                totalExpense: totals.totalExpense,
                monthlyBalance,
                categories: categoriesWithPercentage
            }
        });
    } catch (error) {
        next(error);
    }
};

const getBalance = async (req, res, next) => {
    try {
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
        
        res.json({
            success: true,
            balance
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTransaction,
    getTransactions,
    getMonthlyStats,
    getBalance
};