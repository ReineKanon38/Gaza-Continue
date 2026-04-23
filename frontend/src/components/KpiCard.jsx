import { Card, Col } from 'react-bootstrap';

// Este componente es súper reutilizable
// Recibe un 'title' y un 'value' como props
function KpiCard({ title, value, icon }) {
return (
    <Col>
    <Card className="shadow-sm text-center p-3">
        <Card.Body>
        <Card.Subtitle className="mb-2 text-muted">
            {icon && <span className="me-2">{icon}</span>}
            {title}
        </Card.Subtitle>
        <Card.Title as="h3" className="fw-bold">{value}</Card.Title>
        </Card.Body>
    </Card>
    </Col>
    );
}

export default KpiCard;
