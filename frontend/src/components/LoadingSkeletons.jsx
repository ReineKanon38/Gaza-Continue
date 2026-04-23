import React from 'react';
import { Card, Placeholder } from 'react-bootstrap';

// Componente de esqueleto para tarjetas de KPI
const KpiCardSkeleton = () => (
    <Card className="shadow-sm border-0">
        <Card.Body>
            <Placeholder as={Card.Title} animation="glow">
                <Placeholder xs={6} />
            </Placeholder>
            <Placeholder as="h3" animation="glow">
                <Placeholder xs={8} />
            </Placeholder>
        </Card.Body>
    </Card>
);

// Componente de esqueleto para gráficas
const ChartSkeleton = ({ height = 250 }) => (
    <Card className="shadow-sm border-0">
        <Card.Body>
            <Placeholder as={Card.Title} animation="glow">
                <Placeholder xs={7} />
            </Placeholder>
            <div 
                className="bg-light rounded" 
                style={{ 
                    height: height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando gráfica...</span>
                </div>
            </div>
        </Card.Body>
    </Card>
);

// Componente de esqueleto para productos
const ProductCardSkeleton = () => (
    <Card className="shadow-sm border-0">
        <Placeholder as="div" animation="glow" style={{ height: '200px' }} className="bg-light" />
        <Card.Body>
            <Placeholder as={Card.Title} animation="glow">
                <Placeholder xs={8} />
            </Placeholder>
            <Placeholder as={Card.Text} animation="glow">
                <Placeholder xs={6} />
                <Placeholder xs={4} />
            </Placeholder>
            <Placeholder.Button variant="primary" xs={6} />
        </Card.Body>
    </Card>
);

// Componente de esqueleto para tabla
const TableSkeleton = () => (
    <Card className="shadow-sm border-0">
        <Card.Body>
            <Placeholder as={Card.Title} animation="glow">
                <Placeholder xs={6} />
            </Placeholder>
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th><Placeholder xs={8} /></th>
                            <th><Placeholder xs={6} /></th>
                            <th><Placeholder xs={5} /></th>
                            <th><Placeholder xs={7} /></th>
                            <th><Placeholder xs={6} /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4, 5].map(i => (
                            <tr key={i}>
                                <td><Placeholder xs={9} /></td>
                                <td><Placeholder xs={7} /></td>
                                <td><Placeholder xs={6} /></td>
                                <td><Placeholder xs={8} /></td>
                                <td><Placeholder xs={7} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card.Body>
    </Card>
);

export { KpiCardSkeleton, ChartSkeleton, ProductCardSkeleton, TableSkeleton };