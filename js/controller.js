/** Controller — eventos de usuario y orquestación Model ↔ View. */

import {
  addProductToCart,
  clearCart,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  formatPrice,
  getOrderTotals,
  isValidCardNumber,
  isValidCvv,
  isValidExpiry,
  isValidSpanishZip,
  loadCart,
  onlyDigits,
  removeItem,
  saveCart,
  setItemQuantity,
} from "./model.js";
import * as view from "./view.js";

function validateZipField({ requireComplete = false } = {}) {
  const zip = view.sanitizeDigitField(view.els.coZip, 5);
  if (!zip) return view.setFieldError(view.els.coZip);
  if (!requireComplete && zip.length < 5) return view.setFieldError(view.els.coZip);
  return view.setFieldError(
    view.els.coZip,
    isValidSpanishZip(zip) ? "" : "Introduce un C.P. español válido"
  );
}

function validateCardField({ requireComplete = false } = {}) {
  const digits = onlyDigits(view.els.coCard.value);
  if (!digits) return view.setFieldError(view.els.coCard);
  if (!requireComplete && digits.length < 16) return view.setFieldError(view.els.coCard);
  return view.setFieldError(
    view.els.coCard,
    isValidCardNumber(digits)
      ? ""
      : "La tarjeta debe tener exactamente 16 dígitos"
  );
}

function validateExpiryField({ requireComplete = false } = {}) {
  const value = view.els.coExpiry.value.trim();
  if (!value) return view.setFieldError(view.els.coExpiry);
  if (!requireComplete && value.length < 5) return view.setFieldError(view.els.coExpiry);
  return view.setFieldError(
    view.els.coExpiry,
    isValidExpiry(value) ? "" : "Caducidad inválida (MM/AA)"
  );
}

function validateCvvField({ requireComplete = false } = {}) {
  const digits = onlyDigits(view.els.coCvv.value);
  if (!digits) return view.setFieldError(view.els.coCvv);
  if (!requireComplete && digits.length < 3) return view.setFieldError(view.els.coCvv);
  return view.setFieldError(
    view.els.coCvv,
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
  const ok = checks.every(Boolean) && view.els.checkoutForm.checkValidity();
  if (!ok) view.els.checkoutForm.reportValidity();
  return ok;
}

function refreshCartUi() {
  view.renderCart(loadCart());
}

function handleAddToCart(product) {
  const cart = addProductToCart(loadCart(), product);
  saveCart(cart);
  view.updateCartCount(cart);
  if (view.isCartOpen()) refreshCartUi();
  view.pulseCart();
  view.showToast(`Añadido: <strong>${product.name}</strong>`);
}

function openCart() {
  refreshCartUi();
  view.openCartDrawer();
}

function closeCart(options) {
  view.closeCartDrawer(options);
}

function openCheckout() {
  const cart = loadCart();
  if (cart.length === 0) return;
  view.renderCheckoutSummary(cart);
  view.openCheckoutScreen();
  validateZipField();
}

function closeCheckout() {
  view.closeCheckoutScreen();
}

function bindEvents() {
  view.els.cartLink.addEventListener("click", openCart);
  view.els.cartClose.addEventListener("click", () => closeCart());
  view.els.cartOverlay.addEventListener("click", () => closeCart());

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (view.isCheckoutOpen()) {
      closeCheckout();
      return;
    }
    if (view.isCartOpen()) closeCart();
  });

  view.els.cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const line = button.closest("li.cart-line");
    if (!line) return;

    const id = line.dataset.id;
    const cart = loadCart();
    const item = cart.find((entry) => entry.id === id);
    if (!item) return;

    const action = button.dataset.action;
    let next = cart;
    if (action === "inc") next = setItemQuantity(cart, id, item.quantity + 1);
    if (action === "dec") next = setItemQuantity(cart, id, item.quantity - 1);
    if (action === "remove") next = removeItem(cart, id);

    saveCart(next);
    refreshCartUi();
  });

  view.els.cartCheckout.addEventListener("click", () => {
    if (view.els.cartCheckout.disabled) return;
    closeCart({ skipFocus: true });
    openCheckout();
  });

  view.els.checkoutBack.addEventListener("click", () => {
    view.closeCheckoutScreen({ immediate: true });
    openCart();
  });

  view.els.checkoutDone.addEventListener("click", closeCheckout);

  view.els.coCard.addEventListener("input", () => {
    view.sanitizeDigitField(view.els.coCard, 16, formatCardNumber);
    validateCardField();
    view.syncCardPreviewFromForm();
  });

  view.els.coCardName.addEventListener("input", view.syncCardPreviewFromForm);

  view.els.coExpiry.addEventListener("input", () => {
    view.sanitizeDigitField(view.els.coExpiry, 4, formatExpiry);
    validateExpiryField();
    view.syncCardPreviewFromForm();
  });

  view.els.coCvv.addEventListener("input", () => {
    view.sanitizeDigitField(view.els.coCvv, 3);
    validateCvvField();
    view.syncCardPreviewFromForm();
  });

  view.els.coCvv.addEventListener("focus", () => view.setCardFlipped(true));

  [view.els.coCard, view.els.coCardName, view.els.coExpiry].forEach((input) => {
    input.addEventListener("focus", () => view.setCardFlipped(false));
  });

  view.els.coZip.addEventListener("input", () => validateZipField());

  view.els.checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateCheckoutForm()) return;

    const cardDigits = onlyDigits(view.els.coCard.value);
    const data = new FormData(view.els.checkoutForm);
    const name = String(data.get("name") || "").trim();
    const brand = detectCardBrand(cardDigits);
    const totals = getOrderTotals(loadCart());
    const brandLabel = brand ? brand.toUpperCase() : "TARJETA";

    saveCart(clearCart());
    view.updateCartCount([]);
    view.showCheckoutSuccess(
      `Gracias, ${name}. Pedido de ${formatPrice(totals.total)} con ${brandLabel} registrado (demo local).`
    );
    view.showToast("Pedido confirmado");
    view.resetCardPreview();
  });

  document.querySelectorAll(".btn-add").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      if (!card) return;

      handleAddToCart({
        id: card.dataset.id,
        name: card.dataset.name,
        price: Number(card.dataset.price),
      });
      view.markAddButton(button);
    });
  });
}

export function init() {
  view.els.cartLink.setAttribute("aria-expanded", "false");
  view.updateCartCount(loadCart());
  bindEvents();
}
