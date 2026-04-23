// Hooks personalizados para el carrito
import { useContext } from 'react';
import { CartContext, CartDispatchContext, CART_ACTIONS } from '../context/CartContext';

// Hook personalizado para usar el carrito
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe usarse dentro de CartProvider');
    }
    return context;
};

// Hook para dispatch de acciones
export const useCartDispatch = () => {
    const context = useContext(CartDispatchContext);
    if (!context) {
        throw new Error('useCartDispatch debe usarse dentro de CartProvider');
    }
    return context;
};

// Hook combinado con funciones helper
export const useCartHelpers = () => {
    const cart = useCart();
    const dispatch = useCartDispatch();

    const getProductStock = (product) => {
        const value = Number(product?.stock ?? 0);
        return Number.isFinite(value) ? Math.max(0, value) : 0;
    };

    // Funciones helper básicas
    const addToCart = (product, quantity = 1) => {
        try {
            const requestedQuantity = Number(quantity) || 1;
            const stock = getProductStock(product);

            if (stock <= 0 || product?.active === false) {
                dispatch({
                    type: CART_ACTIONS.SET_ERROR,
                    payload: 'Producto sin stock disponible'
                });
                return;
            }

            const currentQty = getItemQuantity(product._id);
            const nextQty = currentQty + requestedQuantity;
            const safeQuantity = Math.min(nextQty, stock) - currentQty;

            if (safeQuantity <= 0) {
                dispatch({
                    type: CART_ACTIONS.SET_ERROR,
                    payload: `Solo hay ${stock} unidades disponibles`
                });
                return;
            }

            dispatch({
                type: CART_ACTIONS.ADD_ITEM,
                payload: { product, quantity: safeQuantity }
            });
            
            // Mostrar notificación de éxito (opcional)
            console.log(`${product.name} agregado al carrito`);
        } catch (err) {
            console.error('Error al agregar producto:', err);
            dispatch({
                type: CART_ACTIONS.SET_ERROR,
                payload: 'Error al agregar producto al carrito'
            });
        }
    };
  
    const removeFromCart = (productId) => {
        dispatch({
            type: CART_ACTIONS.REMOVE_ITEM,
            payload: { productId }
        });
    };
  
    const updateQuantity = (productId, quantity) => {
        if (quantity < 0) return; // Evitar cantidades negativas

        const item = cart.items.find((entry) => entry.product._id === productId);
        const stock = getProductStock(item?.product);
        const safeQuantity = Math.min(Number(quantity) || 0, stock);

        if (safeQuantity <= 0) {
            dispatch({
                type: CART_ACTIONS.REMOVE_ITEM,
                payload: { productId }
            });
            return;
        }
        
        dispatch({
            type: CART_ACTIONS.UPDATE_QUANTITY,
            payload: { productId, quantity: safeQuantity }
        });
    };
  
    const clearCart = () => {
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
    };
    
    // Funciones helper avanzadas
    const applyDiscount = (discountCode, amount = 0, percentage = 0) => {
        dispatch({
            type: CART_ACTIONS.APPLY_DISCOUNT,
            payload: { code: discountCode, amount, percentage }
        });
    };
    
    const removeDiscount = () => {
        dispatch({ type: CART_ACTIONS.REMOVE_DISCOUNT });
    };
    
    const setShipping = (method, cost) => {
        dispatch({
            type: CART_ACTIONS.SET_SHIPPING,
            payload: { method, cost }
        });
    };
    
    const setLoading = (loading) => {
        dispatch({
            type: CART_ACTIONS.SET_LOADING,
            payload: loading
        });
    };
    
    const setError = (error) => {
        dispatch({
            type: CART_ACTIONS.SET_ERROR,
            payload: error
        });
    };
  
    // Cálculos mejorados
    const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    
    const subtotal = cart.items.reduce((total, item) => {
        const price = typeof item.product.price === 'number' ? item.product.price : 0;
        return total + (price * item.quantity);
    }, 0);
    
    const discountAmount = cart.discount.percentage > 0 
        ? (subtotal * cart.discount.percentage / 100) 
        : cart.discount.amount;
        
    const totalPrice = subtotal - discountAmount + cart.shipping.cost;
  
    const isInCart = (productId) => {
        return cart.items.some(item => item.product._id === productId);
    };
  
    const getItemQuantity = (productId) => {
        const item = cart.items.find(item => item.product._id === productId);
        return item ? item.quantity : 0;
    };
    
    // Validaciones
    const isCartEmpty = cart.items.length === 0;
    
    const canCheckout = !isCartEmpty && !cart.loading && !cart.error;
    
    // Funciones de utilidad
    const getCartSummary = () => ({
        itemsCount: totalItems,
        subtotal,
        discount: discountAmount,
        shipping: cart.shipping.cost,
        total: totalPrice
    });
    
    const findItemByProductId = (productId) => {
        return cart.items.find(item => item.product._id === productId);
    };
  
    return {
        // Estado del carrito
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
        
        // Validaciones y utilidades
        isInCart,
        getItemQuantity,
        getCartSummary,
        findItemByProductId
    };
};