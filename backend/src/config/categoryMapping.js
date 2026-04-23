/**
 * Mapeo de categorías de SYSCOM a categorías de la plataforma
 * 
 * Cada entrada mapea una categoría de SYSCOM a una categoría de la aplicación
 */

export const PLATFORM_CATEGORIES = {
  VIDEOVIGILANCIA: 'videovigilancia',
  CONTROL_ACCESO: 'control-acceso',
  ENERGIA_HERRAMIENTAS: 'energia-herramientas',
  DETECCION_FUEGO: 'deteccion-fuego',
  AUTOMATIZACION: 'automatizacion',
  RADIOCOMUNICACION: 'radiocomunicacion',
  REDES_IT: 'redes-it',
  IOT_GPS: 'iot-gps'
};

/**
 * Mapeo de categorías SYSCOM → Plataforma
 * Las claves son expresiones regulares que se buscan en el nombre de categoría de SYSCOM
 */
export const SYSCOM_TO_PLATFORM_MAPPING = {
  // VIDEOVIGILANCIA
  'Bala': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Domo': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Eyeball': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Turret': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'PTZ': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'IP Megapixel': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Fisheye': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Hemisférica': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'WiFi.*Inalámbrica': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  '4G': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Videograbadora': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'DVR': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'NVR': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Cámara': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Oculta': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Pinhole': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Móvil.*Vehículo': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Cubo': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'TurboHD': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Análoga': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'HDCVI': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'HDTVI': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'AHD': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Transceptor.*Video': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Monitor.*Video': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Grabador': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,
  'Balun': PLATFORM_CATEGORIES.VIDEOVIGILANCIA,

  // AUTOMATIZACIÓN E INTRUSIÓN
  'Alarma': PLATFORM_CATEGORIES.AUTOMATIZACION,
  'Sensor': PLATFORM_CATEGORIES.AUTOMATIZACION,
  'Detector.*Movimiento': PLATFORM_CATEGORIES.AUTOMATIZACION,
  'Sirena': PLATFORM_CATEGORIES.AUTOMATIZACION,
  'Intrusión': PLATFORM_CATEGORIES.AUTOMATIZACION,
  'Panel.*Alarma': PLATFORM_CATEGORIES.AUTOMATIZACION,
  'Central.*Alarma': PLATFORM_CATEGORIES.AUTOMATIZACION,
  'PIR': PLATFORM_CATEGORIES.AUTOMATIZACION,
  'Contacto.*Magnético': PLATFORM_CATEGORIES.AUTOMATIZACION,
  'Sensor.*Magnético': PLATFORM_CATEGORIES.AUTOMATIZACION,
  'Teclado.*Alarma': PLATFORM_CATEGORIES.AUTOMATIZACION,
  'Automatización': PLATFORM_CATEGORIES.AUTOMATIZACION,
  'Domótica': PLATFORM_CATEGORIES.AUTOMATIZACION,

  // CONTROL DE ACCESO
  'Control.*Acceso': PLATFORM_CATEGORIES.CONTROL_ACCESO,
  'Lector.*Proximidad': PLATFORM_CATEGORIES.CONTROL_ACCESO,
  'Lector.*Biométrico': PLATFORM_CATEGORIES.CONTROL_ACCESO,
  'Cerradura.*Electromagnética': PLATFORM_CATEGORIES.CONTROL_ACCESO,
  'Cerradura.*Electrónica': PLATFORM_CATEGORIES.CONTROL_ACCESO,
  'Torniquete': PLATFORM_CATEGORIES.CONTROL_ACCESO,
  'Tarjeta.*Proximidad': PLATFORM_CATEGORIES.CONTROL_ACCESO,
  'Controlador.*Acceso': PLATFORM_CATEGORIES.CONTROL_ACCESO,
  'Botón.*Salida': PLATFORM_CATEGORIES.CONTROL_ACCESO,
  'Pulsador': PLATFORM_CATEGORIES.CONTROL_ACCESO,
  'Biométrico': PLATFORM_CATEGORIES.CONTROL_ACCESO,
  'Huella': PLATFORM_CATEGORIES.CONTROL_ACCESO,
  'Facial': PLATFORM_CATEGORIES.CONTROL_ACCESO,

  // DETECCIÓN DE FUEGO
  'Detección.*Fuego': PLATFORM_CATEGORIES.DETECCION_FUEGO,
  'Detector.*Humo': PLATFORM_CATEGORIES.DETECCION_FUEGO,
  'Detector.*Calor': PLATFORM_CATEGORIES.DETECCION_FUEGO,
  'Detector.*Llama': PLATFORM_CATEGORIES.DETECCION_FUEGO,
  'Panel.*Incendio': PLATFORM_CATEGORIES.DETECCION_FUEGO,
  'Central.*Incendio': PLATFORM_CATEGORIES.DETECCION_FUEGO,
  'Extintor': PLATFORM_CATEGORIES.DETECCION_FUEGO,
  'Estación.*Manual': PLATFORM_CATEGORIES.DETECCION_FUEGO,
  'Fuego': PLATFORM_CATEGORIES.DETECCION_FUEGO,

  // ENERGÍA / HERRAMIENTAS
  'Fuente.*Poder': PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS,
  'Fuente.*Alimentación': PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS,
  'UPS': PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS,
  'No.*Break': PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS,
  'Batería': PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS,
  'Transformador': PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS,
  'Regulador': PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS,
  'Protector.*Sobretensión': PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS,
  'Supresor.*Picos': PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS,
  'Herramienta': PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS,
  'Energía': PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS,
  'Eléctric': PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS,
  'Multímetro': PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS,
  'Probador': PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS,
  'Alimentación': PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS,

  // IOT / GPS / TELEMÁTICA
  'GPS': PLATFORM_CATEGORIES.IOT_GPS,
  'Tracker': PLATFORM_CATEGORIES.IOT_GPS,
  'Rastreador': PLATFORM_CATEGORIES.IOT_GPS,
  'Telemática': PLATFORM_CATEGORIES.IOT_GPS,
  'Telemetría': PLATFORM_CATEGORIES.IOT_GPS,
  'IoT': PLATFORM_CATEGORIES.IOT_GPS,
  'Smart.*Sensor': PLATFORM_CATEGORIES.IOT_GPS,
  'Monitoreo.*Remoto': PLATFORM_CATEGORIES.IOT_GPS,
  'Geolocalización': PLATFORM_CATEGORIES.IOT_GPS,

  // RADIOCOMUNICACIÓN
  'Radio': PLATFORM_CATEGORIES.RADIOCOMUNICACION,
  'Walkie': PLATFORM_CATEGORIES.RADIOCOMUNICACION,
  'Handy': PLATFORM_CATEGORIES.RADIOCOMUNICACION,
  'Transreceptor': PLATFORM_CATEGORIES.RADIOCOMUNICACION,
  'Antena.*Radio': PLATFORM_CATEGORIES.RADIOCOMUNICACION,
  'Repetidor.*Radio': PLATFORM_CATEGORIES.RADIOCOMUNICACION,
  'Radiocomunicación': PLATFORM_CATEGORIES.RADIOCOMUNICACION,

  // REDES E IT
  'Switch': PLATFORM_CATEGORIES.REDES_IT,
  'Router': PLATFORM_CATEGORIES.REDES_IT,
  'Access.*Point': PLATFORM_CATEGORIES.REDES_IT,
  'Punto.*Acceso': PLATFORM_CATEGORIES.REDES_IT,
  'Firewall': PLATFORM_CATEGORIES.REDES_IT,
  'Gateway': PLATFORM_CATEGORIES.REDES_IT,
  'Modem': PLATFORM_CATEGORIES.REDES_IT,
  'Rack': PLATFORM_CATEGORIES.REDES_IT,
  'Gabinete': PLATFORM_CATEGORIES.REDES_IT,
  'Patch.*Panel': PLATFORM_CATEGORIES.REDES_IT,
  'Organizador': PLATFORM_CATEGORIES.REDES_IT,
  'Convertidor.*Medios': PLATFORM_CATEGORIES.REDES_IT,
  'Media.*Converter': PLATFORM_CATEGORIES.REDES_IT,
  'PoE': PLATFORM_CATEGORIES.REDES_IT,
  'Inyector': PLATFORM_CATEGORIES.REDES_IT,
  'Transceiver': PLATFORM_CATEGORIES.REDES_IT,
  'SFP': PLATFORM_CATEGORIES.REDES_IT,
  'Servidor': PLATFORM_CATEGORIES.REDES_IT,
  'Storage': PLATFORM_CATEGORIES.REDES_IT,
  'NAS': PLATFORM_CATEGORIES.REDES_IT,
  'HDD': PLATFORM_CATEGORIES.REDES_IT,
  'Disco.*Duro': PLATFORM_CATEGORIES.REDES_IT,
  'Red': PLATFORM_CATEGORIES.REDES_IT,
  'IT': PLATFORM_CATEGORIES.REDES_IT,
  'Networking': PLATFORM_CATEGORIES.REDES_IT
};

