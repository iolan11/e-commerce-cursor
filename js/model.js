/** Model — datos, reglas de negocio y persistencia (sin DOM). */

export const STORAGE_KEY = "vibe-ropa-cart";
export const IVA_RATE = 0.21;
export const SHIPPING_COST = 4.9;
export const FREE_SHIPPING_FROM = 50;

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

export function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export function formatPrice(value) {
  return (
    value.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

export function formatCardNumber(digits) {
  const clipped = digits.slice(0, 16);
  const parts = clipped.match(/.{1,4}/g) || [];
  return parts.join(" ");
}

export function formatCardNumberDisplay(digits) {
  return formatCardNumber((digits + "################").slice(0, 16));
}

export function formatExpiry(digits) {
  const clipped = digits.slice(0, 4);
  if (clipped.length <= 2) return clipped;
  return `${clipped.slice(0, 2)}/${clipped.slice(2)}`;
}

export function detectCardBrand(digits) {
  if (!digits) return null;
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(6011|65|64[4-9])/.test(digits)) return "discover";
  if (/^(5018|5020|5038|6304|6759|676[1-3]|50)/.test(digits)) return "maestro";
  return null;
}

export function isValidSpanishZip(zip) {
  return /^\d{5}$/.test(zip) && Boolean(ES_PROVINCES[zip.slice(0, 2)]);
}

export function isValidCardNumber(digits) {
  return digits.length === 16;
}

export function isValidExpiry(value) {
  return /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);
}

export function isValidCvv(digits) {
  return /^\d{3}$/.test(digits);
}

export function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function cartItemCount(cart) {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotal(cart) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getOrderTotals(cart) {
  const subtotal = cartSubtotal(cart);
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const base = total / (1 + IVA_RATE);
  const iva = total - base;
  return { subtotal, shipping, iva, base, total };
}

export function addProductToCart(cart, product) {
  const next = cart.map((item) => ({ ...item }));
  const existing = next.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    next.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  return next;
}

export function setItemQuantity(cart, id, quantity) {
  if (quantity <= 0) {
    return cart.filter((entry) => entry.id !== id);
  }

  return cart.map((entry) =>
    entry.id === id ? { ...entry, quantity } : entry
  );
}

export function removeItem(cart, id) {
  return cart.filter((entry) => entry.id !== id);
}

export function clearCart() {
  return [];
}
