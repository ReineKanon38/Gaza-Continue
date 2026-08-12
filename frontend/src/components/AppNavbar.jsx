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

function AppNavbar() {
    const navigate = useNavigate();
    const { totalItems } = useCartHelpers();
    const { user, logout, isAdmin } = useAuth();
    const [searchParams] = useSearchParams();
    const [categories, setCategories] = useState([]);
    const [menuQuery, setMenuQuery] = useState('');
    const [megaMenuOpen, setMegaMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const megaMenuRef = useRef(null);
    const currentCategory = searchParams.get('syscomCategory');

    /* ── Logo destination ── */
    const logoTo = !user ? '/' : isAdmin() ? '/admin' : '/catalog';

    /* ── Categories ── */
    const visibleCategories = useMemo(() => {
        const normalized = String(menuQuery || '').trim().toLowerCase();
        const sorted = [...categories].sort((a, b) =>
            String(a?.name || '').localeCompare(String(b?.name || ''), 'es', { sensitivity: 'base' })
        );
        if (!normalized) return sorted;
        return sorted.filter((cat) => String(cat?.name || '').toLowerCase().includes(normalized));
    }, [categories, menuQuery]);

    const halfLen = Math.ceil(visibleCategories.length / 2);
    const leftCats = visibleCategories.slice(0, halfLen);
    const rightCats = visibleCategories.slice(halfLen);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await productService.getSyscomCategories();
                setCategories(res.categories || []);
            } catch {
                setCategories([]);
            }
        };
        load();
    }, []);

    /* ── Close mega-menu on outside click ── */
    useEffect(() => {
        const handleClick = (e) => {
            if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) {
                setMegaMenuOpen(false);
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
        if (searchTerm.trim()) {
            navigate(`/tienda?search=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
        }
    };

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
                    <form className="navbar-search-form d-none d-md-flex" onSubmit={handleSearch}>
                        <BsSearch className="navbar-search-icon" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar producto, marca o ID..."
                            className="navbar-search-input"
                        />
                        <button type="submit" className="navbar-search-btn">Buscar</button>
                    </form>

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
                            onClick={() => navigate('/profile')}
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
                        <Link to="/catalog" className={`navbar-nav-link ${!currentCategory ? 'active' : ''}`}>
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
                                    {/* Buscador interno */}
                                    <div className="mega-search-wrap">
                                        <BsSearch className="mega-search-icon" />
                                        <input
                                            type="text"
                                            value={menuQuery}
                                            onChange={(e) => setMenuQuery(e.target.value)}
                                            placeholder="Buscar categoría..."
                                            className="mega-search-input"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Grid 2 columnas */}
                                    <div className="mega-grid">
                                        <div className="mega-col">
                                            {leftCats.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    className={`mega-item ${currentCategory === cat.id ? 'active' : ''}`}
                                                    onClick={() => handleCategoryClick(cat.id)}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mega-col">
                                            {rightCats.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    className={`mega-item ${currentCategory === cat.id ? 'active' : ''}`}
                                                    onClick={() => handleCategoryClick(cat.id)}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                        {visibleCategories.length === 0 && (
                                            <div className="mega-empty">Sin resultados.</div>
                                        )}
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
                                <Link to="/catalog" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                                    <BsGrid3X3Gap /> Catálogo completo
                                </Link>
                                <Link to="/super-precio" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                                    <BsStars /> Súper Precio
                                </Link>
                                <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
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
                                    {visibleCategories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            className={`mobile-cat-item ${currentCategory === cat.id ? 'active' : ''}`}
                                            onClick={() => handleCategoryClick(cat.id)}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                    {visibleCategories.length === 0 && (
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