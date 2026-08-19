import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Col, Container, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import { BsFire, BsSearch, BsStars, BsTag } from 'react-icons/bs';
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

  return (
    <div className="super-page-shell">
      <AppNavbar />

      <section className="super-hero">
        <Container>
          <div className="super-hero-content">
            <Badge className="super-tag">
              <BsTag className="me-2" /> Oferta oficial
            </Badge>
            <h1>Super Precio</h1>
            <p>
              Catálogo estratégico para productos con alta rotación y mejor percepción de valor.
              Usa filtros para construir tus ofertas y agrega al carrito desde esta vista.
            </p>
            <div className="super-kpis">
              <span><BsStars className="me-1" /> Productos visibles: {visibleProducts.length}</span>
              <span><BsFire className="me-1" /> Página actual: {currentPage}</span>
              <span><Badge bg="success">Precios en MXN</Badge></span>
            </div>
          </div>
        </Container>
      </section>

      <Container fluid className="px-4 py-4">
        <Row className="mb-3">
          <Col>
            <div className="d-flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={!categoryFilter ? 'dark' : 'outline-dark'}
                onClick={() => setCategoryFilter('')}
              >
                Todas las categorías
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.key}
                  size="sm"
                  variant={categoryFilter === category.key ? 'dark' : 'outline-dark'}
                  onClick={() => setCategoryFilter(category.key)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </Col>
        </Row>

        <Row className="g-3 super-filters align-items-center mb-4">
          <Col lg={5}>
            <InputGroup>
              <InputGroup.Text><BsSearch /></InputGroup.Text>
              <Form.Control
                placeholder="Buscar por nombre, descripción o marca"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </InputGroup>
          </Col>

          <Col lg={3}>
            <Form.Select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}>
              {brands.map((brand) => (
                <option key={brand || 'all'} value={brand}>
                  {brand || 'Todas las marcas'}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col lg={2}>
            <Form.Control
              type="number"
              placeholder="Precio máximo"
              value={priceMax}
              onChange={(event) => setPriceMax(event.target.value)}
            />
          </Col>

          <Col lg={2}>
            <Button
              variant="outline-secondary"
              className="w-100"
              onClick={() => {
                setSearchTerm('');
                setPriceMax('');
                setBrandFilter('');
                setCategoryFilter('');
              }}
            >
              Limpiar
            </Button>
          </Col>
        </Row>

        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <Row xs={1} md={2} lg={4} xl={5} className="g-4">
              {visibleProducts.map((product) => (
                <Col key={product._id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>

            {!visibleProducts.length && (
              <div className="super-empty mt-4">
                <p>No hay productos que coincidan con los filtros aplicados.</p>
              </div>
            )}

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
                {isLoadingMore ? 'Cargando...' : 'Cargar más Super Precio'}
              </Button>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

export default SuperPrecio;
