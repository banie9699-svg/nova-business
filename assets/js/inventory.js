const products = [
  { id: 1, name: "Wireless Headphones", sku: "WH-001", category: "Electronics", stock: 24, threshold: 5, price: 1499 },
  { id: 2, name: "Cotton T-Shirt", sku: "CT-002", category: "Clothing", stock: 4, threshold: 5, price: 499 },
  { id: 3, name: "Smart Watch", sku: "SW-003", category: "Electronics", stock: 12, threshold: 5, price: 2299 },
  { id: 4, name: "Premium Coffee", sku: "PC-004", category: "Food", stock: 0, threshold: 5, price: 299 },
  { id: 5, name: "Leather Wallet", sku: "LW-005", category: "Accessories", stock: 3, threshold: 5, price: 799 },
  { id: 6, name: "Bluetooth Speaker", sku: "BS-006", category: "Electronics", stock: 18, threshold: 5, price: 1199 }
];

const $ = id => document.getElementById(id);
const table = $("productTable");
const modal = $("productModal");
let nextId = 7;
let toastTimer;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

function getStatus(product) {
  if (product.stock === 0) return "out";
  if (product.stock <= product.threshold) return "low";
  return "in";
}

function updateStats() {
  const low = products.filter(p => getStatus(p) === "low");
  $("totalProducts").textContent = products.length;
  $("inStock").textContent = products.filter(p => getStatus(p) === "in").length;
  $("lowStock").textContent = low.length;
  $("outStock").textContent = products.filter(p => getStatus(p) === "out").length;
  $("productCount").textContent = products.length + (products.length === 1 ? " product" : " products");

  const alert = $("lowStockAlert");
  const unavailable = products.filter(p => getStatus(p) === "out").length;
  if (low.length || unavailable) {
    alert.classList.add("show");
    $("alertMessage").textContent =
      `${low.length} product(s) have low stock and ${unavailable} product(s) are out of stock.`;
  } else {
    alert.classList.remove("show");
  }
}

function renderProducts() {
  const search = $("searchInput").value.trim().toLowerCase();
  const category = $("categoryFilter").value;
  const status = $("statusFilter").value;

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search);
    const matchesCategory = category === "all" || p.category === category;
    const matchesStatus = status === "all" || getStatus(p) === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  table.textContent = "";

  filtered.forEach(p => {
    const state = getStatus(p);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><div class="product-name">${escapeHTML(p.name)}</div><div class="product-sub">Product ID: ${p.id}</div></td>
      <td>${escapeHTML(p.sku)}</td>
      <td>${escapeHTML(p.category)}</td>
      <td><span class="stock-number">${p.stock}</span> units</td>
      <td>₹${Number(p.price).toLocaleString("en-IN", {minimumFractionDigits: 2})}</td>
      <td><span class="status ${state}">${state === "in" ? "In Stock" : state === "low" ? "Low Stock" : "Out of Stock"}</span></td>
      <td>
        <div class="action-group">
          <button class="action-btn" data-action="edit" data-id="${p.id}">Edit</button>
          <button class="action-btn" data-action="stock" data-id="${p.id}">± Stock</button>
          <button class="action-btn delete" data-action="delete" data-id="${p.id}">Delete</button>
        </div>
      </td>`;
    table.appendChild(row);
  });

  $("emptyState").hidden = filtered.length !== 0;
  updateStats();
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function openModal(product = null) {
  $("productForm").reset();
  $("editId").value = product ? product.id : "";
  $("modalTitle").textContent = product ? "Edit Product" : "Add New Product";
  $("saveProductBtn").textContent = product ? "Update Product" : "Save Product";

  if (product) {
    $("productName").value = product.name;
    $("productSku").value = product.sku;
    $("productCategory").value = product.category;
    $("productStock").value = product.stock;
    $("productThreshold").value = product.threshold;
    $("productPrice").value = product.price;
  } else {
    $("productThreshold").value = 5;
  }
  modal.classList.add("show");
}

function closeModal() {
  modal.classList.remove("show");
}

$("addProductBtn").addEventListener("click", () => openModal());
$("closeModal").addEventListener("click", closeModal);
$("cancelModal").addEventListener("click", closeModal);

modal.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});

$("productForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = $("editId").value;
  const sku = $("productSku").value.trim();
  const duplicate = products.some(p => p.sku.toLowerCase() === sku.toLowerCase() && String(p.id) !== id);

  if (duplicate) {
    showToast("This SKU already exists. Please use another SKU.");
    return;
  }

  const product = {
    id: id ? Number(id) : nextId++,
    name: $("productName").value.trim(),
    sku,
    category: $("productCategory").value,
    stock: Number($("productStock").value),
    threshold: Number($("productThreshold").value),
    price: Number($("productPrice").value)
  };

  if (!product.name || !product.sku || !product.category ||
      !Number.isInteger(product.stock) || product.stock < 0 ||
      !Number.isInteger(product.threshold) || product.threshold < 0 ||
      !Number.isFinite(product.price) || product.price < 0) {
    showToast("Please enter valid product details.");
    return;
  }

  if (id) {
    const index = products.findIndex(p => p.id === Number(id));
    if (index !== -1) products[index] = product;
    showToast("Product updated successfully.");
  } else {
    products.push(product);
    showToast("New product added successfully.");
  }

  closeModal();
  renderProducts();
});

table.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const product = products.find(p => p.id === id);
  if (!product) return;

  if (button.dataset.action === "edit") {
    openModal(product);
  }

  if (button.dataset.action === "delete") {
    if (confirm(`Delete "${product.name}" from inventory?`)) {
      products.splice(products.indexOf(product), 1);
      renderProducts();
      showToast("Product deleted.");
    }
  }

  if (button.dataset.action === "stock") {
    const amount = prompt(`Current stock: ${product.stock}\nEnter stock change (e.g. 10 to add, -2 to remove):`);
    if (amount === null || amount.trim() === "") return;

    const change = Number(amount);
    if (!Number.isInteger(change) || product.stock + change < 0) {
      showToast("Enter a valid stock change. Stock cannot go below zero.");
      return;
    }

    product.stock += change;
    renderProducts();
    showToast("Stock quantity updated.");
  }
});

$("searchInput").addEventListener("input", renderProducts);
$("categoryFilter").addEventListener("change", renderProducts);
$("statusFilter").addEventListener("change", renderProducts);

$("menuBtn").addEventListener("click", () => {
  $("sidebar").classList.toggle("open");
  $("overlay").classList.toggle("show");
});
$("overlay").addEventListener("click", () => {
  $("sidebar").classList.remove("open");
  $("overlay").classList.remove("show");
});

renderProducts();
