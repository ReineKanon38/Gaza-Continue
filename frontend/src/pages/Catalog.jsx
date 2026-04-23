import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Form, InputGroup, Spinner, Badge, Button, ButtonGroup } from 'react-bootstrap';
import AppNavbar from '../components/AppNavbar';
import ProductCard from '../components/ProductCard';
import { BsGrid3X3Gap, BsSearch, BsCurrencyDollar, BsListUl } from 'react-icons/bs';
import productService from '../services/productService';
import './Catalog.css';

function Catalog() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceFilter, setPriceFilter] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [categories, setCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const productsPerPage = 20;

    const syscomCategoryFilter = searchParams.get('syscomCategory') || '';

    const normalizeSyscomProduct = (product) => {
        const syscomId = String(product.producto_id || product.id || product.syscomId || product._id || '');
        const stock = Number(product.stock || product.existencia?.nuevo || product.existencia || 0);
        const promoPrice = Number(
            product.precio_descuento_mxn ||
            product.precios?.precio_descuento_mxn ||
            product.precio_descuento ||
            product.precios?.precio_descuento ||
            0
        );
        const listPrice = Number(
            product.precio_lista_mxn ||
            product.precios?.precio_lista_mxn ||
            product.precio_mxn ||
            product.precio ||
            product.precio_lista ||
            product.precios?.precio_lista ||
            product.price ||
            0
        );
        const finalPrice = promoPrice > 0 ? promoPrice : listPrice;

        return {
            _id: product._id || `syscom-${syscomId}`,
            syscomId,
            name: product.titulo || product.nombre || product.name || 'Producto SYSCOM',
            description: product.descripcion || product.description || '',
            image: product.imagen || product.image || product.img_portada || '',
            price: finalPrice,
            listPrice,
            stock,
            active: stock > 0
        };
    };

    const handleCategoryChange = (value) => {
        if (value) {
            setSearchParams({ syscomCategory: value });
        } else {
            setSearchParams({});
        }
        setCurrentPage(1); // Resetear a página 1 al cambiar categoría
    };

    const getCurrentCategoryInfo = () => {
        return categories.find(c => c.id === syscomCategoryFilter);
    };

    // Resetear página cuando cambia búsqueda o categoría
    useEffect(() => {
        setCurrentPage(1);
    }, [syscomCategoryFilter, searchTerm]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        const loadCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const response = await productService.getSyscomCategories();
                setCategories(response.categories || []);
            } catch (error) {
                console.error('Error cargando categorias SYSCOM:', error);
                setCategories([]);
            } finally {
                setIsLoadingCategories(false);
            }
        };

        loadCategories();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true);
            try {
                const res = await productService.searchSyscomProducts({
                    page: currentPage,
                    limit: productsPerPage,
                    category: syscomCategoryFilter || undefined,
                    query: debouncedSearchTerm || undefined
                });

                const list = (res.products || []).map((item) => normalizeSyscomProduct(item));
                
                if (currentPage === 1) {
                    setProducts(list);
                } else {
                    setProducts(prev => [...prev, ...list]);
                }
                
                const total = res.total || 0;
                setTotalProducts(total);
                setHasMore(Boolean(res.pagination?.hasNextPage) || (list.length === productsPerPage));
            } catch (error) {
                console.error("Error cargando productos:", error);
                if (currentPage === 1) {
                    setProducts([]);
                    setTotalProducts(0);
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadProducts();
    }, [syscomCategoryFilter, currentPage, debouncedSearchTerm]);

    // Filtrar por precio localmente (filtro adicional)
    const displayedProducts = priceFilter 
        ? products.filter(p => p.price <= parseFloat(priceFilter))
        : products;

    const loadMoreProducts = () => {
        if (hasMore && !isLoading) {
            setCurrentPage(prev => prev + 1);
        }
    };

    return (
        <div className="catalog-page-wrapper">
            <AppNavbar />

            <div className="promo-banner-container">
                <div className="promo-banner-wrapper">
                    <div className="banner-bg-static"></div>
                    <div className="banner-overlay-tech"></div>
                    <div className="banner-content-premium">
                        <h1 className="main-headline">
                            <span className="text-cyan-bright">
                                Infraestructura Tecnológica <br/> de Alto Nivel
                            </span>
                        </h1>
                        <p className="lead">Líderes en distribución de tecnología y seguridad electrónica.</p>
                        <Button className="explore-btn">EXPLORAR CATÁLOGO</Button>
                    </div>
                </div>
            </div>

            <Container fluid className="px-4 pb-4">
                {isLoading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="info" /></div>
                ) : (
                    <>
                        {syscomCategoryFilter && getCurrentCategoryInfo() && (
                            <div 
                                className="premium-page-header"
                                style={{
                                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.75))',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    minHeight: '250px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div>
                                    <Badge className="badge-premium-tag">PRODUCTOS PREMIUM</Badge>
                                    <h2 style={{color: '#00d4ff', textShadow: '0 0 20px rgba(0, 212, 255, 0.5)'}}>{getCurrentCategoryInfo().name}</h2>
                                    <p className="catalog-status-text" style={{color: 'rgba(255,255,255,0.95)', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                                        <span>CATÁLOGO</span> {totalProducts} productos disponibles. Mostrando {displayedProducts.length} de {totalProducts}.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="category-scroll-wrapper">
                            <div 
                                className={`category-glass-card ${!syscomCategoryFilter ? 'active' : ''}`} 
                                onClick={() => handleCategoryChange('')}
                            >
                                <div className="cat-icon-box"><BsGrid3X3Gap /></div>
                                <span>Todos</span>
                            </div>

                            {!isLoadingCategories && categories.map((cat) => (
                              <div
                                key={cat.id}
                                className={`category-glass-card ${syscomCategoryFilter === cat.id ? 'active' : ''}`}
                                onClick={() => handleCategoryChange(cat.id)}
                              >
                                <div className="cat-icon-box">#{cat.level || '-'}</div>
                                <span>{cat.name}</span>
                              </div>
                            ))}
                        </div>
                        
                        <Row className="mb-4 g-3 align-items-center filter-row-custom shadow-sm p-3 mx-0">
                            <Col md={12} className="d-flex justify-content-end">
                                <Badge bg="success">Precios en MXN</Badge>
                            </Col>
                            <Col md={5}>
                                <InputGroup className="search-group-modern">
                                    <InputGroup.Text className="bg-transparent border-0"><BsSearch/></InputGroup.Text>
                                    <Form.Control 
                                        className="bg-transparent border-0 shadow-none" 
                                        placeholder="Buscar..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={3}>
                                <InputGroup className="search-group-modern">
                                    <InputGroup.Text className="bg-transparent border-0"><BsCurrencyDollar/></InputGroup.Text>
                                    <Form.Control 
                                        className="bg-transparent border-0 shadow-none" 
                                        type="number" 
                                        placeholder="Precio Máximo" 
                                        value={priceFilter} 
                                        onChange={(e) => setPriceFilter(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={4} className="d-flex justify-content-end">
                                <ButtonGroup>
                                    <Button variant={viewMode === 'grid' ? 'dark' : 'outline-dark'} onClick={() => setViewMode('grid')}><BsGrid3X3Gap /></Button>
                                    <Button variant={viewMode === 'list' ? 'dark' : 'outline-dark'} onClick={() => setViewMode('list')}><BsListUl /></Button>
                                </ButtonGroup>
                            </Col>
                        </Row>
                        
                        <Row xs={1} md={2} lg={viewMode === 'grid' ? 4 : 2} xl={viewMode === 'grid' ? 5 : 2} className="g-4">
                            {displayedProducts.map((product) => (
                                <Col key={product.id || product._id}>
                                    <ProductCard product={product} viewMode={viewMode} />
                                </Col>
                            ))}
                        </Row>

                        {/* Botón Cargar Más */}
                        {hasMore && !isLoading && (
                            <div className="text-center my-5">
                                <Button 
                                    variant="outline-primary" 
                                    size="lg"
                                    onClick={loadMoreProducts}
                                    style={{
                                        padding: '12px 40px',
                                        borderRadius: '25px',
                                        fontWeight: '600',
                                        border: '2px solid #00d4ff',
                                        color: '#00d4ff',
                                        background: 'transparent',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = '#00d4ff';
                                        e.target.style.color = '#000';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'transparent';
                                        e.target.style.color = '#00d4ff';
                                    }}
                                >
                                    Cargar Más Productos ({totalProducts - displayedProducts.length} restantes)
                                </Button>
                            </div>
                        )}

                        {/* Indicador de carga al cargar más */}
                        {isLoading && currentPage > 1 && (
                            <div className="text-center my-4">
                                <Spinner animation="border" variant="info" />
                                <p className="text-muted mt-2">Cargando más productos...</p>
                            </div>
                        )}
                    </>
                )}
            </Container>
        </div>
    );
}

export default Catalog;