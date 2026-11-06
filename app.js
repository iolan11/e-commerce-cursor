const STORAGE_KEY = "vibe-ropa-cart";
const cartCountEl = document.getElementById("cart-count");
const cartLinkEl = document.getElementById("cart-link");
const cartOverlayEl = document.getElementById("cart-overlay");
const cartDrawerEl = document.getElementById("cart-drawer");
const cartCloseEl = document.getElementById("cart-close");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalsEl = document.getElementById("cart-totals");
const cartCheckoutEl = document.getElementById("cart-checkout");
const checkoutEl = document.getElementById("checkout");
const checkoutBackEl = document.getElementById("checkout-back");
const checkoutFormEl = document.getElementById("checkout-form");
const checkoutSummaryListEl = document.getElementById("checkout-summary-list");
const checkoutTotalsEl = document.getElementById("checkout-totals");
const checkoutSuccessMsgEl = document.getElementById("checkout-success-msg");
const checkoutDoneEl = document.getElementById("checkout-done");
const toastEl = document.getElementById("toast");
const toastTextEl = document.getElementById("toast-text");
const card3dEl = document.getElementById("card-3d");
const cardNumberDisplay = document.getElementById("card-number-display");
const cardHolderDisplay = document.getElementById("card-holder-display");
const cardExpiryDisplay = document.getElementById("card-expiry-display");
const cardCvvDisplay = document.getElementById("card-cvv-display");
const cardBrandEl = document.getElementById("card-brand");
const coCardEl = document.getElementById("co-card");
const coCardNameEl = document.getElementById("co-card-name");
const coExpiryEl = document.getElementById("co-expiry");
const coCvvEl = document.getElementById("co-cvv");
const coZipEl = document.getElementById("co-zip");
const TOAST_MS = 3000;
const ES_PROVINCES = {
  "01": "Álava", "02": "Albacete", "03": "Alicante", "04": "Almería",
  "05": "Ávila", "06": "Badajoz", "07": "Illes Balears", "08": "Barcelona",
  "09": "Burgos", "10": "Cáceres", "11": "Cádiz", "12": "Castellón",
  "13": "Ciudad Real", "14": "Córdoba", "15": "A Coruña", "16": "Cuenca",
  "17": "Girona", "18": "Granada", "19": "Guadalajara", "20": "Gipuzkoa",
  "21": "Huelva", "22": "Huesca", "23": "Jaén", "24": "León",
  "25": "Lleida", "26": "La Rioja", "27": "Lugo", "28": "Madrid",
  "29": "Málaga", "30": "Murcia", "31": "Navarra", "32": "Ourense",
  "33": "Asturias", "34": "Palencia", "35": "Las Palmas", "36": "Pontevedra",
  "37": "Salamanca", "38": "S.C. Tenerife", "39": "Cantabria", "40": "Segovia",
  "41": "Sevilla", "42": "Soria", "43": "Tarragona", "44": "Teruel",
  "45": "Toledo", "46": "Valencia", "47": "Valladolid", "48": "Bizkaia",
  "49": "Zamora", "50": "Zaragoza", "51": "Ceuta", "52": "Melilla",
};
const IVA_RATE = 0.21;
const SHIPPING_COST = 4.9;
const FREE_SHIPPING_FROM = 50;
let toastHideTimer;
let toastClearTimer;
let lastFocus = null;

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function setFieldError(input, message = "") {
  input.setCustomValidity(message || "");
  return !message;
}

function formatCardNumber(digits) {
  const clipped = digits.slice(0, 16);
  const parts = clipped.match(/.{1,4}/g) || [];
  return parts.join(" ");
}

function formatCardNumberDisplay(digits) {
  const padded = (digits + "################").slice(0, 16);
  return formatCardNumber(padded);
}

function formatExpiry(digits) {
  const clipped = digits.slice(0, 4);
  if (clipped.length <= 2) return clipped;
  return `${clipped.slice(0, 2)}/${clipped.slice(2)}`;
}

function detectCardBrand(digits) {
  if (!digits) return null;
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(6011|65|64[4-9])/.test(digits)) return "discover";
  if (/^(5018|5020|5038|6304|6759|676[1-3]|50)/.test(digits)) return "maestro";
  return null;
}

function updateCardBrand(digits) {
  const brand = detectCardBrand(digits);
  cardBrandEl.querySelectorAll(".card-brand-logo").forEach((logo) => {
    logo.classList.toggle("is-visible", logo.dataset.brand === brand);
  });
}

