import syscomClient from '../utils/syscomClient.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import SyscomHealthSnapshot from '../models/SyscomHealthSnapshot.js';
import {
  mapSyscomCategoryToPlatform,
  PLATFORM_CATEGORIES,
  isBlockedPlatformCategory,
  isBlockedSyscomCategoryName
} from '../config/categoryMapping.js';
import { convertUSDtoMXN, CURRENCY_CONFIG, updateExchangeRate } from '../config/currency.js';
import { logger } from '../utils/logger.js';

class SyscomService {
  constructor() {
    this.responseCache = new Map();
    // TTL para productos y búsquedas (5 minutos por defecto)
    this.productCacheTtlMs = Number(process.env.SYSCOM_PRODUCT_CACHE_TTL_MS || 300000);
    // TTL para metadatos estáticos (24 horas por defecto)
    this.metadataCacheTtlMs = Number(process.env.SYSCOM_METADATA_CACHE_TTL_MS || 86400000);
    // Compatibilidad retrospectiva
    this.cacheTtlMs = Number(process.env.SYSCOM_CACHE_TTL_MS || this.productCacheTtlMs);
    this.metrics = {
      search: this.createEmptyMetricBucket(),
      superPrecio: this.createEmptyMetricBucket(),
      categories: this.createEmptyMetricBucket(),
      brands: this.createEmptyMetricBucket(),
      tags: this.createEmptyMetricBucket(),
      uptimeStartedAt: new Date().toISOString()
    };
    this.healthSnapshotIntervalMs = Number(process.env.SYSCOM_HEALTH_SNAPSHOT_INTERVAL_MS || 300000);
    this.healthRetentionHours = Number(process.env.SYSCOM_HEALTH_RETENTION_HOURS || 168);
    this.healthHistoryLimit = Number(process.env.SYSCOM_HEALTH_MAX_POINTS || 288);
    this.startHealthSnapshotScheduler();
    this.startExchangeRateScheduler();
  }

  startExchangeRateScheduler() {
    const syncRate = () => {
      this.syncExchangeRate().catch((error) => {
        logger.warn('No se pudo sincronizar el tipo de cambio de SYSCOM', { message: error.message });
      });
    };

    // Sincronizar inmediatamente al iniciar el servicio
    syncRate();

    // Sincronizar cada 12 horas
    this.exchangeRateTimer = setInterval(syncRate, 12 * 60 * 60 * 1000);

    if (typeof this.exchangeRateTimer.unref === 'function') {
      this.exchangeRateTimer.unref();
    }
  }

  async syncExchangeRate() {
    if (!syscomClient.isConfigured()) {
      return false;
    }

    logger.info('🔄 Sincronizando tipo de cambio dinámico desde SYSCOM...');
    const result = await syscomClient.getExchangeRate();

    if (result.success && result.data && result.data.normal) {
      const normalRate = parseFloat(result.data.normal);
      if (normalRate > 0) {
        updateExchangeRate(normalRate);
        logger.info(`✅ Tipo de cambio actualizado dinámicamente: 1 USD = ${normalRate} MXN`);
        return true;
      }
    }

    logger.warn('⚠️ No se pudo obtener el tipo de cambio oficial de SYSCOM, se mantiene el tipo de cambio por defecto');
    return false;
  }

  startHealthSnapshotScheduler() {
    if (!Number.isFinite(this.healthSnapshotIntervalMs) || this.healthSnapshotIntervalMs <= 0) {
      return;
    }

    const persistSnapshot = () => {
      this.persistHealthSnapshot().catch((error) => {
        logger.warn('No se pudo guardar snapshot de salud SYSCOM', { message: error.message });
      });
    };

    persistSnapshot();
    this.healthSnapshotTimer = setInterval(persistSnapshot, this.healthSnapshotIntervalMs);

    if (typeof this.healthSnapshotTimer.unref === 'function') {
      this.healthSnapshotTimer.unref();
    }
  }

  async persistHealthSnapshot() {
    if (SyscomHealthSnapshot.db?.readyState !== 1) {
      return false;
    }

    const metrics = this.getHealthMetrics();

    await SyscomHealthSnapshot.create({
      capturedAt: new Date(),
      uptimeStartedAt: metrics.uptimeStartedAt,
      cacheTtlMs: metrics.cacheTtlMs,
      cacheEntries: metrics.cacheEntries,
      endpoints: metrics.endpoints
    });

    if (Number.isFinite(this.healthRetentionHours) && this.healthRetentionHours > 0) {
      const threshold = new Date(Date.now() - (this.healthRetentionHours * 60 * 60 * 1000));
      await SyscomHealthSnapshot.deleteMany({ capturedAt: { $lt: threshold } });
    }

    return true;
  }

