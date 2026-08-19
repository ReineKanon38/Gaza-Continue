import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Spinner, Alert, Card } from 'react-bootstrap';
import { BsArrowLeft, BsCartPlusFill, BsCheckLg, BsFileEarmarkArrowDown, BsGrid, BsFileText, BsPlayCircle, BsMegaphone } from 'react-icons/bs';
import { useCartHelpers } from '../hooks/useCartHooks';
import productService from '../services/productService';
import { generateProductBenefits, extractTechnicalBenefits } from '../utils/productBenefits';
import { getRelatedProducts } from '../utils/complementaryProducts';
import ProductCard from '../components/ProductCard';
import AppNavbar from '../components/AppNavbar';

function ProductDetailPage() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCartHelpers();

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState('');
  const [complementaryProducts, setComplementaryProducts] = useState([]);
  const [loadingComplementary, setLoadingComplementary] = useState(false);
  const [activeTab, setActiveTab] = useState('complementary');

  useEffect(() => {
    if (!product && productId) {
      const fetchProduct = async () => {
        setLoading(true);
        setError('');
        try {
          const fetched = await productService.getProductById(productId);
          setProduct(fetched);
        } catch (err) {
          setError(err.message || 'No se pudo cargar el producto.');
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [product, productId]);

  // Cargar productos complementarios cuando el producto principal esté disponible
  useEffect(() => {
    if (product) {
      const loadComplementary = async () => {
        setLoadingComplementary(true);
        try {
          const result = await productService.getAllProducts({ limit: 50 });
          const allProducts = result.products || result.data || [];
          const related = getRelatedProducts(product, allProducts, 3);
          setComplementaryProducts(related);
        } catch (err) {
          console.error('Error loading complementary products:', err);
        } finally {
          setLoadingComplementary(false);
        }
      };

      loadComplementary();
    }
  }, [product]);

  const productName = product?.titulo || product?.nombre || product?.name || product?.title || 'Producto';
  const productDescription = product?.descripcion || product?.description || product?.detalle || '';
  const productImage = product?.imagen || product?.image || product?.img_portada || product?.picture || product?.foto || '';

  const safePrice = Number(product?.precio_mxn || product?.precio_descuento_mxn || product?.price || product?.precio || product?.precio_lista || 0);
  const stock = Number(product?.stock || product?.existencia || product?.cantidad || 0);
  const isOutOfStock = stock <= 0;
  const brand = product?.marca || product?.brand || product?.fabricante || '';
  const model = product?.modelo || product?.model || product?.modelos || '';
  const code = product?.codigo || product?.code || product?._id || product?.syscomId || '';
  const additionalDescription = product?.descripcion_larga || product?.longDescription || product?.details || '';
  const productBenefits = generateProductBenefits(product);
  const technicalBenefits = extractTechnicalBenefits(productDescription + ' ' + additionalDescription);
  const generalDescriptionSource = productDescription || additionalDescription;
  const descriptionHighlights = generalDescriptionSource
    ? generalDescriptionSource
        .split(/[\r\n.]+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
      </Container>
    );
  }

  return (
    <div className="bg-page-content min-vh-100">
      <AppNavbar />
      <Container className="py-4 fade-in-up">
        <Button variant="outline-secondary" onClick={() => navigate(-1)} className="mb-4">
        <BsArrowLeft className="me-2" /> Volver al catálogo
      </Button>

      <Row className="gx-4 gy-4">
        <Col md={5}>
          <Card className="shadow-sm border-0">
            {productImage ? (
              <Card.Img
                variant="top"
                src={productImage}
                alt={productName}
                style={{ objectFit: 'cover', maxHeight: '520px' }}
              />
            ) : (
              <div style={{
                minHeight: '420px',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                fontSize: '1.5rem'
              }}>
                Imagen no disponible
              </div>
            )}
          </Card>
        </Col>

        <Col md={7}>
          <div className="d-flex align-items-start gap-3 mb-3 flex-wrap">
            <h1 className="h3 mb-0" style={{ lineHeight: '1.2' }}>{productName}</h1>
            <Badge bg={isOutOfStock ? 'secondary' : 'success'} style={{ fontSize: '0.9rem' }}>
              {isOutOfStock ? 'Sin stock' : 'Disponible'}
            </Badge>
          </div>

          <div className="mb-4">
            <div className="d-flex flex-wrap align-items-center gap-3">
              <div>
                <div className="text-muted small">Precio</div>
                <div className="fs-3 fw-bold">${safePrice.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN</div>
              </div>
              <div>
                <div className="text-muted small">Stock</div>
                <div>{stock > 0 ? stock : 'Sin stock'}</div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="h6 text-uppercase text-muted mb-2">Descripción</h2>
            {descriptionHighlights.length > 0 ? (
              <ul className="list-unstyled mb-0" style={{ color: '#334155', lineHeight: '1.8' }}>
                {descriptionHighlights.map((item, index) => (
                  <li key={index} className="d-flex align-items-start mb-2">
                    <BsCheckLg className="text-success me-2 mt-1" style={{ fontSize: '1.2rem', flexShrink: 0 }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: '#334155' }}>
                {productDescription || 'Este producto está diseñado para ofrecer calidad, durabilidad y compatibilidad con las necesidades de su proyecto.'}
              </p>
            )}
          </div>

          {productBenefits.length > 0 && (
            <div className="mb-4">
              <h2 className="h5 text-primary mb-3">
                <i className="bi bi-check-circle-fill me-2"></i>
                Beneficios principales
              </h2>
              <div className="row g-2">
                {productBenefits.map((benefit, index) => (
                  <div key={index} className="col-md-6">
                    <div className="d-flex align-items-center p-2 bg-light rounded">
                      <i className="bi bi-star-fill text-warning me-2"></i>
                      <span className="small fw-medium" style={{ color: '#334155' }}>{benefit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {technicalBenefits.length > 0 && (
            <div className="mb-4">
              <h2 className="h6 text-uppercase text-muted mb-2">Características técnicas destacadas</h2>
              <div className="d-flex flex-wrap gap-2">
                {technicalBenefits.map((benefit, index) => (
                  <Badge key={index} bg="info" text="dark" className="px-3 py-2">
                    <i className="bi bi-gear-fill me-1"></i>
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {additionalDescription && (
            <div className="mb-4">
              <h2 className="h6 text-uppercase text-muted mb-2">Información complementaria</h2>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: '#1d4ed8' }}>
                {additionalDescription}
              </p>
            </div>
          )}

          {descriptionHighlights.length > 0 && (
            <div className="mb-4">
              <h2 className="h6 text-uppercase text-muted mb-2">Puntos clave</h2>
              <ul className="mb-0" style={{ color: '#1d4ed8', paddingLeft: '1.25rem' }}>
                {descriptionHighlights.map((item, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4">
            <Row className="gy-3">
              {code && (
                <Col xs={12} sm={6}>
                  <div className="text-muted small">Código</div>
                  <div>{code}</div>
                </Col>
              )}
              {brand && (
                <Col xs={12} sm={6}>
                  <div className="text-muted small">Marca</div>
                  <div>{brand}</div>
                </Col>
              )}
              {model && (
                <Col xs={12} sm={6}>
                  <div className="text-muted small">Modelo</div>
                  <div>{model}</div>
                </Col>
              )}
            </Row>
          </div>

          <div className="d-flex flex-wrap gap-3 mb-3">
            <Button
              onClick={() => addToCart(product, 1)}
              disabled={!product.active || isOutOfStock}
              className="btn-custom-primary d-flex align-items-center gap-2"
              style={{ padding: '0.85rem 1rem', fontSize: '0.95rem', fontWeight: 600 }}
            >
              <BsCartPlusFill style={{ fontSize: '1rem' }} />
              {isOutOfStock
                ? 'No disponible'
                : isInCart(product._id)
                  ? `En carrito (${getItemQuantity(product._id)})`
                  : 'Agregar al carrito'}
            </Button>

            <Button
              onClick={() => {
                addToCart(product, 1);
                navigate('/checkout');
              }}
              disabled={!product.active || isOutOfStock}
              variant="success"
              style={{ padding: '0.85rem 1rem', fontSize: '0.95rem', fontWeight: 600, minWidth: '160px' }}
            >
              Comprar ahora
            </Button>

            <Button
              onClick={() => navigate('/cart')}
              variant="outline-secondary"
              style={{ padding: '0.85rem 1rem', fontSize: '0.95rem', fontWeight: 600, minWidth: '140px' }}
            >
              Ir al carrito
            </Button>
          </div>

          <div className="mt-5 pt-4">
            <div className="d-flex flex-wrap gap-2 mb-4" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                {[
                    { id: 'complementary', label: 'Equipos Complementarios', icon: <BsGrid className="me-2" /> },
                ].map(tab => (
                    <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "primary" : "outline-secondary"}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}
                    >
                        {tab.icon} {tab.label}
                    </Button>
                ))}
            </div>

            <div className="tab-content">
                {activeTab === 'complementary' && (
                    <div>
                        {loadingComplementary ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" variant="primary" size="sm" />
                            </div>
                        ) : complementaryProducts.length > 0 ? (
                            <Row className="gy-3">
                                {complementaryProducts.slice(0, 3).map((comp) => (
                                    <Col key={comp._id || comp.syscomId || Math.random()} md={6} lg={4}>
                                        <ProductCard product={comp} />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <p className="text-muted">No hay equipos complementarios disponibles.</p>
                        )}
                    </div>
                )}

                {activeTab !== 'complementary' && (
                    <div className="text-center py-5 bg-light rounded" style={{ color: '#64748b' }}>
                        <p className="mb-0">Contenido no disponible por el momento.</p>
                    </div>
                )}
            </div>
          </div>
        </Col>
      </Row>
      </Container>
    </div>
  );
}

export default ProductDetailPage;
