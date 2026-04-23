import React from 'react';
import { Card } from 'react-bootstrap';

// Componente de gráfica de dona/pastel simple usando CSS
const DonutChart = ({ data, title, size = 180 }) => {
    if (!data || data.length === 0) {
        return (
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Card.Title>{title}</Card.Title>
                    <div 
                        style={{ 
                            height: size + 40, 
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

    // Calcular total y porcentajes
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const dataWithPercentages = data.map(item => ({
        ...item,
        percentage: total > 0 ? (item.value / total) * 100 : 0
    }));

    // Colores por defecto si no se proporcionan
    const defaultColors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1'];
    
    // Crear segmentos del círculo
    let currentAngle = 0;
    const segments = dataWithPercentages.map((item, index) => {
        const angle = (item.percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle += angle;

        // Calcular path del arco SVG
        const radius = size / 2 - 20;
        const centerX = size / 2;
        const centerY = size / 2;
        
        const startAngleRad = (startAngle - 90) * (Math.PI / 180);
        const endAngleRad = (endAngle - 90) * (Math.PI / 180);
        
        const x1 = centerX + radius * Math.cos(startAngleRad);
        const y1 = centerY + radius * Math.sin(startAngleRad);
        const x2 = centerX + radius * Math.cos(endAngleRad);
        const y2 = centerY + radius * Math.sin(endAngleRad);
        
        const largeArc = angle > 180 ? 1 : 0;
        
        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            `Z`
        ].join(' ');

        return {
            ...item,
            pathData,
            color: item.color || defaultColors[index % defaultColors.length]
        };
    });

    return (
        <Card className="shadow-sm border-0">
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* SVG Donut Chart */}
                    <svg width={size} height={size} style={{ marginBottom: '15px' }}>
                        {segments.map((segment, index) => (
                            <g key={index}>
                                <path
                                    d={segment.pathData}
                                    fill={segment.color}
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'opacity 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.opacity = '0.8';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.opacity = '1';
                                    }}
                                >
                                    <title>{`${segment.label}: ${segment.value} (${segment.percentage.toFixed(1)}%)`}</title>
                                </path>
                            </g>
                        ))}
                        {/* Círculo interno para crear efecto donut */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={size / 4}
                            fill="white"
                        />
                        {/* Texto central */}
                        <text
                            x={size / 2}
                            y={size / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="14"
                            fontWeight="bold"
                            fill="#333"
                        >
                            Total: {total}
                        </text>
                    </svg>

                    {/* Leyenda */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
                        {segments.map((segment, index) => (
                            <div 
                                key={index} 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    fontSize: '12px',
                                    margin: '2px 0'
                                }}
                            >
                                <div
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: segment.color,
                                        borderRadius: '2px',
                                        marginRight: '6px'
                                    }}
                                ></div>
                                <span style={{ color: '#666' }}>
                                    {segment.label} ({segment.percentage.toFixed(1)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default DonutChart;