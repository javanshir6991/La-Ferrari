
// Strapi API URL-lərini öz serverinə uyğun dəyiş
// Əgər relation adları fərqlidirsə, onları dəyiş və ya populate olmadan sadə request at
const API_URL = "http://localhost:1337/api/products?populate=*";

let products = [];
let filters = {
    color: null,
    category: null,
    availability: null,
    brand: null,
    priceMin: null,
    priceMax: null,
    yearMin: null,
    yearMax: null,
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
            ? "bg-yellow-400 text-black border-2 border-yellow-400 duration-300 px-1 py-1 rounded"
            : " hover:bg-black hover:text-black duration-300 px-1 py-1 rounded");
        if (type === "color") {
            const colorCode = colorMap[label] || "#fff";
            btn.innerHTML = `<span class="w-7 h-7 rounded-full border-2 border-gray-400 inline-block" style="background:${colorCode}"></span>`;
        } else {
            btn.textContent = label;
        }
        btn.onclick = () => {
            filters[type] = item.id;
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
        return ok;
    });
    if (filtered.length === 0) {
        list.innerHTML = "<div class='text-white text-xl'>No products found.</div>";
        return;
    }
    filtered.forEach(product => {
        let pname = product?.title || "No name";
        let imgUrl = product?.image?.url ? "http://localhost:1337" + product.image.url : "";
        let hoverImgUrl = product?.hoverimage?.url ? "http://localhost:1337" + product.hoverimage.url : "";
        list.innerHTML += `
            <div class="dark rounded-xl p-5 text-white flex flex-col items-center">
                ${imgUrl
                ? `<img src="${imgUrl}" class="w-48 h-48 object-cover rounded mb-4 transition-all duration-300" alt=""
                        onmouseover="if('${hoverImgUrl}') this.src='${hoverImgUrl}'" onmouseout="this.src='${imgUrl}'">`
                : `<div class="w-48 h-48 flex items-center justify-center bg-gray-800 rounded mb-4 text-gray-400">No Image</div>`}
                <h3 class="font-bold text-lg mb-2">${pname}</h3>
                <p class="text-gray-400 mb-2">${product?.description || ""}</p>
                <span class="text-yellow-400 font-semibold mb-2">${product?.price ? product?.price + " ₼" : ""}</span>
                <div class="flex gap-2 text-sm">
                    <span>${product?.colorname || ""}</span>
                    <span>${product?.categoryname || ""}</span>
                    <span>${product?.brandname || ""}</span>
                    <span>${product?.statusname || ""}</span>
                </div>
            </div>
        `;
    });
}

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
    };
    document.getElementById("filter-price-min").value = "";
    document.getElementById("filter-price-max").value = "";
    document.getElementById("filter-year-min").value = "";
    document.getElementById("filter-year-max").value = "";
    renderProducts();
    fetchFilters();
};


// Price & year filter event listeners
document.addEventListener("DOMContentLoaded", () => {
    fetchFilters();
    fetchProducts();
    ["filter-price-min", "filter-price-max", "filter-year-min", "filter-year-max"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", () => {
                if (id === "filter-price-min") filters.priceMin = el.value ? Number(el.value) : null;
                if (id === "filter-price-max") filters.priceMax = el.value ? Number(el.value) : null;
                if (id === "filter-year-min") filters.yearMin = el.value ? Number(el.value) : null;
                if (id === "filter-year-max") filters.yearMax = el.value ? Number(el.value) : null;
                renderProducts();
            });
        }
    });
});
