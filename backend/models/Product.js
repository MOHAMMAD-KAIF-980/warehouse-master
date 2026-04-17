const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    threshold: { type: Number, default: 10 } // Low stock alert level
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);