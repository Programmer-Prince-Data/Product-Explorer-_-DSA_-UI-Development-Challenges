/*
  Challenge 1 - Smart Price Finder (logic only, no DOM code here)

  Initial Approach: loop over every product, compute |price - target|, sort by that, take 3.
    Time: O(n log n) per search      Space: O(n)

  Optimized Approach: sort by price ONCE, then binary search for the target and walk
  left/right to collect the closest k. A range search = two binary searches + slice.
    Time: sort once O(n log n); each search O(log n + k)     Space: O(n)
*/

// Go through categories -> subcategories -> products and collect everything
function getAllProducts() {
  const all = [];
  storeData.categories.forEach(function (cat) {
    cat.subcategories.forEach(function (sub) {
      sub.products.forEach(function (p) { all.push(p); });
    });
  });
  return all;
}

function sortByPrice(products) {
  return products.slice().sort(function (a, b) { return a.price - b.price; });
}

// Index of the first product with price >= target
function lowerBound(sorted, target) {
  let low = 0, high = sorted.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (sorted[mid].price < target) low = mid + 1;
    else high = mid;
  }
  return low;
}

// Index of the first product with price > target
function upperBound(sorted, target) {
  let low = 0, high = sorted.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (sorted[mid].price <= target) low = mid + 1;
    else high = mid;
  }
  return low;
}

// k products closest to target
function findClosest(sorted, target, k) {
  const result = [];
  let right = lowerBound(sorted, target);
  let left = right - 1;
  while (result.length < k && (left >= 0 || right < sorted.length)) {
    const leftGap = left >= 0 ? Math.abs(sorted[left].price - target) : Infinity;
    const rightGap = right < sorted.length ? Math.abs(sorted[right].price - target) : Infinity;
    if (leftGap <= rightGap) { result.push(sorted[left]); left--; }
    else { result.push(sorted[right]); right++; }
  }
  return result.sort(function (a, b) { return a.price - b.price; });
}

// Every product with min <= price <= max
function findInRange(sorted, min, max) {
  return sorted.slice(lowerBound(sorted, min), upperBound(sorted, max));
}