function resetCardPreview() {
  card3dEl.classList.remove("is-flipped");
  cardNumberDisplay.textContent = "#### #### #### ####";
  cardHolderDisplay.textContent = "TU NOMBRE";
  cardExpiryDisplay.textContent = "MM/AA";
  cardCvvDisplay.textContent = "•••";
  updateCardBrand("");
}

function isValidSpanishZip(zip) {
  return /^\d{5}$/.test(zip) && Boolean(ES_PROVINCES[zip.slice(0, 2)]);
}

function isValidCardNumber(digits) {
  return digits.length === 16;
}

function isValidExpiry(value) {
  return /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);
}

function isValidCvv(digits) {
  return /^\d{3}$/.test(digits);
}

function sanitizeDigitField(input, maxLength, formatter = (digits) => digits) {
  const digits = onlyDigits(input.value).slice(0, maxLength);
  input.value = formatter(digits);
  return digits;
}

function validateZipField({ requireComplete = false } = {}) {
  const zip = sanitizeDigitField(coZipEl, 5);
  if (!zip) return setFieldError(coZipEl);
  if (!requireComplete && zip.length < 5) return setFieldError(coZipEl);
  return setFieldError(
    coZipEl,
    isValidSpanishZip(zip) ? "" : "Introduce un C.P. español válido"
  );
}

function validateCardField({ requireComplete = false } = {}) {
  const digits = onlyDigits(coCardEl.value);
  if (!digits) return setFieldError(coCardEl);
  if (!requireComplete && digits.length < 16) return setFieldError(coCardEl);
  return setFieldError(
    coCardEl,
    isValidCardNumber(digits)
      ? ""
      : "La tarjeta debe tener exactamente 16 dígitos"
  );
}

function validateExpiryField({ requireComplete = false } = {}) {
  const value = coExpiryEl.value.trim();
  if (!value) return setFieldError(coExpiryEl);
  if (!requireComplete && value.length < 5) return setFieldError(coExpiryEl);
  return setFieldError(
    coExpiryEl,
    isValidExpiry(value) ? "" : "Caducidad inválida (MM/AA)"
  );
}

function validateCvvField({ requireComplete = false } = {}) {
  const digits = onlyDigits(coCvvEl.value);
  if (!digits) return setFieldError(coCvvEl);
  if (!requireComplete && digits.length < 3) return setFieldError(coCvvEl);
  return setFieldError(
    coCvvEl,
    isValidCvv(digits) ? "" : "El CVV2 debe tener 3 dígitos"
  );
}

function validateCheckoutForm() {
  const checks = [
    validateZipField({ requireComplete: true }),
    validateCardField({ requireComplete: true }),
    validateExpiryField({ requireComplete: true }),
    validateCvvField({ requireComplete: true }),
  ];
  const ok = checks.every(Boolean) && checkoutFormEl.checkValidity();
  if (!ok) checkoutFormEl.reportValidity();
  return ok;
}

function syncCardPreviewFromForm() {
  const digits = onlyDigits(coCardEl.value);
  cardNumberDisplay.textContent = formatCardNumberDisplay(digits);
  updateCardBrand(digits);

  const holder = coCardNameEl.value.trim();
  cardHolderDisplay.textContent = holder ? holder.toUpperCase() : "TU NOMBRE";

  const expDigits = onlyDigits(coExpiryEl.value);
  cardExpiryDisplay.textContent =
    expDigits.length === 0 ? "MM/AA" : formatExpiry(expDigits).padEnd(5, "•");

  const cvv = onlyDigits(coCvvEl.value).slice(0, 3);
  cardCvvDisplay.textContent = cvv || "•••";
}

