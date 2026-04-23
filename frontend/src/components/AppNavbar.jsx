import { useEffect, useState } from 'react';
import { Button, Navbar, Nav, Container, Image, Badge, NavDropdown } from 'react-bootstrap';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { BsPersonCircle, BsShop, BsCart, BsGrid3X3Gap, BsStars } from 'react-icons/bs';
// Importación de los nuevos iconos de Feather Icons
import { 
    FiLogOut, FiSettings
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
const currentCategory = searchParams.get('syscomCategory');

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
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav className="align-items-center gap-3">
            
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
                <NavDropdown.Item onClick={() => navigate('/catalog')}>
                    <BsShop className="me-2" />
                    Todos los Productos
                </NavDropdown.Item>
                <NavDropdown.Divider />
                {categories.map((cat) => (
                    <NavDropdown.Item 
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className={currentCategory === cat.id ? 'active' : ''}
                    >
                        {cat.name}
                    </NavDropdown.Item>
                ))}
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