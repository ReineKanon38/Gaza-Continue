import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Col, Container, Form, InputGroup, Row, Spinner, ButtonGroup, Offcanvas } from 'react-bootstrap';
import { BsFire, BsSearch, BsStars, BsTag, BsGrid3X3Gap, BsListUl, BsFilter } from 'react-icons/bs';
import AppNavbar from '../components/AppNavbar';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';
import './SuperPrecio.css';

function getNumericPrice(fields = []) {
  for (const field of fields) {
    const numeric = Number(field);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }
  }
  return 0;
}

function normalizeProduct(product) {
  const syscomId = String(product.producto_id || product.id || product.syscomId || product._id || '');
  const stock = Number(product.stock || product.existencia || 0);
  const price = getNumericPrice([
    product.precio_descuento_mxn,
    product.precios?.precio_descuento_mxn,
    product.precio_mxn,
    product.precio_descuento,
    product.precio,
    product.precios?.precio_descuento,
    product.precios?.precio_lista,
    product.precios?.precio_1,
    product.price
  ]);
  const listPrice = getNumericPrice([
    product.precio_lista_mxn,
    product.precios?.precio_lista_mxn,
    product.precio_mxn,
    product.precio,
    product.precio_lista,
    product.precios?.precio_lista,
    product.precios?.precio_1,
    product.listPrice,
    price
  ]);
  const discountPercentage = listPrice > price && price > 0
    ? Math.round(((listPrice - price) / listPrice) * 100)
    : 0;

  const categoryRaw = product.categoria || product.category || '';
  const categoriesArray = Array.isArray(product.categorias) ? product.categorias : [];
  const deepestCategory = categoriesArray.find((item) => item?.nivel === 3) || categoriesArray[categoriesArray.length - 1];
  const categoryName =
    (typeof deepestCategory === 'string' ? deepestCategory : deepestCategory?.nombre) ||
    categoryRaw ||
    'Sin categoría';

  return {
    _id: product._id || `syscom-${syscomId}`,
    syscomId,
    name: product.nombre || product.titulo || product.name || 'Producto sin nombre',
    description: product.descripcion || product.detalle || product.description || '',
    image: product.imagen || product.image || product.img_portada || '',
    price,
    listPrice,
    discountPercentage,
    stock,
    brand: product.marca || product.brand || 'Sin marca',
    categoryName,
    categoryKey: String(categoryName).toLowerCase(),
    active: stock > 0,
    isSuperPrecio: true
  };
}

