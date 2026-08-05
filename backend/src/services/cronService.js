import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import syscomService from './syscomService.js';

class CronService {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
  }

  init() {
    if (this.isRunning) return;
    
    // 1. Sincronización principal (2:00 AM todos los días)
    // Sincroniza categorías, luego productos de Súper Precio por categorías y repara precios faltantes.
    const mainSyncJob = cron.schedule('0 2 * * *', async () => {
      logger.info('🕒 [CRON] Iniciando Sincronización Principal de Madrugada...');
      try {
        // 1. Sincronizar categorías base
        logger.info('🕒 [CRON] Sincronizando categorías...');
        await syscomService.syncCategories();

        // 2. Sincronizar productos Súper Precio masivamente
        logger.info('🕒 [CRON] Sincronizando productos Súper Precio masivamente...');
        await syscomService.syncAllSuperPrecioByCategories({ limitPerCategory: 100 });

        // 3. Reparar precios de productos importados que no tengan precio
        logger.info('🕒 [CRON] Reparando precios faltantes o en cero...');
        await syscomService.repairMissingPrices({ limit: 500, batchSize: 20 });

        logger.info('✅ [CRON] Sincronización Principal finalizada con éxito.');
      } catch (error) {
        logger.error('❌ [CRON] Error en Sincronización Principal:', { error: error.message });
      }
    }, {
      scheduled: true,
      timezone: "America/Mexico_City" // Configurado para hora de México (ajústalo según necesites)
    });

    // 2. Calentamiento de Caché General (3:00 AM todos los días)
    // Realiza búsquedas estratégicas en Syscom para mantener los datos en caché listos (Warm-up).
    const cacheWarmupJob = cron.schedule('0 3 * * *', async () => {
      logger.info('🕒 [CRON] Iniciando calentamiento de caché (Warm-up)...');
      try {
        // Obtener categorías top para cachear la respuesta de categorías
        await syscomService.getCategories();
        
        // Obtener marcas top para cachear la respuesta
        await syscomService.getBrands();

        // Obtener productos de primera página sin filtros (búsqueda general)
        await syscomService.searchProducts({ page: 1, limit: 100 });

        logger.info('✅ [CRON] Calentamiento de caché finalizado.');
      } catch (error) {
        logger.error('❌ [CRON] Error en calentamiento de caché:', { error: error.message });
      }
    }, {
      scheduled: true,
      timezone: "America/Mexico_City"
    });

    this.jobs.push(mainSyncJob);
    this.jobs.push(cacheWarmupJob);
    this.isRunning = true;
    logger.info('⏱️ Servicio de Cron Jobs inicializado correctamente.');
  }

  stop() {
    this.jobs.forEach(job => job.stop());
    this.isRunning = false;
    logger.info('⏱️ Servicio de Cron Jobs detenido.');
  }
}

export default new CronService();
