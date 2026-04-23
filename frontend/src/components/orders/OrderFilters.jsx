// src/components/orders/OrderFilters.jsx
import { Form, Row, Col, Button } from 'react-bootstrap';
import { FiSearch, FiRotateCcw } from 'react-icons/fi';
import { useState } from 'react';

const OrderFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: '-1'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      status: '',
      search: '',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: '-1'
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Form>
      <Row className="g-3">
        {/* Búsqueda */}
        <Col md={6} lg={3}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary mb-2">
              <FiSearch className="me-2" />
              Buscar
            </Form.Label>
            <Form.Control
              type="text"
              name="search"
              placeholder="Cliente, email u orden ID..."
              value={filters.search}
              onChange={handleInputChange}
              className="input-custom"
            />
          </Form.Group>
        </Col>

        {/* Estado */}
        <Col md={6} lg={3}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary mb-2">
              Estado
            </Form.Label>
            <Form.Select
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              className="input-custom"
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="processing">Procesando</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Fecha inicio */}
        <Col md={6} lg={2}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary mb-2">
              Desde
            </Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleInputChange}
              className="input-custom"
            />
          </Form.Group>
        </Col>

        {/* Fecha fin */}
        <Col md={6} lg={2}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary mb-2">
              Hasta
            </Form.Label>
            <Form.Control
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleInputChange}
              className="input-custom"
            />
          </Form.Group>
        </Col>

        {/* Ordenar */}
        <Col md={6} lg={2}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary mb-2">
              Ordenar
            </Form.Label>
            <Form.Select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleInputChange}
              className="input-custom"
            >
              <option value="createdAt">Fecha</option>
              <option value="total">Total</option>
              <option value="status">Estado</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Orden (Asc/Desc) */}
        <Col md={6} lg={1}>
          <Form.Group>
            <Form.Label className="small fw-bold text-secondary mb-2">
              Tipo
            </Form.Label>
            <Form.Select
              name="sortOrder"
              value={filters.sortOrder}
              onChange={handleInputChange}
              className="input-custom"
            >
              <option value="-1">Descendente</option>
              <option value="1">Ascendente</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Botones */}
      <Row className="mt-3">
        <Col className="d-flex gap-2">
          <Button
            variant="primary"
            className="btn-primary-custom"
            onClick={handleApplyFilters}
          >
            <FiSearch className="me-2" />
            Buscar
          </Button>
          <Button
            variant="outline-secondary"
            onClick={handleReset}
          >
            <FiRotateCcw className="me-2" />
            Limpiar
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default OrderFilters;
