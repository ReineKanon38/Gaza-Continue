import { requestJson } from './httpClient';

const responseCache = new Map();

function normalizeSyscomProductPrices(products) {
  if (!Array.isArray(products)) return [];

  return products.map((product) => {
    const priceMXN = Number(product?.price || product?.precio_mxn || 0);

    return {
      ...product,
      precio_mxn: priceMXN,
      precio_descuento_mxn: priceMXN,
      precio_lista_mxn: priceMXN,
      precios: {
        ...(product?.precios || {}),
        precio_descuento_mxn: priceMXN,
        precio_lista_mxn: priceMXN
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

async function cachedRequestJson(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const cacheTtlMs = method === 'GET' ? getCacheTtlMs(url) : 0;
  const cacheKey = `${method}:${url}`;

  if (cacheTtlMs) {
    const cached = getCachedResponse(cacheKey, cacheTtlMs);
    if (cached) {
      return cached;
    }
  }

  const data = await requestJson(url, options);

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
  
  const data = await cachedRequestJson(url);
  // Normaliza respuesta {success, data, count, pagination}
  return {
    products: data.data || data.products || [],
    count: data.count ?? (data.data ? data.data.length : 0),
    total: data.total || data.count || 0,
    pagination: data.pagination || null
  };
};

export const getProductById = async (productId) => {
  const data = await cachedRequestJson(`/api/products/${productId}`);
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
  const data = await cachedRequestJson(url);

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
  const data = await cachedRequestJson('/api/syscom/categories');
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
  const data = await cachedRequestJson(url);

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
    success: !!data?.success,
    source: data?.source || 'syscom'
  };
};

export const createProduct = async (productData) => {
  return cachedRequestJson('/api/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

export const updateProduct = async (productId, productData) => {
  return cachedRequestJson(`/api/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
};

export const deleteProduct = async (productId) => {
  return cachedRequestJson(`/api/products/${productId}`, {
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
