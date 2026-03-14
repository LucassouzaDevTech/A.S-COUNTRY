// Cole aqui as configurações do seu projeto Supabase
// Acesse: supabase.com → seu projeto → Settings → API
const SUPABASE_URL = "";
const SUPABASE_KEY = "";

const USE_SUPABASE =
  SUPABASE_URL.startsWith("https://") && SUPABASE_KEY.length > 20;

function renderProductsFromHTML(filter = "todos") {
  const allItems = document.querySelectorAll(".catalog-item[data-category]");
  if (allItems.length === 0) return;

  let visible = 0;
  allItems.forEach((item) => {
    const cat = item.getAttribute("data-category");
    if (filter === "todos" || cat === filter) {
      item.style.display = "block";
      setTimeout(() => item.classList.add("visible"), 50);
      visible++;
    } else {
      item.style.display = "none";
      item.classList.remove("visible");
    }
  });

  updateActiveCategoryButton(filter);
  if (typeof initReveal === "function") setTimeout(() => initReveal(), 100);
}

async function renderProductsFromSupabase(filter = "todos") {
  const catalog = document.getElementById("productCatalog");
  if (!catalog) return;

  try {
    let url = `${SUPABASE_URL}/rest/v1/products?order=created_at.asc`;
    if (filter !== "todos") url += `&category=eq.${filter}`;

    const [prodRes, catRes] = await Promise.all([
      fetch(url, {
        headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/categories?order=name.asc`, {
        headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
      }),
    ]);

    if (!prodRes.ok) throw new Error("Erro ao buscar produtos");

    const products = await prodRes.json();
    const categories = catRes.ok ? await catRes.json() : [];

    updateCategoryButtons(categories);
    catalog.innerHTML = "";

    if (products.length === 0) {
      catalog.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:3rem;color:#8a7d6a;">
          <i class="fas fa-box-open" style="font-size:2.5rem;margin-bottom:1rem;opacity:.3;display:block;"></i>
          <p style="font-family:'Barlow Condensed',sans-serif;font-size:1.1rem;">Nenhum produto nesta categoria ainda.</p>
        </div>`;
      return;
    }

    products.forEach((p) => {
      const imgSrc = p.image_url || p.image_path || "";
      const item = document.createElement("div");
      item.className = "catalog-item";
      item.setAttribute("data-id", p.id);
      item.setAttribute("data-category", p.category);
      item.innerHTML = `
        <div class="catalog-item-image">
          <img src="${imgSrc}" alt="${escapeHtml(p.name)}"
            onerror="this.src='https://placehold.co/400x400/1a1410/c9b38c?text=Sem+Foto'" />
        </div>
        <div class="catalog-item-content">
          <h3>${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.description || "")}</p>
          <button class="add-to-cart-btn" onclick="addToCartFromHTML(this)">
            <i class="fas fa-shopping-cart"></i>
            <span>Adicionar ao Carrinho</span>
          </button>
        </div>`;
      catalog.appendChild(item);
    });

    updateActiveCategoryButton(filter);
    if (typeof initReveal === "function") setTimeout(() => initReveal(), 100);
  } catch (err) {
    console.error("Supabase indisponível, usando HTML:", err);
    renderProductsFromHTML(filter);
  }
}

function updateCategoryButtons(categories) {
  const filterDiv = document.querySelector(".category-filter");
  if (!filterDiv || categories.length === 0) return;

  const activeBtn = filterDiv.querySelector(".category-btn.active");
  const activeFilter = activeBtn ? activeBtn.getAttribute("data-category") : "todos";

  const allBtn = `
    <button class="category-btn${activeFilter === "todos" ? " active" : ""}" data-category="todos" onclick="renderProducts('todos')">
      <i class="fas fa-th"></i><span>Todos</span>
    </button>`;

  const catBtns = categories.map((c) => `
    <button class="category-btn${activeFilter === c.slug ? " active" : ""}" data-category="${c.slug}" onclick="renderProducts('${c.slug}')">
      <i class="${c.icon || "fas fa-tag"}"></i><span>${escapeHtml(c.name)}</span>
    </button>`).join("");

  filterDiv.innerHTML = allBtn + catBtns;
}

function renderProducts(filter = "todos") {
  if (USE_SUPABASE) {
    renderProductsFromSupabase(filter);
  } else {
    renderProductsFromHTML(filter);
  }
}

function updateActiveCategoryButton(filter) {
  document.querySelectorAll(".category-btn").forEach((btn) => btn.classList.remove("active"));
  const activeBtn = document.querySelector(`.category-btn[data-category="${filter}"]`);
  if (activeBtn) activeBtn.classList.add("active");
}

function addToCartFromHTML(button) {
  const item = button.closest(".catalog-item");
  if (!item) return;

  const product = {
    id: item.getAttribute("data-id"),
    category: item.getAttribute("data-category"),
    name: item.querySelector("h3")?.textContent || "Produto",
    description: item.querySelector("p")?.textContent || "",
    image: item.querySelector("img")?.src || "",
  };

  if (typeof addToCart === "function") {
    addToCart(product);
  }
}

function setupCategoryButtons() {
  document.querySelectorAll(".category-btn").forEach((button) => {
    const newBtn = button.cloneNode(true);
    button.parentNode.replaceChild(newBtn, button);
    newBtn.addEventListener("click", () => {
      renderProducts(newBtn.getAttribute("data-category"));
    });
  });
}

async function loadInitialCategories() {
  if (!USE_SUPABASE) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?order=name.asc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
    });
    if (res.ok) {
      const categories = await res.json();
      updateCategoryButtons(categories);
    }
  } catch (e) {
    console.warn("Não foi possível carregar categorias:", e.message);
  }
}

function initProducts() {
  setupCategoryButtons();
  renderProducts("todos");
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    initProducts();
    if (USE_SUPABASE) loadInitialCategories();
  }, 100);
});

const _origShowPage = window.showPage;
if (typeof _origShowPage === "function") {
  window.showPage = function (pageName) {
    _origShowPage(pageName);
    if (pageName === "produtos") {
      setTimeout(() => {
        setupCategoryButtons();
        const activeBtn = document.querySelector(".category-btn.active");
        const filter = activeBtn ? activeBtn.getAttribute("data-category") : "todos";
        renderProducts(filter);
      }, 200);
    }
  };
}

window.renderProducts = renderProducts;
window.addToCartFromHTML = addToCartFromHTML;
window.setupCategoryButtons = setupCategoryButtons;
window.initProducts = initProducts;
