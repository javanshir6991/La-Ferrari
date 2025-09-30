const swiper = new Swiper(".mySwiper", {
  slidesPerView: 1,         // Tək bir şəkil görünsün
  loop: true,               // Dövr edən slider
  effect: "fade",           // Fade effekti
  fadeEffect: {
    crossFade: true         // Zərif keçid
  },
  autoplay: {
    delay: 1000,            // 2 saniyə sonra dəyişsin
    disableOnInteraction: false
  },
  speed: 2000,              // keçid animasiyası 2 saniyə davam etsin
  pagination: {
    el: ".swiper-pagination",
    clickable: true
  }
});

const API_URL = "http://localhost:1337/api/products?populate=*";

function formatPrice(price) {
  if (!price) return "";
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " $";
}

document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "http://localhost:1337/api/products?populate=*";
  const productsSection = document.getElementById("products-section");
  const productsSection2 = document.getElementById("products-section2");

  // Qiyməti formatlama funksiyası
  function formatPrice(price) {
    return new Intl.NumberFormat("en-US").format(price);
  }

  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    const products = json.data;

    productsSection.innerHTML = "";
    productsSection2.innerHTML = "";

    // yalnız 4 məhsul götürək
    products.slice(0, 4).forEach((product) => {
      const pname = product.title || "No Name";

      // şəkil url-ləri
      const imgUrl = product.image?.url
        ? `http://localhost:1337${product.image.url}`
        : null;

      const hoverImgUrl = product.hoverimage?.url
        ? `http://localhost:1337${product.hoverimage.url}`
        : imgUrl;
      var productId = product.id; // product id
      const card = document.createElement("div");
      card.className =
        "dark rounded-3xl max-h-max overflow-hidden text-white flex flex-col items-center fade-in";

      card.innerHTML = `
        ${imgUrl
          ? `<div class="relative w-full h-72 mb-4 overflow-hidden ">
                <!-- Normal Image -->
                <img src="${imgUrl}" 
                     class="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-100 hover:opacity-0" 
                     alt="${pname}">
        
                <!-- Hover Image -->
                <img src="${hoverImgUrl}" 
                     class="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 hover:opacity-100 scale-105" 
                     alt="${pname}">
              </div>`
          : `<div class="w-full h-72 flex items-center justify-center bg-gray-800 rounded-xl mb-4 text-gray-400">No Image</div>`
        }

        <h3 class="font-bold border-b border-gray-700 text-xl mb-2">${pname}</h3>
        <span class="text-yellow-400 text-lg font-semibold mb-2">${product?.price ? formatPrice(product.price) + " $" : ""
        }</span>
        <div class="flex gap-4 border-b border-neutral-800 text-sm mb-4 pb-2">
            <span class="text-gray-300">${product?.year ? "Year: " + product.year : ""
        }</span>
            <span class="text-gray-300">${product?.KM ? "KM: " + product.KM : ""
        }</span>
        </div>
        <button  onclick="window.location.href='shopDetail.html?id=${productId}'" class="add-to-cart-btn bg-neutral-900 hover:bg-red-600 duration-400 text-white py-3 w-90 mb-2 rounded-full flex items-center justify-center gap-2" data-id="${product.id
        }">
          <i class="ri-shopping-cart-line"></i> ADD TO CART
        </button>
      `;

      productsSection.appendChild(card);
      productsSection2.appendChild(card.cloneNode(true));
    });
  } catch (error) {
    console.error("Products load error:", error);
  }
});



