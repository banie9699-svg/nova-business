(() => {
  const $ = (id) => document.getElementById(id);

  const itemsBody = $("itemsBody");
  const currencySymbols = { INR: "₹", USD: "$", EUR: "€" };

  function todayValue() {
    const date = new Date();
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value + "T00:00:00");
    return date.toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });
  }

  function money(value) {
    const symbol = currencySymbols[$("currency").value] || "₹";
    return symbol + Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function addItem(name = "", quantity = 1, rate = 0) {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    const nameInput = document.createElement("input");
    nameInput.className = "item-name";
    nameInput.type = "text";
    nameInput.placeholder = "Product / service";
    nameInput.value = name;
    nameCell.appendChild(nameInput);

    const qtyCell = document.createElement("td");
    const qtyInput = document.createElement("input");
    qtyInput.className = "item-number";
    qtyInput.type = "number";
    qtyInput.min = "0";
    qtyInput.step = "any";
    qtyInput.value = quantity;
    qtyCell.appendChild(qtyInput);

    const rateCell = document.createElement("td");
    const rateInput = document.createElement("input");
    rateInput.className = "item-number";
    rateInput.type = "number";
    rateInput.min = "0";
    rateInput.step = "any";
    rateInput.value = rate;
    rateCell.appendChild(rateInput);

    const amountCell = document.createElement("td");
    amountCell.className = "item-amount";
    amountCell.textContent = money(quantity * rate);

    const actionCell = document.createElement("td");
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-item";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", "Remove item");
    actionCell.appendChild(removeButton);

    row.append(nameCell, qtyCell, rateCell, amountCell, actionCell);
    itemsBody.appendChild(row);

    [nameInput, qtyInput, rateInput].forEach(input => {
      input.addEventListener("input", updateInvoice);
    });

    removeButton.addEventListener("click", () => {
      if (itemsBody.children.length > 1) {
        row.remove();
        updateInvoice();
      } else {
        nameInput.value = "";
        qtyInput.value = "1";
        rateInput.value = "0";
        updateInvoice();
      }
    });

    updateInvoice();
  }

  function updateInvoice() {
    let subtotal = 0;
    const previewItems = $("previewItems");
    previewItems.replaceChildren();

    Array.from(itemsBody.children).forEach(row => {
      const name = row.querySelector(".item-name").value.trim() || "Item";
      const qty = Math.max(0, Number(row.querySelectorAll("input")[1].value) || 0);
      const rate = Math.max(0, Number(row.querySelectorAll("input")[2].value) || 0);
      const amount = qty * rate;
      subtotal += amount;
      row.querySelector(".item-amount").textContent = money(amount);

      const previewRow = document.createElement("tr");
      [name, String(qty), money(rate), money(amount)].forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value;
        previewRow.appendChild(cell);
      });
      previewItems.appendChild(previewRow);
    });

    const discount = Math.max(0, Number($("discount").value) || 0);
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxRate = Math.min(100, Math.max(0, Number($("taxRate").value) || 0));
    const tax = taxableAmount * taxRate / 100;
    const total = taxableAmount + tax;

    $("previewSubtotal").textContent = money(subtotal);
    $("previewDiscount").textContent = money(discount);
    $("previewTax").textContent = money(tax);
    $("previewTotal").textContent = money(total);

    $("previewBusiness").textContent = $("businessName").value.trim() || "Your Business";
    $("previewBusinessDetails").textContent = [
      $("businessEmail").value,
      $("businessPhone").value,
      $("businessAddress").value
    ].filter(Boolean).join("\n") || "Business email and address";

    $("previewCustomer").textContent = $("customerName").value.trim() || "Customer Name";
    $("previewCustomerDetails").textContent = [
      $("customerEmail").value,
      $("customerAddress").value
    ].filter(Boolean).join("\n") || "Customer address and email";

    $("previewNumber").textContent = $("invoiceNumber").value || "—";
    $("previewDate").textContent = formatDate($("invoiceDate").value);
    $("previewDue").textContent = formatDate($("dueDate").value);
    $("previewNotes").textContent = $("notes").value || "Thank you for your business!";
  }

  function resetForm() {
    if (!confirm("Reset all invoice details?")) return;

    [
      "businessName", "businessEmail", "businessPhone", "businessAddress",
      "customerName", "customerEmail", "customerAddress", "notes"
    ].forEach(id => $(id).value = "");

    $("invoiceNumber").value = "NB-" + Date.now().toString().slice(-6);
    $("invoiceDate").value = todayValue();
    $("dueDate").value = "";
    $("taxRate").value = "18";
    $("discount").value = "0";
    $("currency").value = "INR";
    itemsBody.replaceChildren();
    addItem();
    updateInvoice();
  }

  $("addItemBtn").addEventListener("click", () => addItem());
  $("printBtn").addEventListener("click", () => window.print());
  $("printBtnBottom").addEventListener("click", () => window.print());
  $("resetBtn").addEventListener("click", resetForm);

  [
    "businessName", "businessEmail", "businessPhone", "businessAddress",
    "customerName", "customerEmail", "customerAddress",
    "invoiceNumber", "invoiceDate", "dueDate",
    "taxRate", "discount", "notes", "currency"
  ].forEach(id => {
    $(id).addEventListener("input", updateInvoice);
    $(id).addEventListener("change", updateInvoice);
  });

  $("invoiceNumber").value = "NB-" + Date.now().toString().slice(-6);
  $("invoiceDate").value = todayValue();
  addItem("Website Design", 1, 1999);
  addItem("Logo Design", 1, 799);
  updateInvoice();
})();