  formatHistoryLabel(dateValue) {
    const date = new Date(dateValue);

    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  createEmptyMetricBucket() {
    return {
      total: 0,
      success: 0,
      failed: 0,
      cacheHit: 0,
      staleCacheHit: 0,
      avgLatencyMs: 0,
      lastLatencyMs: 0,
      lastError: null,
      lastSeenAt: null
    };
  }

  trackMetric(name, payload = {}) {
    const bucket = this.metrics[name];
    if (!bucket) return;

    bucket.total += 1;
    bucket.lastSeenAt = new Date().toISOString();

    if (payload.success === true) {
      bucket.success += 1;
    }

    if (payload.success === false) {
      bucket.failed += 1;
      bucket.lastError = payload.error || 'Error desconocido';
    }

    if (payload.source === 'cache') {
      bucket.cacheHit += 1;
    }

    if (payload.source === 'stale-cache') {
      bucket.staleCacheHit += 1;
    }

    if (typeof payload.latencyMs === 'number') {
      bucket.lastLatencyMs = payload.latencyMs;
      bucket.avgLatencyMs =
        bucket.avgLatencyMs === 0
          ? payload.latencyMs
          : Math.round((bucket.avgLatencyMs * 0.8) + (payload.latencyMs * 0.2));
    }
  }

  getHealthMetrics() {
    return {
      uptimeStartedAt: this.metrics.uptimeStartedAt,
      cacheTtlMs: this.cacheTtlMs,
      cacheEntries: this.responseCache.size,
      endpoints: {
        search: this.metrics.search,
        superPrecio: this.metrics.superPrecio,
        categories: this.metrics.categories,
        brands: this.metrics.brands,
        tags: this.metrics.tags
      }
    };
  }

  async getHealthHistory(options = {}) {
    const minutes = Math.min(Math.max(Number(options.minutes || 180), 15), 10080);
    const requestedLimit = Number(options.limit || this.healthHistoryLimit || 288);
    const limit = Math.min(Math.max(requestedLimit, 10), 1000);

    if (SyscomHealthSnapshot.db?.readyState !== 1) {
      return {
        points: [],
        rangeMinutes: minutes,
        total: 0,
        note: 'MongoDB no disponible para historico'
      };
    }

    const since = new Date(Date.now() - (minutes * 60 * 1000));

    const snapshots = await SyscomHealthSnapshot.find({ capturedAt: { $gte: since } })
      .sort({ capturedAt: -1 })
      .limit(limit)
      .lean();

    const points = snapshots
      .reverse()
      .map((snapshot) => {
        const search = snapshot.endpoints?.search || {};
        const superPrecio = snapshot.endpoints?.superPrecio || {};

        return {
          capturedAt: snapshot.capturedAt,
          label: this.formatHistoryLabel(snapshot.capturedAt),
          cacheEntries: Number(snapshot.cacheEntries || 0),
          searchAvgLatencyMs: Number(search.avgLatencyMs || 0),
          superPrecioAvgLatencyMs: Number(superPrecio.avgLatencyMs || 0),
          searchFailed: Number(search.failed || 0),
          superPrecioFailed: Number(superPrecio.failed || 0),
          totalFailed: Number(search.failed || 0) + Number(superPrecio.failed || 0)
        };
      });

    return {
      points,
      rangeMinutes: minutes,
      total: points.length
    };
  }

  getCacheKey(prefix, payload = {}) {
    const normalized = Object.entries(payload || {})
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    return `${prefix}:${JSON.stringify(normalized)}`;
  }

  getCachedValue(cacheKey, customTtl) {
    const entry = this.responseCache.get(cacheKey);
    if (!entry) return null;

    const ttl = customTtl !== undefined ? customTtl : this.cacheTtlMs;
    const ageMs = Date.now() - entry.timestamp;
    return {
      data: entry.data,
      isFresh: ageMs <= ttl,
      ageMs
    };
  }

  setCachedValue(cacheKey, value) {
    this.responseCache.set(cacheKey, {
      data: value,
      timestamp: Date.now()
    });
  }

  toNumber(value) {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    const sanitized = String(value).replace(/[^0-9.-]/g, '');
    const numeric = Number(sanitized);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  extractPriceUSD(syscomProduct = {}) {
    const candidates = [
      syscomProduct.precio_descuento,
      syscomProduct.precio_lista,
      syscomProduct.precio,
      syscomProduct.precios?.precio_descuento,
      syscomProduct.precios?.precio_lista,
      syscomProduct.precios?.precio_1,
      syscomProduct.precios?.precio_especial
    ];

    for (const candidate of candidates) {
      const value = this.toNumber(candidate);
      if (value > 0) return value;
    }

    return 0;
  }

  getPrimarySyscomCategoryName(syscomProduct = {}) {
    if (Array.isArray(syscomProduct.categorias) && syscomProduct.categorias.length > 0) {
      const specificCategory =
        syscomProduct.categorias.find((cat) => cat?.nivel === 3) ||
        syscomProduct.categorias.find((cat) => cat?.nivel === 2) ||
        syscomProduct.categorias[0];

      if (typeof specificCategory === 'string') {
        return specificCategory;
      }

      return specificCategory?.nombre || specificCategory?.name || null;
    }

    return syscomProduct.categoria || syscomProduct.category || null;
  }

  isAllowedSyscomProduct(syscomProduct = {}) {
    if (!syscomProduct) return false;
    const rawCategoryName = this.getPrimarySyscomCategoryName(syscomProduct);

    if (isBlockedSyscomCategoryName(rawCategoryName)) {
      return false;
    }

    const mappedCategory = mapSyscomCategoryToPlatform(rawCategoryName);
    if (mappedCategory && isBlockedPlatformCategory(mappedCategory)) {
      return false;
    }

    return true;
  }

  /**
   * Transformar producto de SYSCOM a nuestro schema
   */
  transformSyscomProduct(syscomProduct = {}) {
    // Mapeo inteligente de precios (en USD de SYSCOM)
    const priceUSD = this.extractPriceUSD(syscomProduct);

    // Convertir precio de USD a MXN
    const priceMXN = convertUSDtoMXN(priceUSD);

    // Obtener categoría(s) de SYSCOM
    const syscomCategoryName = this.getPrimarySyscomCategoryName(syscomProduct);

    // Mapear a categoría de la plataforma
    const platformCategory = mapSyscomCategoryToPlatform(syscomCategoryName);

    const parsedStock = parseInt(syscomProduct.existencia?.nuevo) || parseInt(syscomProduct.existencia) || parseInt(syscomProduct.stock) || 10;
    const productId = String(syscomProduct.producto_id || syscomProduct.id || syscomProduct.syscomId || '');

    const productToReturn = {
      syscomId: productId,
      name: syscomProduct.titulo || syscomProduct.nombre || syscomProduct.name || 'Producto SYSCOM',
      price: priceMXN > 0 ? priceMXN : 0,
      listPrice: priceMXN > 0 ? priceMXN : 0,
      description: syscomProduct.descripcion || syscomProduct.titulo || '',
      category: platformCategory || 'videovigilancia',
      brand: syscomProduct.marca || syscomProduct.brand || '',
      model: syscomProduct.modelo || syscomProduct.model || '',
      image: syscomProduct.img_portada || syscomProduct.imagen || syscomProduct.image || '',
      stock: parsedStock > 0 ? parsedStock : 5,
      distributor: syscomProduct.marca || syscomProduct.brand || syscomProduct.fabricante || '',
      syscomId: productId,
      active: true
    };
    
    if (syscomProduct._id) {
      productToReturn._id = syscomProduct._id;
    }
    
    return productToReturn;
  }

  /**
   * Buscar productos en SYSCOM
   */
  /**
   * Fetch core logic from SYSCOM (sin caché)
   */
  async fetchSearchFromSyscom(searchParams) {
    let directProduct = null;
    const queryStr = String(searchParams?.query || '').trim();
    const isSingleWordIdOrModel = queryStr.length >= 2 && !queryStr.includes(' ') && (/\d/.test(queryStr) || /^[A-Z0-9_-]+$/i.test(queryStr));

    if (isSingleWordIdOrModel) {
      try {
        const directRes = await syscomClient.getProduct(queryStr);
        if (directRes.success && directRes.data && (directRes.data.producto_id || directRes.data.id)) {
          directProduct = directRes.data;
        }
      } catch (err) {
        // Ignorar fallo de búsqueda directa si no existe
      }
    }

    const result = await syscomClient.searchProducts(searchParams);
    
    if (!result.success) {
      return result;
    }

    const pagination = result.pagination || result.data?.paginas || {};
    const resultProducts = Array.isArray(result.data?.productos)
      ? result.data.productos
      : (Array.isArray(result.data) ? result.data : []);
    let filteredProducts = resultProducts.filter((product) => this.isAllowedSyscomProduct(product));

    if (directProduct && this.isAllowedSyscomProduct(directProduct)) {
      const directId = String(directProduct.producto_id || directProduct.id || '');
      filteredProducts = filteredProducts.filter((p) => String(p.producto_id || p.id || '') !== directId);
      filteredProducts.unshift(directProduct);
    }

    // Fallback: si query textual no devolvió resultados, intentamos como marca/distribuidor.
    if (
      filteredProducts.length === 0 &&
      searchParams?.query &&
      !searchParams?.brand
    ) {
      const brandFallbackResult = await syscomClient.searchProducts({
        ...searchParams,
        brand: searchParams.query,
        query: undefined,
        busqueda: undefined
      });

      if (brandFallbackResult.success) {
        const brandProducts = Array.isArray(brandFallbackResult.data?.productos)
          ? brandFallbackResult.data.productos
          : (Array.isArray(brandFallbackResult.data) ? brandFallbackResult.data : []);
        const allowedBrandProducts = brandProducts.filter((product) => this.isAllowedSyscomProduct(product));
        const byId = new Map();

        for (const product of [...filteredProducts, ...allowedBrandProducts]) {
          const productId = product?.producto_id || product?.id;
          if (!productId) continue;
          byId.set(String(productId), product);
        }

        filteredProducts = Array.from(byId.values());
      }
    }

    const transformedProducts = filteredProducts.map((product) => this.transformSyscomProduct(product));

    const filteredData = Array.isArray(result.data)
      ? transformedProducts
      : {
          ...(result.data || {}),
          ...(Array.isArray(result.data?.productos) ? { productos: transformedProducts } : {})
        };

    const inferredTotal = filteredProducts.length;
    return {
      success: true,
      data: filteredData,
      total: Number(pagination.total || pagination.total_registros || inferredTotal || 0),
      page: Number(pagination.pagina_actual || searchParams?.page || searchParams?.pagina || 1),
      pagination,
      source: 'syscom'
    };
  }

  /**
   * Buscar productos en SYSCOM (Con soporte Stale-While-Revalidate)
   */
  async searchProducts(searchParams) {
    const startTime = Date.now();
    if (!syscomClient.isConfigured()) {
      return {
        success: false,
        message: 'SYSCOM API no configurada. Agregue SYSCOM_CLIENT_ID y SYSCOM_API_KEY al .env',
        data: []
      };
    }

    const cacheKey = this.getCacheKey('search', searchParams);
    const cached = this.getCachedValue(cacheKey, this.productCacheTtlMs);

    if (cached) {
      // 1. Si está fresco, devolver del caché de inmediato
      if (cached.isFresh) {
        this.trackMetric('search', {
          success: true,
          source: 'cache',
          latencyMs: Date.now() - startTime
        });
        return {
          ...cached.data,
          source: 'cache'
        };
      }

      // 2. Si está expirado (stale) pero tenemos datos guardados, devolverlos inmediatamente (lag 0ms)
      // e iniciar revalidación asíncrona en segundo plano para refrescar caché
      const STALE_LIMIT_MS = 60 * 60 * 1000; // Permitir reuso de caché stale hasta por 1 hora
      if (cached.data && cached.ageMs <= STALE_LIMIT_MS) {
        logger.debug('SYSCOM search: Sirviendo cache stale, actualizando en segundo plano', { cacheKey });
        
        // Revalidar en segundo plano de forma no bloqueante
        this.fetchSearchFromSyscom(searchParams).then((freshPayload) => {
          if (freshPayload.success) {
            this.setCachedValue(cacheKey, freshPayload);
          }
        }).catch((err) => {
          logger.warn('Fallo revalidación de búsqueda en segundo plano', { error: err.message });
        });

        this.trackMetric('search', {
          success: true,
          source: 'stale-cache',
          latencyMs: Date.now() - startTime
        });

        return {
          ...cached.data,
          source: 'stale-cache',
          warning: 'Mostrando resultados rápidos (actualizando en segundo plano)'
        };
      }
    }

    // 3. Si no hay caché o superó el tiempo stale, hacer petición síncrona real
    const result = await this.fetchSearchFromSyscom(searchParams);
    
    if (!result.success) {
      if (cached?.data) {
        logger.debug('SYSCOM search fallo, devolviendo cache previo', {
          cacheKey,
          cacheAgeMs: cached.ageMs,
          error: result.error
        });

        this.trackMetric('search', {
          success: true,
          source: 'stale-cache',
          latencyMs: Date.now() - startTime,
          error: result.error
        });

        return {
          ...cached.data,
          source: 'stale-cache',
          warning: 'Mostrando resultados previos por fallo temporal de SYSCOM'
        };
      }

      this.trackMetric('search', {
        success: false,
        source: 'syscom',
        latencyMs: Date.now() - startTime,
        error: result.error
      });

      return {
        success: false,
        message: result.error || 'Error al buscar en SYSCOM',
        data: []
      };
    }

    this.setCachedValue(cacheKey, result);

    this.trackMetric('search', {
      success: true,
      source: 'syscom',
      latencyMs: Date.now() - startTime
    });

    return result;
  }

  /**
   * Sincronizar/importar producto desde SYSCOM
   * Solo sincroniza productos que pertenezcan a categorías permitidas.
   */
  async syncProduct(syscomProductId) {
    if (!syscomClient.isConfigured()) {
      throw new Error('SYSCOM API no configurada');
    }

    // Obtener producto de SYSCOM
    const result = await syscomClient.getProduct(syscomProductId);
    
    if (!result.success) {
      throw new Error(`Error al obtener producto de SYSCOM: ${result.error}`);
    }

    const syscomProduct = result.data;

    // Transformar el producto (incluye mapeo de categoría)
    const productData = this.transformSyscomProduct(syscomProduct);

    // Validar que el producto pertenezca a una categoría permitida.
    const validCategories = Object.values(PLATFORM_CATEGORIES)
      .filter((category) => !isBlockedPlatformCategory(category));

    if (!productData.category || !validCategories.includes(productData.category)) {
      throw new Error(`Producto rechazado: categoría no permitida (${productData.category || 'sin-mapeo'})`);
    }

    // Verificar si ya existe en nuestra DB
    const existing = await Product.findOne({ syscomId: syscomProductId });

    if (existing) {
      // Actualizar producto existente
      Object.assign(existing, productData);
      await existing.save();
      return {
        success: true,
        action: 'updated',
        product: existing
      };
    } else {
      // Crear nuevo producto
      const newProduct = await Product.create(productData);
      return {
        success: true,
        action: 'created',
        product: newProduct
      };
    }
  }

  /**
   * Sincronizar múltiples productos
   */
  async syncMultipleProducts(syscomProductIds) {
    const results = {
      success: [],
      failed: [],
      total: syscomProductIds.length
    };

    const concurrency = 6;
    for (let i = 0; i < syscomProductIds.length; i += concurrency) {
      const chunk = syscomProductIds.slice(i, i + concurrency);
      const chunkResults = await Promise.allSettled(
        chunk.map(async (productId) => {
          const syncResult = await this.syncProduct(productId);
          return {
            syscomId: productId,
            action: syncResult.action,
            productId: syncResult.product._id
          };
        })
      );

      for (let index = 0; index < chunkResults.length; index += 1) {
        const status = chunkResults[index];
        const productId = chunk[index];

        if (status.status === 'fulfilled') {
          results.success.push(status.value);
          continue;
        }

        results.failed.push({
          syscomId: productId,
          error: status.reason?.message || 'Error desconocido en sincronizacion'
        });
      }
    }

    return results;
  }

  /**
   * Actualizar stock de producto desde SYSCOM
   */
  async updateStock(productId) {
    const product = await Product.findById(productId);
    
    if (!product || !product.syscomId) {
      throw new Error('Producto no encontrado o sin syscomId');
    }

    const stockResult = await syscomClient.getStock(product.syscomId);
    
    if (stockResult.success) {
      product.stock = stockResult.stock;
      await product.save();
      return {
        success: true,
        stock: stockResult.stock
      };
    }

    throw new Error('Error al obtener stock de SYSCOM');
  }

  /**
   * Actualizar precio de producto desde SYSCOM
   */
  async updatePrice(productId) {
    const product = await Product.findById(productId);
    
    if (!product || !product.syscomId) {
      throw new Error('Producto no encontrado o sin syscomId');
    }

    const priceResult = await syscomClient.getPrice(product.syscomId);
    
    if (priceResult.success) {
      product.price = priceResult.price;
      await product.save();
      return {
        success: true,
        price: priceResult.price
      };
    }

    throw new Error('Error al obtener precio de SYSCOM');
  }

  /**
   * Reparar precios faltantes o en cero para productos sincronizados
   */
  async repairMissingPrices(options = {}) {
    const limit = Number(options.limit || 300);
    const batchSize = Number(options.batchSize || 10);

    const targets = await Product.find({
      syscomId: { $exists: true, $ne: null },
      $or: [
        { price: { $exists: false } },
        { price: null },
        { price: { $lte: 0 } }
      ]
    })
      .select('_id name syscomId')
      .limit(limit)
      .lean();

    if (targets.length === 0) {
      return {
        success: true,
        message: 'No hay productos con precio faltante para reparar',
        scanned: 0,
        updated: 0,
        failed: 0,
        skipped: 0,
        errors: []
      };
    }

    let updated = 0;
    let failed = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < targets.length; i += batchSize) {
      const batch = targets.slice(i, i + batchSize);

      const batchResults = await Promise.all(batch.map(async (product) => {
        const response = await syscomClient.getProduct(product.syscomId);
        if (!response.success || !response.data) {
          throw new Error(response.error || 'No se pudo obtener detalle de SYSCOM');
        }

        const priceUSD = this.extractPriceUSD(response.data);
        const priceMXN = convertUSDtoMXN(priceUSD);

        if (!priceMXN || priceMXN <= 0) {
          return {
            productId: product._id,
            skipped: true
          };
        }

        return {
          productId: product._id,
          skipped: false,
          priceMXN
        };
      }).map((promise) => promise.catch((error) => ({ error }))));

      const updates = [];
      for (const result of batchResults) {
        if (result?.error) {
          failed++;
          errors.push(result.error.message || String(result.error));
          continue;
        }

        if (result.skipped) {
          skipped++;
          continue;
        }

        updates.push({
          updateOne: {
            filter: { _id: result.productId },
            update: { $set: { price: result.priceMXN } }
          }
        });
      }

      if (updates.length > 0) {
        await Product.bulkWrite(updates);
        updated += updates.length;
      }
    }

    return {
      success: true,
      message: `Reparación completada: ${updated} actualizados, ${failed} fallidos, ${skipped} sin precio válido`,
      scanned: targets.length,
      updated,
      failed,
      skipped,
      errors: errors.slice(0, 20)
    };
  }

  /**
   * Fetch core logic for Super Precio (sin caché)
   */
  async fetchSuperPrecioFromSyscom(params = {}) {
    const result = await syscomClient.getSuperPrecioProducts({
      pagina: params.page || 1,
      limite: params.limit || 50,
      categoria: params.category,
      marca: params.brand
    });

    if (!result.success) {
      return result;
    }

    const baseProducts = Array.isArray(result.data?.productos)
      ? result.data.productos
      : (Array.isArray(result.data) ? result.data : []);
    const filteredProducts = baseProducts.filter((product) => this.isAllowedSyscomProduct(product));

    const transformedProducts = filteredProducts.map((product) => this.transformSyscomProduct(product));

    const filteredData = Array.isArray(result.data)
      ? transformedProducts
      : {
          ...(result.data || {}),
          ...(Array.isArray(result.data?.productos) ? { productos: transformedProducts } : {})
        };

    return {
      success: true,
      data: filteredData,
      pagination: result.pagination,
      source: 'syscom'
    };
  }

  /**
   * Obtener productos de Súper Precio (Con soporte Stale-While-Revalidate)
   */
  async getSuperPrecioProducts(params = {}) {
    const startTime = Date.now();
    if (!syscomClient.isConfigured()) {
      return {
        success: false,
        message: 'SYSCOM API no configurada',
        data: []
      };
    }

    const cacheKey = this.getCacheKey('super-precio', params);
    const cached = this.getCachedValue(cacheKey, this.productCacheTtlMs);

    if (cached) {
      // 1. Si está fresco, retornar del caché directamente
      if (cached.isFresh) {
        this.trackMetric('superPrecio', {
          success: true,
          source: 'cache',
          latencyMs: Date.now() - startTime
        });
        return {
          ...cached.data,
          source: 'cache'
        };
      }

      // 2. Si está stale pero tenemos datos, retornar de inmediato (lag 0ms)
      // y revalidar asíncronamente en segundo plano
      const STALE_LIMIT_MS = 60 * 60 * 1000; // Permitir reuso de caché stale hasta por 1 hora
      if (cached.data && cached.ageMs <= STALE_LIMIT_MS) {
        logger.debug('SYSCOM super-precio: Sirviendo cache stale, actualizando en segundo plano', { cacheKey });

        this.fetchSuperPrecioFromSyscom(params).then((freshPayload) => {
          if (freshPayload.success) {
            this.setCachedValue(cacheKey, freshPayload);
          }
        }).catch((err) => {
          logger.warn('Fallo revalidación de super precio en segundo plano', { error: err.message });
        });

        this.trackMetric('superPrecio', {
          success: true,
          source: 'stale-cache',
          latencyMs: Date.now() - startTime
        });

        return {
          ...cached.data,
          source: 'stale-cache',
          warning: 'Mostrando resultados rápidos (actualizando en segundo plano)'
        };
      }
    }

    // 3. Si no hay caché o superó el tiempo stale, hacer petición síncrona real
    const result = await this.fetchSuperPrecioFromSyscom(params);

    if (!result.success) {
      if (cached?.data) {
        logger.debug('SYSCOM super-precio fallo, devolviendo cache previo', {
          cacheKey,
          cacheAgeMs: cached.ageMs,
          error: result.error
        });

        this.trackMetric('superPrecio', {
          success: true,
          source: 'stale-cache',
          latencyMs: Date.now() - startTime,
          error: result.error
        });

        return {
          ...cached.data,
          source: 'stale-cache',
          warning: 'Mostrando resultados previos por fallo temporal de SYSCOM'
        };
      }

      this.trackMetric('superPrecio', {
        success: false,
        source: 'syscom',
        latencyMs: Date.now() - startTime,
        error: result.error
      });

      return {
        success: false,
        message: result.error || 'Error al obtener productos de Súper Precio',
        data: []
      };
    }

    this.setCachedValue(cacheKey, result);

    this.trackMetric('superPrecio', {
      success: true,
      source: 'syscom',
      latencyMs: Date.now() - startTime
    });

    return result;
  }

  /**
   * Sincronizar automáticamente productos de Súper Precio
   */
  async syncSuperPrecioProducts(options = {}) {
    const limit = options.limit || 50;
    const page = options.page || 1;

    const result = await this.getSuperPrecioProducts({ limit, page });
    
    if (!result.success) {
      throw new Error(result.message);
    }

    // Extraer lista de productos
    let productList = [];
    if (result.data.productos) {
      productList = result.data.productos;
    } else if (Array.isArray(result.data)) {
      productList = result.data;
    } else if (result.data.data) {
      productList = result.data.data;
    }

    if (productList.length === 0) {
      return {
        success: true,
        message: 'No hay productos de Súper Precio disponibles',
        synced: 0,
        failed: 0
      };
    }

    const results = { synced: 0, failed: 0, details: [] };

    for (const product of productList) {
      try {
        const productId = product.producto_id || product.id;
        if (productId) {
          const syncResult = await this.syncProduct(productId);
          results.synced++;
          results.details.push({
            id: productId,
            name: product.titulo || product.nombre,
            action: syncResult.action
          });
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          id: product.producto_id || product.id,
          error: error.message
        });
      }
    }

    return {
      success: true,
      message: `Sincronización completada: ${results.synced} productos sincronizados, ${results.failed} fallidos`,
      ...results
    };
  }

