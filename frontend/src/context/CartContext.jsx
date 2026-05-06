// Context para manejar el estado del carrito globalmente
import { createContext, useReducer, useEffect } from 'react';

// Acciones del carrito
// eslint-disable-next-line react-refresh/only-export-components
export const CART_ACTIONS = {
    ADD_ITEM: 'ADD_ITEM',
    REMOVE_ITEM: 'REMOVE_ITEM',
    UPDATE_QUANTITY: 'UPDATE_QUANTITY',
    CLEAR_CART: 'CLEAR_CART',
    LOAD_CART: 'LOAD_CART',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    APPLY_DISCOUNT: 'APPLY_DISCOUNT',
    REMOVE_DISCOUNT: 'REMOVE_DISCOUNT',
    SET_SHIPPING: 'SET_SHIPPING'
};

// Reducer para manejar el estado del carrito
const cartReducer = (state, action) => {
    switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
        const { product, quantity = 1 } = action.payload;
        const existingItem = state.items.find(item => item.product._id === product._id);
    
        if (existingItem) {
        // Si ya existe, actualizar cantidad
        return {
            ...state,
            items: state.items.map(item =>
            item.product._id === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
        };
        } else {
        // Si no existe, agregar nuevo item
        return {
            ...state,
            items: [...state.items, { product, quantity }]
        };
        }
    }
    
    case CART_ACTIONS.REMOVE_ITEM: {
        const { productId } = action.payload;
        return {
        ...state,
        items: state.items.filter(item => item.product._id !== productId)
        };
    }
    
    case CART_ACTIONS.UPDATE_QUANTITY: {
        const { productId, quantity } = action.payload;
        if (quantity <= 0) {
        // Si cantidad es 0 o menor, remover item
        return {
            ...state,
            items: state.items.filter(item => item.product._id !== productId)
        };
        }
        return {
        ...state,
        items: state.items.map(item =>
            item.product._id === productId
            ? { ...item, quantity }
            : item
        )
        };
    }
    
    case CART_ACTIONS.CLEAR_CART:
        return {
            ...state,
            items: [],
            _skipPersist: action.payload?.skipPersist || false
        };
    
    case CART_ACTIONS.LOAD_CART:
        return {
            ...state,
            items: action.payload || []
        };
        
    case CART_ACTIONS.SET_LOADING:
        return {
            ...state,
            loading: action.payload
        };
        
    case CART_ACTIONS.SET_ERROR:
        return {
            ...state,
            error: action.payload,
            loading: false
        };
        
    case CART_ACTIONS.APPLY_DISCOUNT:
        return {
            ...state,
            discount: action.payload
        };
        
    case CART_ACTIONS.REMOVE_DISCOUNT:
        return {
            ...state,
            discount: {
                code: null,
                amount: 0,
                percentage: 0
            }
        };
        
    case CART_ACTIONS.SET_SHIPPING:
        return {
            ...state,
            shipping: action.payload
        };
    
    default:
        return state;
    }
};

// Estado inicial
const initialState = {
    items: [], // Array de { product, quantity }
    loading: false,
    error: null,
    discount: {
        code: null,
        amount: 0,
        percentage: 0
    },
    shipping: {
        method: null,
        cost: 0
    },
    lastUpdated: null
};

// Crear contexts
// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const CartDispatchContext = createContext();

// Provider component
export const CartProvider = ({ children }) => {
    const [cart, dispatch] = useReducer(cartReducer, initialState);
    
    // Clave para localStorage
    const STORAGE_KEY = 'syscom-cart';
  
    // Persistir carrito en localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem(STORAGE_KEY);
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                // Validar estructura del carrito guardado
                if (Array.isArray(parsedCart)) {
                    dispatch({ type: CART_ACTIONS.LOAD_CART, payload: parsedCart });
                } else if (parsedCart.items && Array.isArray(parsedCart.items)) {
                    // Cargar carrito completo con estado
                    dispatch({ type: CART_ACTIONS.LOAD_CART, payload: parsedCart.items });
                    
                    // Cargar discount y shipping si existen
                    if (parsedCart.discount) {
                        dispatch({ type: CART_ACTIONS.APPLY_DISCOUNT, payload: parsedCart.discount });
                    }
                    if (parsedCart.shipping) {
                        dispatch({ type: CART_ACTIONS.SET_SHIPPING, payload: parsedCart.shipping });
                    }
                }
            } catch (error) {
                console.error('Error cargando carrito desde localStorage:', error);
                // Limpiar localStorage corrupto
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);
  
    // Guardar en localStorage cuando cambie el carrito
    useEffect(() => {
        // No sobreescribir si el vaciado fue temporal (sin intención de borrar)
        if (cart._skipPersist) return;

        // Crear objeto completo del carrito para persistir
        const cartData = {
            items: cart.items,
            discount: cart.discount,
            shipping: cart.shipping,
            lastUpdated: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cartData));
        } catch (error) {
            console.error('Error guardando carrito en localStorage:', error);
        }
    }, [cart.items, cart.discount, cart.shipping, cart._skipPersist]);
    
    // Limpiar carrito cuando sea necesario (ej: logout)
    const clearStoredCart = () => {
        localStorage.removeItem(STORAGE_KEY);
        dispatch({ type: CART_ACTIONS.CLEAR_CART, payload: { skipPersist: false } });
        dispatch({ type: CART_ACTIONS.REMOVE_DISCOUNT });
        dispatch({ type: CART_ACTIONS.SET_SHIPPING, payload: { method: null, cost: 0 } });
    };
    
    // Proveer función de limpieza
    const contextValue = {
        ...cart,
        clearStoredCart
    };
  
    return (
        <CartContext.Provider value={contextValue}>
            <CartDispatchContext.Provider value={dispatch}>
                {children}
            </CartDispatchContext.Provider>
        </CartContext.Provider>
    );
};