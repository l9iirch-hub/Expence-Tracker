const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Le titre est obligatoire'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Le montant est obligatoire'],
        min: [0.01, 'Le montant doit être strictement positif']
    },
    type: {
        type: String,
        required: [true, 'Le type est obligatoire'],
        enum: {
            values: ['income', 'expense'],
            message: 'Le type doit être income ou expense'
        }
    },
    // category: {
    //     type: String,
    //     required: function() {
    //         return this.type === 'expense';
    //     },
    //     trim: true
    // },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    date: {
        type: Date,
        required: [true, 'La date est obligatoire'],
        default: Date.now
    }
}, {
    timestamps: true
});

transactionSchema.index({ date: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);