function SuperPrecio() {
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // Para móviles (Offcanvas)
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 30;

  const loadProducts = useCallback(async (page, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const result = await productService.getSuperPrecioProducts({
        page,
        limit: pageSize,
        brand: brandFilter || undefined
      });

      const list = Array.isArray(result.products) ? result.products.map(normalizeProduct) : [];

      if (append) {
        setProducts((prev) => [...prev, ...list]);
      } else {
        setProducts(list);
      }
    } catch (error) {
      console.error('Error cargando Super Precio:', error);
      if (!append) {
        setProducts([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [brandFilter]);

  useEffect(() => {
    setCurrentPage(1);
    loadProducts(1, false);
  }, [brandFilter, loadProducts]);

  useEffect(() => {
    const filtered = products.filter((item) => {
      const bySearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const byPrice = !priceMax || item.price <= Number(priceMax);
      const byCategory = !categoryFilter || item.categoryKey === categoryFilter;

      return bySearch && byPrice && byCategory;
    });

    setVisibleProducts(filtered);
  }, [products, searchTerm, priceMax, categoryFilter]);

  const brands = useMemo(() => {
    const list = new Set(products.map((item) => item.brand).filter(Boolean));
    return [''].concat(Array.from(list).sort((a, b) => a.localeCompare(b, 'es')));
  }, [products]);

  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((item) => {
      if (!item.categoryName) return;
      if (!map.has(item.categoryKey)) {
        map.set(item.categoryKey, item.categoryName);
      }
    });
    return Array.from(map.entries()).map(([key, name]) => ({ key, name }));
  }, [products]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadProducts(nextPage, true);
  };

  const SidebarFilters = () => (
    <div className="super-sidebar p-4 bg-white rounded-4 shadow-sm border">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-bold">Filtros</h5>
        <Button variant="link" className="text-muted p-0 text-decoration-none" onClick={() => {
          setCategoryFilter('');
          setBrandFilter('');
          setPriceMax('');
          setSearchTerm('');
        }}>Limpiar</Button>
      </div>

      <hr />

      <h6 className="fw-bold mb-2">Categorías</h6>
      <div className="d-flex flex-column gap-1 mb-4">
        <Button
          variant="link"
          className={`text-start text-decoration-none px-2 py-1 rounded ${!categoryFilter ? 'bg-light text-primary fw-bold' : 'text-dark'}`}
          onClick={() => { setCategoryFilter(''); setShowFilters(false); }}
        >
          Todas las categorías
        </Button>
        {categories.map((category) => (
          <Button
            key={category.key}
            variant="link"
            className={`text-start text-decoration-none px-2 py-1 rounded ${categoryFilter === category.key ? 'bg-light text-primary fw-bold' : 'text-dark'}`}
            onClick={() => { setCategoryFilter(category.key); setShowFilters(false); }}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <h6 className="fw-bold mb-2">Marcas</h6>
      <Form.Select 
        value={brandFilter} 
        onChange={(event) => setBrandFilter(event.target.value)}
        className="mb-4 form-control-lg"
        style={{ fontSize: '0.9rem' }}
      >
        {brands.map((brand) => (
          <option key={brand || 'all'} value={brand}>
            {brand || 'Todas las marcas'}
          </option>
        ))}
      </Form.Select>

      <h6 className="fw-bold mb-2">Precio Máximo (MXN)</h6>
      <Form.Control
        type="number"
        placeholder="Ej: 5000"
        value={priceMax}
        onChange={(event) => setPriceMax(event.target.value)}
        className="form-control-lg"
        style={{ fontSize: '0.9rem' }}
      />
    </div>
  );

  return (
    <div className="super-page-shell">
      <AppNavbar />

      <Container fluid className="px-lg-5 py-4 mt-3">
        <div className="d-flex justify-content-between align-items-end mb-4 pb-2 border-bottom">
          <div>
            <Badge bg="primary" className="mb-2 px-3 py-2 rounded-pill"><BsTag className="me-1"/> Ofertas Oficiales</Badge>
            <h2 className="fw-bold mb-0" style={{ letterSpacing: '-0.5px' }}>Súper Precio</h2>
          </div>
          <div className="d-none d-md-flex align-items-center gap-3 text-muted small fw-semibold">
            <span><BsStars className="me-1 text-warning" /> {visibleProducts.length} productos</span>
            <span><BsFire className="me-1 text-danger" /> Página {currentPage}</span>
          </div>
        </div>

        <Row>
          <Col lg={3} className="d-none d-lg-block">
            <div className="sticky-sidebar" style={{ top: '90px', position: 'sticky' }}>
              <SidebarFilters />
            </div>
          </Col>

          <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="start">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title className="fw-bold">Filtros</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <SidebarFilters />
            </Offcanvas.Body>
          </Offcanvas>

          <Col lg={9}>
            <div className="super-topbar d-flex gap-3 mb-4 p-3 bg-white rounded-4 shadow-sm border align-items-center">
              <Button 
                variant="outline-dark" 
                className="d-lg-none d-flex align-items-center px-3"
                onClick={() => setShowFilters(true)}
              >
                <BsFilter size={20} className="me-1"/> Filtros
              </Button>

              <InputGroup className="flex-grow-1">
                <InputGroup.Text className="bg-transparent border-end-0 text-muted"><BsSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre, descripción o marca..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="border-start-0 ps-0 shadow-none"
                  style={{ background: 'transparent' }}
                />
              </InputGroup>

              <ButtonGroup className="d-none d-md-flex">
                  <Button variant={viewMode === 'grid' ? 'dark' : 'outline-dark'} onClick={() => setViewMode('grid')}><BsGrid3X3Gap /></Button>
                  <Button variant={viewMode === 'list' ? 'dark' : 'outline-dark'} onClick={() => setViewMode('list')}><BsListUl /></Button>
              </ButtonGroup>
            </div>

            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <>
                <Row xs={1} md={2} lg={viewMode === 'grid' ? 3 : 1} xl={viewMode === 'grid' ? 3 : 1} className="g-4">
                  {visibleProducts.map((item) => (
                    <Col key={item._id}>
                      <ProductCard product={item} viewMode={viewMode} />
                    </Col>
                  ))}
                </Row>

                {!visibleProducts.length && (
                  <div className="super-empty mt-4 text-center">
                    <p className="fs-5 text-muted mb-3">No hay productos que coincidan con los filtros aplicados.</p>
                    <Button variant="outline-primary" onClick={() => {
                        setSearchTerm(''); setCategoryFilter(''); setBrandFilter(''); setPriceMax('');
                    }}>Quitar todos los filtros</Button>
                  </div>
                )}

                {visibleProducts.length > 0 && (
                  <div className="text-center my-5">
                    <Button
                      variant="outline-primary"
                      size="lg"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
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
                      {isLoadingMore ? (
                        <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Cargando...</>
                      ) : 'Cargar más ofertas'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default SuperPrecio;
