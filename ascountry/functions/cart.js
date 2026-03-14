let cart = [];

function loadCart() {
  try {
    const saved = localStorage.getItem("asCountryCart");
    if (saved) {
      cart = JSON.parse(saved);
      updateCart();
    }
  } catch (error) {
    cart = [];
  }
}

function saveCart() {
  try {
    localStorage.setItem("asCountryCart", JSON.stringify(cart));
  } catch (error) {
    console.error("Erro ao salvar carrinho:", error);
  }
}

function toggleCart() {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("cartOverlay");

  if (sidebar && overlay) {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.style.overflow = sidebar.classList.contains("active") ? "hidden" : "";
  }
}

function addToCart(product) {
  if (!product || !product.id) return;

  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      description: product.description || "",
      image: product.image || product.imageUrl || "",
      category: product.category || "",
      quantity: 1,
    });
  }

  saveCart();
  updateCart();
  showNotification("Produto adicionado ao carrinho!");
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  updateCart();
}

function updateQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      updateCart();
    }
  }
}

function updateCart() {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  if (!cartItems || !cartCount) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  cartCount.classList.toggle("show", totalItems > 0);

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-bag"></i>
        <p>Seu carrinho está vazio</p>
      </div>`;
  } else {
    cartItems.innerHTML = cart.map((item) => `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}"
            onerror="this.src='https://via.placeholder.com/100x100/1a1410/c9b38c?text=Sem+Imagem'" />
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-controls">
            <div class="quantity-controls">
              <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">
                <i class="fas fa-minus"></i>
              </button>
              <span class="quantity-display">${item.quantity}</span>
              <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>`).join("");
  }
}

function clearCart() {
  if (cart.length === 0) return;
  if (confirm("Deseja limpar todo o carrinho?")) {
    cart = [];
    saveCart();
    updateCart();
    showNotification("Carrinho limpo!");
  }
}

function sendToWhatsApp() {
  if (cart.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  const phoneNumber = "5543999056364";
  let message = "*Olá! Gostaria de fazer um pedido:*%0A%0A";

  cart.forEach((item) => {
    message += `• *${item.name}*%0A`;
    message += `  Quantidade: ${item.quantity}%0A%0A`;
  });

  message += "Aguardo retorno. Obrigado!";
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
}

function showNotification(message) {
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 25px;
    background: #25d366;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    z-index: 10000;
    font-weight: 500;
    animation: slideInNotification 0.3s ease;
  `;

  if (!document.querySelector("#notification-style")) {
    const style = document.createElement("style");
    style.id = "notification-style";
    style.textContent = `
      @keyframes slideInNotification {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = "slideInNotification 0.3s ease reverse";
    setTimeout(() => notification.remove(), 300);
  }, 2500);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const sidebar = document.getElementById("cartSidebar");
    if (sidebar && sidebar.classList.contains("active")) toggleCart();
  }
});

document.addEventListener("click", (e) => {
  if (e.target.id === "cartOverlay") toggleCart();
});

document.addEventListener("DOMContentLoaded", () => {
  loadCart();
});

window.addEventListener("beforeunload", () => {
  saveCart();
});

window.cart = cart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.updateCart = updateCart;
window.clearCart = clearCart;
window.toggleCart = toggleCart;
window.sendToWhatsApp = sendToWhatsApp;
window.showNotification = showNotification;
window.loadCart = loadCart;
window.saveCart = saveCart;
