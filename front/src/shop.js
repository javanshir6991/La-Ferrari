// Strapi API URL-lərini öz serverinə uyğun dəyiş
// Əgər relation adları fərqlidirsə, onları dəyiş və ya populate olmadan sadə request at
const API_URL = "http://localhost:1337/api/products?populate=*";

let products = [];
let visibleCount = 6;
let filters = {
    color: null,
    category: null,
    availability: null,
    brand: null,
    priceMin: null,
    priceMax: null,
    yearMin: null,
    yearMax: null,
    kmMin: null,
    kmMax: null,
};

// Filterləri doldurmaq üçün relationları ayrıca çək
async function fetchFilters() {
    try {
        const [colors, categories, availabilities, brands] = await Promise.all([
            fetch("http://localhost:1337/api/colors").then(r => r.json()),
            fetch("http://localhost:1337/api/categories").then(r => r.json()),
            fetch("http://localhost:1337/api/availabilities").then(r => r.json()),
            fetch("http://localhost:1337/api/brands").then(r => r.json()),
        ]);
        console.log('Colors:', JSON.stringify(colors, null, 2));
        console.log('Categories:', JSON.stringify(categories, null, 2));
        console.log('Availabilities:', JSON.stringify(availabilities, null, 2));
        console.log('Brands:', JSON.stringify(brands, null, 2));
        renderFilterOptions("color", colors.data || []);
        renderFilterOptions("category", categories.data || []);
        renderFilterOptions("availability", availabilities.data || []);
        renderFilterOptions("brand", brands.data || []);
    } catch (err) {
        console.error('Filter fetch error:', err);
    }
}

function renderFilterOptions(type, items) {
    const container = document.getElementById(`filter-${type}`);
    container.innerHTML = "";
    if (!Array.isArray(items)) return;
    // Color name to hex mapping
    const colorMap = {
        "Red": "#FF0000",
        "Green": "#00FF00",
        "Blue": "#0000FF",
        "Black": "#000000",
        "White": "#FFFFFF",
        "Yellow": "#FFD600",
        "Gray": "#808080",
        "Orange": "#FF9800",
        "Purple": "#9C27B0",
        "Pink": "#E91E63",
        "Silver": "#C0C0C0"
        // istədiyin qədər əlavə et
    };
    if (type === "brand") {
        // Dropdown
        const select = document.getElementById("filter-brand");
        if (!select) return;
        select.innerHTML = `<option value="">Select brand</option>`;
        items.forEach(item => {
            let label = item?.attributes?.brandname || item?.brandname || "Unknown";
            let option = document.createElement("option");
            option.value = item.id;
            option.textContent = label;
            if (filters.brand === item.id) option.selected = true;
            select.appendChild(option);
        });
        select.onchange = (e) => {
            filters.brand = e.target.value ? Number(e.target.value) : null;
            renderProducts();
        };
        return;
    }
    // ...existing code for other types...
    items.forEach(item => {
        let label = "Unknown";
        if (type === "color") label = item?.attributes?.colorname || item?.colorname || "Unknown";
        else if (type === "category") label = item?.attributes?.categoryname || item?.categoryname || "Unknown";
        else if (type === "availability") label = item?.attributes?.statusname || item?.statusname || "Unknown";
        const btn = document.createElement("button");
        let isSelected = filters[type] === item.id;
        btn.className = (type === "color" ? "flex  gap-1 " : "") + (isSelected
            ? "bg-yellow-700 text-black border-2 border-yellow-400 duration-300 px-1 py-1 rounded"
            : " hover:bg-yellow-400 hover:text-black duration-300 px-1 py-1 rounded");
        if (type === "color") {
            const colorCode = colorMap[label] || "#fff";
            btn.innerHTML = `<span class="w-7 h-7 rounded-full border-2 border-gray-400 inline-block" style="background:${colorCode}"></span>`;
        } else {
            btn.textContent = label;
        }
        btn.onclick = () => {
            if (filters[type] === item.id) {
                filters[type] = null; // toggle off
            } else {
                filters[type] = item.id; // select
            }
            renderProducts();
            renderFilterOptions(type, items); // seçimi yeniləmək üçün
        };
        container.appendChild(btn);
    });
}

