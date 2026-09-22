const allProducts = [];
storeData.categories.forEach(cat=>cat.subcategories.forEach(sub=>sub.products.forEach(p=>allProducts.push(p))));
const productById = new Map(allProducts.map(p=>[p.id,p]));
const EMOJI = {Laptops:"\u{1F4BB}",Mobiles:"\u{1F4F1}",Accessories:"\u{1F3A7}",Programming:"\u{1F4D8}",DSA:"\u{1F4D8}","Gaming Accessories":"\u{1F3AE}"};
const iconFor = p => EMOJI[p.subcategory] || "\u{1F4E6}";
const money = n => "Rs " + n.toLocaleString("en-IN");

/* ================= Recently Viewed (Map = fast lookup + keeps order) ================= */
const RV_LIMIT = 5;
const recentMap = new Map(); // key/value = product id; Map keeps insertion order

function viewProduct(id){
  if (recentMap.has(id)) recentMap.delete(id); // take out old spot
  recentMap.set(id, id);                       // put it back at the end = most recent
  if (recentMap.size > RV_LIMIT){
    const oldest = recentMap.keys().next().value; // first key = oldest one
    recentMap.delete(oldest);
  }
  renderRecentlyViewed();
}

function renderRecentlyViewed(){
  const area = document.getElementById("rvArea");
  const ids = [...recentMap.keys()].reverse(); // newest first
  if (ids.length === 0){
    area.innerHTML = '<div class="empty-state">No products viewed yet. Click "View Product" to see it here.</div>';
    return;
  }
  let html = "";
  ids.forEach(id=>{
    const p = productById.get(id);
    html += `<div class="rv-card" data-id="${p.id}">
      <div class="icon">${iconFor(p)}</div>
      <div class="name">${p.name}</div>
      <div class="price">${money(p.price)}</div>
    </div>`;
  });
  area.innerHTML = html;
  document.querySelectorAll(".rv-card").forEach(el=>{
    el.addEventListener("click", ()=> openModal(el.dataset.id));
  });
}

document.getElementById("clearRv").addEventListener("click", function(){
  recentMap.clear();
  renderRecentlyViewed();
});

/* ================= Browse / Filter ================= */
let activeCat = "all";

function renderTabs(){
  const tabs = document.getElementById("tabs");
  const cats = ["all"].concat(storeData.categories.map(c=>c.name));
  let html = "";
  cats.forEach(c=>{
    const label = c === "all" ? "All" : c;
    const activeClass = c === activeCat ? "active" : "";
    html += `<button class="${activeClass}" data-c="${c}">${label}</button>`;
  });
  tabs.innerHTML = html;
  tabs.querySelectorAll("button").forEach(b=>{
    b.addEventListener("click", function(){
      activeCat = b.dataset.c;
      renderTabs();
      renderGrid();
    });
  });
}

function renderGrid(){
  const grid = document.getElementById("grid");
  let list = allProducts;
  if (activeCat !== "all"){
    list = allProducts.filter(p => p.category === activeCat);
  }
  let html = "";
  list.forEach(p=>{
    const stockClass = p.stock < 6 ? "low" : "";
    const stockText = p.stock < 6 ? ("Only " + p.stock + " left") : ("In stock (" + p.stock + ")");
    const origHtml = p.originalPrice > p.price ? `<span class="orig">${money(p.originalPrice)}</span>` : "";
    html += `<div class="card">
      <div class="icon">${iconFor(p)}</div>
      <div class="brand">${p.brand}</div>
      <div class="name">${p.name}</div>
      <div><span class="price">${money(p.price)}</span>${origHtml}</div>
      <div class="rating">Rating: ${p.rating} (${p.reviews} reviews)</div>
      <div class="stock ${stockClass}">${stockText}</div>
      <button class="btn-view" data-view="${p.id}">View Product</button>
      <button class="btn-add" data-add="${p.id}">Add to Cart</button>
    </div>`;
  });
  grid.innerHTML = html;
  grid.querySelectorAll("[data-view]").forEach(b=>{
    b.addEventListener("click", ()=> openModal(b.dataset.view));
  });
  grid.querySelectorAll("[data-add]").forEach(b=>{
    b.addEventListener("click", ()=> addToCart(b.dataset.add));
  });
}

/* ================= Product Modal ================= */
const overlay = document.getElementById("modalOverlay");

