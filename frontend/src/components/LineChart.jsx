import React from 'react';
import { Card } from 'react-bootstrap';

// Componente de gráfica de líneas simple usando CSS y SVG
const LineChart = ({ data, title, height = 200, width = 400 }) => {
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

    // Configuración del gráfico
    const padding = 40;
    const chartWidth = Math.max(10, width - (padding * 2));
    const chartHeight = Math.max(10, height - (padding * 2));

    // Calcular valores mínimos y máximos
    const maxValue = Math.max(...data.map(item => item.value || 0));
    const minValue = Math.min(...data.map(item => item.value || 0));
    const valueRange = maxValue === minValue ? 1 : (maxValue - minValue || 1);
    const divisor = data.length > 1 ? data.length - 1 : 1;

    // Calcular puntos de la línea
    const points = data.map((item, index) => {
        const val = Number(item.value || 0);
        const x = data.length === 1 ? padding + chartWidth / 2 : padding + (index / divisor) * chartWidth;
        const y = padding + chartHeight - ((val - minValue) / valueRange) * chartHeight;
        return { x: Number.isFinite(x) ? x : padding, y: Number.isFinite(y) ? y : padding, ...item };
    });

    // Crear path de la línea
    const linePath = points.reduce((path, point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${path} ${command} ${point.x} ${point.y}`;
    }, '');

    // Crear path del área bajo la línea
    const lastPointX = points[points.length - 1]?.x ?? padding;
    const areaPath = `${linePath} L ${lastPointX} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z`;

    // Líneas de la cuadrícula
    const gridLines = [];
    const numGridLines = 5;
    for (let i = 0; i <= numGridLines; i++) {
        const y = padding + (i / numGridLines) * chartHeight;
        const value = maxValue - (i / numGridLines) * valueRange;
        gridLines.push({ y, value });
    }

    return (
        <Card className="shadow-sm border-0">
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <div style={{ position: 'relative' }}>
                    <svg width={width} height={height} style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        {/* Líneas de cuadrícula */}
                        {gridLines.map((line, index) => (
                            <g key={index}>
                                <line
                                    x1={padding}
                                    y1={line.y}
                                    x2={padding + chartWidth}
                                    y2={line.y}
                                    stroke="#e0e0e0"
                                    strokeWidth="1"
                                />
                                <text
                                    x={padding - 5}
                                    y={line.y}
                                    textAnchor="end"
                                    dominantBaseline="middle"
                                    fontSize="10"
                                    fill="#666"
                                >
                                    {line.value.toFixed(0)}
                                </text>
                            </g>
                        ))}

                        {/* Área bajo la línea */}
                        <path
                            d={areaPath}
                            fill="url(#gradient)"
                            opacity="0.3"
                        />

                        {/* Línea principal */}
                        <path
                            d={linePath}
                            fill="none"
                            stroke="#007bff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Puntos de datos */}
                        {points.map((point, index) => (
                            <g key={index}>
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="4"
                                    fill="white"
                                    stroke="#007bff"
                                    strokeWidth="2"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <title>{`${point.label}: ${point.value}`}</title>
                                </circle>
                            </g>
                        ))}

                        {/* Etiquetas del eje X */}
                        {points.map((point, index) => (
                            <text
                                key={index}
                                x={point.x}
                                y={padding + chartHeight + 20}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#666"
                            >
                                {point.label}
                            </text>
                        ))}

                        {/* Definición del gradiente */}
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#007bff', stopOpacity: 0.8 }} />
                                <stop offset="100%" style={{ stopColor: '#007bff', stopOpacity: 0.1 }} />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </Card.Body>
        </Card>
    );
};

export default LineChart;