/**
 * Mapea una categoría de SYSCOM a una categoría de la plataforma
 * @param {string} syscomCategory - Nombre de categoría de SYSCOM
 * @returns {string} - Slug de categoría de la plataforma
 */
export function mapSyscomCategoryToPlatform(syscomCategory) {
  if (!syscomCategory) {
    return PLATFORM_CATEGORIES.VIDEOVIGILANCIA; // Default para productos sin categoría
  }

  // Buscar coincidencia exacta primero
  for (const [pattern, platformCategory] of Object.entries(SYSCOM_TO_PLATFORM_MAPPING)) {
    const regex = new RegExp(pattern, 'i'); // Case insensitive
    if (regex.test(syscomCategory)) {
      return platformCategory;
    }
  }

  // Si no hay coincidencia, intentar detectar por palabras clave
  const categoryLower = syscomCategory.toLowerCase();

  if (categoryLower.includes('camara') || categoryLower.includes('cctv') || 
      categoryLower.includes('vigilancia') || categoryLower.includes('video')) {
    return PLATFORM_CATEGORIES.VIDEOVIGILANCIA;
  }

  if (categoryLower.includes('switch') || categoryLower.includes('router') || 
      categoryLower.includes('red') || categoryLower.includes('network')) {
    return PLATFORM_CATEGORIES.REDES_IT;
  }

  if (categoryLower.includes('fuente') || categoryLower.includes('bateria') || 
      categoryLower.includes('ups') || categoryLower.includes('energia')) {
    return PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS;
  }

  if (categoryLower.includes('acceso') || categoryLower.includes('biometrico') || 
      categoryLower.includes('cerradura')) {
    return PLATFORM_CATEGORIES.CONTROL_ACCESO;
  }

  if (categoryLower.includes('alarma') || categoryLower.includes('sensor') || 
      categoryLower.includes('intrusion')) {
    return PLATFORM_CATEGORIES.AUTOMATIZACION;
  }

  if (categoryLower.includes('gps') || categoryLower.includes('tracker') || 
      categoryLower.includes('iot')) {
    return PLATFORM_CATEGORIES.IOT_GPS;
  }

  if (categoryLower.includes('radio') || categoryLower.includes('walkie')) {
    return PLATFORM_CATEGORIES.RADIOCOMUNICACION;
  }

  if (categoryLower.includes('fuego') || categoryLower.includes('humo') || 
      categoryLower.includes('incendio')) {
    return PLATFORM_CATEGORIES.DETECCION_FUEGO;
  }

  // Default: Videovigilancia (la categoría más común en SYSCOM)
  return PLATFORM_CATEGORIES.VIDEOVIGILANCIA;
}

/**
 * Obtiene el nombre legible de una categoría de la plataforma
 * @param {string} categorySlug - Slug de categoría
 * @returns {string} - Nombre legible
 */
export function getPlatformCategoryName(categorySlug) {
  const categoryNames = {
    [PLATFORM_CATEGORIES.VIDEOVIGILANCIA]: 'Videovigilancia',
    [PLATFORM_CATEGORIES.CONTROL_ACCESO]: 'Control de acceso',
    [PLATFORM_CATEGORIES.ENERGIA_HERRAMIENTAS]: 'Energía',
    [PLATFORM_CATEGORIES.DETECCION_FUEGO]: 'Detección de fuego',
    [PLATFORM_CATEGORIES.AUTOMATIZACION]: 'Automatización e intrusión',
    [PLATFORM_CATEGORIES.RADIOCOMUNICACION]: 'Radiocomunicación',
    [PLATFORM_CATEGORIES.REDES_IT]: 'Redes',
    [PLATFORM_CATEGORIES.IOT_GPS]: 'IoT / GPS / Telemetría'
  };

  return categoryNames[categorySlug] || 'General';
}
