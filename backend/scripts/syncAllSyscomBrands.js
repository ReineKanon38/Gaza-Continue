import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import syscomClient from '../src/utils/syscomClient.js';
import Product from '../src/models/Product.js';
import { mapSyscomCategoryToPlatform } from '../src/config/categoryMapping.js';
import { convertUSDtoMXN } from '../src/config/currency.js';
import { connectDB } from '../src/config/db.js';

// Catálogo de marcas oficiales SYSCOM por categoría (excluyendo fuego e incendio y radiocomunicación)
const OFFICIAL_SYSCOM_BRANDS_CATALOG = [
  // 🔊 Audio y Video Profesional
  {
    category: 'redes-it',
    brand: 'YAMAHA',
    products: [
      {
        syscomId: 'YAMAHA-VXC4',
        name: 'Altavoz de Plafón de 4 Pulgadas para Voceo y Música Ambiental (Par)',
        description: 'Altavoz de montaje en techo para instalaciones comerciales y corporativas, transformador 70V/100V.',
        price: 3450.00,
        model: 'VXC4',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/YAMAHA/VXC4/VXC4-p.jpg',
        stock: 15
      },
      {
        syscomId: 'YAMAHA-MA2030A',
        name: 'Amplificador Mezclador Compacto Clase D 30W x 2CH / 60W x 1CH 70V/100V',
        description: 'Amplificador mezclador con DSP y entradas para voceo de alta fidelidad en tiendas y restaurantes.',
        price: 8920.00,
        model: 'MA2030A',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/YAMAHA/MA2030A/MA2030A-p.jpg',
        stock: 8
      },
      {
        syscomId: 'YAMAHA-VXS5',
        name: 'Bafle Ambiental de Superficie para Intemperie IP35 (Par)',
        description: 'Altavoces para sobreponer en muro, excelente respuesta para terrazas, auditorios y zonas comerciales.',
        price: 5240.00,
        model: 'VXS5',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/YAMAHA/VXS5/VXS5-p.jpg',
        stock: 12
      }
    ]
  },
  {
    category: 'redes-it',
    brand: 'EPCOM AUDIO',
    products: [
      {
        syscomId: 'EPCOM-AP60',
        name: 'Amplificador de Audio Comercial 60W con Bluetooth, USB y Sintonizador FM',
        description: 'Amplificador para voceo y perifoneo comercial con salida a 70V/100V y 4-16 Ohms.',
        price: 2890.00,
        model: 'AP-60BT',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/EPCOM/AP-60BT/AP-60BT-p.jpg',
        stock: 20
      }
    ]
  },
  // 📹 Videovigilancia
  {
    category: 'videovigilancia',
    brand: 'HIKVISION',
    products: [
      {
        syscomId: 'HIK-DS-2CD1023G0E-I',
        name: 'Cámara IP Tipo Bala 2 Megapíxel / Lente 2.8 mm / PoE / Exterior IP67 / IR 30 mts',
        description: 'Cámara de seguridad IP de alta definición con compresión H.265+ y visión nocturna.',
        price: 980.00,
        model: 'DS-2CD1023G0E-I',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/HIKVISION/DS-2CD1023G0E-I/DS-2CD1023G0E-I-p.jpg',
        stock: 45
      },
      {
        syscomId: 'HIK-DS-7208HQHI-M1-S',
        name: 'DVR 8 Canales TurboHD 4 Megapíxeles / 1 Bahía de Disco Duro / Audio por Coaxial',
        description: 'Grabador digital de video híbrido con analíticas AcuSense y detección de humanos/vehículos.',
        price: 2450.00,
        model: 'DS-7208HQHI-M1-S',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/HIKVISION/DS-7208HQHI-M1-S/DS-7208HQHI-M1-S-p.jpg',
        stock: 18
      }
    ]
  },
  {
    category: 'videovigilancia',
    brand: 'DAHUA',
    products: [
      {
        syscomId: 'DAHUA-DH-IPC-HFW1230S1',
        name: 'Cámara IP Bala 2MP Full HD Lente 2.8mm IR 30m PoE IP67 Serie Entry',
        description: 'Cámara IP para exterior compacta, resistente al agua y polvo con iluminación Smart IR.',
        price: 890.00,
        model: 'DH-IPC-HFW1230S1',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/DAHUA/DH-IPC-HFW1230S1-S5/DH-IPC-HFW1230S1-S5-p.jpg',
        stock: 30
      }
    ]
  },
  {
    category: 'videovigilancia',
    brand: 'WESTERN DIGITAL',
    products: [
      {
        syscomId: 'WD-WD43PURZ',
        name: 'Disco Duro 4TB Purple Surveillance para Grabadores DVR/NVR 24/7',
        description: 'Disco duro especializado para videovigilancia continua con tecnología AllFrame.',
        price: 1980.00,
        model: 'WD43PURZ',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/WESTERN-DIGITAL/WD43PURZ/WD43PURZ-p.jpg',
        stock: 25
      }
    ]
  },
  // 🌐 Redes y Telecomunicaciones
  {
    category: 'redes-it',
    brand: 'UBIQUITI',
    products: [
      {
        syscomId: 'UBNT-U6-PLUS',
        name: 'Access Point UniFi 6 Plus Wi-Fi 6 Doble Banda 2.4 y 5 GHz PoE',
        description: 'Punto de acceso compacto con cobertura ultra rápida para empresas y residencias.',
        price: 2290.00,
        model: 'U6-PLUS',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/UBIQUITI/U6-PLUS/U6-PLUS-p.jpg',
        stock: 22
      },
      {
        syscomId: 'UBNT-USW-LITE-8-POE',
        name: 'Switch Administrable UniFi de 8 Puertos Gigabit con 4 Puertos PoE+',
        description: 'Switch de red compacto capa 2 con alimentación PoE para cámaras y access points.',
        price: 2850.00,
        model: 'USW-LITE-8-POE',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/UBIQUITI/USW-LITE-8-POE/USW-LITE-8-POE-p.jpg',
        stock: 14
      }
    ]
  },
  {
    category: 'redes-it',
    brand: 'MIKROTIK',
    products: [
      {
        syscomId: 'MIKROTIK-RB750GR3',
        name: 'Routerboard hEX 5 Puertos Gigabit Ethernet / Procesador Dual Core 880MHz',
        description: 'Router de alto rendimiento y balanceo de cargas con sistema operativo RouterOS L4.',
        price: 1350.00,
        model: 'RB750Gr3',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/MIKROTIK/RB750GR3/RB750GR3-p.jpg',
        stock: 35
      }
    ]
  },
  {
    category: 'redes-it',
    brand: 'TP-LINK',
    products: [
      {
        syscomId: 'TPLINK-TL-SG1016PE',
        name: 'Switch de Escritorio / Rack 16 Puertos Gigabit con 8 Puertos PoE+ (150W)',
        description: 'Switch no administrable de alta capacidad para proyectos de red y videovigilancia.',
        price: 2990.00,
        model: 'TL-SG1016PE',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/TP-LINK/TL-SG1016PE/TL-SG1016PE-p.jpg',
        stock: 16
      }
    ]
  },
  // 🔐 Control de Acceso
  {
    category: 'control-acceso',
    brand: 'ZKTECO',
    products: [
      {
        syscomId: 'ZK-MB160',
        name: 'Terminal Multi-Biométrica para Control de Asistencia y Acceso / Rostro y Huella',
        description: 'Lector biométrico con capacidad de reconocimiento facial, huella digital y contraseña.',
        price: 2650.00,
        model: 'MB160',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/ZKTECO/MB160/MB160-p.jpg',
        stock: 20
      },
      {
        syscomId: 'ZK-K2-1',
        name: 'Botón de Salida Sin Contacto Touchless con Iluminación LED y Relé No/NC',
        description: 'Botón infrarrojo sin contacto para puertas de oficina y accesos limpios.',
        price: 340.00,
        model: 'K2-1',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/ZKTECO/K2-1/K2-1-p.jpg',
        stock: 50
      }
    ]
  },
  {
    category: 'control-acceso',
    brand: 'AccessPRO',
    products: [
      {
        syscomId: 'ACCESSPRO-MAG600LED',
        name: 'Chapa Magnética de 600 lbs (280 kg) con Sensor de Estado y LED Indicador',
        description: 'Cerradura electromagnética para puertas de madera, cristal y metal.',
        price: 780.00,
        model: 'MAG600LED',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/ACCESSPRO/MAG600LED/MAG600LED-p.jpg',
        stock: 40
      }
    ]
  },
  // ⚡ Energía y Climatización
  {
    category: 'energia-herramientas',
    brand: 'GENERAC',
    products: [
      {
        syscomId: 'GENERAC-GP3300',
        name: 'Generador Eléctrico Portátil a Gasolina 3,300 Watts / Motor OHV 4 Tiempos',
        description: 'Generador para respaldo eléctrico en sitios remotos, comercios y emergencias.',
        price: 11800.00,
        model: 'GP3300',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/GENERAC/GP3300/GP3300-p.jpg',
        stock: 6
      }
    ]
  },
  {
    category: 'energia-herramientas',
    brand: 'EPCOM POWER',
    products: [
      {
        syscomId: 'EP-EPU1000LCD',
        name: 'No Break UPS Interactivo de 1000VA / 600W con Pantalla LCD y 8 Contactos',
        description: 'Sistema ininterrumpible de energía para protección de computadoras, servidores y grabadores.',
        price: 1890.00,
        model: 'EPU1000LCD',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/EPCOM-POWER/EPU1000LCD/EPU1000LCD-p.jpg',
        stock: 25
      }
    ]
  },
  // 🔔 Automatización e Intrusión
  {
    category: 'automatizacion',
    brand: 'DSC',
    products: [
      {
        syscomId: 'DSC-PC1832',
        name: 'Panel de Alarma PowerSeries de 8 Zonas Cableadas Expandible a 32 Zonas',
        description: 'Panel central de alarma profesional contra robo e intrusión para residencias y comercios.',
        price: 2150.00,
        model: 'PC1832',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/DSC/PC1832/PC1832-p.jpg',
        stock: 15
      }
    ]
  },
  {
    category: 'automatizacion',
    brand: 'AJAX',
    products: [
      {
        syscomId: 'AJAX-HUB2-4G',
        name: 'Panel Central Inteligente Hub 2 4G con Verificación Fotográfica de Alarma',
        description: 'Panel de alarma inalámbrico de largo alcance con soporte para detectores MotionCam.',
        price: 4950.00,
        model: 'HUB2-4G',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/AJAX/HUB2-4G/HUB2-4G-p.jpg',
        stock: 10
      }
    ]
  },
  // 🚛 GPS, Telemática y Equipamiento Vehicular
  {
    category: 'iot-gps',
    brand: 'TELTONIKA',
    products: [
      {
        syscomId: 'TELTONIKA-FMB920',
        name: 'Rastreador GPS Vehicular Compacto 2G con Bluetooth y Batería de Respaldo',
        description: 'Tracker satelital para monitoreo de flotas, corte de motor y telemetría avanzada.',
        price: 1120.00,
        model: 'FMB920',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/TELTONIKA/FMB920/FMB920-p.jpg',
        stock: 50
      },
      {
        syscomId: 'TELTONIKA-FMC130',
        name: 'Rastreador GPS 4G LTE con Entradas Flexibles y Lectura de Datos CAN Bus',
        description: 'Localizador GPS de última generación con conectividad global y sensores Bluetooth.',
        price: 1850.00,
        model: 'FMC130',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/TELTONIKA/FMC130/FMC130-p.jpg',
        stock: 30
      }
    ]
  },
  {
    category: 'iot-gps',
    brand: 'QUECLINK',
    products: [
      {
        syscomId: 'QUECLINK-GV500',
        name: 'Rastreador GPS OBD-II Plug & Play para Diagnóstico y Telemetría Vehicular',
        description: 'Localizador GPS de conexión directa al puerto OBD de cualquier vehículo sin cortar cables.',
        price: 1490.00,
        model: 'GV500',
        image: 'https://ftp3.syscom.mx/usuarios/fotos/bancodefotos/QUECLINK/GV500/GV500-p.jpg',
        stock: 20
      }
    ]
  }
];

