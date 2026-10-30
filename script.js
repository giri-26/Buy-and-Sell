// =====================================
// RESELL MARKETPLACE
// =====================================

// Default product images are remote image URLs.
// Users can enter their own image URL when posting an ad.

const fallbackImage =
    "https://placehold.co/600x400/e9eef2/176b87?text=Product+Image";

const sampleProducts = [
    {
        id: 101,
        name: "iPhone 13",
        price: 28000,
        category: "Mobiles",
        condition: "Good",
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
        description: "Pre-owned smartphone in good working condition.",
        location: "Chennai, Tamil Nadu",
        date: "2026-10-20",
        phone: "",
        owner: "sample"
    },
    {
        id: 102,
        name: "Dell Laptop",
        price: 32000,
        category: "Electronics",
        condition: "Like New",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
        description: "Laptop suitable for students and office work.",
        location: "Bengaluru, Karnataka",
        date: "2026-10-22",
        phone: "",
        owner: "sample"
    },
    {
        id: 103,
        name: "Wooden Study Table",
        price: 2500,
        category: "Furniture",
        condition: "Good",
        image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80",
        description: "Used study table with a spacious work surface.",
        location: "Coimbatore, Tamil Nadu",
        date: "2026-10-18",
        phone: "",
        owner: "sample"
    },
    {
        id: 104,
        name: "Mountain Bicycle",
        price: 6500,
        category: "Others",
        condition: "Good",
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
        description: "Pre-owned bicycle for daily commuting and exercise.",
        location: "Krishnagiri, Tamil Nadu",
        date: "2026-10-21",
        phone: "",
        owner: "sample"
    },
    {
        id: 105,
        name: "Honda Motorcycle",
        price: 45000,
        category: "Vehicles",
        condition: "Good",
        image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80",
        description: "Used motorcycle listing. Inspect before purchasing.",
        location: "Salem, Tamil Nadu",
        date: "2026-10-19",
        phone: "",
        owner: "sample"
    },
    {
        id: 106,
        name: "Office Chair",
        price: 1800,
        category: "Furniture",
        condition: "Fair",
        image: "https://images.unsplash.com/photo-1505843490701-5be5d0b2a9a1?auto=format&fit=crop&w=600&q=80",
        description: "Second-hand chair suitable for a study room.",
        location: "Hosur, Tamil Nadu",
        date: "2026-10-23",
        phone: "",
        owner: "sample"
    },
    {
        id: 107,
        name: "Wireless Headphones",
        price: 1200,
        category: "Electronics",
        condition: "Good",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        description: "Pre-owned headphones. Check the condition before buying.",
        location: "Chennai, Tamil Nadu",
        date: "2026-10-24",
        phone: "",
        owner: "sample"
    },
    {
        id: 108,
        name: "Casual Jacket",
        price: 800,
        category: "Fashion",
        condition: "Like New",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
        description: "Second-hand jacket in good wearable condition.",
        location: "Tiruppur, Tamil Nadu",
        date: "2026-10-25",
        phone: "",
        owner: "sample"
    }
];

// =====================================
// SAFE LOCAL STORAGE
// =====================================

function loadStorage(key, defaultValue) {
    try {
        const value = localStorage.getItem(key);

        return value === null
            ? defaultValue
            : JSON.parse(value);
    } catch (error) {
        console.error("Unable to read local storage:", error);
        return defaultValue;
    }
}

function saveStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Unable to save local storage:", error);

        showToast("Unable to save. Browser storage may be full.");
        return false;
    }
}

// User-created advertisements
let userProducts = loadStorage("resell_user_products", []);

// Favourite product IDs
let favorites = loadStorage("resell_favorites", []);

// Active category
let selectedCategory = "All";

// Search text
let searchText = "";

// Notification timer
let toastTimer;

// =====================================
// PRODUCT DATA
// =====================================

function getAllProducts() {
    return [...userProducts, ...sampleProducts];
}

