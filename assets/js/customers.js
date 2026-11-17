const rows = document.getElementById("customerRows");
const search = document.getElementById("customerSearch");
const filter = document.getElementById("statusFilter");
const modal = document.getElementById("customerModal");
const form = document.getElementById("customerForm");

let customers = [
  { id: 1, name: "Rahul Sharma", business: "Sharma Traders", email: "rahul@example.com", phone: "+91 98765 43210", status: "Active" },
  { id: 2, name: "Priya Verma", business: "PV Enterprises", email: "priya@example.com", phone: "+91 98765 12345", status: "Active" },
  { id: 3, name: "Amit Kumar", business: "Amit Electronics", email: "amit@example.com", phone: "+91 98765 67890", status: "New" }
];

let nextId = 4;

function renderCustomers() {
  const query = search.value.trim().toLowerCase();
  const selectedStatus = filter.value;

  const visible = customers.filter(customer => {
    const matchesQuery = [
      customer.name, customer.business, customer.email, customer.phone
    ].join(" ").toLowerCase().includes(query);

    const matchesStatus = selectedStatus === "all" || customer.status === selectedStatus;
    return matchesQuery && matchesStatus;
  });

  rows.innerHTML = "";

  visible.forEach(customer => {
    const tr = document.createElement("tr");

    const nameCell = document.createElement("td");
    const nameWrap = document.createElement("div");
    nameWrap.className = "customer-name";

    const avatar = document.createElement("span");
    avatar.className = "customer-avatar";
    avatar.textContent = customer.name.trim().charAt(0).toUpperCase();

    const details = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = customer.name;
    const label = document.createElement("small");
    label.textContent = "Customer";
    details.append(name, label);
    nameWrap.append(avatar, details);
    nameCell.append(nameWrap);

    const businessCell = document.createElement("td");
    businessCell.textContent = customer.business || "—";

    const emailCell = document.createElement("td");
    emailCell.textContent = customer.email;

    const phoneCell = document.createElement("td");
    phoneCell.textContent = customer.phone || "—";

    const statusCell = document.createElement("td");
    const status = document.createElement("span");
    status.className = "status-pill status-" + customer.status;
    status.textContent = customer.status;
    statusCell.append(status);

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.className = "action-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "Remove";
    deleteButton.addEventListener("click", () => {
      customers = customers.filter(item => item.id !== customer.id);
      renderCustomers();
    });
    actionCell.append(deleteButton);

    tr.append(nameCell, businessCell, emailCell, phoneCell, statusCell, actionCell);
    rows.append(tr);
  });

  document.getElementById("emptyState").hidden = visible.length !== 0;
  document.getElementById("resultCount").textContent =
    `Showing ${visible.length} of ${customers.length} customers`;

  document.getElementById("totalCount").textContent = customers.length;
  document.getElementById("activeCount").textContent =
    customers.filter(c => c.status === "Active").length;
  document.getElementById("newCount").textContent =
    customers.filter(c => c.status === "New").length;
}

function openModal() {
  form.reset();
  document.getElementById("modalMessage").textContent = "";
  modal.hidden = false;
  document.getElementById("customerName").focus();
}

function closeModal() {
  modal.hidden = true;
}

document.getElementById("addCustomerBtn").addEventListener("click", openModal);
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelModal").addEventListener("click", closeModal);

modal.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

search.addEventListener("input", renderCustomers);
filter.addEventListener("change", renderCustomers);

form.addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("customerName").value.trim();
  const business = document.getElementById("customerBusiness").value.trim();
  const email = document.getElementById("customerEmail").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const status = document.getElementById("customerStatus").value;

  if (!name || !email) return;

  const duplicate = customers.some(c => c.email.toLowerCase() === email.toLowerCase());

  if (duplicate) {
    document.getElementById("modalMessage").textContent =
      "A customer with this email already exists in this demo list.";
    return;
  }

  customers.push({ id: nextId++, name, business, email, phone, status });
  renderCustomers();
  closeModal();
});

document.getElementById("year").textContent = new Date().getFullYear();

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

document.getElementById("menuBtn").addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
});

renderCustomers();
