/* ============================================
   Simple Store Logic (Final Version)
   ============================================ */

// ---- Local JSON Storage ----
const DB = {
  getAll(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  },

  save(key, item) {
    const data = this.getAll(key);

    item.id = Date.now();
    item.date = new Date().toLocaleString();

    data.push(item);
    localStorage.setItem(key, JSON.stringify(data));

    return item;
  }
};


// ---- Load Page ----
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  setupOrderModal();
});


// ===============================
// LOAD PRODUCTS
// ===============================
function loadProducts() {
  const grid = document.getElementById('dynamicProducts');
  if (!grid) return;

  fetch('products.json')
    .then(res => res.json())
    .then(products => {
      grid.innerHTML = "";

      products.forEach(p => {
        grid.innerHTML += `
          <div class="product-card">
            <h3>${p.name}</h3>
            <p>${p.price}$</p>
            <p>${p.description}</p>

            <button onclick="openOrderModal(${p.id}, '${p.name}', '${p.price}')">
              Order Now
            </button>
          </div>
        `;
      });
    });
}


// ===============================
// ORDER MODAL
// ===============================
function setupOrderModal() {
  const overlay = document.getElementById('orderModal');
  const closeBtn = document.getElementById('modalClose');
  const orderForm = document.getElementById('orderForm');

  if (!overlay || !orderForm) return;

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('open');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
    }
  });

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const order = {
      productId: document.getElementById('orderProductId').value,
      productName: document.getElementById('orderProductName').value,
      productPrice: document.getElementById('orderProductPrice').value,
      quantity: document.getElementById('orderQty').value,
      customerName: document.getElementById('orderName').value.trim(),
      customerEmail: document.getElementById('orderEmail').value.trim(),
      customerPhone: document.getElementById('orderPhone').value.trim(),
      status: "Pending"
    };

    // validation
    clearErrors();

    let valid = true;

    if (!order.customerName) {
      showError('orderNameError', 'Name is required');
      valid = false;
    }

    if (!order.customerEmail) {
      showError('orderEmailError', 'Email is required');
      valid = false;
    } else if (!isEmail(order.customerEmail)) {
      showError('orderEmailError', 'Invalid email');
      valid = false;
    }

    if (!order.customerPhone) {
      showError('orderPhoneError', 'Phone is required');
      valid = false;
    }

    if (!valid) return;

 fetch("http://localhost:3000/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(order)
})
.then(res => res.json())
.then(data => {
  console.log("Saved in db.json:", data);
  showAlert('orderAlert', 'success', '✅ Order placed successfully!');
  orderForm.reset();
})
.catch(err => console.log(err));

    // SUCCESS
    showAlert('orderAlert', 'success', '✅ Order placed successfully!');

    orderForm.reset();

    setTimeout(() => {
      overlay.classList.remove('open');
    }, 1500);
  });
}


// ===============================
// OPEN MODAL
// ===============================
function openOrderModal(id, name, price) {
  document.getElementById("orderProductId").value = id;
  document.getElementById("orderProductName").value = name;
  document.getElementById("orderProductPrice").value = price;

  // 🔥 يظهر اسم المنتج في المودال
  document.getElementById("summaryName").textContent = name;
  document.getElementById("summaryPrice").textContent = price + "$";

  document.getElementById("orderModal").classList.add("open");
}


// ===============================
// HELPERS
// ===============================
function isEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
}

function showAlert(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'alert ' + type;
}


// ===============================
// EXPORT JSON
// ===============================
function exportJSON(key, filename) {
  const data = localStorage.getItem(key) || "[]";
  const blob = new Blob([data], { type: 'application/json' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}