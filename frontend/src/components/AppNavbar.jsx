import { useEffect, useMemo, useState, useRef } from 'react';
import { Button, Navbar, Nav, Container, Image, Badge } from 'react-bootstrap';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
    BsPersonCircle, BsCart3, BsGrid3X3Gap, BsStars, BsSearch, BsChevronDown,
    BsShieldLock
} from 'react-icons/bs';
import { FiLogOut, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import logo from '../assets/images/SG.jpg';
import { useCartHelpers } from '../hooks/useCartHooks';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import './AppNavbar.css';

export const CATEGORY_TREE = [
  {
    id: 'videovigilancia',
    name: 'Videovigilancia',
    icon: '📹',
    sections: [
      {
        title: 'Cámaras IP',
        items: ['Cámaras IP Bala', 'Cámaras IP Domo', 'Cámaras IP PTZ', 'Cámaras Panorámicas 360°', 'Cámaras Térmicas']
      },
      {
        title: 'Cámaras TurboHD',
        items: ['Domo TurboHD', 'Bala TurboHD', 'PTZ TurboHD', 'Cámaras ColorVu / Full Color', 'Lentes y Accesorios']
      },
      {
        title: 'Grabadores DVR / NVR',
        items: ['NVR 4 a 64 Canales', 'DVR TurboHD AcuSense', 'Servidores de Almacenamiento', 'Discos Duros Purple', 'Switches PoE para Cámaras']
      },
      {
        title: 'Accesorios y Video Móvil',
        items: ['Baluns y Transceptores', 'Fuentes para Cámaras', 'Gabinete para Grabador', 'Body Cams', 'Monitores de Seguridad']
      }
    ]
  },
  {
    id: 'redes-it',
    name: 'Redes y Telecomunicaciones',
    icon: '🌐',
    sections: [
      {
        title: 'Switches y Routing',
        items: ['Switches PoE y PoE+', 'Switches Administrables L2/L3', 'Routers y Gateways', 'Balanceadores de Carga', 'Módulos SFP Fibra']
      },
      {
        title: 'Conectividad Wi-Fi',
        items: ['Access Points Wi-Fi 6', 'Antenas Sectoriales', 'Enlaces Punto a Punto PTP', 'Enlaces Punto Multipunto', 'Controladores Wi-Fi']
      },
      {
        title: 'Racks y Gabinetes',
        items: ['Racks de Pared y Piso', 'Gabinetes de Comunicación', 'Organizadores de Cable', 'Bandejas y PDU', 'Patch Panels Cat6/6A']
      },
      {
        title: 'Fibra y Medios',
        items: ['Convertidores de Medios', 'Cables Patch Cord Fibra', 'Cajas de Distribución Óptica', 'Transceivers Ópticos', 'Herramientas de Fusión']
      }
    ]
  },
  {
    id: 'control-acceso',
    name: 'Control de Acceso',
    icon: '🔐',
    sections: [
      {
        title: 'Cerraduras y Chapas',
        items: ['Chapas Magnéticas 600/1200 lbs', 'Contrachapas Eléctricas', 'Cerraduras Autónomas', 'Soportes ZL y L', 'Cierra Puertas Hidráulicos']
      },
      {
        title: 'Lectores y Biometría',
        items: ['Terminales Reconocimiento Facial', 'Lectores de Huella Digital', 'Lectores de Tarjetas RFID / NFC', 'Lectores QR Dinámico', 'Teclados con Lector']
      },
      {
        title: 'Torniquetes y Barreras',
        items: ['Torniquetes de Acceso', 'Barreras Vehiculares Rápidas', 'Brazos para Barrera', 'Detectores de Masa / Loop', 'Llaveros y Tags Vehiculares']
      },
      {
        title: 'Accesorios y Software',
        items: ['Tarjetas RFID 125kHz / Mifare', 'Botones de Salida Sin Contacto', 'Controladores de Acceso 2/4 Puertas', 'Fuentes con Respaldo de Batería']
      }
    ]
  },
  {
    id: 'energia-herramientas',
    name: 'Energía y Climatización',
    icon: '⚡',
    sections: [
      {
        title: 'Respaldo UPS / No-Break',
        items: ['UPS Interactivos', 'UPS Online Doble Conversión', 'Sistemas de Baterías Externas', 'Supresores de Picos', 'Reguladores de Voltaje']
      },
      {
        title: 'Fuentes y Baterías',
        items: ['Fuentes de Poder Centralizadas', 'Fuentes Industriales Riel DIN', 'Baterías de Ciclo Profundo', 'Baterías AGM / Gel 12V', 'Inversores de Corriente']
      },
      {
        title: 'Generadores y Solar',
        items: ['Generadores Eléctricos a Gasolina', 'Paneles Solares Fotovoltaicos', 'Controladores de Carga Solar', 'Estructuras de Montaje Solar', 'Plantas de Emergencia']
      },
      {
        title: 'Climatización y Gabinetes',
        items: ['Aires Acondicionados para Rack', 'Termostatos Industriales', 'Extractores y Ventiladores', 'Gabinetes NEMA para Intemperie']
      }
    ]
  },
  {
    id: 'automatizacion',
    name: 'Automatización e Intrusión',
    icon: '🔔',
    sections: [
      {
        title: 'Paneles de Alarma',
        items: ['Paneles de Alarma Inalámbricos', 'Paneles Híbridos y Cableados', 'Teclados Táctiles y LCD', 'Módulos Comunicadores 4G / IP', 'Baterías de Respaldo']
      },
      {
        title: 'Sensores y Detección',
        items: ['Sensores de Movimiento PIR', 'Contactos Magnéticos para Puerta/Ventana', 'Detectores de Ruptura de Cristal', 'Barreras Fotoeléctricas Infrarrojas', 'Sensores de Impacto']
      },
      {
        title: 'Sirenas y Disuasión',
        items: ['Sirenas para Exterior con Estrobo', 'Sirenas de Alta Potencia', 'Luces Estroboscópicas', 'Estrobos Ocultos', 'Sirenas para Interior']
      },
      {
        title: 'Domótica y Control',
        items: ['Módulos Relevador Wi-Fi / Zigbee', 'Interruptores Inteligentes', 'Sensores de Inundación', 'Enchufes Inteligentes', 'Controladores de Escenas']
      }
    ]
  },
  {
    id: 'iot-gps',
    name: 'GPS, Telemática y Equipamiento Vehicular',
    icon: '🚛',
    sections: [
      {
        title: 'Rastreo y Telemática',
        items: ['Trackers GPS Vehiculares 4G', 'Localizadores GPS OBD-II Plug & Play', 'Sensores de Nivel de Combustible', 'Módulos SIM M2M Multicarrier', 'Antenas GPS y GSM']
      },
      {
        title: 'Torretas y Barras de Luz',
        items: ['Barras de Luces / Torretas', 'Barras de Luz Interiores', 'Barras Directoras de Tráfico', 'Mini Barras Vehiculares', 'Estrobos y Burbujas']
      },
      {
        title: 'Luces Auxiliares y Sirenas',
        items: ['Luces Auxiliares para Ambulancias', 'Luces para Vehículos Todo Terreno', 'Luces para Montacargas y Grúas', 'Sirenas y Bocinas Vehiculares', 'Alarmas de Reversa']
      },
      {
        title: 'LoRaWAN y Sensores',
        items: ['Gateways LoRaWAN para Exterior', 'Sensores Inteligentes LoRaWAN', 'Equipos de Medición y Telemetría', 'Video Móvil y Cámaras para Autos', 'Body Cams']
      }
    ]
  },
  {
    id: 'redes-it',
    name: 'Cableado Estructurado',
    icon: '🔌',
    sections: [
      {
        title: 'Cables y Bobinas',
        items: ['Bobinas UTP Cat6 100% Cobre', 'Bobinas UTP Cat6A Blindadas', 'Bobinas para Exterior con Mensajero', 'Cables Patch Cord Cat6', 'Bobinas de Fibra Óptica']
      },
      {
        title: 'Conectividad y Jacks',
        items: ['Jacks RJ45 Cat6 / Cat6A', 'Placas de Pared Faceplates', 'Conectores RJ45 Blindados', 'Patch Panels de 24 y 48 Puertos', 'Copres y Adaptadores']
      },
      {
        title: 'Canalización y Soporte',
        items: ['Charolas Tipo Malla', 'Canaletas de Superficie', 'Tubería Conduit y Coples', 'Abrazaderas y Velcros', 'Escalerillas Portacables']
      },
      {
        title: 'Herramientas y Medición',
        items: ['Ponchadoras de Impacto 110', 'Crimpeadoras RJ45', 'Peladores de Cable UTP / Fibra', 'Probadores y Certificadores de Red', 'Generadores de Tono y Pollos']
      }
    ]
  },
  {
    id: 'redes-it',
    name: 'Audio y Video Profesional (Yamaha)',
    icon: '🔊',
    sections: [
      {
        title: 'Altavoces y Bafles (Yamaha)',
        items: ['Altavoces de Plafón para Voceo', 'Bafles Ambientales para Superficie', 'Altavoces para Intemperie IP35/IP65', 'Columnas de Audio y Arrays', 'Subwoofers Comerciales']
      },
      {
        title: 'Amplificadores y Mezcladoras',
        items: ['Amplificadores Clase D 70V/100V', 'Amplificadores Mezcladores con DSP', 'Mezcladoras de Audio Comercial', 'Sistemas de Perifoneo y Voceo', 'Sintonizadores con Bluetooth y USB']
      },
      {
        title: 'Microfonía y Comunicación',
        items: ['Micrófonos de Cuello de Ganso', 'Micrófonos Inalámbricos UHF', 'Estaciones de Voceo Multizona', 'Intercomunicadores y Voceo IP', 'Sistemas de Conferencia']
      },
      {
        title: 'Accesorios y Cables de Audio',
        items: ['Transformadores de Línea 70V', 'Atenuadores y Controles de Volumen', 'Cables de Audio Blindados', 'Conectores XLR y Plug 6.3mm', 'Soportes para Bocinas']
      }
    ]
  },
  {
    id: 'energia-herramientas',
    name: 'Herramientas, Ferretería y Material Eléctrico',
    icon: '🛠️',
    sections: [
      {
        title: 'Herramientas de Precisión',
        items: ['Kits de Herramientas para Telecom', 'Pinzas de Corte y Pelacables', 'Desarmadores de Precisión', 'Ponchadoras para Terminales', 'Cautines y Soldadura']
      },
      {
        title: 'Equipos de Medición',
        items: ['Multímetros Digitales', 'Amperímetros de Gancho', 'Medidores de Distancia Láser', 'Probadores de Cables y Redes', 'Termómetros Infrarrojos']
      },
      {
        title: 'Ferretería y Montaje',
        items: ['Tornillería y Taquetes Especiales', 'Cintas Aislantes y de Autofusión', 'Abrazaderas Tipo Uña y Omega', 'Gabinete y Cajas de Registro', 'Cincho de Plástico y Metálico']
      },
      {
        title: 'Seguridad y Protección',
        items: ['Guantes Dieléctricos', 'Lentes de Seguridad', 'Chalecos de Seguridad', 'Cinturones Portaherramientas', 'Tapetes Dieléctricos']
      }
    ]
  }
];

function AppNavbar() {
    const navigate = useNavigate();
    const { totalItems } = useCartHelpers();
    const { user, logout, isAdmin } = useAuth();
    const [searchParams] = useSearchParams();
    const [categories, setCategories] = useState([]);
    const [menuQuery, setMenuQuery] = useState('');
    const [megaMenuOpen, setMegaMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTabCategoryIndex, setActiveTabCategoryIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [brandFilter, setBrandFilter] = useState(searchParams.get('brand') || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const megaMenuRef = useRef(null);
    const searchRef = useRef(null);
    const currentCategory = searchParams.get('syscomCategory');

    /* ── Logo destination ── */
    const logoTo = !user ? '/' : isAdmin() ? '/admin' : '/catalog';

    /* ── Filtered Categories with Subdivisions ── */
    const filteredCategoryTree = useMemo(() => {
        const normalized = String(menuQuery || '').trim().toLowerCase();
        if (!normalized) return CATEGORY_TREE;
        return CATEGORY_TREE.filter(cat => 
            cat.name.toLowerCase().includes(normalized) ||
            cat.sections.some(sec => 
              sec.title.toLowerCase().includes(normalized) ||
              sec.items.some(item => item.toLowerCase().includes(normalized))
            )
        );
    }, [menuQuery]);

    const activeCat = filteredCategoryTree[activeTabCategoryIndex] || filteredCategoryTree[0] || CATEGORY_TREE[0];

    const [availableBrands, setAvailableBrands] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const [catRes, brandList] = await Promise.all([
                    productService.getSyscomCategories(),
                    productService.getBrands()
                ]);
                setCategories(catRes.categories || []);
                if (Array.isArray(brandList) && brandList.length > 0) {
                    setAvailableBrands(brandList);
                }
            } catch {
                setCategories([]);
            }
        };
        load();
    }, []);

    useEffect(() => {
        setSearchTerm(searchParams.get('search') || '');
        setBrandFilter(searchParams.get('brand') || '');
    }, [searchParams]);

    /* ── Close mega-menu on outside click ── */
    useEffect(() => {
        const handleClick = (e) => {
            if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) {
                setMegaMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleCategoryClick = (catId) => {
        navigate(`/tienda?syscomCategory=${catId}`);
        setMenuQuery('');
        setMegaMenuOpen(false);
        setMobileMenuOpen(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        
        if (searchTerm.trim()) params.set('search', searchTerm.trim());
        else params.delete('search');
        
        if (brandFilter) params.set('brand', brandFilter);
        else params.delete('brand');
        
        params.delete('maxPrice');
        
        navigate(`/tienda?${params.toString()}`);
        setShowSuggestions(false);
    };

    useEffect(() => {
        const fetchSuggestions = async () => {
            const term = searchTerm.trim();
            if (term.length >= 3) {
                try {
                    const res = await productService.searchSyscomProducts({ query: term, limit: 6 });
                    if (res && res.products) {
                        setSuggestions(res.products.slice(0, 6));
                        setShowSuggestions(true);
                    }
                } catch (error) {
                    console.error("Error fetching suggestions:", error);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };

    return (
        <header className="navbar-wrapper">
            {/* ═══════════ FILA 1: Top bar ═══════════ */}
            <div className="navbar-top-bar">
                <Container fluid className="navbar-top-inner px-3 px-md-4">
                    {/* Logo */}
                    <Link to={logoTo} className="navbar-brand-link">
                        <Image
                            src={logo}
                            alt="SYSCOM-GAZA Logo"
                            className="navbar-logo-img"
                        />
                        <div className="navbar-brand-text">
                            <span className="navbar-brand-name">SYSCOM-GAZA</span>
                            <small className="navbar-brand-sub">Infraestructura TI</small>
                        </div>
                    </Link>

                    {/* Buscador central (desktop) */}
                    <div className="navbar-search-container position-relative d-none d-md-flex w-100" ref={searchRef} style={{ margin: '0 2rem' }}>
                        <form className="navbar-search-form w-100" onSubmit={handleSearch}>
                            <select
                                className="navbar-search-select d-none d-lg-block"
                                value={brandFilter}
                                onChange={(e) => setBrandFilter(e.target.value)}
                            >
                                <option value="">Todas las Marcas</option>
                                {availableBrands.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>

                            <BsSearch className="navbar-search-icon" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if(e.target.value.trim().length > 0) setShowSuggestions(true);
                                }}
                                onFocus={() => {
                                    if(suggestions.length > 0) setShowSuggestions(true);
                                }}
                                placeholder="Buscar producto, marca o ID..."
                                className="navbar-search-input"
                            />

                            <button type="submit" className="navbar-search-btn">Buscar</button>
                        </form>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="search-suggestions-dropdown position-absolute" style={{ top: '100%', left: 0, right: 0, zIndex: 1050, marginTop: '0.5rem', background: 'var(--surface-0)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
                                {suggestions.map((item) => (
                                    <div
                                        key={item._id || item.syscomId}
                                        className="suggestion-item d-flex align-items-center gap-3"
                                        style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-1)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        onClick={() => {
                                            setSearchTerm(item.name);
                                            setShowSuggestions(false);
                                            navigate(`/tienda?search=${encodeURIComponent(item.name)}`);
                                        }}
                                    >
                                        <div style={{ width: '45px', height: '45px', flexShrink: 0, background: '#fff', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {item.image ? (
                                                <img src={item.image} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="" />
                                            ) : (
                                                <span style={{ fontSize: '1.2rem' }}>📦</span>
                                            )}
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <span className="suggestion-name d-block" style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{item.name}</span>
                                            <div className="suggestion-meta text-muted" style={{ fontSize: '0.8rem' }}>
                                                <span className="suggestion-brand text-primary fw-bold me-2">{item.distributor || item.marca}</span>
                                                <span className="suggestion-id">{item.modelo ? `Mod: ${item.modelo}` : `ID: ${item.syscomId}`}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Iconos de acción (desktop) */}
                    <div className="navbar-actions">
                        {/* Carrito */}
                        <button
                            className="navbar-action-btn"
                            onClick={() => navigate('/cart')}
                            aria-label="Ver carrito"
                        >
                            <BsCart3 />
                            {totalItems > 0 && (
                                <span className="navbar-action-badge">
                                    {totalItems > 99 ? '99+' : totalItems}
                                </span>
                            )}
                        </button>

                        {/* Perfil */}
                        <button
                            className="navbar-action-btn"
                            onClick={() => navigate('/mi-cuenta')}
                            aria-label="Mi cuenta"
                        >
                            <BsPersonCircle />
                        </button>

                        {/* Admin (solo si es admin) */}
                        {isAdmin() && (
                            <button
                                className="navbar-action-btn navbar-action-admin"
                                onClick={() => navigate('/admin')}
                                aria-label="Panel de administración"
                            >
                                <BsShieldLock />
                            </button>
                        )}

                        {/* Salir */}
                        <button
                            className="navbar-action-btn navbar-action-logout d-none d-md-flex"
                            onClick={handleLogout}
                            aria-label="Cerrar sesión"
                        >
                            <FiLogOut />
                        </button>

                        {/* Hamburguesa mobile */}
                        <button
                            className="navbar-hamburger d-flex d-md-none"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Abrir menú"
                        >
                            <FiMenu />
                        </button>
                    </div>
                </Container>
            </div>

            {/* ═══════════ FILA 2: Nav bar (desktop) ═══════════ */}
            <div className="navbar-bottom-bar d-none d-md-flex">
                <Container fluid className="navbar-bottom-inner px-3 px-md-4">
                    <nav className="navbar-nav-links">
                        {/* Catálogo */}
                        <Link to="/tienda" className={`navbar-nav-link ${!currentCategory ? 'active' : ''}`}>
                            <BsGrid3X3Gap className="me-1" /> Catálogo
                        </Link>

                        {/* Super Precio */}
                        <Link to="/super-precio" className="navbar-nav-link">
                            <BsStars className="me-1" /> Súper Precio
                        </Link>

                        {/* Mega-menú Categorías */}
                        <div className="navbar-mega-wrapper" ref={megaMenuRef}>
                            <button
                                className={`navbar-nav-link navbar-nav-btn ${megaMenuOpen ? 'active' : ''}`}
                                onClick={() => setMegaMenuOpen((v) => !v)}
                                onMouseEnter={() => setMegaMenuOpen(true)}
                                aria-expanded={megaMenuOpen}
                            >
                                Categorías <BsChevronDown className={`mega-chevron ${megaMenuOpen ? 'open' : ''}`} />
                            </button>

                            {megaMenuOpen && (
                                <div
                                    className="navbar-mega-menu"
                                    onMouseLeave={() => setMegaMenuOpen(false)}
                                >
                                    {/* Barra superior con buscador y acción rápida */}
                                    <div className="mega-top-toolbar">
                                        <div className="mega-search-wrap">
                                            <BsSearch className="mega-search-icon" />
                                            <input
                                                type="text"
                                                value={menuQuery}
                                                onChange={(e) => setMenuQuery(e.target.value)}
                                                placeholder="Buscar en el menú de categorías..."
                                                className="mega-search-input"
                                                autoFocus
                                            />
                                        </div>
                                        {activeCat && (
                                            <button
                                                className="mega-category-action-link"
                                                onClick={() => {
                                                    handleCategoryClick(activeCat.id);
                                                    setMegaMenuOpen(false);
                                                }}
                                            >
                                                Ver catálogo completo de {activeCat.name} →
                                            </button>
                                        )}
                                    </div>

                                    {/* Contenido dividido en 2 paneles: Sidebar de Categorías + Grid de Secciones */}
                                    <div className="mega-content-container">
                                        {/* Sidebar Izquierda: Categorías principales */}
                                        <div className="mega-sidebar-tabs">
                                            {filteredCategoryTree.map((cat, idx) => (
                                                <button
                                                    key={idx}
                                                    className={`mega-tab-btn ${activeTabCategoryIndex === idx ? 'active' : ''}`}
                                                    onMouseEnter={() => setActiveTabCategoryIndex(idx)}
                                                    onClick={() => {
                                                        setActiveTabCategoryIndex(idx);
                                                        handleCategoryClick(cat.id);
                                                        setMegaMenuOpen(false);
                                                    }}
                                                >
                                                    <span className="mega-tab-icon">{cat.icon}</span>
                                                    <span className="mega-tab-text">{cat.name}</span>
                                                    <span className="mega-tab-arrow">›</span>
                                                </button>
                                            ))}
                                            {filteredCategoryTree.length === 0 && (
                                                <div className="p-3 text-muted" style={{ fontSize: '0.8rem' }}>Sin categorías</div>
                                            )}
                                        </div>

                                        {/* Panel Derecho: Subsecciones y Familias de Productos */}
                                        <div className="mega-main-panel">
                                            {activeCat && (
                                                <div className="mega-subsections-grid">
                                                    {activeCat.sections.map((sec, sIdx) => (
                                                        <div key={sIdx} className="mega-subsection-group">
                                                            <div className="mega-subsection-title">{sec.title}</div>
                                                            {sec.items.map((item, iIdx) => (
                                                                <button
                                                                    key={iIdx}
                                                                    className="mega-sub-item-link"
                                                                    onClick={() => {
                                                                        navigate(`/tienda?syscomCategory=${activeCat.id}&search=${encodeURIComponent(item)}`);
                                                                        setMegaMenuOpen(false);
                                                                        setMobileMenuOpen(false);
                                                                    }}
                                                                >
                                                                    {item}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Buscador mobile (fila 2 en tablet) */}
                    <form className="navbar-search-form d-flex d-md-none" onSubmit={handleSearch}>
                        <BsSearch className="navbar-search-icon" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar..."
                            className="navbar-search-input"
                        />
                    </form>
                </Container>
            </div>

            {/* ═══════════ MENÚ MOBILE (Offcanvas) ═══════════ */}
            {mobileMenuOpen && (
                <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
                    <aside className="mobile-menu" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-menu-header">
                            <span className="mobile-menu-title">Menú</span>
                            <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="mobile-menu-body">
                            {/* Buscador */}
                            <form className="mobile-search-form" onSubmit={handleSearch}>
                                <BsSearch />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar producto..."
                                />
                                <button type="submit">Ir</button>
                            </form>

                            {/* Links principales */}
                            <nav className="mobile-nav">
                                <Link to="/tienda" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                                    <BsGrid3X3Gap /> Catálogo completo
                                </Link>
                                <Link to="/ofertas" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                                    <BsStars /> Súper Precio
                                </Link>
                                <Link to="/mi-cuenta" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                                    <BsPersonCircle /> Mi cuenta ({user?.name || 'Usuario'})
                                </Link>
                                <Link to="/cart" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                                    <BsCart3 /> Carrito
                                    {totalItems > 0 && <span className="mobile-cart-badge">{totalItems}</span>}
                                </Link>
                                {isAdmin() && (
                                    <Link to="/admin" className="mobile-nav-link mobile-nav-admin" onClick={() => setMobileMenuOpen(false)}>
                                        <FiSettings /> Administración
                                    </Link>
                                )}
                            </nav>

                            {/* Categorías */}
                            <div className="mobile-cats-section">
                                <div className="mobile-cats-title">CATEGORÍAS</div>
                                <div className="mobile-search-form" style={{ marginBottom: '0.5rem' }}>
                                    <BsSearch />
                                    <input
                                        type="text"
                                        value={menuQuery}
                                        onChange={(e) => setMenuQuery(e.target.value)}
                                        placeholder="Buscar categoría..."
                                    />
                                </div>
                                <div className="mobile-cats-list">
                                    {filteredCategoryTree.map((cat) => (
                                        <button
                                            key={cat.id}
                                            className={`mobile-cat-item ${currentCategory === cat.id ? 'active' : ''}`}
                                            onClick={() => handleCategoryClick(cat.id)}
                                        >
                                            <span className="me-2">{cat.icon}</span> {cat.name}
                                        </button>
                                    ))}
                                    {filteredCategoryTree.length === 0 && (
                                        <div className="mobile-cats-empty">Sin resultados.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mobile-menu-footer">
                            <button className="mobile-logout-btn" onClick={handleLogout}>
                                <FiLogOut /> Cerrar sesión
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </header>
    );
}

export default AppNavbar;