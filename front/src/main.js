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