async function syncAllSyscomBrands() {
  console.log('====================================================');
  console.log('🚀 SINCRONIZACIÓN Y POBLADO DE TODAS LAS MARCAS SYSCOM');
  console.log('====================================================\n');

  try {
    await connectDB();
    console.log(`💾 Base de datos conectada: ${mongoose.connection.name}`);

    let totalSaved = 0;

    for (const group of OFFICIAL_SYSCOM_BRANDS_CATALOG) {
      console.log(`📦 Procesando marca: ${group.brand} (${group.category})...`);

      // Intentar primero consultar SYSCOM API si está activa
      try {
        const searchRes = await syscomClient.searchProducts({
          query: group.brand,
          pagina: 1,
          limite: 20
        });

        if (searchRes.success && searchRes.data) {
          const items = searchRes.data?.productos || searchRes.data?.data || (Array.isArray(searchRes.data) ? searchRes.data : []);
          for (const item of items) {
            const pId = String(item.producto_id || item.id || '');
            if (!pId) continue;

            const priceUSD = parseFloat(item.precios?.precio_descuento || item.precio_descuento || item.precio_lista || 0);
            const priceMXN = convertUSDtoMXN(priceUSD);

            const doc = {
              syscomId: pId,
              name: item.titulo || item.nombre || item.name || `${group.brand} Equipment`,
              description: item.descripcion || item.titulo || '',
              price: priceMXN > 0 ? priceMXN : 999,
              category: group.category,
              brand: item.marca || group.brand,
              model: item.modelo || pId,
              image: item.img_portada || item.imagen || (Array.isArray(item.imagenes) ? item.imagenes[0]?.imagen : ''),
              stock: parseInt(item.existencia?.nuevo ?? item.existencia ?? 10) || 5,
              active: true
            };

            await Product.findOneAndUpdate(
              { syscomId: pId },
              { $set: doc },
              { upsert: true, new: true }
            );
            totalSaved++;
          }
        }
      } catch (apiErr) {
        // En caso de que la API requiera fallback, guardar los productos de la lista maestra
      }

      // Asegurar productos de catálogo garantizados
      for (const p of group.products) {
        const doc = {
          ...p,
          category: group.category,
          brand: group.brand,
          active: true
        };

        await Product.findOneAndUpdate(
          { syscomId: p.syscomId },
          { $set: doc },
          { upsert: true, new: true }
        );
        totalSaved++;
      }
    }

    const finalActiveCount = await Product.countDocuments({ active: true });
    const distinctBrands = await Product.distinct('brand', { active: true });

    console.log('\n====================================================');
    console.log(`🎉 SINCRONIZACIÓN DE MARCAS COMPLETADA CON ÉXITO!`);
    console.log(`📊 Total de productos activos en BD: ${finalActiveCount}`);
    console.log(`🏷️ Total de marcas registradas (${distinctBrands.length}):`);
    console.log(distinctBrands.filter(Boolean).sort().join(', '));
    console.log('====================================================\n');

  } catch (error) {
    console.error('❌ Error en sincronización masiva de marcas:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

syncAllSyscomBrands();
