const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// 1. GET ALL SUPPLIERS
// Dashboard par saare suppliers dikhane ke liye
router.get('/', async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ createdAt: -1 });
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ message: "Server Error: Suppliers nahi mil rahe!" });
    }
});

// 2. ADD NEW SUPPLIER
// Naya supplier register karne ke liye
router.post('/add', async (req, res) => {
    const { name, contact, email, category } = req.body;

    const newSupplier = new Supplier({
        name,
        contact,
        email,
        category
    });

    try {
        const savedSupplier = await newSupplier.save();
        res.status(201).json(savedSupplier);
    } catch (err) {
        res.status(400).json({ message: "Error: Supplier add nahi ho paya!" });
    }
});

// 3. DELETE SUPPLIER
// Supplier ko list se remove karne ke liye
router.delete('/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: "Supplier nahi mila!" });
        }

        await Supplier.findByIdAndDelete(req.params.id);
        res.json({ message: "Bhai, Supplier successfully remove ho gaya!" });
    } catch (err) {
        res.status(500).json({ message: "Server Error: Delete fail ho gaya!" });
    }
});

module.exports = router;