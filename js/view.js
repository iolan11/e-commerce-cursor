/** View — lectura/escritura del DOM y feedback visual. */

import {
  FREE_SHIPPING_FROM,
  cartItemCount,
  detectCardBrand,
  formatCardNumberDisplay,
  formatExpiry,
  formatPrice,
  getOrderTotals,
  onlyDigits,
} from "./model.js";

const TOAST_MS = 3000;

export const els = {
  cartCount: document.getElementById("cart-count"),
  cartLink: document.getElementById("cart-link"),
  cartOverlay: document.getElementById("cart-overlay"),
  cartDrawer: document.getElementById("cart-drawer"),
  cartClose: document.getElementById("cart-close"),
  cartItems: document.getElementById("cart-items"),
  cartTotals: document.getElementById("cart-totals"),
  cartCheckout: document.getElementById("cart-checkout"),
  checkout: document.getElementById("checkout"),
  checkoutBack: document.getElementById("checkout-back"),
  checkoutForm: document.getElementById("checkout-form"),
  checkoutSummaryList: document.getElementById("checkout-summary-list"),
  checkoutTotals: document.getElementById("checkout-totals"),
  checkoutSuccessMsg: document.getElementById("checkout-success-msg"),
  checkoutDone: document.getElementById("checkout-done"),
  toast: document.getElementById("toast"),
  toastText: document.getElementById("toast-text"),
  card3d: document.getElementById("card-3d"),
  cardNumberDisplay: document.getElementById("card-number-display"),
  cardHolderDisplay: document.getElementById("card-holder-display"),
  cardExpiryDisplay: document.getElementById("card-expiry-display"),
  cardCvvDisplay: document.getElementById("card-cvv-display"),
  cardBrand: document.getElementById("card-brand"),
  coCard: document.getElementById("co-card"),
  coCardName: document.getElementById("co-card-name"),
  coExpiry: document.getElementById("co-expiry"),
  coCvv: document.getElementById("co-cvv"),
  coZip: document.getElementById("co-zip"),
  coName: document.getElementById("co-name"),
};

let toastHideTimer;
let toastClearTimer;
let lastFocus = null;

export function setFieldError(input, message = "") {
  input.setCustomValidity(message || "");
  return !message;
}

export function sanitizeDigitField(input, maxLength, formatter = (d) => d) {
  const digits = onlyDigits(input.value).slice(0, maxLength);
  input.value = formatter(digits);
  return digits;
}

export function updateCartCount(cart) {
  const count = cartItemCount(cart);
  els.cartCount.textContent = String(count);
  els.cartLink.setAttribute(
    "aria-label",
    count === 1
      ? "Abrir carrito, 1 artículo"
      : `Abrir carrito, ${count} artículos`
  );
}

export function pulseCart() {
  els.cartLink.classList.remove("is-pulse");
  void els.cartLink.offsetWidth;
  els.cartLink.classList.add("is-pulse");
}

export function showToast(message) {
  clearTimeout(toastHideTimer);
  clearTimeout(toastClearTimer);

  els.toastText.innerHTML = message;
  els.toast.classList.remove("is-enter", "is-leave");
  void els.toast.offsetWidth;
  els.toast.classList.add("is-enter");

  toastHideTimer = setTimeout(() => {
    els.toast.classList.remove("is-enter");
    els.toast.classList.add("is-leave");
    toastClearTimer = setTimeout(() => {
      els.toast.classList.remove("is-leave");
    }, 400);
  }, TOAST_MS);
}

