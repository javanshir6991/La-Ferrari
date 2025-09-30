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
<div class="flex justify-start gap-10 fade-in">
<div id="comments-section" class="mt-25 border-t border-neutral-700 pt-9 justify-items-start max-w-xl ">
  <h2 class="text-2xl text-white font-bold mb-4">Reviews</h2>


  <!-- Yeni şərh formu -->
  <form id="comment-form" class="space-y-3 bg-neutral-900 p-4 rounded">
    <input 
      type="text" 
      id="author" 
      placeholder="Username" 
      class="border border-white text-white p-2 w-full rounded"
      required
    >
    <input 
      type="email" 
      id="mail" 
      placeholder="Mail" 
      class="border border-white text-white p-2 w-full rounded"
      required
    >
    <textarea 
      id="comment" 
      placeholder="Comment" 
      class="border border-white text-white p-2 w-full rounded"
      required
    ></textarea>
    <button 
      type="submit" 
      class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 duration-300"
    >
        Add Comment
    </button>
  </form>
</div>

  <!-- Şərhlərin listi -->
  <div id="comments-list" class="space-x-3 flex flex-wrap max-h-max  ml-45 mt-47"></div>

</div>

            




        `;
        // JS ilə altdakı şəkillərə klik event və comment sistemi əlavə et
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
            // COMMENT SISTEMI
            const API_URL_COMMENTS = "http://localhost:1337/api/comments";
            const productIdForComment = product.id;

            // Şərhləri yükləmək
            async function loadComments() {
                try {
                    const res = await fetch(
                        `${API_URL_COMMENTS}?filters[products][id][$eq]=${productIdForComment}&populate=*`
                    );

                    const data = await res.json();
                    console.log("Strapi-dən gələn comment data:", data);

                    const list = document.getElementById("comments-list");
                    if (!list) return;
                    list.innerHTML = "";

                    if (!data.data || data.data.length === 0) {
                        list.innerHTML = `<p class="text-gray-500">No comments yet.</p>`;
                        return;
                    }
                    data.data.forEach((c) => {
                        if (!c) return;
                        const div = document.createElement("div");
                        div.className = "p-4 mb-4  rounded-2xl shadow-lg border border-gray-400 opacity-0 translate-y-3 transition-all duration-500 ease-out";
                        div.innerHTML = `
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
            ${c.Author ? c.Author[0].toUpperCase() : "A"}
        </div>
        <div>
            <p class="text-lg font-semibold text-white">${c.Author || "Anonim"}</p>
            <p class="text-sm text-gray-500">${c.mail || ""}</p>
        </div>
    </div>
    <p class="mt-3 text-white border-t border-neutral-800 pt-2 leading-relaxed">${c.comment || ""}</p>
`;
                        list.appendChild(div);
                        setTimeout(() => {
                            div.classList.remove("opacity-0", "translate-y-3");
                        }, 50);
                    });
                } catch (err) {
                    console.error("Şərhlər yüklənmədi:", err);
                }
            }

            // Commentləri həmişə göstər
            loadComments();

            // Yeni şərh göndərmək
            const commentForm = document.getElementById("comment-form");
            if (commentForm) {
                commentForm.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const author = document.getElementById("author").value.trim();
                    const mail = document.getElementById("mail").value.trim();
                    const comment = document.getElementById("comment").value.trim();
                    if (!author || !mail || !comment) {
                        alert("Bütün xanaları doldurun!");
                        return;
                    }
                    try {
                        await fetch(API_URL_COMMENTS, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                data: {
                                    Author: author,
                                    mail: mail,
                                    comment: comment,
                                    products: [productIdForComment], // ⚡ Array formatda
                                    publishedAt: new Date().toISOString() // ⚡ dərhal görünməsi üçün
                                }
                            })
                        });
                        e.target.reset();
                        // Comment göndəriləndən sonra dərhal yenilə
                        loadComments();
                    } catch (err) {
                        console.error("Şərh göndərilmədi:", err);
                    }
                });
            }


        }, 100);
    } catch (err) {
        document.querySelector("main").innerHTML = '<div class="text-red-400 text-2xl">Error loading product.</div>';
    }
});

function formatPrice(price) {
    price = price.toString();
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
