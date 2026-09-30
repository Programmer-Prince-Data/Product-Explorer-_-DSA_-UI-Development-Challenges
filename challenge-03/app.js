// UI code: draws the product list, the history row and the modal

const allProducts = getAllProducts();

function formatPrice(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function openModal(product) {
  document.getElementById("modalTitle").textContent = product.name;
  let html =
    "<p class='price'>" + formatPrice(product.price) + "</p>" +
    "<p>Brand: " + product.brand + "</p>" +
    "<p>Rating: " + product.rating + " (" + product.reviews + " reviews)</p>" +
    "<p>Stock: " + product.stock + "</p><ul>";
  for (const key in product.specifications) {
    html += "<li>" + key + ": " + product.specifications[key] + "</li>";
  }
  html += "</ul>";
  document.getElementById("modalBody").innerHTML = html;
  document.getElementById("modalOverlay").style.display = "block";
}

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
}

// Every "View" button calls this
function handleView(product) {
  addToHistory(product);
  renderHistory();
  openModal(product);
}

function renderHistory() {
  const row = document.getElementById("historyRow");
  const items = getHistory();
  row.innerHTML = "";
  document.getElementById("clearHistoryBtn").disabled = items.length === 0;

  if (items.length === 0) {
    row.innerHTML = "<p class='empty'>You haven't viewed any products yet.</p>";
    return;
  }

  items.forEach(function (p) {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = "<p><b>" + p.name + "</b></p><p>" + formatPrice(p.price) + "</p>";

    const viewBtn = document.createElement("button");
    viewBtn.textContent = "View";
    viewBtn.addEventListener("click", function () { handleView(p); });

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", function () {
      removeFromHistory(p.id);
      renderHistory();
    });

    item.appendChild(viewBtn);
    item.appendChild(removeBtn);
    row.appendChild(item);
  });
}

function renderProducts() {
  const list = document.getElementById("productList");
  allProducts.forEach(function (p) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML =
      "<h3>" + p.name + "</h3>" +
      "<p class='price'>" + formatPrice(p.price) + "</p>" +
      "<p>Brand: " + p.brand + "</p>" +
      "<p>Rating: " + p.rating + " / 5</p>";
    const btn = document.createElement("button");
    btn.textContent = "View Product";
    btn.addEventListener("click", function () { handleView(p); });
    card.appendChild(btn);
    list.appendChild(card);
  });
}

document.getElementById("clearHistoryBtn").addEventListener("click", function () {
  clearHistory();
  renderHistory();
});
document.getElementById("closeModalBtn").addEventListener("click", closeModal);
document.getElementById("modalOverlay").addEventListener("click", function (e) {
  if (e.target.id === "modalOverlay") closeModal();   // click outside the box
});

renderProducts();
renderHistory();