function formatPrice(price) {
    return Number(price).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    });
}

// Escape text before displaying user input as HTML.
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];
    });
}

// Accept only safe web image URLs.
function safeImageURL(value) {
    try {
        const url = new URL(value);

        if (url.protocol === "https:" || url.protocol === "http:") {
            return url.href;
        }
    } catch (error) {
        // Invalid URLs use the fallback image.
    }

    return fallbackImage;
}

// Accept only valid Indian mobile numbers.
function isValidIndianPhone(phone) {
    return /^[6-9][0-9]{9}$/.test(phone);
}

// =====================================
// DISPLAY PRODUCTS
// =====================================

function displayProducts() {
    const productGrid = document.getElementById("productGrid");
    const productCount = document.getElementById("productCount");
    const emptyMessage = document.getElementById("emptyMessage");

    const allProducts = getAllProducts();

    const filteredProducts = allProducts.filter(function (product) {
        const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory;

        const searchValue = searchText.toLowerCase();

        const matchesSearch =
            product.name.toLowerCase().includes(searchValue) ||
            product.category.toLowerCase().includes(searchValue) ||
            product.location.toLowerCase().includes(searchValue) ||
            product.description.toLowerCase().includes(searchValue);

        return matchesCategory && matchesSearch;
    });

    productCount.textContent =
        filteredProducts.length +
        (filteredProducts.length === 1 ? " product" : " products");

    emptyMessage.hidden = filteredProducts.length !== 0;

    productGrid.innerHTML = filteredProducts.map(function (product) {
        const isFavorite = favorites.includes(product.id);

        const deleteButton = product.owner === "user"
            ? `
                <button
                    class="delete-button"
                    data-action="delete"
                    data-id="${product.id}"
                >
                    Delete
                </button>
            `
            : "";

        return `
            <article
                class="product-card"
                data-card-id="${product.id}"
                tabindex="0"
                aria-label="View ${escapeHTML(product.name)}"
            >

                <button
                    class="favorite-button"
                    data-action="favorite"
                    data-id="${product.id}"
                    aria-label="${isFavorite ? "Remove from" : "Add to"} favourites"
                    aria-pressed="${isFavorite}"
                >
                    ${isFavorite ? "❤️" : "🤍"}
                </button>

                <img
                    class="product-image"
                    src="${escapeHTML(safeImageURL(product.image))}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy"
                >

                <div class="product-info">

                    <div class="product-price">
                        ${formatPrice(product.price)}
                    </div>

                    <h3 class="product-name">
                        ${escapeHTML(product.name)}
                    </h3>

                    <span class="product-condition">
                        ${escapeHTML(product.condition)}
                    </span>

                    <p class="product-description">
                        ${escapeHTML(product.description)}
                    </p>

                    <div class="product-location">
                        📍 ${escapeHTML(product.location)}
                    </div>

                    <div class="product-date">
                        Posted: ${escapeHTML(product.date)}
                    </div>

                    <div class="card-actions">

                        <button
                            data-action="details"
                            data-id="${product.id}"
                        >
                            View Details
                        </button>

                        ${deleteButton}

                    </div>
                </div>
            </article>
        `;
    }).join("");

    // Replace broken image links with a placeholder.
    productGrid.querySelectorAll(".product-image").forEach(function (img) {
        img.addEventListener("error", function () {
            img.onerror = null;
            img.src = fallbackImage;
        }, { once: true });
    });
}

// =====================================
// SEARCH PRODUCTS
// =====================================

function searchProducts() {
    searchText = document.getElementById("searchInput").value.trim();

    displayProducts();

    scrollToProducts();
}

document.getElementById("searchInput").addEventListener("input", function () {
    searchText = this.value.trim();
    displayProducts();
});

// =====================================
// CATEGORY FILTER
// =====================================

