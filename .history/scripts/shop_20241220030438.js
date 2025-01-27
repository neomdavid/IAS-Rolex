// Fetching watches from the backend API
async function fetchWatches() {
  try {
    const response = await fetch("http://localhost:3000/api/v1/watches"); // Replace with your backend endpoint
    const data = await response.json();

    if (response.ok) {
      console.log("Got the watches");
      renderWatches(data.watches); // Pass the watch data to the render function
    } else {
      console.error("Failed to fetch watches:", data.message);
    }
  } catch (error) {
    console.error("Error fetching watches:", error);
  }
}

// Render watches in the product grid
function renderWatches(watches) {
  const productGrid = document.getElementById("product-grid");
  productGrid.innerHTML = ""; // Clear any existing content

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  watches.forEach((watch) => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");
    productDiv.dataset.gender = watch.category; // Add gender category for filtering
    productDiv.dataset.id = watch._id;

    // Find if this watch is already in the cart
    const cartItem = cart.find((item) => item.watchId === watch._id);
    const quantityInCart = cartItem ? cartItem.quantity : 0; // Get the current quantity from the cart

    // Add product content
    productDiv.innerHTML = `
              <img crossorigin="anonymous" src="http://localhost:3000${
                watch.watchImage
              }" alt="${watch.name}">
              <h3>${watch.name}</h3>
              <p>Php ${watch.price.toLocaleString()}</p>
              <button class="add-to-cart" onclick="addToCart('${watch._id}', '${
      watch.name
    }', '${watch.watchImage}', ${watch.price})">
                  ${
                    quantityInCart > 0
                      ? `Added (${quantityInCart})`
                      : "Add to Cart"
                  }
              </button>
          `;
    productGrid.appendChild(productDiv);
  });

  // Update results count dynamically
  document.getElementById("product-count").textContent = watches.length;

  // Initialize category filter (show all watches)
  filterProducts("all"); // Show all initially
}

// Filter products based on the selected category (men, women, or all)
function filterProducts(filterValue) {
  const allProducts = document.querySelectorAll(".product");
  let visibleCount = 0;

  allProducts.forEach((product) => {
    const gender = product.getAttribute("data-gender"); // Get the gender from data attribute

    // Check if it matches the filter
    const isVisible = filterValue === "all" || filterValue === gender;

    // Toggle display based on match
    product.style.display = isVisible ? "block" : "none";
    if (isVisible) visibleCount++; // Track visible products
  });

  // Update results count dynamically
  const resultsCount = document.getElementById("results-count");
  resultsCount.textContent = `Showing 1–${visibleCount} of ${allProducts.length} results`;
}

// Event Listeners for Men/Women Tab Clicks
document.addEventListener("DOMContentLoaded", () => {
  const menTab = document.getElementById("men-tab");
  const womenTab = document.getElementById("women-tab");
  const allTab = document.getElementById("all-tab"); // Add a tab for all products if needed

  // Filter by Men
  if (menTab) {
    menTab.addEventListener("click", () => {
      filterProducts("men");
    });
  }

  // Filter by Women
  if (womenTab) {
    womenTab.addEventListener("click", () => {
      filterProducts("women");
    });
  }

  // Filter by All (optional)
  if (allTab) {
    allTab.addEventListener("click", () => {
      filterProducts("all");
    });
  }
});

// Function to update the cart item count in the header or a cart display element
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCountElement = document.getElementById("cart-count");
  if (cartCountElement) {
    // Total items in the cart, considering quantity
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.innerText = totalItems;
  }
}

// Function to add an item to the cart
async function addToCart(watchId, name, img, price, quantity = 1) {
  console.log(watchId, name, img, price, quantity);

  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check if the item already exists in the cart
    const existingItem = cart.find((item) => item.watchId === watchId);

    if (existingItem) {
      // If item already exists, increase the quantity
      existingItem.quantity += quantity;
    } else {
      // If it's a new item, add it to the cart
      const cartItem = { watchId, quantity, name, img, price };
      cart.push(cartItem);
    }

    // Save the updated cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    console.log("Item added to cart:", cart);

    // Send the request to the backend to add the product to the user's cart (optional if you're syncing with the backend)
    const cartData = { watchId, quantity, name, img, price };
    const response = await fetch(
      "http://localhost:3000/api/v1/carts/cart/items",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming authToken is stored in localStorage
        },
        body: JSON.stringify(cartData),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("Item added to cart successfully!");
    } else {
      console.error("Failed to add item to cart:", data.message);
    }

    // Update the cart count in the header
    updateCartCount();
    renderWatches(await fetchWatches()); // Re-fetch watches to update the "Add to Cart" button text
  } catch (error) {
    console.error("Error adding item to cart:", error);
  }
}

// Call this function when the page loads to set the initial cart count and fetch watches
window.onload = () => {
  updateCartCount();
  fetchWatches(); // Fetch watches when the page loads
};