  /**
   * Obtener categorías
   */
  async getCategories() {
    const startTime = Date.now();
    
    // Buscar en caché (24 horas)
    const cacheKey = 'metadata:categories';
    const cached = this.getCachedValue(cacheKey, this.metadataCacheTtlMs);
    if (cached?.isFresh) {
      this.trackMetric('categories', {
        success: true,
        source: 'cache',
        latencyMs: Date.now() - startTime
      });
      return { ...cached.data, source: 'cache' };
    }

    if (!syscomClient.isConfigured()) {
      this.trackMetric('categories', {
        success: false,
        source: 'syscom',
        latencyMs: Date.now() - startTime,
        error: 'SYSCOM API no configurada'
      });

      return {
        success: false,
        message: 'SYSCOM API no configurada',
        data: []
      };
    }

    const result = await syscomClient.getCategories();
    const sourceCategories = Array.isArray(result?.data) ? result.data : [];
    const filteredCategories = sourceCategories.filter((categoryItem) => {
      const categoryName = categoryItem?.nombre || categoryItem?.name || categoryItem;
      return !isBlockedSyscomCategoryName(categoryName);
    });

    const response = {
      ...result,
      data: Array.isArray(result?.data) ? filteredCategories : result?.data,
      source: 'syscom'
    };

    if (response.success) {
      this.setCachedValue(cacheKey, response);
    }

    this.trackMetric('categories', {
      success: !!response.success,
      source: 'syscom',
      latencyMs: Date.now() - startTime,
      error: response.error
    });

    return response;
  }