document.querySelectorAll(".category").forEach(function (button) {
    button.addEventListener("click", function () {
        document.querySelectorAll(".category").forEach(function (item) {
            item.classList.remove("active");
        });

        this.classList.add("active");

        selectedCategory = this.dataset.category;

        displayProducts();
    });
});

// =====================================
// OPEN AND CLOSE SELL FORM
// =====================================

function openSellForm() {
    document.getElementById("sellModal").classList.add("show");
    document.getElementById("productName").focus();
}

function closeSellForm() {
    document.getElementById("sellModal").classList.remove("show");
}

// =====================================
// ADD NEW PRODUCT
// =====================================

document.getElementById("sellForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("productName").value.trim();
    const price = Number(document.getElementById("productPrice").value);
    const category = document.getElementById("productCategory").value;
    const condition = document.getElementById("productCondition").value;
    const imageInput = document.getElementById("productImage").value.trim();
    const description = document.getElementById("productDescription").value.trim();
    const location = document.getElementById("sellerLocation").value.trim();
    const phone = document.getElementById("sellerPhone").value.trim();

    if (!name || !description || !location || !category) {
        showToast("Please complete all required fields.");
        return;
    }

    if (!Number.isFinite(price) || price < 1 || price > 100000000) {
        showToast("Please enter a valid price.");
        return;
    }

    const validCategories = [
        "Mobiles",
        "Electronics",
        "Vehicles",
        "Furniture",
        "Fashion",
        "Others"
    ];

    if (!validCategories.includes(category)) {
        showToast("Please choose a valid category.");
        return;
    }

    if (!["Like New", "Good", "Fair"].includes(condition)) {
        showToast("Please choose a valid condition.");
        return;
    }

    if (phone && !isValidIndianPhone(phone)) {
        showToast("Enter a valid 10-digit Indian mobile number.");
        return;
    }

    if (imageInput) {
        try {
            const imageURL = new URL(imageInput);

            if (
                imageURL.protocol !== "https:" &&
                imageURL.protocol !== "http:"
            ) {
                showToast("Please enter a valid image URL.");
                return;
            }
        } catch (error) {
            showToast("Please enter a valid image URL.");
            return;
        }
    }

    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        category: category,
        condition: condition,
        image: imageInput || fallbackImage,
        description: description,
        location: location,
        date: new Date().toISOString().slice(0, 10),
        phone: phone,
        owner: "user"
    };

    // Save only if browser storage accepts the new listing.
    const updatedProducts = [newProduct, ...userProducts];

    if (!saveStorage("resell_user_products", updatedProducts)) {
        return;
    }

    userProducts = updatedProducts;

    this.reset();

    closeSellForm();

    selectedCategory = "All";
    searchText = "";

    document.getElementById("searchInput").value = "";

    document.querySelectorAll(".category").forEach(function (button) {
        button.classList.toggle(
            "active",
            button.dataset.category === "All"
        );
    });

    displayProducts();

    showToast("Your advertisement was posted successfully!");

    scrollToProducts();
});

// =====================================
// FAVOURITES
// =====================================

function toggleFavorite(productId) {
    const updatedFavorites = favorites.includes(productId)
        ? favorites.filter(function (id) {
            return id !== productId;
        })
        : [...favorites, productId];

    if (!saveStorage("resell_favorites", updatedFavorites)) {
        return;
    }

    favorites = updatedFavorites;

    displayProducts();

    showToast(
        favorites.includes(productId)
            ? "Added to favourites!"
            : "Removed from favourites."
    );
}

// =====================================
// DELETE USER-CREATED LISTINGS
// =====================================

function deleteProduct(productId) {
    const product = userProducts.find(function (item) {
        return item.id === productId;
    });

    if (!product) {
        showToast("You can delete only your own listings in this demo.");
        return;
    }

    const confirmed = window.confirm(
        "Are you sure you want to delete this advertisement?"
    );

    if (!confirmed) {
        return;
    }

    const updatedProducts = userProducts.filter(function (item) {
        return item.id !== productId;
    });

    if (!saveStorage("resell_user_products", updatedProducts)) {
        return;
    }

    userProducts = updatedProducts;

    displayProducts();

    showToast("Advertisement deleted.");
}

