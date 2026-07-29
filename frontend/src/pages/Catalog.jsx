import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Form, InputGroup, Spinner, Badge, Button, ButtonGroup } from 'react-bootstrap';
import AppNavbar from '../components/AppNavbar';
import ProductCard from '../components/ProductCard';
import PromoModal from '../components/PromoModal';
import { BsGrid3X3Gap, BsSearch, BsCurrencyDollar, BsListUl } from 'react-icons/bs';
import { FiActivity, FiBarChart2, FiCamera, FiCpu, FiGrid, FiLock, FiMic, FiShield, FiTool, FiZap } from 'react-icons/fi';
import productService from '../services/productService';
import './Catalog.css';

const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ' ').trim();
};

const normalizeText = (value) => removeAccents(String(value || '').toLowerCase());

const getCategoryIcon = (categoryName) => {
    const normalized = normalizeText(categoryName);

    if (/(videovigil|camara|cctv)/.test(normalized)) return FiCamera;
    if (/(red|network|it|switch|router)/.test(normalized)) return FiCpu;
    if (/(iot|gps|telemat|senaliz)/.test(normalized)) return FiActivity;
    if (/(energia|herramient|fuente|ups|bateria)/.test(normalized)) return FiZap;
    if (/(automatiz|intrusion|sensor|alarma)/.test(normalized)) return FiShield;
    if (/(acceso|biometri|cerradura)/.test(normalized)) return FiLock;
    if (/(marketing|publicidad|anuncio)/.test(normalized)) return FiBarChart2;
    if (/(cableado|infraestructura|fibra|conector)/.test(normalized)) return FiTool;
    if (/(audio|video profesional|microfono|bocina)/.test(normalized)) return FiMic;
    return FiGrid;
};

