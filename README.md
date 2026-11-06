# Exercici 4 — VIBE · Ropa de segunda mano

E-commerce de **ropa preloved** con HTML + CSS + JS separados. Layout con **Flexbox**, carrito en **localStorage**, checkout con tarjeta interactiva y UI en lavanda suave.

## Cómo abrirlo

Abre `index.html` en el navegador (mejor con conexión para Google Fonts). Los archivos `styles.css` y `app.js` deben estar en la misma carpeta.

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

| Archivo | Rol |
|---------|-----|
| `index.html` | Marcado semántico (navbar, catálogo, carrito, checkout). |
| `styles.css` | Estilos, variables, layout Flexbox, animaciones. |
| `app.js` | Carrito, localStorage, checkout, tarjeta, validaciones. |
| `README.md` | Documentación. |

Productos con `data-id`, `data-name`, `data-price`. El JS se carga con `defer`.

### UI

| Pieza | Detalle |
|-------|---------|
| Tipografía | **Outfit** + **Nunito Sans** |
| Color | Fondo violeta suave; acentos malva (`#9b84c7`, `#b39ddb`) |
| Motion | Entrada de cards, hover, pulso carrito, toast, flip de tarjeta |
| Semántica | Landmarks (`header`/`main`/`footer`), catálogo en `section`+`ul`/`article`, diálogos con `header`/`footer`, `fieldset`/`legend`, `data` en precios, skip-link |
| Accesibilidad | `label`↔`for`/`id`; `aria-label` en iconos; `aria-expanded`/`aria-disabled` |

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
| C.P. | `validateZipField()` / `isValidSpanishZip()` (5 dígitos, 01–52) |
| Marca tarjeta | `detectCardBrand()` por BIN (Visa, MC, Amex…) |
| Validación DRY | `setFieldError`, `sanitizeDigitField`, `validateCheckoutForm` |
| API | `loadCart`, `saveCart`, `addToCart`, `openCart`, `openCheckout` |

### Archivos

```
exercici4/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Criterios cubiertos

- [x] Navbar, listado (3), footer, Flexbox
- [x] CSS y JS en archivos independientes
- [x] Carrito + contador + localStorage
- [x] Icono cesta + número sin fondo
- [x] Toast 3 s, panel carrito, checkout
- [x] IVA + envío desglosados; envío gratis ≥ 50 €
- [x] Ropa de segunda mano; tarjeta preview + flip CVV + logo marca
- [x] C.P. España (sin Google Maps, de pago)
- [x] Datos demo en checkout para probar el flujo