export function renderTotalsBreakdown(container, cart) {
  const { subtotal, shipping, iva, total } = getOrderTotals(cart);
  const shippingLabel =
    shipping === 0 && subtotal > 0 ? "Envío (gratis)" : "Gastos de envío";
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

export function renderCart(cart) {
  updateCartCount(cart);
  renderTotalsBreakdown(els.cartTotals, cart);
  els.cartCheckout.disabled = cart.length === 0;
  els.cartCheckout.setAttribute("aria-disabled", String(cart.length === 0));

  if (cart.length === 0) {
    els.cartItems.innerHTML =
      '<li class="cart-empty">Tu carrito está vacío.<br>Añade una prenda del catálogo.</li>';
    return;
  }

  els.cartItems.innerHTML = cart
    .map(
      (item) => `
    <li class="cart-line" data-id="${item.id}">
      <div class="cart-line-top">
        <div>
          <p class="cart-line-name" id="cart-item-${item.id}">${item.name}</p>
          <p class="cart-line-sub">${formatPrice(item.price)} · ud.</p>
        </div>
        <span class="cart-line-total">${formatPrice(item.price * item.quantity)}</span>
      </div>
      <div class="cart-line-actions">
        <div class="qty-controls" role="group" aria-labelledby="cart-item-${item.id}">
          <button type="button" class="qty-btn" data-action="dec" aria-label="Quitar una unidad de ${item.name}">−</button>
          <span class="qty-value" aria-label="Cantidad: ${item.quantity}">${item.quantity}</span>
          <button type="button" class="qty-btn" data-action="inc" aria-label="Añadir una unidad de ${item.name}">+</button>
        </div>
        <button type="button" class="cart-remove" data-action="remove" aria-label="Quitar ${item.name} del carrito">Quitar</button>
      </div>
    </li>`
    )
    .join("");
}

export function renderCheckoutSummary(cart) {
  renderTotalsBreakdown(els.checkoutTotals, cart);

  if (cart.length === 0) {
    els.checkoutSummaryList.innerHTML =
      '<li class="cart-empty">No hay productos en el carrito.</li>';
    return;
  }

  els.checkoutSummaryList.innerHTML = cart
    .map(
      (item) => `
    <li class="checkout-line">
      <span>${item.name} × ${item.quantity}</span>
      <span>${formatPrice(item.price * item.quantity)}</span>
    </li>`
    )
    .join("");
}

export function openCartDrawer() {
  lastFocus = document.activeElement;
  els.cartOverlay.hidden = false;
  els.cartOverlay.setAttribute("aria-hidden", "false");
  els.cartDrawer.hidden = false;
  void els.cartDrawer.offsetWidth;
  els.cartOverlay.classList.add("is-open");
  els.cartDrawer.classList.add("is-open");
  document.body.classList.add("cart-open");
  els.cartLink.setAttribute("aria-expanded", "true");
  els.cartClose.focus();
}

export function closeCartDrawer({ skipFocus = false } = {}) {
  els.cartOverlay.classList.remove("is-open");
  els.cartDrawer.classList.remove("is-open");
  document.body.classList.remove("cart-open");
  els.cartLink.setAttribute("aria-expanded", "false");
  els.cartOverlay.setAttribute("aria-hidden", "true");

  const onEnd = () => {
    els.cartOverlay.hidden = true;
    els.cartDrawer.hidden = true;
    els.cartDrawer.removeEventListener("transitionend", onEnd);
    if (!skipFocus && lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  };
  els.cartDrawer.addEventListener("transitionend", onEnd);
}

export function openCheckoutScreen() {
  els.checkout.classList.remove("is-success");
  els.checkoutForm.reset();
  syncCardPreviewFromForm();
  els.checkout.hidden = false;
  void els.checkout.offsetWidth;
  els.checkout.classList.add("is-open");
  document.body.classList.add("checkout-open");
  els.coName.focus();
}

export function closeCheckoutScreen({ immediate = false } = {}) {
  els.checkout.classList.remove("is-open");
  document.body.classList.remove("checkout-open");

  if (immediate) {
    els.checkout.hidden = true;
    els.checkout.classList.remove("is-success");
    return;
  }

  const onEnd = () => {
    els.checkout.hidden = true;
    els.checkout.classList.remove("is-success");
    els.checkout.removeEventListener("transitionend", onEnd);
  };
  els.checkout.addEventListener("transitionend", onEnd);
}

export function showCheckoutSuccess(message) {
  els.checkout.classList.add("is-success");
  els.checkoutSuccessMsg.textContent = message;
}

export function updateCardBrand(digits) {
  const brand = detectCardBrand(digits);
  els.cardBrand.querySelectorAll(".card-brand-logo").forEach((logo) => {
    logo.classList.toggle("is-visible", logo.dataset.brand === brand);
  });
}

export function resetCardPreview() {
  els.card3d.classList.remove("is-flipped");
  els.cardNumberDisplay.textContent = "#### #### #### ####";
  els.cardHolderDisplay.textContent = "TU NOMBRE";
  els.cardExpiryDisplay.textContent = "MM/AA";
  els.cardCvvDisplay.textContent = "•••";
  updateCardBrand("");
}

export function syncCardPreviewFromForm() {
  const digits = onlyDigits(els.coCard.value);
  els.cardNumberDisplay.textContent = formatCardNumberDisplay(digits);
  updateCardBrand(digits);

  const holder = els.coCardName.value.trim();
  els.cardHolderDisplay.textContent = holder ? holder.toUpperCase() : "TU NOMBRE";

  const expDigits = onlyDigits(els.coExpiry.value);
  els.cardExpiryDisplay.textContent =
    expDigits.length === 0 ? "MM/AA" : formatExpiry(expDigits).padEnd(5, "•");

  const cvv = onlyDigits(els.coCvv.value).slice(0, 3);
  els.cardCvvDisplay.textContent = cvv || "•••";
}

export function setCardFlipped(flipped) {
  els.card3d.classList.toggle("is-flipped", flipped);
}

export function markAddButton(button) {
  const label = button.textContent;
  button.textContent = "¡Ya!";
  button.classList.add("is-added");
  setTimeout(() => {
    button.textContent = label;
    button.classList.remove("is-added");
  }, 900);
}

export function isCartOpen() {
  return els.cartDrawer.classList.contains("is-open");
}

export function isCheckoutOpen() {
  return els.checkout.classList.contains("is-open");
}
