// Utilidades para generar beneficios de productos basados en su descripción y tipo
export const generateProductBenefits = (product) => {
  const benefits = [];
  const description = (product?.descripcion || product?.description || '').toLowerCase();
  const name = (product?.titulo || product?.nombre || product?.name || '').toLowerCase();
  const brand = (product?.marca || product?.brand || '').toLowerCase();

  // Beneficios basados en palabras clave en la descripción
  if (description.includes('rápido') || description.includes('velocidad') || description.includes('performance')) {
    benefits.push('Alto rendimiento y velocidad optimizada');
  }

  if (description.includes('duradero') || description.includes('resistente') || description.includes('robusto')) {
    benefits.push('Construcción duradera y resistente');
  }

  if (description.includes('eficiente') || description.includes('ahorro') || description.includes('energía')) {
    benefits.push('Eficiencia energética y ahorro de costos');
  }

  if (description.includes('compatible') || description.includes('compatibilidad')) {
    benefits.push('Amplia compatibilidad con diversos sistemas');
  }

  if (description.includes('fácil') || description.includes('instalación') || description.includes('plug and play')) {
    benefits.push('Instalación sencilla y rápida');
  }

  if (description.includes('seguridad') || description.includes('seguro') || description.includes('protección')) {
    benefits.push('Mayor seguridad y protección de datos');
  }

  if (description.includes('calidad') || description.includes('premium') || description.includes('profesional')) {
    benefits.push('Calidad profesional y confiable');
  }

  if (description.includes('inalámbrico') || description.includes('wireless') || description.includes('wifi')) {
    benefits.push('Conectividad inalámbrica flexible');
  }

  if (description.includes('monitoreo') || description.includes('vigilancia') || description.includes('cámara')) {
    benefits.push('Monitoreo continuo y vigilancia efectiva');
  }

  if (description.includes('escalable') || description.includes('expandible')) {
    benefits.push('Escalabilidad para crecimiento futuro');
  }

  // Beneficios basados en el tipo de producto (por nombre)
  if (name.includes('router') || name.includes('switch') || name.includes('red')) {
    benefits.push('Conectividad de red estable y confiable');
    benefits.push('Gestión avanzada de tráfico de datos');
  }

  if (name.includes('cámara') || name.includes('vigilancia') || name.includes('seguridad')) {
    benefits.push('Vigilancia 24/7 con alta resolución');
    benefits.push('Detección inteligente de movimientos');
  }

  if (name.includes('servidor') || name.includes('storage') || name.includes('almacenamiento')) {
    benefits.push('Almacenamiento seguro y de alta capacidad');
    benefits.push('Disponibilidad continua de datos');
  }

  if (name.includes('ups') || name.includes('batería') || name.includes('power')) {
    benefits.push('Protección contra cortes de energía');
    benefits.push('Autonomía extendida en emergencias');
  }

  if (name.includes('computadora') || name.includes('pc') || name.includes('laptop')) {
    benefits.push('Potencia de procesamiento superior');
    benefits.push('Multitarea eficiente y productiva');
  }

  // Beneficios por marca reconocida
  if (brand.includes('cisco') || brand.includes('hp') || brand.includes('dell') || brand.includes('lenovo')) {
    benefits.push('Tecnología de marca reconocida mundialmente');
  }

  // Si no hay beneficios específicos, agregar genéricos
  if (benefits.length === 0) {
    benefits.push('Producto de calidad garantizada');
    benefits.push('Soporte técnico especializado');
    benefits.push('Garantía extendida disponible');
  }

  // Limitar a máximo 4 beneficios únicos
  return [...new Set(benefits)].slice(0, 4);
};

// Función para generar descripción breve enfocada en beneficios
export const generateBenefitDescription = (product) => {
  const benefits = generateProductBenefits(product);
  const name = product?.titulo || product?.nombre || product?.name || 'Producto';

  if (benefits.length === 0) {
    return `${name} - Producto de alta calidad con garantía y soporte técnico.`;
  }

  const mainBenefit = benefits[0];
  return `${name} - ${mainBenefit.toLowerCase()}.`;
};

// Función para extraer características técnicas como beneficios
export const extractTechnicalBenefits = (description) => {
  const benefits = [];
  const desc = description.toLowerCase();

  // Buscar especificaciones técnicas comunes
  const specs = [
    { pattern: /(\d+)\s*(gb|gigabytes?|mb|megabytes?)/gi, benefit: 'Alta capacidad de almacenamiento' },
    { pattern: /(\d+)\s*(mhz|ghz|hz)/gi, benefit: 'Procesamiento de alta velocidad' },
    { pattern: /(\d+)\s*(mp|megapixels?)/gi, benefit: 'Alta resolución de imagen' },
    { pattern: /(\d+)\s*(ports?|puertos?)/gi, benefit: 'Múltiples conexiones disponibles' },
    { pattern: /(wireless|wifi|inalámbrico)/gi, benefit: 'Conectividad inalámbrica' },
    { pattern: /(poe|power over ethernet)/gi, benefit: 'Alimentación por red simplificada' },
    { pattern: /(4k|hd|full hd)/gi, benefit: 'Calidad de video superior' },
    { pattern: /(raid|redundancia)/gi, benefit: 'Protección de datos redundante' }
  ];

  specs.forEach(spec => {
    if (spec.pattern.test(desc)) {
      benefits.push(spec.benefit);
    }
  });

  return [...new Set(benefits)];
};
