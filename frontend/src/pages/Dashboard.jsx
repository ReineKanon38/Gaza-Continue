// 1. IMPORTAMOS LOS HOOKS Y EL SPINNER
import { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Pagination,
    Table,
    InputGroup,
    Spinner,
    Alert,
    Nav,
    Button
} from 'react-bootstrap';

// Importamos los iconos
import { 
    BsGridFill, 
    BsGraphUp, 
    BsTable,
    BsSearch,
    BsFilterLeft
} from 'react-icons/bs';
import { BiDollar } from 'react-icons/bi';
import { FiBox } from 'react-icons/fi';

import AppNavbar from '../components/AppNavbar';
import ProductCard from '../components/ProductCard';
import KpiCard from '../components/KpiCard';
import BarChart from '../components/BarChart';
import DonutChart from '../components/DonutChart';
import LineChart from '../components/LineChart';
import ManageOrders from '../components/ManageOrders';
import { KpiCardSkeleton, ChartSkeleton, ProductCardSkeleton, TableSkeleton } from '../components/LoadingSkeletons';
import NotificationToast from '../components/NotificationToast';
import { requestJson } from '../services/httpClient';

// Mock data para modo offline
const mockProducts = [
    { id: 1, name: 'Nombre Producto 1', price: '$199.99' },
    { id: 2, name: 'Nombre Producto 2', price: '$299.99' },
    { id: 3, name: 'Nombre Producto 3', price: '$399.99' },
    { id: 4, name: 'Nombre Producto 4', price: '$499.99' },
];

const mockKpis = [
    { title: 'Ventas hoy', value: '$10,000' },
    { title: 'Total comisiones', value: '$5,000' },
    { title: 'Productos top', value: '15' },
];

const mockSales = [
    { id: 1, cliente: 'Juan', producto: 'Producto A', cantidad: 2, total: '$500', fecha: '10/11/2025' },
    { id: 2, cliente: 'Maria', producto: 'Producto B', cantidad: 1, total: '$199', fecha: '09/11/2025' },
    { id: 3, cliente: 'Carlos', producto: 'Producto C', cantidad: 5, total: '$1,200', fecha: '08/11/2025' },
];