  /**
   * Obtener marcas
   */
  async getBrands() {
    const startTime = Date.now();
    
    // Buscar en caché (24 horas)
    const cacheKey = 'metadata:brands';
    const cached = this.getCachedValue(cacheKey, this.metadataCacheTtlMs);
    if (cached?.isFresh) {
      this.trackMetric('brands', {
        success: true,
        source: 'cache',
        latencyMs: Date.now() - startTime
      });
      return { ...cached.data, source: 'cache' };
    }

    if (!syscomClient.isConfigured()) {
      this.trackMetric('brands', {
        success: false,
        source: 'syscom',
        latencyMs: Date.now() - startTime,
        error: 'SYSCOM API no configurada'
      });

      return {
        success: false,
        message: 'SYSCOM API no configurada',
        data: []
      };
    }

    const result = await syscomClient.getBrands();
    const response = {
      ...result,
      source: 'syscom'
    };

    if (response.success) {
      this.setCachedValue(cacheKey, response);
    }

    this.trackMetric('brands', {
      success: !!response.success,
      source: 'syscom',
      latencyMs: Date.now() - startTime,
      error: response.error
    });

    return response;
  }

  /**
   * Obtener etiquetas (Super Precio, Envío Gratis, etc.)
   */
  async getTags() {
    const startTime = Date.now();
    
    // Buscar en caché (24 horas)
    const cacheKey = 'metadata:tags';
    const cached = this.getCachedValue(cacheKey, this.metadataCacheTtlMs);
    if (cached?.isFresh) {
      this.trackMetric('tags', {
        success: true,
        source: 'cache',
        latencyMs: Date.now() - startTime
      });
      return { ...cached.data, source: 'cache' };
    }

    if (!syscomClient.isConfigured()) {
      this.trackMetric('tags', {
        success: false,
        source: 'syscom',
        latencyMs: Date.now() - startTime,
        error: 'SYSCOM API no configurada'
      });

      return {
        success: false,
        message: 'SYSCOM API no configurada',
        data: []
      };
    }

    const result = await syscomClient.getTags();
    const response = {
      ...result,
      source: 'syscom'
    };

    if (response.success) {
      this.setCachedValue(cacheKey, response);
    }

    this.trackMetric('tags', {
      success: !!result.success,
      source: 'syscom',
      latencyMs: Date.now() - startTime,
      error: result.error
    });

    return response;
  }

