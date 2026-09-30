// UI code: reads inputs, calls the functions in finder.js, draws the results

const sortedProducts = sortByPrice(getAllProducts());
const CLOSEST_COUNT = 3;

function formatPrice(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function viewProduct(p) {
  alert(p.name + "\nBrand: " + p.brand + "\nPrice: " + formatPrice(p.price) +
        "\nRating: " + p.rating + "\nStock: " + p.stock);
}

function createCard(p) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML =
    "<h3>" + p.name + "</h3>" +
    "<p class='price'>" + formatPrice(p.price) + "</p>" +
    "<p>Brand: " + p.brand + "</p>" +
    "<p>Rating: " + p.rating + " / 5</p>";
  const btn = document.createElement("button");
  btn.textContent = "View Product";
  btn.addEventListener("click", function () { viewProduct(p); });
  card.appendChild(btn);
  return card;
}

function showCards(container, products) {
  container.innerHTML = "";
  if (products.length === 0) {
    container.innerHTML = "<p class='empty'>No products found.</p>";
    return;
  }
  products.forEach(function (p) { container.appendChild(createCard(p)); });
}

document.getElementById("searchBtn").addEventListener("click", function () {
  const value = document.getElementById("targetPrice").value;
  const error = document.getElementById("targetError");
  const target = Number(value);
  if (value === "" || isNaN(target) || target < 0) {
    error.textContent = "Please enter a valid price (0 or more).";
    return;
  }
  error.textContent = "";
  showCards(document.getElementById("closestResults"), findClosest(sortedProducts, target, CLOSEST_COUNT));
});

document.getElementById("rangeBtn").addEventListener("click", function () {
  const minValue = document.getElementById("minPrice").value;
  const maxValue = document.getElementById("maxPrice").value;
  const error = document.getElementById("rangeError");
  const min = Number(minValue), max = Number(maxValue);
  if (minValue === "" || maxValue === "" || isNaN(min) || isNaN(max) || min < 0) {
    error.textContent = "Please enter both a valid min and max price.";
    return;
  }
  if (min > max) {
    error.textContent = "Min price cannot be greater than max price.";
    return;
  }
  error.textContent = "";
  const found = findInRange(sortedProducts, min, max);
  document.getElementById("rangeCount").textContent = found.length + " product(s) found";
  showCards(document.getElementById("rangeResults"), found);
});
