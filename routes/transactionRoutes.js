const express = require('express');
const router = express.Router();
const {
    createTransaction,
    getTransactions,
    getMonthlyStats,
    getBalance
} = require('../controllers/transactionController');
const { validateTransaction } = require('../middleware/validation');
const { checkBalance } = require('../middleware/balanceCheck');
router.route('/')
    .get(getTransactions)
    .post(validateTransaction, checkBalance, createTransaction);

router.get('/stats', getMonthlyStats);
router.get('/balance', getBalance);

module.exports = router;