function Dashboard() {
    
    // --- ESTADOS PARA DATOS REALES ---
    const [products, setProducts] = useState([]);
    const [kpis, setKpis] = useState([]);
    const [sales, setSales] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [statsData, setStatsData] = useState(null);
    
    // Estados para datos de gráficas
    const [salesChartData, setSalesChartData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    
    // Estados para UX mejorada
    const [activeView, setActiveView] = useState('overview'); // 'overview' o 'orders'
    const [loadingStates] = useState({
        products: true,
        stats: true,
        orders: true
    });
    const [toast, setToast] = useState({ show: false, title: '', message: '', variant: 'info' });

    // --- FUNCIÓN PARA CARGAR DATOS DEL BACKEND ---
    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            const apiUrl = import.meta.env.VITE_API_URL;
            
            // Modo sin-backend: usar mocks
            if (!apiUrl) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                setProducts(mockProducts);
                setKpis(mockKpis);
                setSales(mockSales);
                setIsLoading(false);
                return;
            }

            // Peticiones paralelas para mejor performance
            const [
                dashboardResponse,
                recentOrdersResponse,
                productsResponse
            ] = await Promise.all([
                requestJson('/stats/dashboard'),
                requestJson('/stats/recent-orders?limit=5'),
                requestJson('/products?limit=4')
            ]);

            // Procesar respuesta de estadísticas
            if (dashboardResponse.success) {
                const stats = dashboardResponse.data;
                setStatsData(stats);
                
                // Formatear KPIs
                setKpis([
                    { 
                        title: 'Ventas Hoy', 
                        value: `$${stats.kpis.salesToday.toFixed(2)}` 
                    },
                    { 
                        title: 'Ventas Este Mes', 
                        value: `$${stats.kpis.salesMonth.toFixed(2)}` 
                    },
                    { 
                        title: 'Órdenes Pendientes', 
                        value: stats.kpis.pendingOrders.toString() 
                    }
                ]);
            } else {
                throw new Error('Error en respuesta de estadísticas');
            }

            // Procesar órdenes recientes
            if (recentOrdersResponse.success) {
                setSales(recentOrdersResponse.data.map(order => ({
                    id: order.id,
                    cliente: order.cliente,
                    producto: order.productos.substring(0, 30) + (order.productos.length > 30 ? '...' : ''),
                    cantidad: order.estado,
                    total: order.total,
                    fecha: order.fecha
                })));
            } else {
                setSales(mockSales);
            }

            // Procesar productos
            if (productsResponse.success) {
                setProducts(productsResponse.data || []);
            } else {
                setProducts(mockProducts);
            }

        } catch (err) {
            console.error('Error cargando dashboard:', err);
            setError('Error al cargar datos. Mostrando datos de ejemplo.');
            
            // Fallback a mocks en caso de error
            setProducts(mockProducts);
            setKpis(mockKpis);
            setSales(mockSales);
        } finally {
            setIsLoading(false);
        }
    };

    // --- CARGAR DATOS AL MONTAR COMPONENTE ---
    useEffect(() => {
        loadDashboardData();
    }, []);

    // --- PREPARAR DATOS PARA GRÁFICAS ---
    useEffect(() => {
        if (statsData) {
            // Datos para gráfico de barras - productos más vendidos
            if (statsData.topProducts && statsData.topProducts.length > 0) {
                const chartData = statsData.topProducts.map(product => ({
                    label: product.name.length > 10 ? product.name.substring(0, 10) + '...' : product.name,
                    value: product.totalSold,
                    color: '#007bff'
                }));
                setSalesChartData(chartData);
            }

            // Datos para gráfico de dona - categorías (simulado)
            const categories = [
                { label: 'Electrónicos', value: 35, color: '#007bff' },
                { label: 'Ropa', value: 25, color: '#28a745' },
                { label: 'Hogar', value: 20, color: '#ffc107' },
                { label: 'Deportes', value: 15, color: '#dc3545' },
                { label: 'Otros', value: 5, color: '#6c757d' }
            ];
            setCategoryData(categories);

            // Datos para gráfico de líneas - ventas mensuales (simulado)
            const monthly = [
                { label: 'Ene', value: statsData.kpis.salesMonth * 0.8 },
                { label: 'Feb', value: statsData.kpis.salesMonth * 0.9 },
                { label: 'Mar', value: statsData.kpis.salesMonth * 1.1 },
                { label: 'Abr', value: statsData.kpis.salesMonth * 0.95 },
                { label: 'May', value: statsData.kpis.salesMonth },
                { label: 'Jun', value: statsData.kpis.salesMonth * 1.2 }
            ];
            setMonthlyData(monthly);
        } else {
            // Datos mock para modo offline
            setSalesChartData([
                { label: 'Producto A', value: 45, color: '#007bff' },
                { label: 'Producto B', value: 38, color: '#28a745' },
                { label: 'Producto C', value: 29, color: '#ffc107' },
                { label: 'Producto D', value: 22, color: '#dc3545' }
            ]);

            setCategoryData([
                { label: 'Electrónicos', value: 35, color: '#007bff' },
                { label: 'Ropa', value: 25, color: '#28a745' },
                { label: 'Hogar', value: 20, color: '#ffc107' },
                { label: 'Deportes', value: 15, color: '#dc3545' },
                { label: 'Otros', value: 5, color: '#6c757d' }
            ]);

            setMonthlyData([
                { label: 'Ene', value: 8000 },
                { label: 'Feb', value: 9200 },
                { label: 'Mar', value: 11000 },
                { label: 'Abr', value: 9500 },
                { label: 'May', value: 10000 },
                { label: 'Jun', value: 12000 }
            ]);
        }
    }, [statsData]);

    return (
        <>
            <AppNavbar />

            <Container fluid className="p-4" style={{ backgroundColor: 'var(--body-bg)', minHeight: '100vh' }}>
                
                {/* Navegación de Vistas */}
                <Row className="mb-4">
                    <Col>
                        <Nav variant="tabs" activeKey={activeView} onSelect={(k) => setActiveView(k)}>
                            <Nav.Item>
                                <Nav.Link eventKey="overview">
                                    <BsGridFill className="me-2" />
                                    Resumen
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="orders">
                                    <BsTable className="me-2" />
                                    Gestión de Órdenes
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                </Row>
                
                {/* --- RENDERIZADO CONDICIONAL --- */}
                {isLoading && activeView === 'overview' ? (
                    
                    // Si 'isLoading' es true, muestra el Spinner
                    <div className="text-center" style={{ marginTop: '10rem' }}>
                        <Spinner 
                            animation="border" 
                            role="status" 
                            style={{ 
                                width: '3rem', 
                                height: '3rem', 
                                color: 'var(--primary-color)' 
                            }}
                        >
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                        <h4 className="mt-3 fw-bold" style={{ color: 'var(--text-color)' }}>
                            Cargando datos de administrador...
                        </h4>
                    </div>

                ) : (
                    
                    // Si 'isLoading' es false, muestra tu contenido
                    <>
                        {/* Mensaje de error si existe */}
                        {error && (
                            <Row className="mb-3">
                                <Col>
                                    <Alert variant="warning" className="d-flex align-items-center">
                                        <span>{error}</span>
                                        <button 
                                            className="btn btn-sm btn-outline-warning ms-auto"
                                            onClick={loadDashboardData}
                                        >
                                            Reintentar
                                        </button>
                                    </Alert>
                                </Col>
                            </Row>
                        )}

                        {/* --- Título de Sección Productos --- */}
                        <Row className="mb-3">
                            <Col>
                                <h2 className="fw-bold d-flex align-items-center">
                                    <BsGridFill className="me-3" />
                                    Catálogo de Productos
                                </h2>
                            </Col>
                        </Row>
                        
                        {/* --- Filtros y Búsqueda --- */}
                        <Row className="mb-4 g-3">
                            <Col md={6}>
                                <InputGroup>
                                    <InputGroup.Text><BsSearch /></InputGroup.Text>
                                    <Form.Control type="text" placeholder="Buscar producto..." />
                                </InputGroup>
                            </Col>
                            <Col md={3}>
                                <InputGroup>
                                    <InputGroup.Text><BsFilterLeft /></InputGroup.Text>
                                    <Form.Select aria-label="Filtrar por categoría">
                                        <option>Filtrar categoría</option>
                                        <option value="1">Categoría 1</option>
                                        <option value="2">Categoría 2</option>
                                    </Form.Select>
                                </InputGroup>
                            </Col>
                            <Col md={3}>
                                <InputGroup>
                                    <InputGroup.Text><BiDollar /></InputGroup.Text>
                                    <Form.Control type="text" placeholder="Precio" />
                                </InputGroup>
                            </Col>
                        </Row>
                        
                        {/* --- Cuadrícula de Productos --- */}
                        <Row xs={1} md={2} lg={4} className="g-4">
                            {products.map((product) => (
                                <ProductCard key={product._id || product.id} product={product} />
                            ))}
                        </Row>
                        
                        {/* --- Paginación --- */}
                        <Pagination className="justify-content-center mt-4">
                            <Pagination.Prev />
                            <Pagination.Item active>{1}</Pagination.Item>
                            <Pagination.Item>{2}</Pagination.Item>
                            <Pagination.Next />
                        </Pagination>

                        {/* --- Separador Visual --- */}
                        <hr className="my-5" />

                        {/* --- Título de la Sección Admin --- */}
                        <Row className="mb-3">
                            <Col>
                                <h2 className="fw-bold d-flex align-items-center">
                                    <BsGraphUp className="me-3" />
                                    KPI's principales
                                    {statsData && (
                                        <small className="text-muted ms-3" style={{ fontSize: '0.8rem' }}>
                                            Datos en tiempo real
                                        </small>
                                    )}
                                </h2>
                            </Col>
                        </Row>

                        {/* --- Tarjetas de KPIs --- */}
                        <Row xs={1} md={3} className="g-4 mb-4">
                            {loadingStates.stats ? (
                                // Mostrar skeletons mientras cargan las estadísticas
                                [1, 2, 3, 4, 5, 6].map(i => (
                                    <Col key={i}>
                                        <KpiCardSkeleton />
                                    </Col>
                                ))
                            ) : (
                                kpis.map((kpi) => (
                                    <Col key={kpi.title}>
                                        <KpiCard 
                                            title={kpi.title} 
                                            value={kpi.value} 
                                        />
                                    </Col>
                                ))
                            )}
                        </Row>

                        {/* --- Gráficas Funcionales con Datos Reales --- */}
                        <Row className="g-4 mb-4">
                            <Col md={6}>
                                {loadingStates.stats ? (
                                    <ChartSkeleton height={250} />
                                ) : (
                                    <BarChart 
                                        data={salesChartData} 
                                        title="Productos Más Vendidos" 
                                        height={250} 
                                    />
                                )}
                            </Col>
                            <Col md={6}>
                                {loadingStates.stats ? (
                                    <ChartSkeleton height={250} />
                                ) : (
                                    <DonutChart 
                                        data={categoryData} 
                                        title="Ventas por Categoría" 
                                        size={200} 
                                    />
                                )}
                            </Col>
                        </Row>

                        {/* --- Gráfica de Tendencia Mensual --- */}
                        <Row className="g-4 mb-4">
                            <Col md={12}>
                                {loadingStates.stats ? (
                                    <ChartSkeleton height={250} />
                                ) : (
                                    <LineChart 
                                        data={monthlyData} 
                                        title="Tendencia de Ventas Mensuales" 
                                        height={250} 
                                        width={800} 
                                    />
                                )}
                            </Col>
                        </Row>

                        {/* --- Tabla de Últimas Ventas --- */}
                        <Row>
                            <Col>
                                <Card className="shadow-sm border-0">
                                    <Card.Body>
                                        <Card.Title className="mb-3 fw-bold d-flex align-items-center">
                                            <BsTable className="me-3" />
                                            Últimas órdenes
                                            {sales.length > 0 && (
                                                <small className="text-muted ms-3" style={{ fontSize: '0.8rem' }}>
                                                    Actualizadas en tiempo real
                                                </small>
                                            )}
                                        </Card.Title>
                                        <Table striped bordered hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>Cliente</th>
                                                    <th>Producto(s)</th>
                                                    <th>Estado</th>
                                                    <th>Total</th>
                                                    <th>Fecha</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sales.length > 0 ? sales.map((sale) => (
                                                    <tr key={sale.id}>
                                                        <td>{sale.cliente}</td>
                                                        <td>{sale.producto}</td>
                                                        <td>
                                                            <span className={`badge ${
                                                                sale.cantidad === 'completada' ? 'bg-success' :
                                                                sale.cantidad === 'pendiente' ? 'bg-warning' :
                                                                sale.cantidad === 'procesando' ? 'bg-info' :
                                                                'bg-secondary'
                                                            }`}>
                                                                {sale.cantidad}
                                                            </span>
                                                        </td>
                                                        <td><strong>{sale.total}</strong></td>
                                                        <td>{sale.fecha}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="5" className="text-center text-muted py-4">
                                                            No hay órdenes recientes
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}
                
                {/* Vista de Gestión de Órdenes */}
                {activeView === 'orders' && <ManageOrders />}
                
            </Container>
            
            {/* Componente de notificaciones */}
            <NotificationToast
                show={toast.show}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
                title={toast.title}
                message={toast.message}
                variant={toast.variant}
            />
        </>
    );
}

export default Dashboard;