function formatPrice(value) {
  return (
    value.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function cartItemCount(cart) {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function cartSubtotal(cart) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function getOrderTotals(cart) {
  const subtotal = cartSubtotal(cart);
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const base = total / (1 + IVA_RATE);
  const iva = total - base;

  return { subtotal, shipping, iva, base, total };
}

function renderTotalsBreakdown(container, cart) {
  const { subtotal, shipping, iva, total } = getOrderTotals(cart);
  const shippingLabel =
    shipping === 0 && subtotal > 0
      ? "Envío (gratis)"
      : "Gastos de envío";
  let shippingNote = "";
  if (subtotal > 0 && shipping === 0) {
    shippingNote = `<p class="shipping-note">Gratis: pedido ≥ ${formatPrice(FREE_SHIPPING_FROM)}</p>`;
  } else if (shipping > 0) {
    shippingNote = `<p class="shipping-note">Gratis desde ${formatPrice(FREE_SHIPPING_FROM)}</p>`;
  }

  container.innerHTML = `
    <div class="totals-row">
      <span>Subtotal</span>
      <span>${formatPrice(subtotal)}</span>
    </div>
    <div class="totals-row">
      <span>${shippingLabel}</span>
      <span>${formatPrice(shipping)}</span>
    </div>
    <div class="totals-row is-note">
      <span>IVA (21% incluido)</span>
      <span>${formatPrice(iva)}</span>
    </div>
    ${shippingNote}
    <div class="totals-row is-total">
      <span>Total</span>
      <strong>${formatPrice(total)}</strong>
    </div>
  `;
}

function updateCartCount(cart) {
  cartCountEl.textContent = String(cartItemCount(cart));
}

function pulseCart() {
  cartLinkEl.classList.remove("is-pulse");
  void cartLinkEl.offsetWidth;
  cartLinkEl.classList.add("is-pulse");
}

function showToast(message) {
  clearTimeout(toastHideTimer);
  clearTimeout(toastClearTimer);

  toastTextEl.innerHTML = message;
  toastEl.classList.remove("is-enter", "is-leave");
  void toastEl.offsetWidth;
  toastEl.classList.add("is-enter");

  toastHideTimer = setTimeout(() => {
    toastEl.classList.remove("is-enter");
    toastEl.classList.add("is-leave");
    toastClearTimer = setTimeout(() => {
      toastEl.classList.remove("is-leave");
    }, 400);
  }, TOAST_MS);
}

function renderCart() {
  const cart = loadCart();
  updateCartCount(cart);
  renderTotalsBreakdown(cartTotalsEl, cart);
  cartCheckoutEl.disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItemsEl.innerHTML =
      '<p class="cart-empty">Tu carrito está vacío.<br>Añade una prenda del catálogo.</p>';
    return;
  }

  cartItemsEl.innerHTML = cart
    .map(
      (item) => `
    <article class="cart-line" data-id="${item.id}">
      <div class="cart-line-top">
        <div>
          <p class="cart-line-name">${item.name}</p>
          <p class="cart-line-sub">${formatPrice(item.price)} · ud.</p>
        </div>
        <span class="cart-line-total">${formatPrice(item.price * item.quantity)}</span>
      </div>
      <div class="cart-line-actions">
        <div class="qty-controls">
          <button type="button" class="qty-btn" data-action="dec" aria-label="Quitar uno">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button type="button" class="qty-btn" data-action="inc" aria-label="Añadir uno">+</button>
        </div>
        <button type="button" class="cart-remove" data-action="remove">Quitar</button>
      </div>
    </article>`
    )
    .join("");
}

function setCartQuantity(id, quantity) {
  let cart = loadCart();
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;

  if (quantity <= 0) {
    cart = cart.filter((entry) => entry.id !== id);
  } else {
    item.quantity = quantity;
  }

  saveCart(cart);
  renderCart();
}

function removeFromCart(id) {
  const cart = loadCart().filter((entry) => entry.id !== id);
  saveCart(cart);
  renderCart();
}

function openCart() {
  lastFocus = document.activeElement;
  renderCart();
  cartOverlayEl.hidden = false;
  cartDrawerEl.hidden = false;
  void cartDrawerEl.offsetWidth;
  cartOverlayEl.classList.add("is-open");
  cartDrawerEl.classList.add("is-open");
  document.body.classList.add("cart-open");
  cartLinkEl.setAttribute("aria-expanded", "true");
  cartCloseEl.focus();
}

function closeCart(options = {}) {
  const { skipFocus = false } = options;
  cartOverlayEl.classList.remove("is-open");
  cartDrawerEl.classList.remove("is-open");
  document.body.classList.remove("cart-open");
  cartLinkEl.setAttribute("aria-expanded", "false");

  const onEnd = () => {
    cartOverlayEl.hidden = true;
    cartDrawerEl.hidden = true;
    cartDrawerEl.removeEventListener("transitionend", onEnd);
    if (!skipFocus && lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  };
  cartDrawerEl.addEventListener("transitionend", onEnd);
}

function renderCheckoutSummary() {
  const cart = loadCart();
  renderTotalsBreakdown(checkoutTotalsEl, cart);

  if (cart.length === 0) {
    checkoutSummaryListEl.innerHTML =
      '<p class="cart-empty">No hay productos en el carrito.</p>';
    return;
  }

  checkoutSummaryListEl.innerHTML = cart
    .map(
      (item) => `
    <div class="checkout-line">
      <span>${item.name} × ${item.quantity}</span>
      <span>${formatPrice(item.price * item.quantity)}</span>
    </div>`
    )
    .join("");
}

function openCheckout() {
  const cart = loadCart();
  if (cart.length === 0) return;

  checkoutEl.classList.remove("is-success");
  checkoutFormEl.reset();
  syncCardPreviewFromForm();
  validateZipField();
  renderCheckoutSummary();
  checkoutEl.hidden = false;
  void checkoutEl.offsetWidth;
  checkoutEl.classList.add("is-open");
  document.body.classList.add("checkout-open");
  document.getElementById("co-name").focus();
}

function closeCheckout() {
  checkoutEl.classList.remove("is-open");
  document.body.classList.remove("checkout-open");

  const onEnd = () => {
    checkoutEl.hidden = true;
    checkoutEl.classList.remove("is-success");
    checkoutEl.removeEventListener("transitionend", onEnd);
  };
  checkoutEl.addEventListener("transitionend", onEnd);
}

function addToCart(product) {
  const cart = loadCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  saveCart(cart);
  updateCartCount(cart);
  if (cartDrawerEl.classList.contains("is-open")) {
    renderCart();
  }
  pulseCart();
  showToast(`Añadido: <strong>${product.name}</strong>`);
}

cartLinkEl.addEventListener("click", openCart);
cartCloseEl.addEventListener("click", closeCart);
cartOverlayEl.addEventListener("click", closeCart);

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (checkoutEl.classList.contains("is-open")) {
    closeCheckout();
    return;
  }
  if (cartDrawerEl.classList.contains("is-open")) {
    closeCart();
  }
});

cartItemsEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const line = button.closest(".cart-line");
  if (!line) return;

  const id = line.dataset.id;
  const cart = loadCart();
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;

  const action = button.dataset.action;
  if (action === "inc") setCartQuantity(id, item.quantity + 1);
  if (action === "dec") setCartQuantity(id, item.quantity - 1);
  if (action === "remove") removeFromCart(id);
});

