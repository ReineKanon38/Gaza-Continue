import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { BsCheckCircleFill, BsCircle, BsTruck, BsBoxSeam, BsShopWindow, BsPerson } from 'react-icons/bs';
import AppNavbar from '../components/AppNavbar';
import orderService from '../services/orderService';

const STAGES = [
  { key: 'supplier_received',    label: 'Proveedor recibió el pedido', icon: BsShopWindow },
  { key: 'in_transit',           label: 'En camino a GAZA',            icon: BsTruck     },
  { key: 'intermediary_received',label: 'Recibido por GAZA',           icon: BsBoxSeam   },
  { key: 'out_for_delivery',     label: 'En camino al cliente',        icon: BsTruck     },
  { key: 'delivered',            label: 'Entregado',                   icon: BsPerson    },
];

const STATUS_LABEL = {
  pending:    { text: 'Pendiente',    bg: 'warning' },
  processing: { text: 'En proceso',   bg: 'primary' },
  completed:  { text: 'Completado',   bg: 'success' },
  cancelled:  { text: 'Cancelado',    bg: 'danger'  },
};

const PAYMENT_LABEL = {
  pending_validation: { text: 'Pago en revisión', bg: 'warning' },
  approved:           { text: 'Pago aprobado',    bg: 'success' },
  rejected:           { text: 'Pago rechazado',   bg: 'danger'  },
};

function StageTimeline({ currentStage, history }) {
  const completedKeys = new Set((history || []).map(h => h.stage));
  const currentIdx   = STAGES.findIndex(s => s.key === currentStage);

  return (
    <div className="position-relative ps-4" style={{ borderLeft: '2px solid #dee2e6' }}>
      {STAGES.map((stage, idx) => {
        const Icon     = stage.icon;
        const done     = completedKeys.has(stage.key) || idx <= currentIdx;
        const isCurrent = stage.key === currentStage;
        const histEntry = (history || []).find(h => h.stage === stage.key);

        return (
          <div key={stage.key} className="d-flex align-items-start gap-3 mb-4 position-relative" style={{ marginLeft: '-1.35rem' }}>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 32, height: 32,
                background: done ? 'var(--bs-success, #198754)' : '#dee2e6',
                color: done ? '#fff' : '#6c757d',
                border: isCurrent ? '3px solid #0d6efd' : '2px solid transparent',
                zIndex: 1
              }}
            >
              {done ? <BsCheckCircleFill size={14} /> : <BsCircle size={14} />}
            </div>
            <div>
              <div className="fw-semibold" style={{ color: done ? 'inherit' : '#6c757d' }}>
                <Icon className="me-1" />
                {stage.label}
                {isCurrent && <Badge bg="primary" className="ms-2" style={{ fontSize: '0.7rem' }}>Actual</Badge>}
              </div>
              {histEntry && (
                <div className="text-muted small">
                  {histEntry.message && <span>{histEntry.message} · </span>}
                  {histEntry.timestamp && new Date(histEntry.timestamp).toLocaleString('es-MX')}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderTracking() {
  const { id } = useParams();
  const [tracking, setTracking] = useState(null);
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [orderData, trackingData] = await Promise.all([
          orderService.getOrderById(id),
          orderService.getOrderTracking(id),
        ]);
        setOrder(orderData);
        setTracking(trackingData);
      } catch (err) {
        setError(err.message || 'No se pudo cargar el rastreo de este pedido.');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const statusInfo  = STATUS_LABEL[order?.status]  || { text: order?.status,        bg: 'secondary' };
  const paymentInfo = PAYMENT_LABEL[order?.paymentStatus] || { text: order?.paymentStatus, bg: 'secondary' };

  return (
    <div className="min-vh-100 bg-page-content">
      <AppNavbar />
      <Container className="py-4" style={{ maxWidth: 720 }}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <Link to="/profile" className="text-decoration-none text-muted">← Mis pedidos</Link>
        </div>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2 text-muted">Cargando rastreo…</p>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && order && (
          <>
            {/* Cabecera */}
            <Card className="shadow-sm border-0 mb-4">
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  <Col>
                    <h5 className="fw-bold mb-1">{order.orderId}</h5>
                    <div className="text-muted small">
                      {new Date(order.createdAt).toLocaleString('es-MX')}
                    </div>
                  </Col>
                  <Col xs="auto" className="d-flex gap-2 flex-wrap">
                    <Badge bg={statusInfo.bg}  className="px-3 py-2">{statusInfo.text}</Badge>
                    <Badge bg={paymentInfo.bg} className="px-3 py-2">{paymentInfo.text}</Badge>
                    <Badge bg="dark"           className="px-3 py-2">GAZA</Badge>
                  </Col>
                </Row>

                {order.trackingNumber && (
                  <div className="mt-3 p-2 rounded bg-light d-flex align-items-center gap-2">
                    <BsTruck className="text-primary" />
                    <span className="fw-semibold">Número de guía:</span>
                    <span>{order.trackingNumber}</span>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Timeline */}
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-white border-bottom fw-bold">Seguimiento del pedido</Card.Header>
              <Card.Body className="p-4">
                <div className="d-flex gap-4 mb-4 text-muted small">
                  <span><strong>Proveedor:</strong> {tracking?.mapping?.supplier || 'SYSCOM'}</span>
                  <span><strong>Operado por:</strong> {tracking?.mapping?.intermediary || 'GAZA'}</span>
                </div>
                <StageTimeline
                  currentStage={tracking?.fulfillmentTracking?.stage || order?.fulfillmentTracking?.stage}
                  history={tracking?.fulfillmentTracking?.history || order?.fulfillmentTracking?.history}
                />
              </Card.Body>
            </Card>

            {/* Productos */}
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-white border-bottom fw-bold">Productos</Card.Header>
              <Card.Body className="p-0">
                {(order.products || []).map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-3 p-3 border-bottom">
                    <div
                      className="rounded"
                      style={{ width: 56, height: 56, background: '#f1f3f5', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {item.product?.image
                        ? <img src={item.product.image} alt={item.product.name} style={{ width: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '1.5rem' }}>📦</span>
                      }
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{item.product?.name || 'Producto'}</div>
                      <div className="text-muted small">Cantidad: {item.quantity}</div>
                    </div>
                    <div className="fw-bold">
                      ${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </div>
                  </div>
                ))}
                <div className="d-flex justify-content-between p-3 fw-bold">
                  <span>Total</span>
                  <span>${Number(order.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                </div>
              </Card.Body>
            </Card>

            {/* Dirección */}
            {order.shippingAddress && (
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-bottom fw-bold">Dirección de envío</Card.Header>
                <Card.Body className="p-3 text-muted">
                  {order.shippingAddress.street} {order.shippingAddress.number}<br />
                  {order.shippingAddress.neighborhood && <>{order.shippingAddress.neighborhood}, </>}
                  {order.shippingAddress.city}, {order.shippingAddress.state} CP {order.shippingAddress.zipCode}
                </Card.Body>
              </Card>
            )}
          </>
        )}
      </Container>
    </div>
  );
}

export default OrderTracking;
