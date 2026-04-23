import React from 'react';
import { Card } from 'react-bootstrap';

// Componente de gráfica de barras simple usando CSS
const BarChart = ({ data, title, height = 200 }) => {
    if (!data || data.length === 0) {
        return (
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Card.Title>{title}</Card.Title>
                    <div 
                        style={{ 
                            height: height, 
                            backgroundColor: '#fafafa', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            color: '#aaa', 
                            borderRadius: 'var(--border-radius)' 
                        }}
                    >
                        No hay datos disponibles
                    </div>
                </Card.Body>
            </Card>
        );
    }

    // Calcular el valor máximo para normalizar las barras
    const maxValue = Math.max(...data.map(item => item.value));

    return (
        <Card className="shadow-sm border-0">
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <div 
                    style={{ 
                        height: height, 
                        display: 'flex', 
                        alignItems: 'end', 
                        justifyContent: 'space-around', 
                        padding: '20px 10px 10px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px'
                    }}
                >
                    {data.map((item, index) => (
                        <div 
                            key={index} 
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center',
                                flex: 1,
                                maxWidth: '80px',
                                margin: '0 5px'
                            }}
                        >
                            {/* Barra */}
                            <div
                                style={{
                                    width: '100%',
                                    height: `${(item.value / maxValue) * 140}px`,
                                    backgroundColor: item.color || '#007bff',
                                    borderRadius: '4px 4px 0 0',
                                    marginBottom: '8px',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.opacity = '0.8';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.opacity = '1';
                                }}
                                title={`${item.label}: ${item.value}`}
                            >
                                {/* Valor en la parte superior de la barra */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '-20px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        color: '#333',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {item.value}
                                </div>
                            </div>
                            {/* Etiqueta */}
                            <span 
                                style={{ 
                                    fontSize: '11px', 
                                    textAlign: 'center', 
                                    fontWeight: '500',
                                    color: '#666',
                                    lineHeight: '1.2'
                                }}
                            >
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </Card.Body>
        </Card>
    );
};

export default BarChart;