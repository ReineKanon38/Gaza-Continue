// src/components/orders/OrdersTable.jsx
import { Table, Button, Badge, Form } from 'react-bootstrap';
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import { formatCurrency, formatDate } from '../../utils/formatters';

const OrdersTable = ({ orders, onViewDetails, onEdit, onDelete }) => {
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

  return (
    <Table hover responsive className="mb-0">
      <thead className="bg-light">
        <tr>
          <th>#Orden</th>
          <th>Cliente</th>
          <th>Email</th>
          <th>Total</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order._id} className="align-middle">
            <td className="fw-bold text-primary">
              {order.orderId || `#${order._id.substring(0, 8)}`}
            </td>
            <td>{order.customerName || order.user?.name || 'N/A'}</td>
            <td className="text-secondary text-opacity-75">
              {order.customerEmail || order.user?.email || 'N/A'}
            </td>
            <td className="fw-bold text-success">
              {formatCurrency(order.total)}
            </td>
            <td>{getStatusBadge(order.status)}</td>
            <td className="text-secondary">
              {formatDate(order.createdAt)}
            </td>
            <td>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => onViewDetails(order)}
                  title="Ver detalles"
                >
                  <FiEye />
                </Button>
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => onEdit(order)}
                  title="Editar orden"
                >
                  <FiEdit />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('¿Eliminar esta orden?')) {
                      onDelete(order._id);
                    }
                  }}
                  title="Eliminar orden"
                >
                  <FiTrash2 />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default OrdersTable;
