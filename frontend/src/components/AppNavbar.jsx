import { useEffect, useMemo, useState } from 'react';
import { Button, Navbar, Nav, Container, Image, Badge, NavDropdown, Offcanvas } from 'react-bootstrap';
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
    <Navbar expand={false} className="navbar-custom shadow-sm" sticky="top">
    <Container fluid className="px-4">
        <Navbar.Brand 
        as={Link}
        to="/"
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
        
        {/* Carrito directo en la barra principal para acceso rápido */}
        <div className="d-flex align-items-center ms-auto me-3">
            <Button variant="link" onClick={() => navigate('/cart')} className="position-relative text-white p-0 nav-link-custom">
                <BsCart style={{ fontSize: '1.5rem' }} />
                {totalItems > 0 && (
                    <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.65rem' }}>
                        {totalItems > 99 ? '99+' : totalItems}
                    </Badge>
                )}
            </Button>
        </div>

        <Navbar.Toggle aria-controls="offcanvasNavbar" className="minimal-hamburger-toggle" aria-label="Abrir menú">
            <FiMenu />
        </Navbar.Toggle>
        
        <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
            className="offcanvas-custom"
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title id="offcanvasNavbarLabel" className="fw-bold">
                    Menú
                </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="d-flex flex-column">
                <Nav className="flex-column mb-auto">
                    
                    <Nav.Link as={Link} to="/profile" className="d-flex align-items-center mb-3 fs-5 nav-offcanvas-link">
                        <BsPersonCircle className="me-3" /> Perfil de {user?.name || 'Usuario'}
                    </Nav.Link>

                    {isAdmin() && (
                        <Nav.Link as={Link} to="/admin" className="d-flex align-items-center mb-3 fs-5 nav-offcanvas-link">
                            <FiSettings className="me-3" /> Administración
                        </Nav.Link>
                    )}

                    <hr />

                    <Nav.Link as={Link} to="/catalog" className="d-flex align-items-center mb-3 fs-5 nav-offcanvas-link">
                        <BsShop className="me-3" /> Catálogo Completo
                    </Nav.Link>

                    <Nav.Link as={Link} to="/super-precio" className="d-flex align-items-center mb-3 fs-5 nav-offcanvas-link">
                        <BsStars className="me-3" /> Súper Precio
                    </Nav.Link>

                    {/* Categorías integradas en el menú */}
                    <div className="mt-3">
                        <div className="fw-bold text-muted mb-2 ps-2">CATEGORÍAS</div>
                        <div className="syscom-mega-search mb-2 mx-2">
                            <BsSearch />
                            <input
                                type="text"
                                value={menuQuery}
                                onChange={(e) => setMenuQuery(e.target.value)}
                                placeholder="Buscar categoría..."
                                className="form-control"
                            />
                        </div>
                        <div style={{ maxHeight: '30vh', overflowY: 'auto' }} className="px-2">
                            {visibleCategories.map(cat => (
                                <Button 
                                    key={cat.id} 
                                    variant="link" 
                                    className={`d-block w-100 text-start text-decoration-none py-2 ${currentCategory === cat.id ? 'fw-bold text-primary' : 'text-body'}`}
                                    onClick={() => handleCategoryClick(cat.id)}
                                >
                                    {cat.name}
                                </Button>
                            ))}
                            {visibleCategories.length === 0 && <div className="text-muted small">Sin resultados.</div>}
                        </div>
                    </div>
                </Nav>

                <div className="mt-auto pt-4">
                    <Button onClick={handleLogout} variant="danger" className="w-100 d-flex align-items-center justify-content-center">
                        <FiLogOut className="me-2" /> Salir
                    </Button>
                </div>
            </Offcanvas.Body>
        </Navbar.Offcanvas>
    </Container>
    </Navbar>
);
}

export default AppNavbar;