const searchToggle = document.getElementById("search-toggle");
const searchBarContainer = document.getElementById("search-bar-container");
const searchClose = document.getElementById("search-close");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

// Toggle açma/bağlama
searchToggle.addEventListener("click", () => {
    const isOpen = searchBarContainer.classList.contains("scale-y-100");
    if (!isOpen) {
        searchBarContainer.classList.remove("scale-y-0");
        searchBarContainer.classList.add("scale-y-100");
        searchInput.focus();
    } else {
        searchBarContainer.classList.remove("scale-y-100");
        searchBarContainer.classList.add("scale-y-0");
        searchResults.classList.add("hidden");
        searchInput.value = "";
    }
});

// Close button
searchClose.addEventListener("click", () => {
    searchBarContainer.classList.remove("scale-y-100");
    searchBarContainer.classList.add("scale-y-0");
    searchResults.classList.add("hidden");
    searchInput.value = "";
});

// ESC ilə bağlama
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        searchBarContainer.classList.remove("scale-y-100");
        searchBarContainer.classList.add("scale-y-0");
        searchResults.classList.add("hidden");
        searchInput.value = "";
    }
});

// Input logic
searchInput.addEventListener("input", async (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!query) {
        searchResults.classList.add("hidden");
        searchResults.innerHTML = "";
        return;
    }
    try {
        const res = await fetch(`http://localhost:1337/api/products?populate=*&filters[title][$containsi]=${encodeURIComponent(query)}`);
        const data = await res.json();
        const items = Array.isArray(data.data) ? data.data : [];
        if (items.length === 0) {
            searchResults.innerHTML = '<div class="p-3 text-gray-400">Heç bir məhsul tapılmadı.</div>';
            searchResults.classList.remove("hidden");
            return;
        }

        searchResults.innerHTML = items.map(product => {
            let pname = product?.title || "No name";
            let imgUrl = product?.image?.url ? "http://localhost:1337" + product.image.url : "";
            let productId = product.id; // product id
            return `<a href="shopDetail.html?id=${productId}" class='flex items-center gap-3 p-3 hover:bg-neutral-700 transition-colors rounded cursor-pointer'>
                        <img src='${imgUrl}' alt='' class='w-10 h-10 object-cover rounded'/>
                        <span class='text-white font-medium'>${pname}</span>
                    </a>`;
        }).join("");
        searchResults.classList.remove("hidden");
    } catch (err) {
        searchResults.innerHTML = '<div class="p-3 text-red-400">Axtarış zamanı xəta baş verdi.</div>';
        searchResults.classList.remove("hidden");
    }
});

