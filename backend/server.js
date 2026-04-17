const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARES (Ye add/delete ke liye bahut zaruri hain) ---
app.use(cors()); // Isse frontend aur backend connect honge
app.use(express.json()); // Isse POST request ka data server read kar payega

// --- DATABASE CONNECTION ---
// Agar .env use kar rahe ho toh process.env.MONGO_URI, warna direct string daal dena
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/invmaster';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Bhai, MongoDB connect ho gaya hai!'))
    .catch((err) => console.log('❌ Database connection error:', err));

// --- ROUTES ---
const productRoutes = require('./routes/productRoutes');
const supplierRoutes = require('./routes/supplierRoutes');

// API Endpoints setup
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);

// Base route test karne ke liye
app.get('/', (req, res) => {
    res.send('InvMaster API is running perfectly! 🔥');
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server chalu ho gaya port: ${PORT} par`);
});