// Məhsulları çək və render et
async function fetchProducts() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) {
            console.error('Products fetch error:', res.status, res.statusText);
            products = [];
            renderProducts();
            return;
        }
        const data = await res.json();
        console.log('Products:', JSON.stringify(data, null, 2));
        products = Array.isArray(data.data) ? data.data : [];
        renderProducts();
    } catch (err) {
        console.error('Products fetch error:', err);
        products = [];
        renderProducts();
    }
}

function renderProducts() {
    const list = document.getElementById("products-list");
    if (!list) return;
    list.innerHTML = "";
    if (!Array.isArray(products)) {
        list.innerHTML = "<div class='text-white text-xl'>No products found.</div>";
        return;
    }
    function formatPrice(price) {
        price = price.toString();
        return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    let filtered = products.filter(product => {
        let ok = true;
        if (filters.color && product?.color?.id) ok = ok && product.color.id === filters.color;
        if (filters.category && product?.category?.id) ok = ok && product.category.id === filters.category;
        if (filters.availability && product?.availability?.id) ok = ok && product.availability.id === filters.availability;
        if (filters.brand && product?.brand?.id) ok = ok && product.brand.id === filters.brand;
        // Price filter
        let price = Number(product?.price);
        if (filters.priceMin !== null && !isNaN(price)) ok = ok && price >= filters.priceMin;
        if (filters.priceMax !== null && !isNaN(price)) ok = ok && price <= filters.priceMax;
        // Year filter
        let year = Number(product?.year);
        if (filters.yearMin !== null && !isNaN(year)) ok = ok && year >= filters.yearMin;
        if (filters.yearMax !== null && !isNaN(year)) ok = ok && year <= filters.yearMax;
        // KM filter
        let km = Number(product?.km);
        if (filters.kmMin !== null && !isNaN(km)) ok = ok && km >= filters.kmMin;
        if (filters.kmMax !== null && !isNaN(km)) ok = ok && km <= filters.kmMax;
        return ok;
    });
    if (filtered.length === 0) {
        list.innerHTML = "<div class='text-white text-xl'>No products found.</div>";
        return;
    }
    // Yalnız visibleCount qədər məhsulu göstər
    filtered.slice(0, visibleCount).forEach((product, idx) => {
        let pname = product?.title || "No name";
        let imgUrl = product?.image?.url ? "http://localhost:1337" + product.image.url : "";
        let hoverImgUrl = product?.hoverimage?.url ? "http://localhost:1337" + product.hoverimage.url : "";
        const card = document.createElement("div");
        card.className = "dark rounded-3xl max-h-max overflow-hidden text-white flex flex-col items-center fade-in";
        card.style.animationDelay = `${idx * 80}ms`;
        card.style.cursor = "pointer";
        card.innerHTML = `
            ${imgUrl
                ? `<div class=\"relative w-full h-90 mb-4 overflow-hidden\">
        <!-- Normal Image -->
        <img src=\"${imgUrl}\" 
             class=\"absolute inset-0 w-full h-full object-cover transition-all duration-600 ease-in-out opacity-100 hover:opacity-0\" 
             alt=\"\">

        <!-- Hover Image -->
        <img src=\"${hoverImgUrl}\" 
             class=\"absolute inset-0 w-full h-full object-cover transition-all duration-600 ease-in-out opacity-0 hover:opacity-100 scale-105\" 
             alt=\"\">
     </div>`
                : `<div class=\"w-48 h-48 flex items-center justify-center bg-gray-800 rounded mb-4 text-gray-400\">No Image</div>`}

                <h3 class=\"font-bold border-b border-gray-700 text-xl mb-2\">${pname}</h3>
                <span class=\"text-yellow-400 text-lg font-semibold mb-2\">${product?.price ? formatPrice(product.price) + " $" : ""}</span>
                <div class=\"flex gap-2 border-b border-neutral-800 text-sm mb-4\">
                    <span class=\"text-gray-300 mr-3\">${product?.year ? "Year: " + product.year : ""}</span>
                    <span class=\"text-gray-300\">${product?.KM ? "KM: " + product.KM : ""}</span>
                </div>
                <button class=\"add-to-cart-btn bg-neutral-900 hover:bg-red-600 duration-400 text-white py-3 w-93 mb-4 rounded-full\" data-id=\"${product.id}\"><i class=\"ri-shopping-cart-line\"></i> ADD TO CART</button>
        `;



        card.onclick = () => {
            window.location.href = `shopDetail.html?id=${product.id}`;
        };
        // Add to Cart düyməsinə basanda detail pageyə atmaması üçün
        card.querySelector('.add-to-cart-btn').addEventListener('click', function (e) {
            e.stopPropagation(); // event propagation dayandırılır
            // addtocart.js-dəki addToCart funksiyasını çağır
            if (typeof addToCart === 'function') {
                const id = product.id;
                const title = pname;
                const price = product?.price ? formatPrice(product.price) + " $" : "";
                const image = imgUrl;
                addToCart({ id, title, price, image });
            }
        });
        list.appendChild(card);
    });

    // Əgər daha çox məhsul varsa, Load More buttonu məhsul gridinin altında çıxmalıdır
    let loadMoreBtn = document.getElementById("load-more-products");
    if (filtered.length > visibleCount) {
        if (!loadMoreBtn) {
            loadMoreBtn = document.createElement("button");
            loadMoreBtn.id = "load-more-products";
            loadMoreBtn.textContent = "Load More";
            loadMoreBtn.className = " w-70 text-xl text-yellow-400 rounded-full px-6 py-2  bg-neutral-900 mb-6  hover:scale-105 hover:bg-black duration-800 col-span-full";
            loadMoreBtn.onclick = () => {
                visibleCount += 6;
                renderProducts();
            };
            list.appendChild(loadMoreBtn);
        } else {
            list.appendChild(loadMoreBtn);
        }
        loadMoreBtn.style.display = "block";
    } else if (loadMoreBtn) {
        loadMoreBtn.style.display = "none";
    }
}

// Price, year, KM filter event listeners

document.addEventListener("DOMContentLoaded", () => {
    // URL səhvdirsə error page-ə yönləndir
    if (!window.location.pathname.endsWith('shop.html')) {
        window.location.href = 'error.html';
        return;
    }
    fetchFilters();
    fetchProducts();
    visibleCount = 6;
    ["filter-price-min", "filter-price-max", "filter-year-min", "filter-year-max", "filter-km-min", "filter-km-max"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", () => {
                if (id === "filter-price-min") filters.priceMin = el.value ? Number(el.value) : null;
                if (id === "filter-price-max") filters.priceMax = el.value ? Number(el.value) : null;
                if (id === "filter-year-min") filters.yearMin = el.value ? Number(el.value) : null;
                if (id === "filter-year-max") filters.yearMax = el.value ? Number(el.value) : null;
                if (id === "filter-km-min") filters.kmMin = el.value ? Number(el.value) : null;
                if (id === "filter-km-max") filters.kmMax = el.value ? Number(el.value) : null;
                renderProducts();
            });
        }
    });

    // --- Search Bar Logic ---
    const searchToggle = document.getElementById("search-toggle");
    const searchBarContainer = document.getElementById("search-bar-container");
    const searchInput = document.getElementById("search-input");
    const searchClose = document.getElementById("search-close");
    const searchResults = document.getElementById("search-results");

    if (searchToggle && searchBarContainer && searchInput && searchClose && searchResults) {
        searchToggle.onclick = () => {
            searchBarContainer.style.display = "block";
            searchInput.focus();
        };
        searchClose.onclick = () => {
            searchBarContainer.style.display = "none";
            searchResults.style.display = "none";
            searchInput.value = "";
        };
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                searchBarContainer.style.display = "none";
                searchResults.style.display = "none";
                searchInput.value = "";
            }
        });
        searchInput.addEventListener("input", async (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (!query) {
                searchResults.style.display = "none";
                searchResults.innerHTML = "";
                return;
            }
            // Strapi-dən məhsulları ada görə axtar
            try {
                const res = await fetch(`http://localhost:1337/api/products?populate=*&filters[title][$containsi]=${encodeURIComponent(query)}`);
                const data = await res.json();
                const items = Array.isArray(data.data) ? data.data : [];
                if (items.length === 0) {
                    searchResults.innerHTML = '<div class="p-3 text-gray-400">No products found.</div>';
                    searchResults.style.display = "block";
                    return;
                }
                searchResults.innerHTML = items.map(product => {
                    let pname = product?.title || "No name";
                    let imgUrl = product?.image?.url ? "http://localhost:1337" + product.image.url : "";
                    return `<div class='flex items-center gap-3 p-2 hover:bg-neutral-800 rounded cursor-pointer'>
                        <img src='${imgUrl}' alt='' class='w-10 h-10 object-cover rounded'/>
                        <span>${pname}</span>
                    </div>`;
                }).join("");
                searchResults.style.display = "block";
            } catch (err) {
                searchResults.innerHTML = '<div class="p-3 text-red-400">Search error.</div>';
                searchResults.style.display = "block";
            }
        });
    }
});

