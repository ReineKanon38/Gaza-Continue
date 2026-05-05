import { Modal, Button, Badge, Row, Col, ListGroup } from 'react-bootstrap';

function ProductDetailModal({ show, onHide, product }) {
  if (!product) return null;

  const price = Number(product.price || 0);
  const listPrice = Number(product.listPrice || 0);
  const hasPromo = listPrice > price && price > 0;
  const stock = Number(product.stock || 0);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{product.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-4">
          <Col md={5}>
            <img
              src={product.image || 'https://via.placeholder.com/480x320?text=Producto'}
              alt={product.name}
              className="img-fluid rounded"
              style={{ width: '100%', objectFit: 'cover' }}
            />
          </Col>
          <Col md={7}>
            <div className="d-flex gap-2 mb-2 flex-wrap">
              {product.isSuperPrecio && <Badge bg="danger">Super Precio</Badge>}
              <Badge bg={stock > 0 ? 'success' : 'secondary'}>
                {stock > 0 ? `Stock disponible: ${stock}` : 'Sin stock'}
              </Badge>
            </div>

            {hasPromo && (
              <div className="text-muted text-decoration-line-through mb-1">
                ${listPrice.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
              </div>
            )}
            <h4 className="mb-3 text-primary">
              ${price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
            </h4>

            <p className="text-muted">
              {product.description || 'Sin descripción detallada para este producto.'}
            </p>

            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>ID:</strong> {product.syscomId || product._id || 'N/D'}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Proveedor:</strong> SYSCOM (integrado por GAZA)
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Comercializa:</strong> GAZA
              </ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProductDetailModal;
