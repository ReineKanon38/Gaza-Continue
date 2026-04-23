// src/components/orders/EditOrderModal.jsx
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { useNotification } from '../../hooks';

const EditOrderModal = ({ show, order, onHide, onOrderUpdated }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: order?.status || 'pending',
    trackingNumber: order?.trackingNumber || '',
    notes: order?.notes || '',
    shippingAddress: {
      street: order?.shippingAddress?.street || '',
      number: order?.shippingAddress?.number || '',
      neighborhood: order?.shippingAddress?.neighborhood || '',
      city: order?.shippingAddress?.city || '',
      state: order?.shippingAddress?.state || '',
      zipCode: order?.shippingAddress?.zipCode || '',
      country: order?.shippingAddress?.country || 'México',
      additionalInfo: order?.shippingAddress?.additionalInfo || ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${order._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar la orden');
      }

      onOrderUpdated();
      onHide();
    } catch (err) {
      console.error('Error actualizando orden:', err);
      showNotification('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Orden #{order?.orderId || order?._id?.substring(0, 8)}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Estado y Seguimiento */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">Estado</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input-custom"
                >
                  <option value="pending">Pendiente</option>
                  <option value="processing">Procesando</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">Número de Seguimiento</Form.Label>
                <Form.Control
                  type="text"
                  name="trackingNumber"
                  value={formData.trackingNumber}
                  onChange={handleInputChange}
                  placeholder="Ej: MX123456789"
                  className="input-custom"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Notas */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Notas Administrativas</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Agregar notas sobre esta orden..."
              className="input-custom"
            />
          </Form.Group>

          {/* Dirección de Envío */}
          <h6 className="fw-bold mt-4 mb-3">Dirección de Envío</h6>

          <Row className="mb-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label className="fw-bold">Calle</Form.Label>
                <Form.Control
                  type="text"
                  name="street"
                  value={formData.shippingAddress.street}
                  onChange={handleAddressChange}
                  className="input-custom"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold">Número</Form.Label>
                <Form.Control
                  type="text"
                  name="number"
                  value={formData.shippingAddress.number}
                  onChange={handleAddressChange}
                  className="input-custom"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">Colonia</Form.Label>
                <Form.Control
                  type="text"
                  name="neighborhood"
                  value={formData.shippingAddress.neighborhood}
                  onChange={handleAddressChange}
                  className="input-custom"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">Ciudad</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.shippingAddress.city}
                  onChange={handleAddressChange}
                  className="input-custom"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">Estado</Form.Label>
                <Form.Control
                  type="text"
                  name="state"
                  value={formData.shippingAddress.state}
                  onChange={handleAddressChange}
                  className="input-custom"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold">CP</Form.Label>
                <Form.Control
                  type="text"
                  name="zipCode"
                  value={formData.shippingAddress.zipCode}
                  onChange={handleAddressChange}
                  maxLength="5"
                  className="input-custom"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold">País</Form.Label>
                <Form.Control
                  type="text"
                  name="country"
                  value={formData.shippingAddress.country}
                  onChange={handleAddressChange}
                  className="input-custom"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Información Adicional</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="additionalInfo"
              value={formData.shippingAddress.additionalInfo}
              onChange={handleAddressChange}
              placeholder="Detalles adicionales de la dirección..."
              className="input-custom"
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          className="btn-primary-custom"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" animation="border" />
              Guardando...
            </>
          ) : (
            <>
              <FiSave className="me-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditOrderModal;
