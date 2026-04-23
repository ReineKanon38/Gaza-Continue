# 🛒 Sistema de Carrito - Documentación

## 📁 Estructura de Archivos

```
frontend/src/
├── context/
│   └── CartContext.jsx     # Context + Provider + Reducer
├── hooks/
│   ├── useCartHooks.js     # Hooks personalizados del carrito
│   └── index.js           # Exportaciones centralizadas
├── components/
│   └── Cart.jsx           # Componente visual del carrito
└── pages/
    └── Cart.jsx           # Página del carrito (si existe)
```

## 🔧 Cómo Importar

### ✅ Imports Correctos:

```javascript
// Para usar hooks del carrito
import { useCartHelpers } from '../hooks/useCartHooks';
// O desde el índice
import { useCartHelpers } from '../hooks';

// Para el Provider (en main.jsx o App.jsx)
import { CartProvider } from './context/CartContext';

// Para constantes y contexts (si necesitas acceso directo)
import { CART_ACTIONS, CartContext } from './context/CartContext';
```

### ❌ Imports Obsoletos (YA NO USAR):

```javascript
// ❌ NO usar - esto ya no existe
import { useCartHelpers } from '../context/CartContext';
```

## 🎯 Hooks Disponibles

### `useCartHelpers()`
Hook principal que incluye todas las funcionalidades:

```javascript
const {
    // Estado
    cart,
    isCartEmpty,
    canCheckout,
    
    // Funciones básicas
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Funciones avanzadas
    applyDiscount,
    removeDiscount,
    setShipping,
    setLoading,
    setError,
    
    // Cálculos
    totalItems,
    subtotal,
    discountAmount,
    totalPrice,
    
    // Utilidades
    isInCart,
    getItemQuantity,
    getCartSummary,
    findItemByProductId
} = useCartHelpers();
```

### `useCart()`
Hook para acceso directo al estado del carrito:

```javascript
const cart = useCart();
// cart.items, cart.loading, cart.error, etc.
```

### `useCartDispatch()`
Hook para dispatch directo de acciones:

```javascript
const dispatch = useCartDispatch();
dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: { product, quantity } });
```

## 🚀 Uso en Componentes

### Ejemplo básico:
```javascript
import React from 'react';
import { useCartHelpers } from '../hooks/useCartHooks';

const MiComponente = () => {
    const { addToCart, totalItems, isInCart } = useCartHelpers();
    
    const producto = { _id: '123', name: 'Producto', price: 100 };
    
    return (
        <div>
            <p>Items en carrito: {totalItems}</p>
            <button onClick={() => addToCart(producto)}>
                {isInCart(producto._id) ? 'En carrito' : 'Agregar'}
            </button>
        </div>
    );
};
```

## 🔄 Migración Completada

Todos los archivos han sido actualizados automáticamente:
- ✅ `AppNavbar.jsx`
- ✅ `ProductCard.jsx` 
- ✅ `Cart.jsx` (componente)
- ✅ `Cart.jsx` (página)
- ✅ `main.jsx` (ya estaba correcto)

## 🎉 Beneficios de la Nueva Estructura

- ✅ **Sin errores de Fast Refresh**
- ✅ **Separación clara de responsabilidades**
- ✅ **Mejor organización del código**
- ✅ **Imports más claros y mantenibles**
- ✅ **Estructura escalable para futuras funcionalidades**