// src/components/ManageOrders.jsx
import { useState, useEffect, useCallback } from 'react';
import { Card, Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import '../styles/components.css';
import OrdersTable from './orders/OrdersTable';
import OrderFilters from './orders/OrderFilters';
import OrderDetailModal from './orders/OrderDetailModal';
import EditOrderModal from './orders/EditOrderModal';
import OrderStats from './orders/OrderStats';
import { useNotification } from '../hooks';
import { requestJson } from '../services/httpClient';

const ManageOrders = () => {
  const { showNotification } = useNotification();
  
  // Estados
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: '-1',
    page: 1,
    limit: 20
  });

  // Cargar órdenes
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir query string
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const data = await requestJson(`/orders/admin/all?${queryParams.toString()}`);
      setOrders(data.data || []);
    } catch (err) {
      console.error('Error cargando órdenes:', err);
      setError(err.message);
      showNotification('Error', 'Error al cargar las órdenes', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showNotification]);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      const data = await requestJson('/orders/admin/stats');
      setStats(data.data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  }, []);

  // Cargar datos al montar
  useEffect(() => {
    loadOrders();
    loadStats();
  }, [loadOrders, loadStats]);

  // Manejar vista de detalles
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Manejar edición
  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };

  // Manejar cambio de filtros
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset a primera página
    }));
  };

  // Manejar eliminación
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta orden?')) {
      return;
    }

    try {
      await requestJson(`/orders/${orderId}`, { method: 'DELETE' });

      showNotification('Éxito', 'Orden eliminada correctamente', 'success');
      await loadOrders();
      await loadStats();
    } catch (err) {
      console.error('Error eliminando orden:', err);
      showNotification('Error', 'Error al eliminar la orden', 'error');
    }
  };

  // Manejar actualización de orden
  const handleOrderUpdated = async () => {
    await loadOrders();
    await loadStats();
    setShowEditModal(false);
    showNotification('Éxito', 'Orden actualizada correctamente', 'success');
  };

  return (
    <Container fluid className="py-4">
      {/* Título */}
      <Row className="mb-4">
        <Col>
          <h1 className="text-dark mb-2">Gestión de Órdenes</h1>
          <p className="text-secondary">Administra todas las órdenes de los clientes</p>
        </Col>
      </Row>

      {/* Estadísticas */}
      {stats && (
        <Row className="mb-4">
          <OrderStats stats={stats} />
        </Row>
      )}

      {/* Filtros */}
      <Row className="mb-4">
        <Col>
          <Card className="card-custom">
            <Card.Body>
              <OrderFilters onFilterChange={handleFilterChange} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de órdenes */}
      <Row>
        <Col>
          <Card className="card-custom">
            <Card.Body className="p-0">
              {error && (
                <Alert variant="danger" className="m-3">
                  {error}
                </Alert>
              )}

              {loading ? (
                <div className="text-center p-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-secondary">Cargando órdenes...</p>
                </div>
              ) : orders.length === 0 ? (
                <Alert variant="info" className="m-3">
                  No se encontraron órdenes
                </Alert>
              ) : (
                <OrdersTable
                  orders={orders}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEditOrder}
                  onDelete={handleDeleteOrder}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de detalles */}
      {selectedOrder && (
        <OrderDetailModal
          show={showDetailModal}
          order={selectedOrder}
          onHide={() => setShowDetailModal(false)}
        />
      )}

      {/* Modal de edición */}
      {editingOrder && (
        <EditOrderModal
          show={showEditModal}
          order={editingOrder}
          onHide={() => setShowEditModal(false)}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </Container>
  );
};

export default ManageOrders;
