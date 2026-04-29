const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const USD_TO_MXN = Number(import.meta.env.VITE_USD_TO_MXN || 17.5);
const responseCache = new Map();

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const sanitized = String(value).replace(/[^0-9.-]/g, '');
  const numeric = Number(sanitized);
  return Number.isFinite(numeric) ? numeric : 0;
}

function usdToMxn(value) {
  const usd = toNumber(value);
  if (usd <= 0) return 0;
  return Math.round(usd * USD_TO_MXN * 100) / 100;
}

function normalizeSyscomProductPrices(products) {
  if (!Array.isArray(products)) return [];

  return products.map((product) => {
    const discountUSD =
      toNumber(product?.precio_descuento) ||
      toNumber(product?.precios?.precio_descuento);

    const listUSD =
      toNumber(product?.precio) ||
      toNumber(product?.precio_lista) ||
      toNumber(product?.precios?.precio_lista) ||
      toNumber(product?.precios?.precio_1) ||
      toNumber(product?.price);

    const fallbackUSD = listUSD || discountUSD;

    const priceDiscountMXN = usdToMxn(discountUSD || fallbackUSD);
    const priceListMXN = usdToMxn(listUSD || discountUSD || fallbackUSD);

    return {
      ...product,
      precio_descuento_mxn: priceDiscountMXN,
      precio_lista_mxn: priceListMXN,
      precio_mxn: priceDiscountMXN || priceListMXN,
      precios: {
        ...(product?.precios || {}),
        precio_descuento_mxn: priceDiscountMXN,
        precio_lista_mxn: priceListMXN
      }
    };
  });
}

function getCacheTtlMs(url) {
  if (url.includes('/api/syscom/categories')) return 10 * 60 * 1000;
  if (url.includes('/api/syscom/super-precio')) return 45 * 1000;
  if (url.includes('/api/syscom/search')) return 25 * 1000;
  return 0;
}

function getCachedResponse(cacheKey, ttlMs) {
  if (!ttlMs) return null;
  const entry = responseCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlMs) {
    responseCache.delete(cacheKey);
    return null;
  }
  return JSON.parse(JSON.stringify(entry.value));
}

function setCachedResponse(cacheKey, value, ttlMs) {
  if (!ttlMs) return;
  responseCache.set(cacheKey, {
    value,
    timestamp: Date.now()
  });
}

async function requestJson(url, options = {}) {
  const token = localStorage.getItem('token');
  const method = (options.method || 'GET').toUpperCase();
  const cacheTtlMs = method === 'GET' ? getCacheTtlMs(url) : 0;
  const cacheKey = `${method}:${url}`;

  if (cacheTtlMs) {
    const cached = getCachedResponse(cacheKey, cacheTtlMs);
    if (cached) {
      return cached;
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const err = data?.error || data?.message || res.statusText || 'Error en la petición';
    throw new Error(err);
  }

  if (cacheTtlMs) {
    setCachedResponse(cacheKey, data, cacheTtlMs);
  }

  return data;
}

export const getAllProducts = async (params = {}) => {
  // Construir query string desde parámetros
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.category) queryParams.append('category', params.category);
  if (params.search) queryParams.append('search', params.search);
  if (params.active !== undefined) queryParams.append('active', params.active);
  
  const queryString = queryParams.toString();
  const url = queryString ? `/api/products?${queryString}` : '/api/products';
  
  const data = await requestJson(url);
  // Normaliza respuesta {success, data, count, pagination}
  return {
    products: data.data || data.products || [],
    count: data.count ?? (data.data ? data.data.length : 0),
    total: data.total || data.count || 0,
    pagination: data.pagination || null
  };
};

export const getProductById = async (productId) => {
  const data = await requestJson(`/api/products/${productId}`);
  return data.data || data;
};

export const getSuperPrecioProducts = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.category) queryParams.append('category', params.category);
  if (params.brand) queryParams.append('brand', params.brand);

  const queryString = queryParams.toString();
  const url = queryString ? `/api/syscom/super-precio?${queryString}` : '/api/syscom/super-precio';
  const data = await requestJson(url);

  const rawProducts = data?.data?.productos || data?.data?.data || data?.data || [];
  const normalizedProducts = normalizeSyscomProductPrices(rawProducts);

  return {
    products: normalizedProducts,
    pagination: data?.pagination || null,
    success: !!data?.success
  };
};

const flattenSyscomCategories = (rawCategories) => {
  const rootList = Array.isArray(rawCategories)
    ? rawCategories
    : (Array.isArray(rawCategories?.categorias)
      ? rawCategories.categorias
      : (Array.isArray(rawCategories?.data)
        ? rawCategories.data
        : (Array.isArray(rawCategories?.items) ? rawCategories.items : [])));

  if (!Array.isArray(rootList) || rootList.length === 0) return [];

  const results = [];
  const visit = (node) => {
    if (!node) return;

    const id =
      node.id ??
      node.category_id ??
      node.categoria_id ??
      node.id_categoria ??
      node.value;
    const name =
      node.nombre ??
      node.name ??
      node.descripcion ??
      node.label ??
      node.categoria;

    if (id !== undefined && id !== null && name) {
      results.push({
        id: String(id),
        name: String(name),
        level: Number(node.nivel ?? node.level ?? 0) || 0
      });
    }

    const children =
      node.subcategorias ||
      node.children ||
      node.categorias ||
      node.subCategories ||
      node.childCategories ||
      [];
    if (Array.isArray(children)) {
      children.forEach(visit);
    }
  };

  rootList.forEach(visit);

  const seen = new Set();
  return results.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export const getSyscomCategories = async () => {
  const data = await requestJson('/api/syscom/categories');
  const raw =
    data?.data ??
    data?.categorias ??
    data?.result ??
    [];
  const blockedCategoryRegex = /(radio|walkie|handy|radiocom|fuego|humo|incendio)/i;
  const categories = flattenSyscomCategories(raw).filter(
    (item) => !blockedCategoryRegex.test(String(item?.name || ''))
  );
  return {
    categories,
    raw
  };
};

export const searchSyscomProducts = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.query) queryParams.append('query', params.query);
  if (params.brand) queryParams.append('brand', params.brand);
  if (params.category) queryParams.append('category', params.category);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const queryString = queryParams.toString();
  const url = queryString ? `/api/syscom/search?${queryString}` : '/api/syscom/search';
  const data = await requestJson(url);

  const rawData = data?.data;
  const rawProducts = rawData?.productos || rawData?.data || (Array.isArray(rawData) ? rawData : []);
  const products = normalizeSyscomProductPrices(rawProducts);
  const pagination = rawData?.paginas || data?.pagination || null;
  const total = Number(
    pagination?.total ??
    data?.total ??
    (Array.isArray(products) ? products.length : 0)
  );

  return {
    products,
    total,
    page: Number(pagination?.pagina_actual || data?.page || params.page || 1),
    pagination,
    success: !!data?.success
  };
};

export const createProduct = async (productData) => {
  return requestJson('/api/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

export const updateProduct = async (productId, productData) => {
  return requestJson(`/api/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
};

export const deleteProduct = async (productId) => {
  return requestJson(`/api/products/${productId}`, {
    method: 'DELETE',
  });
};

export default {
  getAllProducts,
  getProductById,
  getSuperPrecioProducts,
  getSyscomCategories,
  searchSyscomProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