// Reset filter

document.getElementById("filter-reset").onclick = () => {
    filters = {
        color: null,
        category: null,
        availability: null,
        brand: null,
        priceMin: null,
        priceMax: null,
        yearMin: null,
        yearMax: null,
        kmMin: null,
        kmMax: null,
    };
    document.getElementById("filter-price-min").value = "";
    document.getElementById("filter-price-max").value = "";
    document.getElementById("filter-year-min").value = "";
    document.getElementById("filter-year-max").value = "";
    document.getElementById("filter-km-min").value = "";
    document.getElementById("filter-km-max").value = "";
    renderProducts();
    fetchFilters();
};

// --- Search Bar Logic ---
const searchToggle = document.getElementById("search-toggle");
const searchBarContainer = document.getElementById("search-bar-container");
const searchInput = document.getElementById("search-input");
const searchClose = document.getElementById("search-close");
const searchResults = document.getElementById("search-results");

if (searchToggle && searchBarContainer && searchInput && searchClose && searchResults) {
    searchToggle.onclick = () => {
        searchBarContainer.style.display = "block";
        searchInput.focus();
    };
    searchClose.onclick = () => {
        searchBarContainer.style.display = "none";
        searchResults.style.display = "none";
        searchInput.value = "";
    };
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            searchBarContainer.style.display = "none";
            searchResults.style.display = "none";
            searchInput.value = "";
        }
    });
    searchInput.addEventListener("input", async (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
            searchResults.style.display = "none";
            searchResults.innerHTML = "";
            return;
        }
        // Strapi-dən məhsulları ada görə axtar
        try {
            const res = await fetch(`http://localhost:1337/api/products?populate=*&filters[title][$containsi]=${encodeURIComponent(query)}`);
            const data = await res.json();
            const items = Array.isArray(data.data) ? data.data : [];
            if (items.length === 0) {
                searchResults.innerHTML = '<div class="p-3 text-gray-400">No products found.</div>';
                searchResults.style.display = "block";
                return;
            }
            searchResults.innerHTML = items.map(product => {
                let pname = product?.title || "No name";
                let imgUrl = product?.image?.url ? "http://localhost:1337" + product.image.url : "";
                return `<div class='flex items-center gap-3 p-2 hover:bg-neutral-800 rounded cursor-pointer'>
                    <img src='${imgUrl}' alt='' class='w-10 h-10 object-cover rounded'/>
                    <span>${pname}</span>
                </div>`;
            }).join("");
            searchResults.style.display = "block";
        } catch (err) {
            searchResults.innerHTML = '<div class="p-3 text-red-400">Search error.</div>';
            searchResults.style.display = "block";
        }
    });
}
