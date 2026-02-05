# POV - Punto de Venta (Cotillón)

Sistema de Punto de Venta desarrollado con React + Vite para gestión de comercio de artículos de fiesta.

## 🚀 Tecnologías

- **React 19** - UI Library
- **Vite 7** - Build Tool
- **Tailwind CSS** (via CDN) - Estilos
- **Lucide React** - Iconos

## 📁 Estructura del Proyecto

```text
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── AppModals.jsx          # Modales de la aplicación
│   │   ├── ProductImage.jsx       # Componente de imagen de producto
│   │   ├── Sidebar.jsx            # Barra lateral de navegación
│   │   └── TicketPrintLayout.jsx  # Layout para impresión de tickets
│   ├── hooks/
│   │   ├── useBarcodeScanner.js   # Hook para escaneo de códigos de barras
│   │   └── useClients.js          # Hook para gestión de clientes/socios
│   ├── utils/
│   │   └── helpers.js             # ♻️ Funciones helper centralizadas (DRY)
│   ├── views/
│   │   ├── CategoryManagerView.jsx # Vista de gestión de categorías
│   │   ├── ClientsView.jsx         # Vista de gestión de socios
│   │   ├── DashboardView.jsx       # Vista de control de caja
│   │   ├── HistoryView.jsx         # Vista de historial de ventas
│   │   ├── InventoryView.jsx       # Vista de gestión de stock
│   │   ├── LogsView.jsx            # Vista de registro de acciones
│   │   └── POSView.jsx             # Vista de punto de venta
│   ├── App.css
│   ├── App.jsx                     # Componente principal
│   ├── data.js                     # Datos iniciales y constantes
│   ├── index.css
│   └── main.jsx                    # Entry point
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```

## ⚡ Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🔑 Usuarios de Prueba

| Rol | Contraseña |
|-----|------------|
| Dueño | 1234 |
| Vendedor | 4321 |

## 📝 Características

- **Punto de Venta (POS)**: Venta rápida con escaneo de códigos de barras
- **Gestión de Inventario**: CRUD de productos con múltiples categorías
- **Sistema de Socios**: Programa de fidelización con puntos
- **Control de Caja**: Apertura/cierre con cierre automático programado
- **Historial**: Registro completo de transacciones y acciones
- **Impresión de Tickets**: Layout optimizado para impresoras térmicas 58mm

## 🔄 Changelog v0.0.3.2 (Corregido)

### 🔧 FIX
- Corregido `index.html`: script de Tailwind movido dentro del `<head>`
- Eliminado Tailwind CDN duplicado
- Corregida ruta de favicon (`/favicon.svg`)

### ♻️ REFACTOR
- Creado `src/utils/helpers.js` con funciones centralizadas:
  - `formatPrice()` - Formato de precios sin decimales
  - `formatTime24()` - Conversión de hora 12h a 24h
  - `getGradientForItem()` - Generación de gradientes para placeholders
  - `normalizeDate()` - Normalización de fechas argentinas
- Eliminado código duplicado en múltiples archivos (DRY)

## 🧪 Compatibilidad

- ✅ StackBlitz
- ✅ React + Vite
- ✅ Node.js 18+

---

*Desarrollado para gestión de Cotillón*