// =====================================
// PRODUCT DETAILS
// =====================================

function openDetails(productId) {
    const product = getAllProducts().find(function (item) {
        return item.id === productId;
    });

    if (!product) {
        showToast("Product not found.");
        return;
    }

    const details = document.getElementById("productDetails");

    let contactHTML = `
        <p><strong>Seller contact:</strong> Not provided</p>
    `;

    if (product.phone && isValidIndianPhone(product.phone)) {
        const safePhone = escapeHTML(product.phone);

        contactHTML = `
            <p><strong>Seller contact:</strong> ${safePhone}</p>
            <a
                class="contact-button"
                href="tel:${safePhone}"
            >
                Call Seller
            </a>
        `;
    }

    details.innerHTML = `
        <img
            class="details-image"
            src="${escapeHTML(safeImageURL(product.image))}"
            alt="${escapeHTML(product.name)}"
        >

        <h2>${escapeHTML(product.name)}</h2>

        <h2 style="color: #176b87;">
            ${formatPrice(product.price)}
        </h2>

        <p>
            <strong>Category:</strong>
            ${escapeHTML(product.category)}
        </p>

        <p>
            <strong>Condition:</strong>
            ${escapeHTML(product.condition)}
        </p>

        <p>
            <strong>Description:</strong>
            ${escapeHTML(product.description)}
        </p>

        <p>
            <strong>Location:</strong>
            ${escapeHTML(product.location)}
        </p>

        <p>
            <strong>Posted on:</strong>
            ${escapeHTML(product.date)}
        </p>

        ${contactHTML}
    `;

    const detailsImage = details.querySelector(".details-image");

    detailsImage.addEventListener("error", function () {
        detailsImage.onerror = null;
        detailsImage.src = fallbackImage;
    }, { once: true });

    document.getElementById("detailsModal").classList.add("show");
}

function closeDetails() {
    document.getElementById("detailsModal").classList.remove("show");
}

// =====================================
// HANDLE PRODUCT CARD BUTTONS
// =====================================

document.getElementById("productGrid").addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (button) {
        event.stopPropagation();

        const productId = Number(button.dataset.id);

        if (!Number.isSafeInteger(productId)) {
            return;
        }

        const action = button.dataset.action;

        if (action === "favorite") {
            toggleFavorite(productId);
        } else if (action === "delete") {
            deleteProduct(productId);
        } else if (action === "details") {
            openDetails(productId);
        }

        return;
    }

    const card = event.target.closest(".product-card");

    if (card) {
        openDetails(Number(card.dataset.cardId));
    }
});

// Keyboard accessibility for product cards.
document.getElementById("productGrid").addEventListener("keydown", function (event) {
    const card = event.target.closest(".product-card");

    if (
        !card ||
        event.target !== card ||
        (event.key !== "Enter" && event.key !== " ")
    ) {
        return;
    }

    event.preventDefault();

    openDetails(Number(card.dataset.cardId));
});

// =====================================
// SCROLL TO PRODUCTS
// =====================================

function scrollToProducts() {
    document.getElementById("productsSection").scrollIntoView({
        behavior: "smooth"
    });
}

// =====================================
// NOTIFICATION MESSAGE
// =====================================

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2500);
}

// =====================================
// CLOSE MODALS
// =====================================

document.getElementById("sellModal").addEventListener("click", function (event) {
    if (event.target === this) {
        closeSellForm();
    }
});

document.getElementById("detailsModal").addEventListener("click", function (event) {
    if (event.target === this) {
        closeDetails();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeSellForm();
        closeDetails();
    }
});

// =====================================
// START APPLICATION
// =====================================

displayProducts();