// As credenciais do Supabase são lidas de products.js
// (SUPABASE_URL e SUPABASE_KEY devem estar carregados antes deste script)

let currentHighlightSlide = 0;
let highlightInterval;
const highlightSlideInterval = 5000;
let cardsPerView = 3;

async function loadHighlightsFromSupabase() {
  const track = document.getElementById("highlightsTrack");
  const indicatorsEl = document.querySelector(".highlights-indicators");
  if (!track) return;

  track.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;width:100%;padding:2rem;color:#8a7d6a;font-family:'Barlow Condensed',sans-serif;letter-spacing:1px;">
      <i class="fas fa-spinner fa-spin" style="margin-right:.5rem;"></i> Carregando destaques...
    </div>`;

  try {
    const useSupa =
      typeof SUPABASE_URL !== "undefined" &&
      typeof SUPABASE_KEY !== "undefined" &&
      SUPABASE_URL.startsWith("https://") &&
      SUPABASE_KEY.length > 20;

    if (!useSupa) {
      track.innerHTML = "";
      initCarouselBehavior();
      return;
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?is_featured=eq.true&order=created_at.desc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY } }
    );

    if (!res.ok) throw new Error("Erro ao buscar destaques");

    const highlights = await res.json();

    if (highlights.length === 0) {
      track.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;width:100%;padding:2rem;color:#8a7d6a;font-family:'Barlow Condensed',sans-serif;letter-spacing:1px;">
          <span>Nenhum produto em destaque no momento.</span>
        </div>`;
      return;
    }

    track.innerHTML = highlights.map((p) => {
      const imgSrc =
        p.image_url && p.image_url.startsWith("http")
          ? p.image_url
          : p.image_path
            ? p.image_path
            : "https://placehold.co/400x500/1a1410/c9b38c?text=AS+Country";
      return `
        <div class="highlight-card">
          <div class="highlight-card-image">
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.name)}"
              onerror="this.src='https://placehold.co/400x500/1a1410/c9b38c?text=Sem+Foto'" />
          </div>
          <div class="highlight-card-content">
            <h3>${escapeHtml(p.name)}</h3>
            <p>${escapeHtml(p.description || "")}</p>
            <button class="highlight-cta" onclick="addToCartFromHTML(this.closest('.highlight-card')); this.closest('.highlight-card').setAttribute('data-id','${p.id}'); this.closest('.highlight-card').setAttribute('data-category','${escapeHtml(p.category)}');">
              <i class="fas fa-shopping-cart"></i>
              <span>Adicionar ao Carrinho</span>
            </button>
          </div>
        </div>`;
    }).join("");

    if (indicatorsEl) {
      const totalSlides = Math.ceil(highlights.length / cardsPerView);
      indicatorsEl.innerHTML = Array.from(
        { length: totalSlides },
        (_, i) => `<button class="indicator-dot${i === 0 ? " active" : ""}" onclick="goToHighlightSlide(${i})"></button>`
      ).join("");
    }

    currentHighlightSlide = 0;
    initCarouselBehavior();
  } catch (err) {
    console.error("Erro ao carregar destaques:", err);
    track.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;width:100%;padding:2rem;color:#8a7d6a;">
        <span>Não foi possível carregar os destaques.</span>
      </div>`;
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function updateCardsPerView() {
  const w = window.innerWidth;
  cardsPerView = w < 768 ? 1 : w < 1024 ? 2 : 3;
  updateHighlightCarousel();
}

function updateHighlightCarousel() {
  const track = document.getElementById("highlightsTrack");
  const cards = document.querySelectorAll(".highlight-card");
  if (!track || cards.length === 0) return;

  const totalSlides = Math.ceil(cards.length / cardsPerView);
  if (currentHighlightSlide >= totalSlides) currentHighlightSlide = 0;

  track.style.transform = `translateX(${currentHighlightSlide * -100}%)`;
  updateHighlightIndicators();
}

function updateHighlightIndicators() {
  const indicators = document.querySelectorAll(".indicator-dot");
  const totalSlides = Math.ceil(document.querySelectorAll(".highlight-card").length / cardsPerView);

  indicators.forEach((dot, i) => {
    dot.style.display = i < totalSlides ? "block" : "none";
    dot.classList.toggle("active", i === currentHighlightSlide);
  });
}

function moveHighlightCarousel(dir) {
  const cards = document.querySelectorAll(".highlight-card");
  if (cards.length === 0) return;
  const totalSlides = Math.ceil(cards.length / cardsPerView);
  currentHighlightSlide = (currentHighlightSlide + dir + totalSlides) % totalSlides;
  updateHighlightCarousel();
  stopHighlightCarousel();
  startHighlightCarousel();
}

function goToHighlightSlide(idx) {
  currentHighlightSlide = idx;
  updateHighlightCarousel();
  stopHighlightCarousel();
  startHighlightCarousel();
}

function startHighlightCarousel() {
  stopHighlightCarousel();
  const homePage = document.getElementById("page-home");
  if (homePage && homePage.classList.contains("active")) {
    highlightInterval = setInterval(() => moveHighlightCarousel(1), highlightSlideInterval);
  }
}

function stopHighlightCarousel() {
  if (highlightInterval) {
    clearInterval(highlightInterval);
    highlightInterval = null;
  }
}

let touchStartX = 0;
let touchEndX = 0;

function initCarouselBehavior() {
  updateCardsPerView();

  const wrapper = document.querySelector(".highlights-carousel-wrapper");
  if (wrapper) {
    wrapper.addEventListener("mouseenter", stopHighlightCarousel);
    wrapper.addEventListener("mouseleave", startHighlightCarousel);
  }

  const carousel = document.querySelector(".highlights-carousel");
  if (carousel) {
    carousel.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    carousel.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) moveHighlightCarousel(diff > 0 ? 1 : -1);
    }, { passive: true });
  }

  startHighlightCarousel();
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(updateCardsPerView, 250);
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopHighlightCarousel();
  } else {
    const homePage = document.getElementById("page-home");
    if (homePage && homePage.classList.contains("active")) startHighlightCarousel();
  }
});

document.addEventListener("keydown", (e) => {
  const homePage = document.getElementById("page-home");
  if (!homePage || !homePage.classList.contains("active")) return;
  if (e.key === "ArrowLeft") moveHighlightCarousel(-1);
  else if (e.key === "ArrowRight") moveHighlightCarousel(1);
});

const _origShowPageHL = window.showPage;
if (typeof _origShowPageHL === "function") {
  window.showPage = function (pageName) {
    stopHighlightCarousel();
    _origShowPageHL(pageName);
    if (pageName === "home") {
      setTimeout(startHighlightCarousel, 100);
    }
  };
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    loadHighlightsFromSupabase();
  }, 300);
});

window.addEventListener("beforeunload", stopHighlightCarousel);

window.moveHighlightCarousel = moveHighlightCarousel;
window.goToHighlightSlide = goToHighlightSlide;
window.startHighlightCarousel = startHighlightCarousel;
window.stopHighlightCarousel = stopHighlightCarousel;
window.loadHighlightsFromSupabase = loadHighlightsFromSupabase;
