import { useState } from 'react';
import { Modal, Button, Badge, Row, Col, Tab, Tabs } from 'react-bootstrap';
import { BsCartPlusFill, BsBoxSeam, BsTagFill, BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';
import { useCartHelpers } from '../hooks/useCartHooks';

function ProductDetailModal({ show, onHide, product }) {
  const { addToCart, isInCart, getItemQuantity } = useCartHelpers();
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const price = Number(product.price || 0);
  const listPrice = Number(product.listPrice || 0);
  const hasPromo = listPrice > price && price > 0;
  const stock = Number(product.stock || 0);
  const isOutOfStock = stock <= 0;
  const hasLowStock = stock > 0 && stock <= 5;
  const discount = hasPromo ? Math.round((1 - price / listPrice) * 100) : 0;

  const handleAddToCart = () => {
    addToCart(product, qty);
    onHide();
  };

  const specs = product.specs || product.attributes || {};
  const specEntries = Object.entries(specs).filter(([, v]) => v !== null && v !== undefined && v !== '');

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold fs-5">{product.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <Row className="g-4">
          {/* Imagen */}
          <Col md={5}>
            <div style={{ background: '#f8f9fa', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }}
                />
              ) : (
                <div style={{ fontSize: '5rem', color: '#adb5bd' }}>📦</div>
              )}
            </div>
            {/* Badges bajo imagen */}
            <div className="d-flex gap-2 flex-wrap mt-3">
              {product.isSuperPrecio && (
                <Badge bg="danger" className="d-flex align-items-center gap-1 px-2 py-2">
                  <BsTagFill /> Super Precio
                </Badge>
              )}
              {hasLowStock && <Badge bg="warning" text="dark" className="px-2 py-2">Últimas {stock} piezas</Badge>}
              {isOutOfStock
                ? <Badge bg="secondary" className="d-flex align-items-center gap-1 px-2 py-2"><BsXCircleFill /> Sin stock</Badge>
                : <Badge bg="success" className="d-flex align-items-center gap-1 px-2 py-2"><BsCheckCircleFill /> Disponible</Badge>
              }
            </div>
          </Col>

          {/* Info */}
          <Col md={7}>
            {/* Precio */}
            <div className="mb-3">
              {hasPromo && (
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="text-muted text-decoration-line-through fs-6">
                    ${listPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                  <Badge bg="danger">-{discount}%</Badge>
                </div>
              )}
              <div className="fw-bold" style={{ fontSize: '2rem', color: 'var(--primary-color, #0d6efd)' }}>
                ${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </div>
              {hasPromo && (
                <div className="text-success small">
                  Ahorras ${(listPrice - price).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </div>
              )}
            </div>

            {/* Tabs: Descripción / Especificaciones */}
            <Tabs defaultActiveKey="desc" className="mb-3" variant="underline">
              <Tab eventKey="desc" title="Descripción">
                <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {product.description || 'Sin descripción disponible para este producto.'}
                </p>
              </Tab>
              {specEntries.length > 0 && (
                <Tab eventKey="specs" title="Especificaciones">
                  <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    <table className="table table-sm table-striped mb-0" style={{ fontSize: '0.875rem' }}>
                      <tbody>
                        {specEntries.map(([key, val]) => (
                          <tr key={key}>
                            <td className="fw-semibold text-nowrap pe-3" style={{ width: '40%' }}>{key}</td>
                            <td>{String(val)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Tab>
              )}
              <Tab eventKey="info" title="Información">
                <table className="table table-sm mb-0" style={{ fontSize: '0.875rem' }}>
                  <tbody>
                    <tr><td className="fw-semibold" style={{ width: '40%' }}>ID / SKU</td><td>{product.syscomId || product._id?.slice(-8) || 'N/D'}</td></tr>
                    <tr><td className="fw-semibold">Categoría</td><td>{product.category || 'General'}</td></tr>
                    <tr><td className="fw-semibold">Proveedor</td><td>SYSCOM</td></tr>
                    <tr><td className="fw-semibold">Comercializa</td><td><Badge bg="dark">GAZA</Badge></td></tr>
                    <tr><td className="fw-semibold">Stock</td><td>{isOutOfStock ? 'Sin stock' : `${stock} unidades`}</td></tr>
                  </tbody>
                </table>
              </Tab>
            </Tabs>

            {/* Selector de cantidad + agregar */}
            {!isOutOfStock && (
              <div className="d-flex align-items-center gap-3 mt-3">
                <div className="d-flex align-items-center border rounded" style={{ overflow: 'hidden' }}>
                  <button
                    className="btn btn-light border-0 px-3 py-2"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                  >−</button>
                  <span className="px-3 fw-bold">{qty}</span>
                  <button
                    className="btn btn-light border-0 px-3 py-2"
                    onClick={() => setQty(q => Math.min(stock, q + 1))}
                    disabled={qty >= stock}
                  >+</button>
                </div>
                <Button
                  className="btn-custom-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleAddToCart}
                  style={{ padding: '0.65rem 1.5rem', fontWeight: '600', fontSize: '1rem' }}
                >
                  <BsCartPlusFill />
                  {isInCart(product._id)
                    ? `En carrito (${getItemQuantity(product._id)}) — Añadir ${qty} más`
                    : `Agregar ${qty} al carrito`}
                </Button>
              </div>
            )}

            {isOutOfStock && (
              <div className="alert alert-secondary d-flex align-items-center gap-2 mt-3 mb-0">
                <BsBoxSeam /> Producto sin stock disponible por el momento.
              </div>
            )}
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

export default ProductDetailModal;