function openModal(id){
  const p = productById.get(id);
  viewProduct(id); // this counts as "viewing" the product

  let specsHtml = "";
  for (const key in p.specifications){
    specsHtml += `<tr><td>${key}</td><td>${p.specifications[key]}</td></tr>`;
  }

  let tagsHtml = "";
  p.tags.forEach(t => tagsHtml += `<span>#${t}</span>`);

  const origHtml = p.originalPrice > p.price ? `<span class="orig">${money(p.originalPrice)}</span>` : "";

  document.getElementById("modalBody").innerHTML = `
    <button id="modalClose">X</button>
    <div class="icon">${iconFor(p)}</div>
    <div class="brand">${p.brand}</div>
    <h2 style="border:none; margin:5px 0;">${p.name}</h2>
    <div><span class="price">${money(p.price)}</span>${origHtml}</div>
    <div class="rating">Rating: ${p.rating} - ${p.reviews} reviews</div>
    <div class="stock">In stock: ${p.stock}</div>
    <table class="spec-table">${specsHtml}</table>
    <div class="tags">${tagsHtml}</div>
    <button id="modalAdd">Add to Cart</button>
  `;

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalAdd").addEventListener("click", ()=> addToCart(p.id));
  overlay.classList.add("open");
}

function closeModal(){
  overlay.classList.remove("open");
}
overlay.addEventListener("click", function(e){
  if (e.target === overlay) closeModal();
});

/* ================= Cart with Undo/Redo (saves a snapshot after every action) ================= */
let history = [[]];       // list of past cart states
let historyIndex = 0;     // which state we are currently looking at

function currentCart(){
  return history[historyIndex];
}

function commit(newState){
  history = history.slice(0, historyIndex + 1); // throw away any "redo" states
  history.push(newState);
  historyIndex++;
  renderCart();
}

function cloneCart(){
  return currentCart().map(row => ({ id: row.id, qty: row.qty }));
}

function addToCart(id){
  const next = cloneCart();
  const row = next.find(r => r.id === id);
  if (row){
    row.qty++;
  } else {
    next.push({ id: id, qty: 1 });
  }
  commit(next);
}

function removeFromCart(id){
  const next = cloneCart().filter(r => r.id !== id);
  commit(next);
}

function changeQty(id, delta){
  const next = cloneCart();
  const row = next.find(r => r.id === id);
  if (!row) return;
  row.qty += delta;
  if (row.qty <= 0){
    commit(next.filter(r => r.id !== id));
  } else {
    commit(next);
  }
}

function undo(){
  if (historyIndex > 0){
    historyIndex--;
    renderCart();
  }
}
function redo(){
  if (historyIndex < history.length - 1){
    historyIndex++;
    renderCart();
  }
}

function renderCart(){
  const cart = currentCart();
  const itemsEl = document.getElementById("cartItems");

  let count = 0;
  let total = 0;
  cart.forEach(r=>{
    count += r.qty;
    total += r.qty * productById.get(r.id).price;
  });

  document.getElementById("itemCount").textContent = count;
  document.getElementById("cartTotal").textContent = money(total);

  const badge = document.getElementById("cartBadge");
  if (count > 0){
    badge.style.display = "inline";
    badge.textContent = count;
  } else {
    badge.style.display = "none";
  }

  if (cart.length === 0){
    itemsEl.innerHTML = '<div class="empty-state">Your cart is empty.</div>';
  } else {
    let html = "";
    cart.forEach(r=>{
      const p = productById.get(r.id);
      html += `<div class="cart-row">
        <div class="icon">${iconFor(p)}</div>
        <div class="info">
          <div class="n">${p.name}</div>
          <div>${money(p.price)}</div>
        </div>
        <div class="qty">
          <button data-dec="${p.id}">-</button>
          <span>${r.qty}</span>
          <button data-inc="${p.id}">+</button>
        </div>
        <button class="rm" data-rm="${p.id}">X</button>
      </div>`;
    });
    itemsEl.innerHTML = html;

    itemsEl.querySelectorAll("[data-inc]").forEach(b=>{
      b.addEventListener("click", ()=> changeQty(b.dataset.inc, 1));
    });
    itemsEl.querySelectorAll("[data-dec]").forEach(b=>{
      b.addEventListener("click", ()=> changeQty(b.dataset.dec, -1));
    });
    itemsEl.querySelectorAll("[data-rm]").forEach(b=>{
      b.addEventListener("click", ()=> removeFromCart(b.dataset.rm));
    });
  }

  document.getElementById("undoBtn").disabled = (historyIndex === 0);
  document.getElementById("redoBtn").disabled = (historyIndex === history.length - 1);
}

document.getElementById("undoBtn").addEventListener("click", undo);
document.getElementById("redoBtn").addEventListener("click", redo);

document.getElementById("cartToggle").addEventListener("click", function(){
  document.getElementById("cartPanel").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
});
function closeCart(){
  document.getElementById("cartPanel").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
}
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("cartOverlay").addEventListener("click", closeCart);

/* ---------- start everything ---------- */
renderTabs();
renderGrid();
renderRecentlyViewed();
renderCart();
