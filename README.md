# Exercici 4 — VIBE · Ropa de segunda mano

E-commerce de **ropa preloved** con HTML + CSS + JS en patrón **MVC**. Layout con **Flexbox**, carrito en **localStorage**, checkout con tarjeta interactiva y UI en lavanda suave.

## Cómo abrirlo

Abre `index.html` en el navegador (mejor con conexión para Google Fonts).

> Con `type="module"`, si abres el archivo como `file://` algunos navegadores bloquean módulos. Sirve la carpeta con un servidor local (p. ej. extensión Live Server o `npx serve`).

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

### Arquitectura MVC

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| **Model** | `js/model.js` | Carrito, `localStorage`, totales, validaciones puras, marca de tarjeta. |
| **View** | `js/view.js` | Render del DOM, toast, paneles, preview de tarjeta. |
| **Controller** | `js/controller.js` | Eventos de usuario; orquesta Model ↔ View. |
| **Entry** | `app.js` | Arranque: `init()`. |

### Estructura de archivos

```
exercici4/
├── index.html
├── styles.css
├── app.js
├── js/
│   ├── model.js
│   ├── view.js
│   └── controller.js
└── README.md
```

### UI

| Pieza | Detalle |
|-------|---------|
| Tipografía | **Outfit** + **Nunito Sans** |
| Color | Variables CSS en `:root` (`--accent*`, `--bg-*`, `--ink`, `--muted`…) |
| Semántica | Landmarks, catálogo en `section`+`ul`/`article`, `fieldset`/`legend`, skip-link |
| Accesibilidad | `label`↔`for`/`id`; `aria-label` en iconos; `aria-expanded`/`aria-disabled` |

### Layout Flexbox

| Contenedor | Uso |
|------------|-----|
| `body` | Columna; `main { flex: 1 }` |
| `.navbar` | Marca ↔ menú ↔ carrito |
| `.product-grid` | Fila + `flex-wrap` |
| `.product-meta` / `.footer` | Filas (footer en columna en móvil) |

## Criterios cubiertos

- [x] Navbar, listado (3), footer, Flexbox
- [x] CSS y JS separados; JS en MVC
- [x] Carrito + contador + localStorage
- [x] Toast, panel carrito, checkout, tarjeta, C.P. España
- [x] Datos demo en checkout
