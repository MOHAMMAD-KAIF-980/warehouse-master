const API_URL = 'http://localhost:5000/api/products';
const SUPP_API = 'http://localhost:5000/api/suppliers';
let allProducts = [];

// --- Fetch Data ---
async function fetchAllData() {
    try {
        const res = await fetch(API_URL);
        allProducts = await res.json();
        updateStats(allProducts);
        renderInventory(allProducts);
    } catch (e) { console.error("API Error:", e); }
}

function updateStats(data) {
    document.getElementById('stat-total').innerText = data.length;
    document.getElementById('stat-low').innerText = data.filter(p => p.quantity > 0 && p.quantity < 10).length;
    document.getElementById('stat-out').innerText = data.filter(p => p.quantity <= 0).length;
}

// --- Render Table ---
function renderInventory(data) {
    const tableBody = document.getElementById('inventory-table');
    tableBody.innerHTML = data.map(p => `
        <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
            <td class="p-4">
                <div class="font-bold text-slate-800">${p.name}</div>
                <div class="text-[10px] text-indigo-500 font-bold uppercase">${p.category || 'General'}</div>
            </td>
            <td class="p-4 font-mono text-xs text-indigo-400 font-bold">${(p.sku || 'N/A').toUpperCase()}</td>
            <td class="p-4 text-center">
                <span class="text-[10px] font-black text-slate-500 block uppercase">${p.location || 'Warehouse'}</span>
                <button onclick="updateGPS('${p._id}')" class="text-[9px] text-blue-500 underline font-bold">UPDATE GPS</button>
            </td>
            <td class="p-4 text-center font-black text-emerald-600">$${p.price || 0}</td>
            <td class="p-4 text-center font-bold text-slate-600">${p.quantity}</td>
            <td class="p-4 text-right">
                <button onclick="deleteItem('${p._id}')" class="text-slate-300 hover:text-red-500 transition"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');
}

// --- Search Feature ---
function searchProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
    );
    renderInventory(filtered);
}

// --- GPS Tracking Update ---
async function updateGPS(id) {
    const loc = prompt("Enter New Location:");
    if(loc) {
        await fetch(`${API_URL}/${id}`, { 
            method: 'PUT', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({location: loc}) 
        });
        fetchAllData();
    }
}

// --- Export CSV ---
function exportInventory() {
    if(allProducts.length === 0) return alert("Empty inventory!");
    let csv = "Name,Type,SKU,Price,Quantity,Location\n";
    allProducts.forEach(p => {
        csv += `${p.name},${p.category},${p.sku},${p.price},${p.quantity},${p.location || 'Warehouse'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Inventory_Report.csv';
    a.click();
}

// --- Add Product ---
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('pName').value,
        category: document.getElementById('pType').value,
        sku: document.getElementById('pSku').value,
        price: Number(document.getElementById('pPrice').value),
        quantity: Number(document.getElementById('pQty').value)
    };
    await fetch(`${API_URL}/add`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    toggleModal('productModal'); e.target.reset(); fetchAllData();
});

// --- Suppliers Management ---
async function fetchSuppliers() {
    const res = await fetch(SUPP_API);
    const data = await res.json();
    document.getElementById('supplier-table').innerHTML = data.map(s => `
        <tr class="border-b">
            <td class="p-4 font-bold">${s.name}</td>
            <td class="p-4 text-slate-500">${s.contact}</td>
            <td class="p-4"><span class="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold uppercase">${s.category}</span></td>
            <td class="p-4 text-right"><button onclick="deleteSupp('${s._id}')" class="text-red-300"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');
}

document.getElementById('supplierForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('sName').value,
        contact: document.getElementById('sContact').value,
        category: document.getElementById('sCat').value
    };
    await fetch(`${SUPP_API}/add`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    toggleModal('supplierModal'); e.target.reset(); fetchSuppliers();
});

// --- UI Controls ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if(id === 'suppliers-section') fetchSuppliers();
}
async function deleteItem(id) { if(confirm('Delete Product?')) { await fetch(`${API_URL}/${id}`, { method: 'DELETE' }); fetchAllData(); } }
async function deleteSupp(id) { if(confirm('Delete Supplier?')) { await fetch(`${SUPP_API}/${id}`, { method: 'DELETE' }); fetchSuppliers(); } }
function toggleModal(id) { document.getElementById(id).classList.toggle('hidden'); }
document.addEventListener('DOMContentLoaded', fetchAllData);