  /**
   * Sincronizar todos los productos con syscomId
   */
  async syncAllProducts() {
    // Buscamos algo genérico para empezar
    const result = await syscomClient.searchProducts({ query: 'camara' });
    
    // Si result.data existe, seguimos adelante
    if (!result.success || !result.data) {
        throw new Error('No se recibió respuesta válida de SYSCOM');
    }

    // Intentamos extraer la lista de donde sea que venga
    let lista = [];
    if (result.data.productos) lista = result.data.productos;
    else if (Array.isArray(result.data)) lista = result.data;
    else if (result.data.data) lista = result.data.data; // A veces viene anidado así

    if (lista.length === 0) {
        throw new Error('Se conectó pero la lista de productos regresó vacía');
    }

    const results = { updated: 0, failed: 0, details: [] };

    for (const p of lista.slice(0, 15)) { // Limitamos a 15 para probar rápido
        try {
            const id = p.producto_id || p.id;
            if (id) {
                await this.syncProduct(id);
                results.updated++;
            }
        } catch (error) {
            results.failed++;
        }
    }
    return results;
}

  /**
   * Sincronizar categorías de SYSCOM a MongoDB
   */
  async syncCategories() {
    const categoriesResult = await this.getCategories();
    
    if (!categoriesResult.success) {
      throw new Error('No se pudieron obtener categorías de SYSCOM');
    }

    const categories = categoriesResult.data;
    const synced = [];
    const errors = [];

    for (const syscomCategory of categories) {
      try {
        const categoryName = syscomCategory.nombre || syscomCategory.name || syscomCategory;
        
        // Buscar o crear categoría
        let category = await Category.findOne({ name: categoryName });
        
        if (!category) {
          category = await Category.create({
            name: categoryName,
            description: `Categoría sincronizada de SYSCOM`,
            active: true,
            productCount: 0
          });
          synced.push({ name: categoryName, action: 'created' });
        } else {
          synced.push({ name: categoryName, action: 'exists' });
        }
      } catch (error) {
        errors.push({ 
          category: syscomCategory,
          error: error.message 
        });
      }
    }

    return {
      success: true,
      synced: synced.length,
      errors: errors.length,
      details: { synced, errors }
    };
  }

