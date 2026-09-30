/*
  Challenge 3 - Recently Viewed Products (logic only, no DOM code here)

  Initial Approach: plain array. On view: indexOf to find it, splice it out, unshift to the
  front, pop if the length is over 5.
    Time: O(h) per view (h = history size)      Space: O(h)

  Optimized Approach: a Map (hash table that remembers insertion order).
  has / delete / set are O(1), and the oldest entry is simply the first key.
    Time: O(1) per view      Space: O(h)

  When a 6th different product is viewed, the oldest one is removed.
*/

const MAX_HISTORY = 5;
const viewHistory = new Map();   // productId -> product

function getAllProducts() {
  const all = [];
  storeData.categories.forEach(function (cat) {
    cat.subcategories.forEach(function (sub) {
      sub.products.forEach(function (p) { all.push(p); });
    });
  });
  return all;
}

function addToHistory(product) {
  if (viewHistory.has(product.id)) {
    viewHistory.delete(product.id);       // remove the old position
  }
  viewHistory.set(product.id, product);   // adding again = newest position

  if (viewHistory.size > MAX_HISTORY) {
    const oldestId = viewHistory.keys().next().value;
    viewHistory.delete(oldestId);
  }
}

function removeFromHistory(productId) {
  viewHistory.delete(productId);
}

function clearHistory() {
  viewHistory.clear();
}

// Newest first
function getHistory() {
  return Array.from(viewHistory.values()).reverse();
}
