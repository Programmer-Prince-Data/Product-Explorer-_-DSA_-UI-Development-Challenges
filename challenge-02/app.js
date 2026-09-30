// UI code: reads the dropdown, calls getTopK from popular.js, draws the cards

const allProducts = getAllProducts();

function formatPrice(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function viewProduct(p) {
  alert(p.name + "\nBrand: " + p.brand + "\nPrice: " + formatPrice(p.price) +
        "\nRating: " + p.rating + "\nReviews: " + p.reviews + "\nStock: " + p.stock);
}

function showPopular(k) {
  const container = document.getElementById("popularResults");
  container.innerHTML = "";

  const top = getTopK(allProducts, k);
  if (top.length === 0) {
    container.innerHTML = "<p class='empty'>No products available.</p>";
    return;
  }

  const bestScore = top[0].score;
  top.forEach(function (entry, index) {
    const p = entry.product;
    const percent = Math.round((entry.score / bestScore) * 100);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML =
      "<p><b>#" + (index + 1) + "</b></p>" +
      "<h3>" + p.name + "</h3>" +
      "<p class='price'>" + formatPrice(p.price) + "</p>" +
      "<p>" + "⭐".repeat(Math.round(p.rating)) + " " + p.rating + "</p>" +
      "<p>" + p.reviews + " reviews</p>" +
      "<p>Popularity: " + Math.round(entry.score) + "</p>" +
      "<div style='background:#ddd;height:8px;margin-bottom:6px;'>" +
      "<div style='background:orange;height:8px;width:" + percent + "%;'></div></div>";

    const btn = document.createElement("button");
    btn.textContent = "View Product";
    btn.addEventListener("click", function () { viewProduct(p); });
    card.appendChild(btn);
    container.appendChild(card);
  });
}

// Changing the dropdown redraws the cards - no page reload
document.getElementById("topK").addEventListener("change", function (e) {
  showPopular(Number(e.target.value));
});

showPopular(Number(document.getElementById("topK").value));
