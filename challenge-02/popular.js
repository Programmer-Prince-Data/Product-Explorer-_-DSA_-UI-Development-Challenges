/*
  Challenge 2 - Top K Popular Products (logic only, no DOM code here)

  Initial Approach: score every product, fully sort, take the first K.
    Time: O(n log n)      Space: O(n)

  Optimized Approach: a min-heap that never holds more than K items. For each product,
  compare with the heap top (the weakest of the current best K) and replace it only if
  the new product is better.
    Time: O(n log k)      Space: O(k)

  (With only 15 products you won't feel the difference. It matters at 1,000,000 products.)
*/

function getAllProducts() {
  const all = [];
  storeData.categories.forEach(function (cat) {
    cat.subcategories.forEach(function (sub) {
      sub.products.forEach(function (p) { all.push(p); });
    });
  });
  return all;
}

function getPopularity(product) {
  return product.rating * product.reviews;
}

// Min-heap: the LOWEST score is always at index 0
class MinHeap {
  constructor() { this.items = []; }
  size() { return this.items.length; }
  peek() { return this.items[0]; }

  push(item) {
    this.items.push(item);
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.items[parent].score <= this.items[i].score) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  pop() {
    const top = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0) {
      this.items[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  siftDown(i) {
    const n = this.items.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1, right = 2 * i + 2;
      if (left < n && this.items[left].score < this.items[smallest].score) smallest = left;
      if (right < n && this.items[right].score < this.items[smallest].score) smallest = right;
      if (smallest === i) break;
      this.swap(i, smallest);
      i = smallest;
    }
  }

  swap(a, b) {
    const temp = this.items[a];
    this.items[a] = this.items[b];
    this.items[b] = temp;
  }
}

// Returns [{product, score}, ...] best first
function getTopK(products, k) {
  if (k <= 0) return [];
  const heap = new MinHeap();

  products.forEach(function (product) {
    const score = getPopularity(product);
    if (heap.size() < k) {
      heap.push({ product: product, score: score });
    } else if (score > heap.peek().score) {
      heap.pop();                                    // remove the weakest
      heap.push({ product: product, score: score });
    }
  });

  const result = [];
  while (heap.size() > 0) result.push(heap.pop());   // smallest comes out first
  return result.reverse();                           // so flip it: best first
}
