/**
 * INV-MASTER: PRO-LEVEL LOGIC
 * Features: Real-time Category Grouping, Sorting, Low Stock Alerts
 */

const API_URL = 'http://localhost:5000/api/products';
const SUPP_API = 'http://localhost:5000/api/suppliers';
let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    showSection('inventory-section');
    fetchInventory();
    
    // Listeners
    document.getElementById('searchBox')?.addEventListener('input', filterData);
    document.getElementById('productForm')?.addEventListener('submit', handleAddProduct);
    document.getElementById('supplierForm')?.addEventListener('submit', handleAddSupplier);
});

// --- NAVIGATION ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active-link'));
    if(id === 'inventory-section') document.getElementById('nav-inv').classList.add('active-link');
    if(id === 'suppliers-section') {
        document.getElementById('nav-supp').classList.add('active-link');
        fetchSuppliers();
    }
}

// --- PRODUCT / INVENTORY LOGIC ---
async function fetchInventory() {
    try {
        const res = await fetch(API_URL);
        allProducts = await res.json();
        renderProductTable(allProducts);
        updateStats(allProducts);
        checkAlerts(allProducts);
    } catch (err) { console.error("Fetch Error:", err); }
}

function renderProductTable(data) {
    const table = document.getElementById('inventory-table');
    if(!table) return;

    if(data.length === 0) {
        table.innerHTML = `<tr><td colspan="5" class="p-10 text-center text-slate-400 italic">No products matched your search.</td></tr>`;
        return;
    }

    // 1. Grouping by Category Logic
    const grouped = data.reduce((acc, p) => {
        const cat = p.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
    }, {});

    let html = '';
    for (const cat in grouped) {
        // Category Header Row
        html += `
            <tr class="bg-slate-50/80 shadow-inner">
                <td colspan="5" class="p-3 pl-5 text-[10px] font-black text-blue-600 uppercase tracking-[2px] border-l-4 border-blue-600">
                    <i class="fas fa-folder-open mr-2"></i> ${cat} (${grouped[cat].length})
                </td>
            </tr>
        `;
        // Product Rows
        grouped[cat].forEach(p => {
            html += `
                <tr class="hover:bg-blue-50/30 transition border-b border-slate-50">
                    <td class="p-5">
                        <div class="font-bold text-slate-700">${p.name}</div>
                    </td>
                    <td class="p-5 text-slate-400 font-mono text-xs">${p.sku}</td>
                    <td class="p-5 text-center font-black ${p.quantity < 10 ? 'text-red-500' : 'text-slate-700'}">${p.quantity}</td>
                    <td class="p-5 font-bold text-blue-600 italic">₹${p.price.toLocaleString()}</td>
                    <td class="p-5 text-right">
                        <button onclick="deleteProduct('${p._id}')" class="text-slate-300 hover:text-red-500 transition p-2 hover:scale-125 transform">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    table.innerHTML = html;
}

// --- NEW SMART FUNCTIONS ---

function filterData() {
    const val = document.getElementById('searchBox').value.toLowerCase();
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(val) || 
        p.sku.toLowerCase().includes(val) || 
        p.category.toLowerCase().includes(val)
    );
    renderProductTable(filtered);
}

function filterLowStock() {
    const low = allProducts.filter(p => p.quantity < 10);
    renderProductTable(low);
}

function sortByPrice(order) {
    const sorted = [...allProducts].sort((a, b) => 
        order === 'high' ? b.price - a.price : a.price - b.price
    );
    renderProductTable(sorted);
}

function checkAlerts(data) {
    const alertBox = document.getElementById('lowStockAlert');
    const lowCount = data.filter(p => p.quantity < 10).length;
    if(lowCount > 0) alertBox.classList.remove('hidden');
    else alertBox.classList.add('hidden');
}

// --- CRUD OPERATIONS ---
async function handleAddProduct(e) {
    e.preventDefault();
    const newItem = {
        name: document.getElementById('pName').value,
        sku: document.getElementById('pSku').value,
        category: document.getElementById('pCat').value,
        quantity: Number(document.getElementById('pQty').value),
        price: Number(document.getElementById('pPrice').value)
    };
    await fetch(`${API_URL}/add`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newItem)
    });
    toggleModal('productModal');
    fetchInventory();
    e.target.reset();
}

async function deleteProduct(id) {
    if(confirm('Khatam kar dein is item ko?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchInventory();
    }
}

// --- SUPPLIER LOGIC ---
async function fetchSuppliers() {
    try {
        const res = await fetch(SUPP_API);
        const data = await res.json();
        const table = document.getElementById('supplier-table');
        if(!table) return;

        if(data.length === 0) {
            table.innerHTML = `<tr><td colspan="4" class="p-10 text-center text-slate-400">No suppliers registered.</td></tr>`;
            return;
        }

        table.innerHTML = data.map(s => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-50">
                <td class="p-5">
                    <div class="font-bold text-slate-800">${s.name}</div>
                    <div class="text-[10px] text-blue-500 font-bold uppercase tracking-tighter italic">${s.email}</div>
                </td>
                <td class="p-5 text-slate-500 font-medium">${s.contact}</td>
                <td class="p-5 text-xs font-black uppercase text-indigo-600 bg-indigo-50/50 rounded-full inline-block mt-4 ml-5 px-3 py-1 border border-indigo-100">${s.category}</td>
                <td class="p-5 text-right">
                    <button onclick="deleteSupplier('${s._id}')" class="text-red-300 hover:text-red-600 transition p-2">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) { console.error("Supp Error:", err); }
}

async function handleAddSupplier(e) {
    e.preventDefault();
    const newSupp = {
        name: document.getElementById('sName').value,
        contact: document.getElementById('sContact').value,
        email: document.getElementById('sEmail').value,
        category: document.getElementById('sCat').value
    };
    await fetch(`${SUPP_API}/add`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newSupp)
    });
    toggleModal('supplierModal');
    fetchSuppliers();
    e.target.reset();
}

async function deleteSupplier(id) {
    if(confirm('Supplier list se hatayein?')) {
        await fetch(`${SUPP_API}/${id}`, { method: 'DELETE' });
        fetchSuppliers();
    }
}

// --- UTILS ---
function updateStats(data) {
    document.getElementById('stat-total').innerText = data.length;
    document.getElementById('stat-low').innerText = data.filter(p => p.quantity > 0 && p.quantity < 10).length;
    document.getElementById('stat-out').innerText = data.filter(p => p.quantity <= 0).length;
}

function toggleModal(id) { document.getElementById(id).classList.toggle('hidden'); }

function exportInventory() {
    if(allProducts.length === 0) return alert("Kuch hai hi nahi export karne ko!");
    let csv = "Item Name,SKU,Stock,Price,Category\n";
    allProducts.forEach(p => { csv += `${p.name},${p.sku},${p.quantity},${p.price},${p.category}\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'InvMaster_Report_Final.csv';
    a.click();
}