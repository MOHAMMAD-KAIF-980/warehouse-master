const API_URL = 'http://localhost:5000/api/products';
const SUPP_API = 'http://localhost:5000/api/suppliers';
let allProducts = [];

// --- 1. LOGIN SECURITY CHECK ---
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'auth.html';
}

// --- 2. LOGOUT ---
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'auth.html';
}

// --- 3. FETCH ALL DATA ---
async function fetchAllData() {
    try {
        const res = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        allProducts = await res.json();
        updateStats(allProducts);
        renderInventory(allProducts);
    } catch (e) { 
        console.error("API Error:", e);
    }
}

// --- 4. SELL ITEM (Stock Kam Karna) ---
async function sellItem(id, currentQty) {
    const sellAmount = prompt("Kitni quantity bechni (SELL) hai?");
    if (!sellAmount || isNaN(sellAmount) || sellAmount <= 0) return;
    
    const newQty = currentQty - Number(sellAmount);
    if (newQty < 0) return alert("Bhai, itna stock nahi hai!");

    updateQuantity(id, newQty);
}

// --- 5. ADD ITEM (Naya Stock Aana) ---
async function restockItem(id, currentQty) {
    const addAmount = prompt("Kitni quantity aur aayi (ADD) hai?");
    if (!addAmount || isNaN(addAmount) || addAmount <= 0) return;
    
    const newQty = currentQty + Number(addAmount);
    updateQuantity(id, newQty);
}

// --- 6. COMMON UPDATE FUNCTION ---
async function updateQuantity(id, newQty) {
    try {
        await fetch(`${API_URL}/${id}`, { 
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }, 
            body: JSON.stringify({ quantity: newQty }) 
        });
        fetchAllData(); 
    } catch (e) { alert("Update failed!"); }
}

// --- 7. RENDER TABLE (Fixed Sequence according to your Screenshot) ---
function renderInventory(data) {
    const tableBody = document.getElementById('inventory-table');
    tableBody.innerHTML = data.map(p => {
        const isLow = p.quantity > 0 && p.quantity < 50;
        const isOut = p.quantity <= 0;

        return `
        <tr class="border-b border-slate-50 hover:bg-slate-50 transition ${isLow ? 'bg-red-50' : ''}">
            <td class="p-4 text-left">
                <div class="font-bold text-slate-800">${p.name}</div>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] text-indigo-500 font-bold uppercase">${p.category || 'General'}</span>
                    ${isLow ? '<span class="bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black animate-pulse">LOW STOCK</span>' : ''}
                </div>
            </td>

            <td class="p-4 text-center font-mono text-xs text-indigo-400 font-bold">
                ${(p.sku || 'N/A').toUpperCase()}
            </td>

            <td class="p-4 text-center">
                <div class="text-[10px] font-black text-emerald-600 uppercase mb-1">${p.location || 'WAREHOUSE'}</div>
                <button onclick="updateGPS('${p._id}')" class="text-[9px] text-blue-500 underline font-bold italic hover:text-blue-700">UPDATE GPS</button>
            </td>

            <td class="p-4 text-center font-black text-slate-600">
                $${p.price || 0}
            </td>
            
            <td class="p-4 text-center font-bold ${isLow ? 'text-red-600' : 'text-slate-600'}">
                ${p.quantity}
            </td>
            
            <td class="p-4 text-right flex gap-2 justify-end items-center mt-2">
                <button onclick="restockItem('${p._id}', ${p.quantity})" class="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-black hover:bg-indigo-700 shadow-md">
                    <i class="fas fa-plus mr-1"></i> ADD
                </button>

                <button onclick="sellItem('${p._id}', ${p.quantity})" class="bg-orange-500 text-white px-3 py-1 rounded-lg text-[10px] font-black hover:bg-orange-600 shadow-md">
                    SELL
                </button>
                
                <button onclick="deleteItem('${p._id}')" class="text-slate-200 hover:text-red-500 transition ml-2"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
        `;
    }).join('');
}

// --- 8. SEARCH ---
function searchProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.sku && p.sku.toLowerCase().includes(query))
    );
    renderInventory(filtered);
}

// --- 9. STATS (50 ka limit) ---
function updateStats(data) {
    document.getElementById('stat-total').innerText = data.length;
    document.getElementById('stat-low').innerText = data.filter(p => p.quantity > 0 && p.quantity < 50).length;
    document.getElementById('stat-out').innerText = data.filter(p => p.quantity <= 0).length;
}

// --- 10. PRODUCT FORM (NEW) ---
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('pName').value,
        category: document.getElementById('pType').value,
        sku: document.getElementById('pSku').value,
        price: Number(document.getElementById('pPrice').value),
        quantity: Number(document.getElementById('pQty').value),
        location: 'WAREHOUSE' // Default location
    };
    
    await fetch(`${API_URL}/add`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify(data) 
    });
    toggleModal('productModal'); e.target.reset(); fetchAllData();
});

// --- 11. GPS UPDATE ---
async function updateGPS(id) {
    const loc = prompt("New Location:");
    if(loc) {
        await fetch(`${API_URL}/${id}`, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
            body: JSON.stringify({location: loc}) 
        });
        fetchAllData();
    }
}

// --- 12. EXPORT CSV ---
function exportInventory() {
    let csv = "Name,SKU,Price,Quantity,Location\n";
    allProducts.forEach(p => {
        csv += `${p.name},${p.sku},${p.price},${p.quantity},${p.location || 'Warehouse'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Inventory_Report.csv';
    a.click();
}

// --- 13. SUPPLIERS ---
async function fetchSuppliers() {
    const res = await fetch(SUPP_API, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    document.getElementById('supplier-table').innerHTML = data.map(s => `
        <tr class="border-b">
            <td class="p-4 font-bold text-slate-700">${s.name}</td>
            <td class="p-4 text-slate-500">${s.contact}</td>
            <td class="p-4"><span class="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">${s.category}</span></td>
            <td class="p-4 text-right"><button onclick="deleteSupp('${s._id}')" class="text-red-300 hover:text-red-600"><i class="fas fa-trash"></i></button></td>
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
    await fetch(`${SUPP_API}/add`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify(data) 
    });
    toggleModal('supplierModal'); e.target.reset(); fetchSuppliers();
});

// --- 14. UI CONTROLS ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if(id === 'suppliers-section') fetchSuppliers();
}

async function deleteItem(id) { if(confirm('Delete Product?')) { await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); fetchAllData(); } }
async function deleteSupp(id) { if(confirm('Remove Supplier?')) { await fetch(`${SUPP_API}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); fetchSuppliers(); } }
function toggleModal(id) { document.getElementById(id).classList.toggle('hidden'); }

document.addEventListener('DOMContentLoaded', fetchAllData);