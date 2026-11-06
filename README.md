# Exercici 4 — VIBE · Ropa de segunda mano

E-commerce de **ropa preloved** con HTML + CSS + JS en patrón **MVC**. Layout con **Flexbox**, carrito en **localStorage**, checkout con tarjeta interactiva y UI en lavanda suave.

## Cómo probar la app

La app usa módulos ES (`import` / `export`). Por eso **no conviene** abrir `index.html` a doble clic (`file://`): el navegador puede bloquear los JS. Hay que servir la carpeta `exercici4` con un servidor local.

No hace falta ninguna configuración extra en el proyecto: el servidor solo publica los archivos de la carpeta desde la que lo lanzas.

### 1. Arrancar un servidor (elige una opción)

**Opción A — Python** (si ya lo tienes instalado):

```bash
cd exercici4
python -m http.server 5500
```

Abre en el navegador: [http://localhost:5500](http://localhost:5500)

Para parar el servidor: `Ctrl+C` en esa terminal.

**Opción B — Live Server** (extensión de Cursor / VS Code): clic derecho en `index.html` → *Open with Live Server*.

**Opción C — Node.js** (si tienes `npx`):

```bash
cd exercici4
npx --yes serve .
```

> Tip: lanza el servidor **dentro de `exercici4`**. Si lo lanzas en la carpeta padre, tendrás que entrar a `/exercici4/` en la URL.

Conexión a internet recomendada la primera vez (Google Fonts).

### 2. Flujo de prueba en la UI

1. Añade una o más prendas al carrito (mira el toast y el contador del icono).
2. Abre el icono de cesta → revisa cantidades, totales, IVA y envío.
3. Pulsa **Ir a pagar** (el formulario ya viene con datos demo).
4. Comprueba la preview de la tarjeta y el giro al enfocar el CVV2.
5. Pulsa **Confirmar pedido** → mensaje de éxito.
6. Recarga la página: el carrito vacío se mantiene vía `localStorage` (clave `vibe-ropa-cart`).

### 3. Datos demo del checkout

| Campo | Valor |
|-------|-------|
| Nombre | Alex Rivera |
| Email | alex.rivera@demo.local |
| Dirección | Calle de Alcalá 42, 3º B |
| Ciudad / C.P. | Madrid / 28014 |
| Tarjeta | `4111 1111 1111 1111` (Visa de prueba) |
| Titular | Alex Rivera |
| Caducidad / CVV2 | 12/28 / 123 |

No hay cobro real; es solo demo local.

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
