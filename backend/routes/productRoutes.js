const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// 1. GET ALL
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. ADD PRODUCT
router.post('/add', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// 3. SELL/UPDATE QUANTITY (Auto-Update Logic)
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            { $set: { quantity: req.body.quantity } }, 
            { new: true }
        );
        res.json(updatedProduct);
    } catch (err) { res.status(500).json({ message: "Update Failed" }); }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;