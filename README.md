# Exercici 4 — VIBE · Ropa de segunda mano

E-commerce de **ropa preloved** en **un solo documento HTML** (`index.html`). Layout con **Flexbox**, carrito en **localStorage**, checkout con tarjeta interactiva y UI en lavanda suave.

## Cómo abrirlo

Abre `index.html` en el navegador (mejor con conexión para Google Fonts).

### Flujo rápido de prueba

1. Añade una o más prendas al carrito.
2. Abre el icono de cesta → **Ir a pagar**.
3. El checkout ya trae **datos ficticios** rellenados (envio + Visa de demo).
4. Pulsa **Confirmar pedido**.

## Funcionalidades

| Área | Qué hace |
|------|----------|
| **Catálogo** | 3 prendas de segunda mano (chaqueta, vaqueros, camiseta) con talla/estado. |
| **Navbar** | Marca **VIBE** + icono de cesta con contador superpuesto (sin fondo). |
| **Carrito** | Panel lateral: + / −, quitar, totales, **Ir a pagar**. Cierre × / overlay / Escape. |
| **Toast** | Notificación animada al añadir (3 s + barra de progreso). |
| **Totales** | Subtotal, envío (4,90 €; **gratis desde 50 €**), IVA 21 % incluido, total. |
| **Checkout** | Envío solo España; C.P. validado en local (provincias 01–52). |
| **Tarjeta** | Preview compacto; nº / caducidad en vivo; logo Visa/MC/…; flip al CVV2; 16 dígitos. |
| **Demo** | Formulario prefilled para probar el flujo sin teclear. |
| **Persistencia** | `localStorage` clave `vibe-ropa-cart`. |
| **Responsive** | Flexbox + tipografía adaptable. |

### Datos ficticios por defecto (checkout)

| Campo | Valor demo |
|-------|------------|
| Nombre | Alex Rivera |
| Email | alex.rivera@demo.local |
| Dirección | Calle de Alcalá 42, 3º B |
| Ciudad / C.P. | Madrid / 28014 |
| Tarjeta | `4111 1111 1111 1111` (Visa) |
| Titular | Alex Rivera |
| Caducidad / CVV2 | 12/28 / 123 |

> Nota: la tarjeta es un número de prueba habitual; no hay cobro real.

## Parte técnica

### Estructura

Un único `index.html`: HTML semántico + CSS + JS embebidos. Productos con `data-id`, `data-name`, `data-price`.

### UI

| Pieza | Detalle |
|-------|---------|
| Tipografía | **Outfit** + **Nunito Sans** |
| Color | Fondo violeta suave; acentos malva (`#9b84c7`, `#b39ddb`) |
| Motion | Entrada de cards, hover, pulso carrito, toast, flip de tarjeta |
| Accesibilidad | `aria-*` en carrito/checkout; `prefers-reduced-motion` |

### Layout Flexbox

| Contenedor | Uso |
|------------|-----|
| `body` | Columna; `main { flex: 1 }` |
| `.navbar` | Marca ↔ menú |
| `.product-grid` | Fila + `flex-wrap` |
| `.product-meta` / `.footer` | Filas (footer en columna en móvil) |

### Carrito / checkout (JS)

| Pieza | Detalle |
|-------|---------|
| Clave | `vibe-ropa-cart` |
| Ítem | `{ id, name, price, quantity }` |
| Totales | `getOrderTotals()` → subtotal, envío, IVA, total |
| C.P. | `isValidSpanishZip()` (5 dígitos, 01–52) |
| Marca tarjeta | `detectCardBrand()` por BIN (Visa, MC, Amex…) |
| API | `loadCart`, `saveCart`, `addToCart`, `openCart`, `openCheckout` |

### Archivos

```
exercici4/
├── index.html
└── README.md
```

## Criterios cubiertos

- [x] Navbar, listado (3), footer, Flexbox, un solo documento
- [x] Carrito + contador + localStorage
- [x] Icono cesta + número sin fondo
- [x] Toast 3 s, panel carrito, checkout
- [x] IVA + envío desglosados; envío gratis ≥ 50 €
- [x] Ropa de segunda mano; tarjeta preview + flip CVV + logo marca
- [x] C.P. España (sin Google Maps, de pago)
- [x] Datos demo en checkout para probar el flujo
