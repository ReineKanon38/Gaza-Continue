import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [priceFilter, setPriceFilter] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [categories, setCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [brandFilter, setBrandFilter] = useState('');
    const [dataSource, setDataSource] = useState('syscom');
    const hasLoadedOnceRef = useRef(false);
    const productsPerPage = 20;

    const syscomCategoryFilter = searchParams.get('syscomCategory') || '';
    const urlSearchTerm = searchParams.get('search') || '';

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
    }, [syscomCategoryFilter, urlSearchTerm, brandFilter]);

    // Guardar última categoría visitada para la sección "Para Ti"
    useEffect(() => {
        if (syscomCategoryFilter) {
            localStorage.setItem('lastVisitedCategory', syscomCategoryFilter);
        }
    }, [syscomCategoryFilter]);

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
                    query: urlSearchTerm || undefined,
                    brand: brandFilter || undefined
                });

                let rawList = res.products || [];

                // Fallback a productos locales si SYSCOM no devuelve elementos en búsqueda general
                if (!rawList.length && !syscomCategoryFilter) {
                    try {
                        const localRes = await productService.getAllProducts({
                            page: currentPage,
                            limit: productsPerPage,
                            search: urlSearchTerm || undefined
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

    const loadMoreProducts = () => {
        if (hasMore && !isRefreshing) {
            setCurrentPage(prev => prev + 1);
        }
    };

    /* ── Secciones de Home ── */
    const showHomeSections = !syscomCategoryFilter && !urlSearchTerm && !brandFilter && !isInitialLoading;
    const lastVisitedCategoryId = localStorage.getItem('lastVisitedCategory') || '';
    const lastVisitedCategory = categories.find(c => c.id === lastVisitedCategoryId);

    // EN TENDENCIA: primeros 8 productos cargados
    const trendingProducts = useMemo(() => products.slice(0, 8), [products]);

    // PARA TI: productos con distributor que no estén en trending (simulado por variedad)
    const forYouProducts = useMemo(() => {
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 8);
    }, [products]);

    return (
        <div className="catalog-page-wrapper">
            <AppNavbar />
            <PromoModal />

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
                                </div>
                            </div>
                        )}

                        {/* ── CATEGORÍAS DESTACADAS (ARRIBA) ── */}
                        {showHomeSections && categories.length > 0 && (
                            <div className="home-sections-wrapper mb-4">
                                <section className="home-section">
                                    <div className="home-section-header">
                                        <span className="home-section-tag cats-tag">📂 CATEGORÍAS DESTACADAS</span>
                                    </div>
                                    <div className="home-cats-grid">
                                        {categories.slice(0, 12).map((cat) => {
                                            const CatIcon = getCategoryIcon(cat.name);
                                            return (
                                                <button
                                                    key={cat.id}
                                                    className="home-cat-card"
                                                    onClick={() => handleCategoryChange(cat.id)}
                                                >
                                                    <div className="home-cat-icon-wrap">
                                                        <CatIcon />
                                                    </div>
                                                    <span className="home-cat-name">{cat.name}</span>
                                                    <span className="home-cat-arrow">→</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            </div>
                        )}

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
                            <Col md={4}>
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
                            <Col md={4}>
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

                        {/* ════ SECCIONES HOME (Movidasa al final) ════ */}
                        {showHomeSections && (
                            <div className="home-sections-wrapper mt-5 pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>

                                {/* ── EN TENDENCIA ── */}
                                {trendingProducts.length > 0 && (
                                    <section className="home-section">
                                        <div className="home-section-header">
                                            <span className="home-section-tag trending-tag">🔥 EN TENDENCIA</span>
                                            <button
                                                className="home-section-view-all"
                                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                            >
                                                Subir al catálogo ↑
                                            </button>
                                        </div>
                                        <div className="home-products-row">
                                            {trendingProducts.map((product) => (
                                                <div 
                                                    key={product._id || product.id} 
                                                    className="home-product-mini-card"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => navigate(`/product/${product._id || product.syscomId || product.id}`)}
                                                >
                                                    <div className="home-prod-img-wrap">
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.name} className="home-prod-img" />
                                                        ) : (
                                                            <div className="home-prod-img-placeholder">📦</div>
                                                        )}
                                                    </div>
                                                    <div className="home-prod-info">
                                                        <span className="home-prod-brand">{product.distributor || 'SYSCOM'}</span>
                                                        <p className="home-prod-name">{product.name}</p>
                                                        <span className="home-prod-price">
                                                            ${(product.price || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* ── PARA TI ── */}
                                <section className="home-section">
                                    <div className="home-section-header">
                                        <span className="home-section-tag para-ti-tag">⭐ PARA TI</span>
                                        {lastVisitedCategory && (
                                            <span className="home-section-sub">
                                                Basado en: <strong>{lastVisitedCategory.name}</strong>
                                            </span>
                                        )}
                                        <button
                                            className="home-section-view-all"
                                            onClick={() => lastVisitedCategoryId
                                                ? handleCategoryChange(lastVisitedCategoryId)
                                                : handleCategoryChange('')
                                            }
                                        >
                                            Ver todo →
                                        </button>
                                    </div>
                                    <div className="home-products-row">
                                        {forYouProducts.map((product) => (
                                            <div 
                                                key={`fyi-${product._id || product.id}`} 
                                                className="home-product-mini-card"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => navigate(`/product/${product._id || product.syscomId || product.id}`)}
                                            >
                                                <div className="home-prod-img-wrap">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="home-prod-img" />
                                                    ) : (
                                                        <div className="home-prod-img-placeholder">📦</div>
                                                    )}
                                                </div>
                                                <div className="home-prod-info">
                                                    <span className="home-prod-brand">{product.distributor || 'SYSCOM'}</span>
                                                    <p className="home-prod-name">{product.name}</p>
                                                    <span className="home-prod-price">
                                                        ${(product.price || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {forYouProducts.length === 0 && (
                                            <div className="home-section-empty">
                                                Explora el catálogo para ver recomendaciones personalizadas.
                                            </div>
                                        )}
                                    </div>
                                </section>


                            </div>
                        )}
                    </>
                )}

            </Container>
        </div>
    );
}

export default Catalog;