const levenshteinDistance = (a, b) => {
    const first = String(a || '');
    const second = String(b || '');

    if (!first.length) return second.length;
    if (!second.length) return first.length;

    const matrix = Array.from({ length: first.length + 1 }, () => new Array(second.length + 1).fill(0));

    for (let i = 0; i <= first.length; i += 1) matrix[i][0] = i;
    for (let j = 0; j <= second.length; j += 1) matrix[0][j] = j;

    for (let i = 1; i <= first.length; i += 1) {
        for (let j = 1; j <= second.length; j += 1) {
            const cost = first[i - 1] === second[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[first.length][second.length];
};

const getApproximateMatch = (product, term) => {
    const normalizedTerm = normalizeText(term);
    if (!normalizedTerm) {
        return { score: 1, isApprox: false };
    }

    const name = normalizeText(product?.name);
    const distributor = normalizeText(product?.distributor);
    const syscomId = normalizeText(product?.syscomId);
    const id = normalizeText(product?._id);
    const fields = [name, distributor, syscomId, id].filter(Boolean);

    if (fields.some((field) => field.includes(normalizedTerm))) {
        return { score: 1, isApprox: false };
    }

    const searchTokens = normalizedTerm.split(' ').filter(Boolean);
    let bestScore = 0;

    for (const token of searchTokens) {
        for (const field of fields) {
            const words = field.split(' ').filter(Boolean);
            for (const word of words) {
                const maxLen = Math.max(token.length, word.length);
                if (!maxLen) continue;
                const distance = levenshteinDistance(token, word);
                const similarity = 1 - (distance / maxLen);
                if (similarity > bestScore) {
                    bestScore = similarity;
                }
            }
        }
    }

    if (bestScore >= 0.7) {
        return { score: bestScore, isApprox: true };
    }

    return { score: 0, isApprox: false };
};

function Catalog() {
    const [products, setProducts] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const [priceFilter, setPriceFilter] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [categories, setCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const [dataSource, setDataSource] = useState('syscom');
    const hasLoadedOnceRef = useRef(false);
    const productsPerPage = 20;

    const syscomCategoryFilter = searchParams.get('syscomCategory') || '';

    const normalizeSyscomProduct = (product) => {
        const syscomId = String(product.producto_id || product.id || product.syscomId || product._id || '');
        const stock = Number(
            product.stock ??
            product.existencia?.nuevo ??
            product.existencia ??
            10
        );
        const listPrice = Number(
            product.price ||
            product.listPrice ||
            product.precio_lista_mxn ||
            product.precio_mxn ||
            product.precio ||
            product.precio_lista ||
            0
        );
        const promoPrice = Number(
            product.precio_descuento_mxn ||
            product.precio_descuento ||
            0
        );
        const finalPrice = promoPrice > 0 ? promoPrice : listPrice;

        return {
            _id: product._id || product.id || (syscomId ? `syscom-${syscomId}` : `item-${Date.now()}-${Math.random()}`),
            syscomId,
            name: product.name || product.titulo || product.nombre || 'Producto SYSCOM',
            description: product.description || product.descripcion || '',
            image: product.image || product.imagen || product.img_portada || '',
            distributor: product.distributor || product.marca || product.brand || product.fabricante || product.proveedor || '',
            price: finalPrice > 0 ? finalPrice : 0,
            listPrice: listPrice > 0 ? listPrice : finalPrice,
            stock: stock > 0 ? stock : 5,
            active: true
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

    // Resetear página cuando cambia búsqueda, categoría o marca
    useEffect(() => {
        setCurrentPage(1);
    }, [syscomCategoryFilter, searchTerm, brandFilter]);

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
            if (!hasLoadedOnceRef.current && currentPage === 1) {
                setIsInitialLoading(true);
            } else {
                setIsRefreshing(true);
            }

            try {
                let res = await productService.searchSyscomProducts({
                    page: currentPage,
                    limit: productsPerPage,
                    category: syscomCategoryFilter || undefined,
                    query: debouncedSearchTerm || undefined,
                    brand: brandFilter || undefined
                });

                let rawList = res.products || [];

                // Fallback a productos locales si SYSCOM no devuelve elementos en búsqueda general
                if (!rawList.length && !syscomCategoryFilter) {
                    try {
                        const localRes = await productService.getAllProducts({
                            page: currentPage,
                            limit: productsPerPage,
                            search: debouncedSearchTerm || undefined
                        });
                        if (localRes.products && localRes.products.length > 0) {
                            rawList = localRes.products;
                            res.total = localRes.total || localRes.products.length;
                            res.source = 'database';
                        }
                    } catch (fallbackErr) {
                        console.warn('Fallback a productos locales falló:', fallbackErr);
                    }
                }

                const list = rawList.map((item) => normalizeSyscomProduct(item));

                if (currentPage === 1) {
                    setProducts(list);
                } else {
                    setProducts((prev) => {
                        const existingIds = new Set(prev.map((item) => item._id));
                        const uniqueItems = list.filter((item) => !existingIds.has(item._id));
                        return [...prev, ...uniqueItems];
                    });
                }

                const total = res.total || list.length || 0;
                setTotalProducts(total);
                setDataSource(res.source || 'syscom');
                setHasMore(Boolean(res.pagination?.hasNextPage) || (list.length === productsPerPage));
            } catch (error) {
                console.error("Error cargando productos:", error);
                if (currentPage === 1) {
                    setProducts([]);
                    setTotalProducts(0);
                }
            } finally {
                setIsInitialLoading(false);
                setIsRefreshing(false);
                hasLoadedOnceRef.current = true;
            }
        };
        loadProducts();
    }, [syscomCategoryFilter, currentPage, debouncedSearchTerm]);

    const searchRankedProducts = useMemo(() => {
        const normalizedTerm = normalizeText(debouncedSearchTerm);
        if (!normalizedTerm) {
            return products.map((product) => ({
                ...product,
                _matchScore: 1,
                _approxMatch: false
            }));
        }

        return products
            .map((product) => {
                const match = getApproximateMatch(product, normalizedTerm);
                return {
                    ...product,
                    _matchScore: match.score,
                    _approxMatch: match.isApprox
                };
            })
            .filter((product) => product._matchScore > 0)
            .sort((a, b) => b._matchScore - a._matchScore);
    }, [products, debouncedSearchTerm]);

    // Filtrar por precio localmente (filtro adicional)
    const displayedProducts = useMemo(() => {
        if (!priceFilter) {
            return searchRankedProducts;
        }

        const maxPrice = parseFloat(priceFilter);
        if (Number.isNaN(maxPrice)) {
            return searchRankedProducts;
        }

        return searchRankedProducts.filter((p) => p.price <= maxPrice);
    }, [searchRankedProducts, priceFilter]);

    const suggestions = useMemo(() => {
        const cleanTerm = String(searchTerm || '').trim().toLowerCase();
        if (!cleanTerm) return [];

        return products
            .filter((p) => {
                const name = String(p.name || '').toLowerCase();
                const brand = String(p.distributor || '').toLowerCase();
                const syscomId = String(p.syscomId || '').toLowerCase();
                return name.includes(cleanTerm) || brand.includes(cleanTerm) || syscomId.includes(cleanTerm);
            })
            .slice(0, 6);
    }, [products, searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadMoreProducts = () => {
        if (hasMore && !isRefreshing) {
            setCurrentPage(prev => prev + 1);
        }
    };

    return (
        <div className="catalog-page-wrapper">
            <AppNavbar />
            <PromoModal />

            <div className="promo-banner-container">
                <div className="promo-banner-wrapper">
                    <div className="banner-bg-static"></div>
                    <div className="banner-overlay-tech"></div>
                    <div className="banner-content-premium">
                        <h1 className="main-headline">
                            <span className="text-cyan-bright">
                                Infraestructura Tecnológica <br /> de Alto Nivel
                            </span>
                        </h1>
                        <p className="lead">Líderes en distribución de tecnología y seguridad electrónica.</p>
                        <Button className="explore-btn">EXPLORAR CATÁLOGO</Button>
                    </div>
                </div>
            </div>

            <Container fluid className="px-4 pb-4">
                {isInitialLoading ? (
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
                                    <h2 style={{ color: '#00d4ff', textShadow: '0 0 20px rgba(0, 212, 255, 0.5)' }}>{getCurrentCategoryInfo().name}</h2>
                                    <p className="catalog-status-text" style={{ color: 'rgba(255,255,255,0.95)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
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
                                <div className="cat-icon-box"><FiGrid /></div>
                                <span>Todos</span>
                            </div>

                            {!isLoadingCategories && categories.map((cat) => {
                                const CategoryIcon = getCategoryIcon(cat.name);
                                return (
                                    <div
                                        key={cat.id}
                                        className={`category-glass-card ${syscomCategoryFilter === cat.id ? 'active' : ''}`}
                                        onClick={() => handleCategoryChange(cat.id)}
                                    >
                                        <div className="cat-icon-box">
                                            <CategoryIcon aria-hidden="true" />
                                        </div>
                                        <span>{cat.name}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <Row className="mb-4 g-3 align-items-center filter-row-custom shadow-sm p-3 mx-0">
                            <Col md={12} className="d-flex justify-content-end align-items-center">
                                {dataSource === 'cache' || dataSource === 'stale-cache' ? (
                                    <Badge bg="info" className="me-2 text-dark">
                                        ⚡ Caché Optimizada
                                    </Badge>
                                ) : null}
                                <Badge bg="success">Precios en MXN</Badge>
                                {isRefreshing && <Badge bg="secondary" className="ms-2">Actualizando...</Badge>}
                            </Col>
                            <Col md={5}>
                                <div className="search-container-relative" ref={searchRef}>
                                    <InputGroup className="search-group-modern">
                                        <InputGroup.Text className="bg-transparent border-0"><BsSearch /></InputGroup.Text>
                                        <Form.Control
                                            className="bg-transparent border-0 shadow-none"
                                            placeholder="Buscar por producto, marca o ID..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setShowSuggestions(true);
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                        />
                                    </InputGroup>

                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="search-suggestions-dropdown">
                                            {suggestions.map((item) => (
                                                <div
                                                    key={item._id}
                                                    className="suggestion-item"
                                                    onClick={() => {
                                                        setSearchTerm(item.name);
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    <span className="suggestion-name">{item.name}</span>
                                                    <div className="suggestion-meta">
                                                        <span className="suggestion-brand">{item.distributor}</span>
                                                        <span className="suggestion-id">ID: {item.syscomId}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col md={2}>
                                <Form.Select
                                    className="bg-transparent border-0 shadow-none search-group-modern text-muted"
                                    value={brandFilter}
                                    onChange={(e) => setBrandFilter(e.target.value)}
                                >
                                    <option value="">Todas las Marcas</option>
                                    <option value="HIKVISION">HIKVISION</option>
                                    <option value="DAHUA">DAHUA</option>
                                    <option value="EPCOM">EPCOM</option>
                                    <option value="UBIQUITI">UBIQUITI</option>
                                    <option value="TP-LINK">TP-LINK</option>
                                    <option value="SAXXON">SAXXON</option>
                                    <option value="ZKTECO">ZKTECO</option>
                                    <option value="SYSCOM">SYSCOM</option>
                                </Form.Select>
                            </Col>
                            <Col md={2}>
                                <InputGroup className="search-group-modern">
                                    <InputGroup.Text className="bg-transparent border-0"><BsCurrencyDollar /></InputGroup.Text>
                                    <Form.Control
                                        className="bg-transparent border-0 shadow-none"
                                        type="number"
                                        placeholder="Precio Máximo"
                                        value={priceFilter}
                                        onChange={(e) => setPriceFilter(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={3} className="d-flex justify-content-end">
                                <ButtonGroup>
                                    <Button variant={viewMode === 'grid' ? 'dark' : 'outline-dark'} onClick={() => setViewMode('grid')}><BsGrid3X3Gap /></Button>
                                    <Button variant={viewMode === 'list' ? 'dark' : 'outline-dark'} onClick={() => setViewMode('list')}><BsListUl /></Button>
                                </ButtonGroup>
                            </Col>
                        </Row>

                        <Row xs={1} md={2} lg={viewMode === 'grid' ? 4 : 2} xl={viewMode === 'grid' ? 5 : 2} className="g-4">
                            {displayedProducts.map((product) => (
                                <Col key={product.id || product._id}>
                                    <ProductCard
                                        product={product}
                                        viewMode={viewMode}
                                        matchMeta={{
                                            isApprox: product._approxMatch,
                                            score: product._matchScore
                                        }}
                                    />
                                </Col>
                            ))}
                        </Row>

                        {/* Botón Cargar Más */}
                        {hasMore && !isRefreshing && (
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
                        {isRefreshing && currentPage > 1 && (
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