cartCheckoutEl.addEventListener("click", () => {
  if (cartCheckoutEl.disabled) return;
  closeCart({ skipFocus: true });
  openCheckout();
});

checkoutBackEl.addEventListener("click", () => {
  checkoutEl.classList.remove("is-open", "is-success");
  document.body.classList.remove("checkout-open");
  checkoutEl.hidden = true;
  openCart();
});

checkoutDoneEl.addEventListener("click", () => {
  closeCheckout();
});

coCardEl.addEventListener("input", () => {
  sanitizeDigitField(coCardEl, 16, formatCardNumber);
  validateCardField();
  syncCardPreviewFromForm();
});

coCardNameEl.addEventListener("input", syncCardPreviewFromForm);

coExpiryEl.addEventListener("input", () => {
  sanitizeDigitField(coExpiryEl, 4, formatExpiry);
  validateExpiryField();
  syncCardPreviewFromForm();
});

coCvvEl.addEventListener("input", () => {
  sanitizeDigitField(coCvvEl, 3);
  validateCvvField();
  syncCardPreviewFromForm();
});

coCvvEl.addEventListener("focus", () => {
  card3dEl.classList.add("is-flipped");
});

[coCardEl, coCardNameEl, coExpiryEl].forEach((input) => {
  input.addEventListener("focus", () => {
    card3dEl.classList.remove("is-flipped");
  });
});

coZipEl.addEventListener("input", () => validateZipField());

checkoutFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateCheckoutForm()) return;

  const cardDigits = onlyDigits(coCardEl.value);
  const data = new FormData(checkoutFormEl);
  const name = String(data.get("name") || "").trim();
  const brand = detectCardBrand(cardDigits);
  const totals = getOrderTotals(loadCart());
  const total = formatPrice(totals.total);
  const brandLabel = brand ? brand.toUpperCase() : "TARJETA";

  saveCart([]);
  updateCartCount([]);
  checkoutEl.classList.add("is-success");
  checkoutSuccessMsgEl.textContent =
    `Gracias, ${name}. Pedido de ${total} con ${brandLabel} registrado (demo local).`;
  showToast("Pedido confirmado");
  resetCardPreview();
});

document.querySelectorAll(".btn-add").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".product-card");
    if (!card) return;

    addToCart({
      id: card.dataset.id,
      name: card.dataset.name,
      price: Number(card.dataset.price),
    });

    const label = button.textContent;
    button.textContent = "¡Ya!";
    button.classList.add("is-added");
    setTimeout(() => {
      button.textContent = label;
      button.classList.remove("is-added");
    }, 900);
  });
});

cartLinkEl.setAttribute("aria-expanded", "false");
updateCartCount(loadCart());
