import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { logger } from './logger.js';

class SyscomClient {
    constructor() {
        this.baseURL = process.env.SYSCOM_API_URL || 'https://developers.syscom.mx/api/v1';
        this.clientId = process.env.SYSCOM_CLIENT_ID;
        this.clientSecret = process.env.SYSCOM_API_KEY;
        this.timeoutMs = Number(process.env.SYSCOM_TIMEOUT_MS || 12000);
        this.maxRetries = Number(process.env.SYSCOM_MAX_RETRIES || 2);
        this.accessToken = null;
        this.tokenExpiry = null;
        this.tokenPromise = null;

        if (!this.clientId || !this.clientSecret) {
            logger.warn('Credenciales SYSCOM faltantes en .env');
        } else {
            logger.info('Credenciales SYSCOM cargadas');
        }
    }

    shouldRetry(error) {
        const status = error?.response?.status;
        if (!status) {
            return true;
        }
        return status === 408 || status === 429 || status >= 500;
    }

    async requestWithRetry(requestFn, context) {
        let lastError;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error;
                const canRetry = attempt < this.maxRetries && this.shouldRetry(error);
                if (!canRetry) {
                    throw error;
                }

                const delay = 300 * (attempt + 1);
                logger.debug(`${context} fallo temporal, reintentando`, {
                    attempt: attempt + 1,
                    maxRetries: this.maxRetries,
                    status: error?.response?.status,
                    waitMs: delay,
                });
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    }

    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        if (this.tokenPromise) {
            return this.tokenPromise;
        }

        this.tokenPromise = (async () => {
            try {
                const params = new URLSearchParams();
                params.append('client_id', this.clientId);
                params.append('client_secret', this.clientSecret);
                params.append('grant_type', 'client_credentials');

                const response = await this.requestWithRetry(
                    () => axios.post('https://developers.syscom.mx/oauth/token', params, {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        timeout: this.timeoutMs,
                    }),
                    'Auth SYSCOM'
                );

                if (response.data.access_token) {
                    this.accessToken = response.data.access_token;
                    this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
                    logger.debug('Nuevo token SYSCOM obtenido');
                    return this.accessToken;
                }
            } catch (error) {
                logger.error('Error de autenticacion SYSCOM', { message: error.response?.data || error.message });
                // Fallback: usar secret directamente (algunas llaves funcionan así)
                return this.clientSecret;
            } finally {
                this.tokenPromise = null;
            }
        })();

        return this.tokenPromise;
    }

    async searchProducts(params = {}) {
        try {
            const token = await this.getAccessToken();
            
            // Construir parámetros de búsqueda
            const queryParams = {};
            const query = params.query || params.busqueda;
            const brand = params.marca || params.brand;
            const category = params.categoria || params.category;
            const page = params.pagina || params.page;
            const limit = params.limite || params.limit;

            // La API de SYSCOM requiere al menos un filtro: busqueda, marca o categoria.
            // Si no llega ninguno, usamos un término por defecto para evitar 422.
            const hasAnyFilter = Boolean(query || brand || category);
            if (!hasAnyFilter) {
                queryParams.busqueda = process.env.SYSCOM_DEFAULT_QUERY || 'camara';
            }
            
            // Si hay query, agregarla
            if (query) {
                queryParams.busqueda = query;
            }
            
            // Filtro por etiqueta (Super Precio, Envío Gratis, etc.)
            if (params.etiqueta) {
                queryParams.etiqueta = params.etiqueta;
            }
            
            // Filtro por marca
            if (brand) {
                queryParams.marca = brand;
            }
            
            // Filtro por categoría
            if (category) {
                queryParams.categoria = category;
            }
            
            // Paginación
            if (page) {
                queryParams.pagina = page;
            }
            
            if (limit) {
                queryParams.limite = limit;
            }

            const response = await this.requestWithRetry(
                () => axios.get(`${this.baseURL}/productos`, {
                    params: queryParams,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    },
                    timeout: this.timeoutMs,
                }),
                'Busqueda de productos SYSCOM'
            );

            return { 
                success: true, 
                data: response.data,
                pagination: response.data.paginas || {}
            };
        } catch (error) {
            logger.error('Error en peticion de productos SYSCOM', { message: error.response?.data || error.message });
            return { success: false, error: error.message };
        }
    }

    async getProduct(productId) {
        try {
            const token = await this.getAccessToken();
            const response = await this.requestWithRetry(
                () => axios.get(`${this.baseURL}/productos/${productId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    timeout: this.timeoutMs,
                }),
                `Detalle de producto SYSCOM ${productId}`
            );
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener productos de Súper Precio
     */
    async getSuperPrecioProducts(params = {}) {
        // SYSCOM requiere al menos un parámetro de búsqueda, marca o categoría
        // Si no hay ninguno, usamos términos de búsqueda populares
        const searchParams = { ...params };
        
        if (!searchParams.query && !searchParams.marca && !searchParams.categoria) {
            // Usamos búsquedas estratégicas según la página
            const searchTerms = [
                'camara', 'monitor', 'laptop', 'router', 'accesorio',
                'cable', 'switch', 'dvr', 'microfono', 'teclado'
            ];
            const page = params.pagina || params.page || 1;
            const termIndex = (page - 1) % searchTerms.length;
            searchParams.query = searchTerms[termIndex];
        }
        
        // Agregar el filtro de Super Precio
        searchParams.etiqueta = 'Super Precio';
        
        return this.searchProducts(searchParams);
    }

    /**
     * Obtener todas las categorías disponibles
     */
    async getCategories() {
        try {
            const token = await this.getAccessToken();
            const response = await this.requestWithRetry(
                () => axios.get(`${this.baseURL}/categorias`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    },
                    timeout: this.timeoutMs,
                }),
                'Categorias SYSCOM'
            );
            return { success: true, data: response.data };
        } catch (error) {
            logger.error('Error obteniendo categorias SYSCOM', { message: error.response?.data || error.message });
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener todas las marcas disponibles
     */
    async getBrands() {
        try {
            const token = await this.getAccessToken();
            const response = await this.requestWithRetry(
                () => axios.get(`${this.baseURL}/marcas`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    },
                    timeout: this.timeoutMs,
                }),
                'Marcas SYSCOM'
            );
            return { success: true, data: response.data };
        } catch (error) {
            logger.error('Error obteniendo marcas SYSCOM', { message: error.response?.data || error.message });
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener todas las etiquetas conocidas
     * Nota: SYSCOM no tiene un endpoint dedicado para esto,
     * estas son las etiquetas más comunes disponibles
     */
    async getTags() {
        return {
            success: true,
            data: [
                'Super Precio',
                'Envío Gratis',
                'Nuevos Productos',
                'Liquidación'
            ]
        };
    }

    // Funciones mínimas para que el Service no truene
    isConfigured() { return !!(this.clientId && this.clientSecret); }
    async getStock(id) { return { success: false }; }
    async getPrice(id) { return { success: false }; }

    /**
     * Obtener el tipo de cambio oficial de SYSCOM
     */
    async getExchangeRate() {
        try {
            const token = await this.getAccessToken();
            const response = await this.requestWithRetry(
                () => axios.get(`${this.baseURL}/tipocambio`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    timeout: this.timeoutMs,
                }),
                'Tipo de cambio SYSCOM'
            );
            return { success: true, data: response.data };
        } catch (error) {
            logger.error('Error obteniendo tipo de cambio SYSCOM', { message: error.response?.data || error.message });
            return { success: false, error: error.message };
        }
    }
}

export default new SyscomClient();
