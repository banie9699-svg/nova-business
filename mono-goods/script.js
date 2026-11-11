const cart = [];

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) existing.quantity++;
  else cart.push({name, price, quantity: 1});
  renderCart();
  document.getElementById("cart-count").textContent =
    cart.reduce((sum, item) => sum + item.quantity, 0);
}

function removeFromCart(name) {
  const index = cart.findIndex(item => item.name === name);
  if (index !== -1) cart.splice(index, 1);
  renderCart();
  document.getElementById("cart-count").textContent =
    cart.reduce((sum, item) => sum + item.quantity, 0);
}

function renderCart() {
  const container = document.getElementById("cart-items");
  if (!cart.length) {
    container.innerHTML = '<p class="empty-cart">Your bag is currently empty.</p>';
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <span>${item.name} × ${item.quantity}</span>
        <span>₹${(item.price * item.quantity).toLocaleString("en-IN")}
          <button onclick="removeFromCart('${item.name}')">Remove</button>
        </span>
      </div>
    `).join("");
  }
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById("cart-total").textContent = "₹" + total.toLocaleString("en-IN");
}

function toggleCart() {
  document.getElementById("cart-panel").classList.toggle("open");
  document.getElementById("cart-overlay").classList.toggle("open");
}
