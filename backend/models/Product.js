const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    location: { type: String, default: "Warehouse" }, // GPS Tracking ke liye
    status: { type: String, default: "In Stock" }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);