  /**
   * Sincronizar productos de Super Precio por TODAS las categorías
   * Límite de productos por categoría (default: 100)
   * SOLO incluye las 8 categorías activas del sistema
   */
  async syncAllSuperPrecioByCategories(options = {}) {
    const limitPerCategory = options.limitPerCategory || 100;
    const maxTotalProducts = options.maxTotalProducts || 2000; // Límite total para evitar timeouts
    
    logger.info('Paso 1: Obteniendo IDs de productos de Super Precio');
    
    // 1. Obtener IDs de productos de Súper Precio usando múltiples búsquedas
    // Términos específicos para categorías activas permitidas
    // (sin radiocomunicación/incendios por decisión operativa).
    const searchTerms = [
      // Videovigilancia
      'camara', 'dvr', 'nvr', 'cctv', 'vigilancia',
      // Control de acceso
      'acceso', 'biometrico', 'cerradura', 'lector',
      // Energía
      'fuente', 'bateria', 'ups', 'energia',
      // Automatización e intrusión
      'alarma', 'sensor', 'intrusion', 'domotica',
      // Redes
      'switch', 'router', 'red', 'poe',
      // IoT / GPS / Telemetría
      'gps', 'tracker', 'iot', 'telemetria'
    ];
    let allProductIds = new Set(); // Set para evitar duplicados
    
    for (const term of searchTerms) {
      if (allProductIds.size >= maxTotalProducts) {
        logger.info(`Alcanzado limite de ${maxTotalProducts} productos`);
        break;
      }
            
      let currentPage = 1;
      const maxPages = 3; // Reducir a 3 páginas por término para más variedad
      
      while (currentPage <= maxPages) {
        const productsResult = await syscomClient.searchProducts({
          query: term,
          etiqueta: 'Super Precio',
          pagina: currentPage,
          limite: 50
        });

        if (!productsResult.success) {
          break;
        }

        // Extraer productos
        let pageProducts = [];
        if (productsResult.data.productos) {
          pageProducts = productsResult.data.productos;
        } else if (Array.isArray(productsResult.data)) {
          pageProducts = productsResult.data;
        } else if (productsResult.data.data) {
          pageProducts = productsResult.data.data;
        }

        if (pageProducts.length === 0) {
          break;
        }

        // Agregar solo IDs nuevos
        for (const product of pageProducts) {
          const productId = product.producto_id || product.id;
          if (productId) {
            allProductIds.add(productId);
          }
        }
        
        currentPage++;
        
        if (allProductIds.size >= maxTotalProducts) {
          break;
        }
      }
      
      logger.debug(`Termino '${term}': ${allProductIds.size} productos unicos acumulados`);
    }

    const productIds = Array.from(allProductIds);
    logger.info(`Total IDs unicos obtenidos: ${productIds.length}`);

    if (productIds.length === 0) {
      return {
        success: false,
        message: 'No se encontraron productos de Súper Precio',
        totalCategories: 0,
        processedCategories: 0,
        totalProductsSynced: 0,
        totalProductsFailed: 0
      };
    }

    // 2. Sincronizar cada producto individualmente (esto obtendrá categorías correctas)
    logger.info('Paso 2: Sincronizando productos');
    
    let synced = 0;
    let failed = 0;
    
    for (const productId of productIds) {
      try {
        await this.syncProduct(productId);
        synced++;
        
        // Mostrar progreso cada 25 productos
        if (synced % 25 === 0) {
          logger.info(`Progreso: ${synced}/${productIds.length} productos sincronizados`);
        }
      } catch (error) {
        failed++;
      }
    }

    logger.info(`Sincronizacion completada: ${synced} exitosos, ${failed} fallidos`);

    // 3. Agrupar productos por categoría desde MongoDB
    logger.info('Paso 3: Analizando productos por categoria en MongoDB');
    
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // 4. Sincronizar categorías en MongoDB
    logger.info('Paso 4: Sincronizando categorias en MongoDB');
    
    // Asegurar que las categorías de la plataforma existen en MongoDB
    const platformCategories = [
      { value: 'videovigilancia', name: 'Videovigilancia' },
      { value: 'audio-video', name: 'Audio y Video' },
      { value: 'automatizacion', name: 'Automatización e Intrusión' },
      { value: 'cableado', name: 'Cableado Estructurado' },
      { value: 'control-acceso', name: 'Control de Acceso' },
      { value: 'deteccion-fuego', name: 'Detección de Fuego' },
      { value: 'energia-herramientas', name: 'Energía / Herramientas' },
      { value: 'iot-gps', name: 'IoT / GPS / Telemática' },
      { value: 'radiocomunicacion', name: 'Radiocomunicación' },
      { value: 'redes-it', name: 'Redes e IT' },
      { value: 'robots-industrial', name: 'Robots e Industrial' }
    ];

    for (const platCat of platformCategories) {
      const count = categoryStats.find(stat => stat._id === platCat.value)?.count || 0;
      
      try {
        let category = await Category.findOne({ name: platCat.name });
        
        if (!category) {
          await Category.create({
            name: platCat.name,
            description: `Categoría de la plataforma`,
            active: true,
            productCount: count
          });
          if (count > 0) {
            logger.info(`Categoria creada: ${platCat.name} (${count} productos)`);
          }
        } else {
          if (count > 0) {
            await Category.updateOne(
              { name: platCat.name },
              { $set: { productCount: count } }
            );
            logger.info(`Categoria actualizada: ${platCat.name} (${count} productos)`);
          }
        }
      } catch (error) {
        logger.warn(`Error en categoria ${platCat.name}`, { message: error.message });
      }
    }

    // 5. Generar resultados detallados con nombres legibles
    const platformCategoriesMap = {
      'videovigilancia': 'Videovigilancia',
      'audio-video': 'Audio y Video',
      'automatizacion': 'Automatización e Intrusión',
      'cableado': 'Cableado Estructurado',
      'control-acceso': 'Control de Acceso',
      'deteccion-fuego': 'Detección de Fuego',
      'energia-herramientas': 'Energía / Herramientas',
      'iot-gps': 'IoT / GPS / Telemática',
      'radiocomunicacion': 'Radiocomunicación',
      'redes-it': 'Redes e IT',
      'robots-industrial': 'Robots e Industrial'
    };

    const results = {
      totalCategories: categoryStats.length,
      processedCategories: categoryStats.length,
      totalProductsSynced: synced,
      totalProductsFailed: failed,
      categoriesDetails: categoryStats.map(stat => ({
        category: platformCategoriesMap[stat._id] || stat._id || 'General',
        categorySlug: stat._id,
        status: 'success',
        synced: stat.count,
        failed: 0
      }))
    };

    return {
      success: true,
      message: `Sincronización completada: ${synced} productos en ${categoryStats.length} categorías`,
      ...results
    };
  }

  /**
   * Obtener el tipo de cambio configurado actual
   */
  getExchangeRate() {
    return {
      success: true,
      rate: CURRENCY_CONFIG.USD_TO_MXN,
      currency: CURRENCY_CONFIG.PLATFORM_CURRENCY,
      symbol: CURRENCY_CONFIG.CURRENCY_SYMBOL
    };
  }
}

export default new SyscomService();
