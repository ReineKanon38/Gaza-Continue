# 🎨 Sistema de Diseño Unificado - GAZA-SYSCOM

## 📋 Índice
1. [Introducción](#introducción)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Variables Globales](#variables-globales)
4. [Componentes Reutilizables](#componentes-reutilizables)
5. [Guía de Uso](#guía-de-uso)
6. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Introducción

Este sistema de diseño modular unifica todos los estilos de la aplicación GAZA-SYSCOM, facilitando el mantenimiento, escalabilidad y consistencia visual en todo el proyecto.

### Ventajas del Sistema

✅ **Consistencia Visual**: Todos los componentes usan las mismas variables  
✅ **Fácil Mantenimiento**: Cambio en un lugar afecta toda la app  
✅ **Escalabilidad**: Fácil agregar nuevos componentes  
✅ **Modularidad**: Estilos organizados por responsabilidad  
✅ **Performance**: CSS optimizado y sin duplicación  

---

## 📁 Estructura de Archivos

```
frontend/src/
├── styles/
│   ├── variables.css      # Variables CSS globales
│   ├── base.css           # Estilos base y reset
│   ├── components.css     # Componentes reutilizables
│   ├── utilities.css      # Clases helper
│   └── main.css           # Punto de entrada (importa todo)
├── index.css              # Archivo principal (importa main.css)
├── components/
│   └── AppNavbar.css      # Estilos específicos del navbar
└── pages/
    ├── Catalog.css        # Estilos específicos del catálogo
    ├── AdminPanel.css     # Estilos específicos del admin
    └── Checkout.css       # Estilos específicos del checkout
```

### Flujo de Importación

```
index.css
    └── styles/main.css
            ├── variables.css
            ├── base.css
            ├── components.css
            └── utilities.css
```

---

## 🎨 Variables Globales

### Colores Primarios

```css
--primary-dark: #1a2947       /* Azul oscuro principal */
--primary-blue: #1e3c72       /* Azul medio */
--primary-orange: #ff6b35     /* Naranja principal */
--primary-orange-hover: #f54021  /* Naranja hover */
```

**Uso:**
```css
.mi-elemento {
  background: var(--primary-blue);
  color: var(--primary-orange);
}
```

### Colores de Fondo

```css
--bg-light: #f5f7fa           /* Fondo claro */
--bg-lighter: #e8eef5         /* Fondo más claro */
--bg-white: #ffffff           /* Blanco */
--bg-card: #ffffff            /* Fondo de tarjetas */
```

### Colores de Texto

```css
--text-primary: #1e293b       /* Texto principal */
--text-secondary: #64748b     /* Texto secundario */
--text-muted: #94a3b8         /* Texto atenuado */
--text-white: #ffffff         /* Texto blanco */
```

### Colores de Estado

```css
--success: #10b981            /* Verde éxito */
--warning: #f59e0b            /* Amarillo advertencia */
--danger: #ef4444             /* Rojo peligro */
--info: #3b82f6               /* Azul información */
```

### Bordes y Radios

```css
--border-radius: 10px         /* Radio estándar */
--border-radius-sm: 8px       /* Radio pequeño */
--border-radius-lg: 15px      /* Radio grande */
--border-radius-full: 50px    /* Radio completo (pills) */
```

### Sombras

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1)     /* Sombra pequeña */
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1)     /* Sombra media */
--shadow-lg: 0 4px 15px rgba(0, 0, 0, 0.15)   /* Sombra grande */
--shadow-xl: 0 10px 25px rgba(0, 0, 0, 0.2)   /* Sombra extra grande */
```

### Gradientes

```css
--gradient-primary: linear-gradient(135deg, #1a2947 0%, #1e3c72 100%)
--gradient-orange: linear-gradient(135deg, #ff6b35 0%, #f54021 100%)
--gradient-bg: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%)
```

### Espaciado

```css
--spacing-xs: 0.25rem    /* 4px */
--spacing-sm: 0.5rem     /* 8px */
--spacing-md: 1rem       /* 16px */
--spacing-lg: 1.5rem     /* 24px */
--spacing-xl: 2rem       /* 32px */
--spacing-2xl: 3rem      /* 48px */
```

### Tipografía

```css
--font-family: 'Poppins', sans-serif

/* Tamaños */
--font-size-xs: 0.75rem      /* 12px */
--font-size-sm: 0.875rem     /* 14px */
--font-size-base: 1rem       /* 16px */
--font-size-lg: 1.125rem     /* 18px */
--font-size-xl: 1.25rem      /* 20px */
--font-size-2xl: 1.5rem      /* 24px */
--font-size-3xl: 2rem        /* 32px */

/* Pesos */
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
--font-weight-extrabold: 800
```

### Transiciones

```css
--transition-fast: 0.15s ease
--transition-base: 0.3s ease
--transition-slow: 0.5s ease
```

---

## 🧩 Componentes Reutilizables

### Cards

```html
<div class="card-custom">
  <div class="card-custom-header">
    Título de la tarjeta
  </div>
  <div class="card-body">
    Contenido...
  </div>
</div>
```

### Botones

```html
<!-- Botón primario -->
<button class="btn-primary-custom">
  Acción Principal
</button>

<!-- Botón naranja -->
<button class="btn-orange-custom">
  Acción Especial
</button>
```

### Badges

```html
<span class="badge-custom badge-success">Completado</span>
<span class="badge-custom badge-warning">Pendiente</span>
<span class="badge-custom badge-danger">Error</span>
<span class="badge-custom badge-info">Información</span>
```

### Inputs

```html
<input type="text" class="input-custom" placeholder="Escribe aquí...">
```

### Page Header

```html
<div class="page-header-custom">
  <span class="page-header-icon">🛍️</span>
  <div>
    <h1 class="page-header-title">Título de la Página</h1>
    <p class="text-muted-custom">Descripción opcional</p>
  </div>
</div>
```

### Empty State

```html
<div class="empty-state">
  <div class="empty-state-icon">📦</div>
  <h3 class="empty-state-title">No hay resultados</h3>
  <p class="empty-state-text">
    Intenta con otros criterios de búsqueda
  </p>
</div>
```

### Alerts

```html
<div class="alert-custom alert-success">
  ✅ Operación exitosa
</div>

<div class="alert-custom alert-warning">
  ⚠️ Advertencia importante
</div>

<div class="alert-custom alert-danger">
  ❌ Ocurrió un error
</div>

<div class="alert-custom alert-info">
  ℹ️ Información adicional
</div>
```

---

## 🛠️ Clases Utilitarias

### Espaciado

```html
<!-- Márgenes -->
<div class="mt-md">Margen superior medio</div>
<div class="mb-lg">Margen inferior grande</div>

<!-- Padding -->
<div class="p-xl">Padding extra grande</div>
```

### Texto

```html
<!-- Colores -->
<span class="text-primary-custom">Texto azul</span>
<span class="text-orange-custom">Texto naranja</span>
<span class="text-muted-custom">Texto atenuado</span>

<!-- Tamaños -->
<p class="text-sm">Texto pequeño</p>
<p class="text-lg">Texto grande</p>
<p class="text-2xl">Texto extra grande</p>

<!-- Pesos -->
<p class="font-medium">Peso medio</p>
<p class="font-bold">Peso negrita</p>
```

### Sombras

```html
<div class="shadow-sm-custom">Sombra pequeña</div>
<div class="shadow-md-custom">Sombra media</div>
<div class="shadow-lg-custom">Sombra grande</div>
```

### Bordes Redondeados

```html
<div class="rounded">Radio estándar</div>
<div class="rounded-lg">Radio grande</div>
<div class="rounded-full">Radio completo</div>
```

### Flexbox

```html
<div class="flex-center">Centrado horizontal y vertical</div>
<div class="flex-between">Espacio entre elementos</div>
<div class="flex gap-md">Flex con gap medio</div>
```

### Animaciones

```html
<div class="animate-fade-in">Aparece suavemente</div>
<div class="animate-slide-in">Desliza desde la izquierda</div>
<div class="animate-pulse">Pulsa continuamente</div>
```

### Hover Effects

```html
<div class="hover-lift">Se eleva al pasar el mouse</div>
<div class="hover-scale">Se agranda al pasar el mouse</div>
```

---

## 📖 Guía de Uso

### Crear un Nuevo Componente

**1. Usar variables globales:**

```css
.mi-nuevo-componente {
  background: var(--bg-white);
  color: var(--text-primary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}
```

**2. Usar clases utilitarias:**

```html
<div class="bg-white-custom p-lg rounded shadow-md-custom">
  Mi componente
</div>
```

### Agregar Estilos Específicos de Página

Crear archivo CSS en `pages/` e importar las variables:

```css
/* pages/MiPagina.css */

.mi-pagina-container {
  background: var(--gradient-bg);
  min-height: 100vh;
  padding: var(--spacing-xl);
}

.mi-pagina-card {
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-2xl);
}
```

### Sobrescribir Estilos de Bootstrap

Ya está configurado en `main.css`, pero puedes extender:

```css
/* Ejemplo: Personalizar btn-primary */
.btn-primary {
  background: var(--gradient-primary) !important;
  border: none !important;
  box-shadow: var(--shadow-md);
}
```

---

## ✅ Mejores Prácticas

### 1. Siempre Usar Variables

❌ **Incorrecto:**
```css
.elemento {
  color: #1a2947;
  padding: 16px;
  border-radius: 10px;
}
```

✅ **Correcto:**
```css
.elemento {
  color: var(--primary-dark);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
}
```

### 2. Preferir Clases Utilitarias

❌ **Incorrecto:**
```css
.mi-boton {
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

✅ **Correcto:**
```html
<button class="p-md rounded-sm shadow-md-custom">
  Mi Botón
</button>
```

### 3. Modularizar Estilos

- Variables globales → `variables.css`
- Estilos base → `base.css`
- Componentes comunes → `components.css`
- Estilos específicos → Archivo propio en `pages/` o `components/`

### 4. Naming Conventions

- Variables: kebab-case → `--primary-color`
- Clases: kebab-case → `.my-component`
- BEM para componentes complejos → `.card__header--active`

### 5. Responsive Design

Usar las media queries definidas:

```css
/* Mobile first */
.elemento {
  padding: var(--spacing-md);
}

/* Tablet */
@media (max-width: 991px) {
  .elemento {
    padding: var(--spacing-sm);
  }
}

/* Mobile */
@media (max-width: 767px) {
  .elemento {
    padding: var(--spacing-xs);
  }
}
```

### 6. Performance

- Evitar !important (solo en overrides de Bootstrap)
- Usar transform para animaciones (mejor performance)
- Consolidar media queries
- Minimizar selectores anidados (máx. 3 niveles)

---

## 🎯 Ejemplos Completos

### Card de Producto

```html
<div class="card-custom hover-lift">
  <img src="producto.jpg" alt="Producto" class="rounded-lg">
  <div class="p-lg">
    <h3 class="text-xl font-bold text-primary-custom mb-sm">
      Nombre del Producto
    </h3>
    <p class="text-muted-custom mb-md">
      Descripción breve del producto
    </p>
    <div class="flex-between mb-md">
      <span class="text-2xl font-bold text-orange-custom">$999.00</span>
      <span class="badge-custom badge-success">En Stock</span>
    </div>
    <button class="btn-orange-custom w-100">
      Agregar al Carrito
    </button>
  </div>
</div>
```

### Formulario

```html
<div class="card-custom p-xl">
  <h2 class="text-2xl font-bold text-primary-custom mb-lg">
    Información Personal
  </h2>
  
  <div class="mb-md">
    <label class="font-medium text-primary mb-sm">Nombre</label>
    <input type="text" class="input-custom" placeholder="Tu nombre">
  </div>
  
  <div class="mb-md">
    <label class="font-medium text-primary mb-sm">Email</label>
    <input type="email" class="input-custom" placeholder="tu@email.com">
  </div>
  
  <div class="alert-custom alert-info mb-md">
    ℹ️ Tus datos están protegidos
  </div>
  
  <button class="btn-primary-custom w-100">
    Guardar Cambios
  </button>
</div>
```

---

## 🔄 Migración de Código Legacy

### Paso 1: Identificar Valores Hardcodeados

Buscar en archivos CSS:
- Colores hexadecimales (`#1a2947`)
- Valores de padding/margin (`16px`, `1rem`)
- Box shadows hardcodeados
- Border radius hardcodeados

### Paso 2: Reemplazar con Variables

```css
/* Antes */
.mi-elemento {
  background: #1a2947;
  padding: 16px;
  border-radius: 10px;
}

/* Después */
.mi-elemento {
  background: var(--primary-dark);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
}
```

### Paso 3: Consolidar Estilos Duplicados

Si varios componentes tienen estilos similares, crear una clase reutilizable en `components.css`.

---

## 📚 Recursos Adicionales

- **Variables CSS**: `frontend/src/styles/variables.css`
- **Componentes**: `frontend/src/styles/components.css`
- **Utilidades**: `frontend/src/styles/utilities.css`
- **Bootstrap Docs**: https://getbootstrap.com/docs/5.3/

---

## 🆘 Soporte

Para dudas o problemas con el sistema de diseño:
1. Revisa este documento
2. Consulta los archivos en `frontend/src/styles/`
3. Revisa ejemplos en componentes existentes

---

*Última actualización: Diciembre 2024*  
*Sistema de Diseño GAZA-SYSCOM v1.0*
