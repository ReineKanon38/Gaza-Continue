// src/components/orders/OrderStats.jsx
import { Row, Col } from 'react-bootstrap';
import KpiCard from '../KpiCard';
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi';

const OrderStats = ({ stats }) => {
  return (
    <>
      <Col lg={3} md={6} className="mb-3">
        <KpiCard
          title="Órdenes Totales"
          value={stats.totalOrders || 0}
          icon={<FiPackage size={24} />}
          color="primary"
          trend={`Total de órdenes en el sistema`}
        />
      </Col>

      <Col lg={3} md={6} className="mb-3">
        <KpiCard
          title="Pendientes"
          value={stats.byStatus?.pending || 0}
          icon={<FiClock size={24} />}
          color="warning"
          trend={`Órdenes pendientes de procesar`}
        />
      </Col>

      <Col lg={3} md={6} className="mb-3">
        <KpiCard
          title="Completadas"
          value={stats.byStatus?.completed || 0}
          icon={<FiCheckCircle size={24} />}
          color="success"
          trend={`Órdenes entregadas`}
        />
      </Col>

      <Col lg={3} md={6} className="mb-3">
        <KpiCard
          title="Ingresos Totales"
          value={`$${(stats.totalRevenue || 0).toFixed(2)}`}
          icon={<FiTrendingUp size={24} />}
          color="info"
          trend={`Promedio: $${(stats.averageOrderValue || 0).toFixed(2)}`}
        />
      </Col>
    </>
  );
};

export default OrderStats;
