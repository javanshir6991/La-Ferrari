// Product detail page logic
const API_URL = "http://localhost:1337/api/products";

document.addEventListener("DOMContentLoaded", async () => {
    // Get product id from URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
    if (!productId) {
        document.querySelector("main").innerHTML = '<div class="text-white text-2xl">Product not found.</div>';
        return;
    }
    try {
        const res = await fetch(`${API_URL}?populate=*`);
        const data = await res.json();
        const products = Array.isArray(data.data) ? data.data : [];
        const product = products.find(p => p.id == productId);
        if (!product) {
            document.querySelector("main").innerHTML = '<div class="text-white text-2xl">Product not found.</div>';
            return;
        }
        // Shop.js-dəki kimi bütün məlumatları göstər
        const title = product.title || "No name";
        const description = product.description || "No description";
        // Description truncation logic
        const maxDescLength = 600;
        let shortDescription = description;
        let isTruncated = false;
        if (description.length > maxDescLength) {
            shortDescription = description.slice(0, maxDescLength) + "...";
            isTruncated = true;
        }
        const price = product.price ? formatPrice(product.price) + " $" : "";
        const year = product.year || "";
        const km = product.KM || product.km || "";
        const image = product.image?.url ? "http://localhost:1337" + product.image.url : "";
        const hoverimage = product.hoverimage?.url ? "http://localhost:1337" + product.hoverimage.url : "";
        const interiorimage = product.interiorimage?.url ? "http://localhost:1337" + product.interiorimage.url : "";
        const availability = product.availability?.statusname || "";
        const brand = product.brand?.brandname || "";
        const category = product.category?.categoryname || "";
        const color = product.color?.colorname || "";
        document.querySelector("main").innerHTML = `
            <div class="flex flex-col ml-80 md:flex-row gap-10 items-center text-white fade-in">
                <div class="w-96 flex flex-col items-center mb-6 md:mb-0">
                    <div id="main-image-container" class="w-270 h-150 relative border-2 border-neutral-700 rounded-lg overflow-hidden mb-4">
                        <img id="main-image" src="${image}" class="absolute inset-0 w-full  h-full object-cover transition-all duration-500 ease-in-out opacity-100" alt="">
                    </div>
                    <div class="flex gap-4 justify-center">
                        ${hoverimage ? `<img src="${hoverimage}" class="w-120 h-40 object-cover rounded-lg border-2 border-neutral-700 cursor-pointer" alt="Hover" data-img="${hoverimage}">` : ""}
                        ${interiorimage ? `<img src="${interiorimage}" class="w-120 h-40 object-cover rounded-lg border-2 border-neutral-700 cursor-pointer" alt="Interior" data-img="${interiorimage}">` : ""}
                        ${image ? `<img src="${image}" class="w-120 h-40 object-cover rounded-lg border-2 border-neutral-700 cursor-pointer" alt="Main" data-img="${image}">` : ""}
                    </div>
                </div>
                <div class="flex-1 ml-100 flex flex-col gap-4">
                    <h2 class="text-3xl font-bold mb-1 border-b border-neutral-700 pb-2">${title}</h2>
                    <span class="font-semibold text-3xl text-yellow-400 ">${price}</span>
                    <p class="text-gray-400 border-b border-neutral-700 pb-2 mb-2" id="product-description">
                        ${isTruncated ? shortDescription : description}
                        ${isTruncated ? `<button id="desc-more" class="ml-2 text-yellow-400 underline">More</button>` : ""}
                    </p>
                    <div class="flex gap-4 flex-wrap mb-2 border-b border-neutral-700 pb-5">
                        <span class="bg-neutral-800 px-3 py-1 rounded"><h1 class="text-sm text-gray-400">Year:</h1> ${year}</span>
                        <span class="bg-neutral-800 px-3 py-1 rounded"><h1 class="text-sm text-gray-400">KM:</h1> ${km}</span>
                        <span class="bg-neutral-800 px-3 py-1 rounded"><h1 class="text-sm text-gray-400">Availability:</h1> ${availability}</span>
                        <span class="bg-neutral-800 px-3 py-1 rounded"><h1 class="text-sm text-gray-400">Brand:</h1> ${brand}</span>
                        <span class="bg-neutral-800 px-3 py-1 rounded"><h1 class="text-sm text-gray-400">Category:</h1> ${category}</span>
                        <span class="bg-neutral-800 px-3 py-1 rounded"><h1 class="text-sm text-gray-400">Color:</h1> ${color}</span>
                    </div>
                        <div class="flex items-center gap-4 justify-start">
                            <button class="bg-yellow-300 text-black font-semibold px-3 py-2 rounded-full hover:bg-red-600 duration-400 transition-all mb-2 "><i class="ri-empathize-fill text-2xl"></i></button>
                            <button id="add-to-cart-detail" class="bg-yellow-400 text-black font-semibold px-6 py-2 w-full rounded-full hover:bg-green-600 duration-400 transition-all mb-2 text-2xl">Add to Cart</button>
                        </div>
                </div>
            </div>
        `;
        // JS ilə altdakı şəkillərə klik event əlavə et
        setTimeout(() => {
            // Add to Cart düyməsi üçün event
            const addBtn = document.getElementById('add-to-cart-detail');
            if (addBtn) {
                addBtn.addEventListener('click', function () {
                    if (typeof addToCart === 'function') {
                        addToCart({
                            id: product.id,
                            title,
                            price,
                            image
                        });
                    }
                });
            }
            // Description 'Davamı' button click event
            if (isTruncated) {
                setTimeout(() => {
                    const moreBtn = document.getElementById('desc-more');
                    if (moreBtn) {
                        moreBtn.addEventListener('click', () => {
                            const descEl = document.getElementById('product-description');
                            descEl.innerHTML = description;
                        });
                    }
                }, 200);
            }
            document.querySelectorAll('[data-img]').forEach(img => {
                img.addEventListener('click', function () {
                    const mainImg = document.getElementById('main-image');
                    if (mainImg) {
                        mainImg.style.opacity = 0;
                        setTimeout(() => {
                            mainImg.src = this.getAttribute('data-img');
                            mainImg.style.opacity = 1;
                        }, 250);
                    }
                });
            });
        }, 100);
    } catch (err) {
        document.querySelector("main").innerHTML = '<div class="text-red-400 text-2xl">Error loading product.</div>';
    }
});

function formatPrice(price) {
    price = price.toString();
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
