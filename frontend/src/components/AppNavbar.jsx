import { useEffect, useMemo, useState } from 'react';
import { Button, Navbar, Nav, Container, Image, Badge, NavDropdown } from 'react-bootstrap';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { BsPersonCircle, BsShop, BsCart, BsGrid3X3Gap, BsStars, BsSearch } from 'react-icons/bs';
// Importación de los nuevos iconos de Feather Icons
import { 
    FiArrowLeft, FiHome, FiLogOut, FiMenu, FiSettings, FiShoppingCart
} from 'react-icons/fi';
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
const currentCategory = searchParams.get('syscomCategory');

const visibleCategories = useMemo(() => {
    const normalized = String(menuQuery || '').trim().toLowerCase();

    const sorted = [...categories].sort((a, b) => {
        const levelA = Number(a?.level || 0);
        const levelB = Number(b?.level || 0);
        if (levelA !== levelB) return levelA - levelB;
        return String(a?.name || '').localeCompare(String(b?.name || ''), 'es', { sensitivity: 'base' });
    });

    if (!normalized) return sorted;

    return sorted.filter((cat) => String(cat?.name || '').toLowerCase().includes(normalized));
}, [categories, menuQuery]);

const splitIndex = Math.ceil(visibleCategories.length / 2);
const leftColumnCategories = visibleCategories.slice(0, splitIndex);
const rightColumnCategories = visibleCategories.slice(splitIndex);

useEffect(() => {
    const loadCategories = async () => {
        try {
            const response = await productService.getSyscomCategories();
            setCategories(response.categories || []);
        } catch (error) {
            console.error('No fue posible cargar categorías de SYSCOM en navbar:', error);
            setCategories([]);
        }
    };

    loadCategories();
}, []);

const handleLogout = () => {
    logout();
};

const handleCategoryClick = (categoryValue) => {
    navigate(`/catalog?syscomCategory=${categoryValue}`);
    setMenuQuery('');
};

const handleBack = () => {
    if (window.history.length > 1) {
        navigate(-1);
        return;
    }

    navigate('/catalog');
};

return (
    <Navbar expand="lg" className="navbar-custom shadow-sm" sticky="top">
    <Container fluid className="px-4">
        <Navbar.Brand 
        onClick={() => navigate('/catalog')} 
        className="d-flex align-items-center brand-hover"
        style={{ cursor: 'pointer' }}
        >
        <Image
          src={logo}
          alt="SYSCOM-GAZA Logo"
          style={{ height: '45px', marginRight: '12px' }}
          className="d-inline-block align-top logo-img"
        />
        <div className="d-flex flex-column">
            <span className="fw-bold brand-name">SYSCOM-GAZA</span>
            <small style={{ fontSize: '0.7rem', marginTop: '-4px', color: '#ffd4c4', fontWeight: '500', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                Infraestructura TI
            </small>
        </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="minimal-hamburger-toggle" aria-label="Abrir navegación">
            <FiMenu />
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav className="align-items-center gap-3">
            <div className="mobile-quick-nav d-lg-none">
                <Button variant="light" className="mobile-quick-btn" onClick={handleBack} aria-label="Regresar">
                    <FiArrowLeft />
                </Button>
                <Button variant="light" className="mobile-quick-btn" onClick={() => navigate('/catalog')} aria-label="Inicio">
                    <FiHome />
                </Button>
                <Button variant="light" className="mobile-quick-btn" onClick={() => navigate('/cart')} aria-label="Carrito">
                    <FiShoppingCart />
                    {totalItems > 0 && <span className="mobile-quick-counter">{totalItems > 99 ? '99+' : totalItems}</span>}
                </Button>
            </div>
            
            {/* Dropdown de Categorías con la nueva lista */}
            <NavDropdown 
                title={
                    <span className="d-flex align-items-center">
                        <BsGrid3X3Gap className="me-2" />
                        Categorías
                    </span>
                } 
                id="categories-dropdown"
                className="categories-dropdown"
            >
                <div className="syscom-mega-menu">
                    <div className="syscom-mega-header">
                        <div className="syscom-mega-title">Categorías de productos</div>
                        <Badge bg="info">{visibleCategories.length}</Badge>
                    </div>

                    <div className="syscom-mega-search">
                        <BsSearch />
                        <input
                            type="text"
                            value={menuQuery}
                            onChange={(e) => setMenuQuery(e.target.value)}
                            placeholder="Buscar categoría..."
                            aria-label="Buscar categoría"
                        />
                    </div>

                    <div className="syscom-mega-grid">
                        <div className="syscom-mega-column">
                            {leftColumnCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`syscom-mega-item ${currentCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => handleCategoryClick(cat.id)}
                                >
                                    <span>{cat.name}</span>
                                    <small>Nivel {cat.level || 0}</small>
                                </button>
                            ))}
                        </div>

                        <div className="syscom-mega-column">
                            {rightColumnCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`syscom-mega-item ${currentCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => handleCategoryClick(cat.id)}
                                >
                                    <span>{cat.name}</span>
                                    <small>Nivel {cat.level || 0}</small>
                                </button>
                            ))}
                        </div>
                    </div>

                    {visibleCategories.length === 0 && (
                        <div className="syscom-empty-state">No hay categorías que coincidan con la búsqueda.</div>
                    )}
                </div>
            </NavDropdown>
            
            {/* Link al catálogo */}
            <Nav.Link 
            as={Link} 
            to="/catalog" 
            className="d-flex align-items-center nav-link-custom"
            >
            <BsShop className="me-1" />
            Catálogo
            </Nav.Link>

            <Nav.Link
            as={Link}
            to="/super-precio"
            className="d-flex align-items-center nav-link-custom"
            >
            <BsStars className="me-1" />
            Super Precio
            </Nav.Link>
            
            {/* Link al carrito con badge */}
            <Nav.Link 
            as={Link} 
            to="/cart" 
            className="d-flex align-items-center position-relative nav-link-custom"
            >
            <BsCart className="me-1" style={{ fontSize: '1.3rem' }} />
            Carrito
            {totalItems > 0 && (
                <Badge 
                bg="danger" 
                pill 
                className="position-absolute cart-badge"
                >
                {totalItems > 99 ? '99+' : totalItems}
                </Badge>
            )}
            </Nav.Link>

            {/* Link al panel de admin */}
            {isAdmin() && (
                <Nav.Link 
                as={Link} 
                to="/admin" 
                className="d-flex align-items-center nav-link-custom"
                >
                <FiSettings className="me-1" style={{ fontSize: '1.3rem' }} />
                <span className="d-none d-lg-inline">Admin</span>
                </Nav.Link>
            )}
            
            {/* Link al perfil */}
            <Nav.Link 
            as={Link} 
            to="/profile" 
            className="d-flex align-items-center nav-link-custom"
            >
            <BsPersonCircle className="me-1" style={{ fontSize: '1.3rem' }} />
            <span className="d-none d-lg-inline">{user?.name || 'Usuario'}</span>
            </Nav.Link>
            
            <Button 
            onClick={handleLogout} 
            className="btn-logout d-flex align-items-center"
            >
            <FiLogOut className="me-2" />
            <span className="d-none d-lg-inline">Salir</span>
            </Button>
        </Nav>
        </Navbar.Collapse>
    </Container>
    </Navbar>
);
}

export default AppNavbar;