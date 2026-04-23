// src/components/orders/OrderDetailModal.jsx
import { Modal, Row, Col, Badge, Table } from 'react-bootstrap';
import { formatCurrency, formatDate } from '../../utils/formatters';

const OrderDetailModal = ({ show, order, onHide }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', label: 'Pendiente' },
      processing: { variant: 'info', label: 'Procesando' },
      completed: { variant: 'success', label: 'Completada' },
      cancelled: { variant: 'danger', label: 'Cancelada' }
    };

    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return <Badge bg={config.variant}>{config.label}</Badge>;
  };

  if (!order) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title>
          Detalles de Orden {order.orderId || `#${order._id.substring(0, 8)}`}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Información General */}
        <div className="mb-4">
          <h6 className="fw-bold text-dark mb-3">Información General</h6>
          <Row>
            <Col md={6}>
              <p className="text-secondary mb-1">Estado</p>
              <p className="mb-3">{getStatusBadge(order.status)}</p>
              
              <p className="text-secondary mb-1">Cliente</p>
              <p className="mb-3">{order.customerName || order.user?.name}</p>
              
              <p className="text-secondary mb-1">Email</p>
              <p className="mb-3">{order.customerEmail || order.user?.email}</p>
            </Col>
            <Col md={6}>
              <p className="text-secondary mb-1">Teléfono</p>
              <p className="mb-3">{order.customerPhone || 'No especificado'}</p>
              
              <p className="text-secondary mb-1">Fecha</p>
              <p className="mb-3">{formatDate(order.createdAt)}</p>
              
              <p className="text-secondary mb-1">Número de Seguimiento</p>
              <p className="mb-3">{order.trackingNumber || 'Pendiente'}</p>
            </Col>
          </Row>
        </div>

        {/* Productos */}
        <div className="mb-4">
          <h6 className="fw-bold text-dark mb-3">Productos</h6>
          <Table size="sm" bordered>
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-end">Precio</th>
                <th className="text-end">Cantidad</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.products && order.products.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.product?.name || 'Producto no disponible'}</td>
                  <td className="text-end">{formatCurrency(item.price)}</td>
                  <td className="text-end">{item.quantity}</td>
                  <td className="text-end fw-bold">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Resumen Financiero */}
        <div className="mb-4 border-top pt-3">
          <h6 className="fw-bold text-dark mb-3">Resumen Financiero</h6>
          <Row>
            <Col md={6}>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Subtotal:</span>
                <span>{formatCurrency(order.subtotal || order.total)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Impuesto:</span>
                <span>{formatCurrency(order.tax || 0)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Envío:</span>
                <span>{formatCurrency(order.shippingCost || 0)}</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-between mb-2 p-2 bg-light rounded">
                <span className="fw-bold text-dark">Total:</span>
                <span className="fw-bold text-success fs-5">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </Col>
          </Row>
        </div>

        {/* Dirección de Envío */}
        {order.shippingAddress && (
          <div className="mb-4 border-top pt-3">
            <h6 className="fw-bold text-dark mb-3">Dirección de Envío</h6>
            <address className="text-secondary">
              {order.shippingAddress.street} {order.shippingAddress.number}<br />
              {order.shippingAddress.neighborhood}, {order.shippingAddress.city}<br />
              {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
              {order.shippingAddress.country || 'México'}
            </address>
            {order.shippingAddress.additionalInfo && (
              <p className="text-secondary text-sm">
                <strong>Nota:</strong> {order.shippingAddress.additionalInfo}
              </p>
            )}
          </div>
        )}

        {/* Información de Pago */}
        {order.paymentInfo && (
          <div className="mb-4 border-top pt-3">
            <h6 className="fw-bold text-dark mb-3">Información de Pago</h6>
            <p className="mb-2">
              <strong>Método:</strong> {order.paymentInfo.method?.replace('_', ' ').toUpperCase()}
            </p>
            {order.paymentInfo.cardLastFour && (
              <p className="mb-2">
                <strong>Tarjeta:</strong> {order.paymentInfo.cardType?.toUpperCase()} ****{order.paymentInfo.cardLastFour}
              </p>
            )}
          </div>
        )}

        {/* Notas */}
        {order.notes && (
          <div className="border-top pt-3">
            <h6 className="fw-bold text-dark mb-2">Notas</h6>
            <p className="text-secondary text-sm bg-light p-2 rounded">
              {order.notes}
            </p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default OrderDetailModal;
