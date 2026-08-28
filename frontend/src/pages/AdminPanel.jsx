import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Nav, Alert, Modal, Form } from 'react-bootstrap';
import { FiUsers, FiShoppingCart, FiPackage, FiBarChart2, FiSettings, FiTrendingUp, FiDollarSign, FiCheck, FiX, FiEye, FiEdit, FiTrash2, FiPlus, FiDownload, FiTruck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import KpiCard from '../components/KpiCard';
import BarChart from '../components/BarChart';
import DonutChart from '../components/DonutChart';
import LineChart from '../components/LineChart';
import { KpiCardSkeleton, ChartSkeleton, TableSkeleton } from '../components/LoadingSkeletons';
import orderService from '../services/orderService';
import userService from '../services/userService';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import couponService from '../services/couponService';
import configService from '../services/configService';
import inventoryService from '../services/inventoryService';
import syscomAdminService from '../services/syscomAdminService';
import { requestJson } from '../services/httpClient';
import './AdminPanel.css';

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('all');
  const [selectedOrderStatusFilter, setSelectedOrderStatusFilter] = useState('all');
  const [orderPaymentSummary, setOrderPaymentSummary] = useState({
    all: 0,
    pending_validation: 0,
    approved: 0,
    rejected: 0
  });
  const [allUsers, setAllUsers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    model: '',
    stock: ''
  });
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });
  const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    discount: '',
    type: 'percentage',
    maxUses: '',
    expiryDate: ''
  });
  const [configError, setConfigError] = useState(null);
  const [systemConfig, setSystemConfig] = useState(null);
  const [paymentMethodsForm, setPaymentMethodsForm] = useState({
    bankTransfer: true,
    cash: false,
    creditCard: false,
    debitCard: false,
    paypal: false
  });
  const [shippingMethodsForm, setShippingMethodsForm] = useState([]);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [reportKpis, setReportKpis] = useState({
    salesToday: 0,
    salesMonth: 0,
    ordersToday: 0,
    ordersMonth: 0,
    pendingOrders: 0
  });
  const [reportTopProducts, setReportTopProducts] = useState([]);
  const [syscomHealth, setSyscomHealth] = useState(null);
  const [isLoadingSyscomHealth, setIsLoadingSyscomHealth] = useState(false);
  const [syscomHealthHistory, setSyscomHealthHistory] = useState({ points: [] });
  const [isLoadingSyscomHealthHistory, setIsLoadingSyscomHealthHistory] = useState(false);
  const [selectedSyscomHistoryMinutes, setSelectedSyscomHistoryMinutes] = useState(180);
  const [inventoryData, setInventoryData] = useState({
    products: [],
    stats: {
      totalStock: 0,
      totalProducts: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      inventoryValue: 0
    }
  });
  const [inventoryThreshold, setInventoryThreshold] = useState(5);
  const [selectedInventoryIds, setSelectedInventoryIds] = useState([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);

  const buildOrderFilters = useCallback((paymentFilter = selectedPaymentFilter, orderStatusFilter = selectedOrderStatusFilter) => {
    const query = {};
    if (paymentFilter !== 'all') {
      query.paymentStatus = paymentFilter;
    }
    if (orderStatusFilter !== 'all') {
      query.status = orderStatusFilter;
    }
    return query;
  }, [selectedPaymentFilter, selectedOrderStatusFilter]);

  const loadOrders = useCallback(async (paymentFilter = selectedPaymentFilter, orderStatusFilter = selectedOrderStatusFilter) => {
    try {
      const query = buildOrderFilters(paymentFilter, orderStatusFilter);
      const orders = await orderService.getAllOrders(query);
      setAllOrders(orders.orders || orders.data || []);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
    }
  }, [buildOrderFilters, selectedPaymentFilter, selectedOrderStatusFilter]);

  const loadSyscomHealthHistory = useCallback(async (minutes = selectedSyscomHistoryMinutes) => {
    try {
      setIsLoadingSyscomHealthHistory(true);
      const data = await syscomAdminService.getHealthHistory({
        minutes,
        limit: 120
      });
      setSyscomHealthHistory(data || { points: [] });
    } catch (error) {
      console.error('Error cargando historico de SYSCOM:', error);
      setSyscomHealthHistory({ points: [] });
    } finally {
      setIsLoadingSyscomHealthHistory(false);
    }
  }, [selectedSyscomHistoryMinutes]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    // Verificar que el usuario sea admin
    if (!user || user.role !== 'admin') {
      navigate('/tienda');
      return;
    }

    // Cargar estadísticas
    loadAdminData();
    loadOrders();
    loadOrderPaymentSummary();
    loadUsers();
    loadProducts();
    loadCategories();
    loadCoupons();
    loadSystemConfig();
    loadInventory();
    loadSyscomHealth();
  }, [user, authLoading, navigate, loadOrders]);

  useEffect(() => {
    if (activeTab === 'reports') {
      loadSyscomHealth();
      loadSyscomHealthHistory(selectedSyscomHistoryMinutes);
    }
  }, [activeTab, selectedSyscomHistoryMinutes, loadSyscomHealthHistory]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setCategories([]);
    }
  };

  const loadCoupons = async () => {
    try {
      const response = await couponService.getAllCoupons();
      setCoupons(response.data || []);
    } catch (error) {
      console.error('Error cargando cupones:', error);
      setCoupons([]);
    }
  };

  const loadSystemConfig = async () => {
    try {
      const response = await configService.getSystemConfig();
      const config = response.data;
      setSystemConfig(config);

      if (config?.paymentMethods) {
        setPaymentMethodsForm({
          bankTransfer: Boolean(config.paymentMethods.bankTransfer),
          cash: Boolean(config.paymentMethods.cash),
          creditCard: Boolean(config.paymentMethods.creditCard),
          debitCard: Boolean(config.paymentMethods.debitCard),
          paypal: Boolean(config.paymentMethods.paypal)
        });
      }

      setShippingMethodsForm(Array.isArray(config?.shippingMethods) ? config.shippingMethods : []);
    } catch (error) {
      console.error('Error cargando configuracion del sistema:', error);
    }
  };

  const handlePaymentMethodToggle = (methodKey) => {
    setPaymentMethodsForm((prev) => ({
      ...prev,
      [methodKey]: !prev[methodKey]
    }));
  };

  const handleShippingMethodChange = (index, key, value) => {
    setShippingMethodsForm((prev) => prev.map((method, idx) => {
      if (idx !== index) return method;

      if (key === 'cost') {
        return { ...method, cost: Number(value) || 0 };
      }
      if (key === 'enabled') {
        return { ...method, enabled: Boolean(value) };
      }
      return { ...method, [key]: value };
    }));
  };

  const handleAddShippingMethod = () => {
    setShippingMethodsForm((prev) => ([
      ...prev,
      {
        code: `custom_${prev.length + 1}`,
        name: 'Nuevo metodo',
        enabled: true,
        cost: 0,
        estimatedDays: '2-5 dias habiles'
      }
    ]));
  };

  const handleRemoveShippingMethod = (index) => {
    setShippingMethodsForm((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveSystemConfig = async () => {
    try {
      setIsSavingConfig(true);
      await configService.updatePaymentMethods(paymentMethodsForm);
      await configService.updateShippingMethods(shippingMethodsForm);
      await loadSystemConfig();
      alert('Configuracion guardada correctamente');
    } catch (error) {
      console.error('Error guardando configuracion:', error);
      alert('Error al guardar la configuracion del sistema');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const loadOrderPaymentSummary = async () => {
    try {
      const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        orderService.getAllOrders({ page: 1, limit: 1 }),
        orderService.getAllOrders({ paymentStatus: 'pending_validation', page: 1, limit: 1 }),
        orderService.getAllOrders({ paymentStatus: 'approved', page: 1, limit: 1 }),
        orderService.getAllOrders({ paymentStatus: 'rejected', page: 1, limit: 1 })
      ]);

      setOrderPaymentSummary({
        all: allRes?.pagination?.total || 0,
        pending_validation: pendingRes?.pagination?.total || 0,
        approved: approvedRes?.pagination?.total || 0,
        rejected: rejectedRes?.pagination?.total || 0
      });
    } catch (error) {
      console.error('Error cargando resumen de pagos:', error);
    }
  };

  const handlePaymentFilterChange = async (paymentFilter) => {
    setSelectedPaymentFilter(paymentFilter);
    await loadOrders(paymentFilter, selectedOrderStatusFilter);
  };

  const handleOrderStatusFilterChange = async (orderStatusFilter) => {
    setSelectedOrderStatusFilter(orderStatusFilter);
    await loadOrders(selectedPaymentFilter, orderStatusFilter);
  };

  const toCsvValue = (value) => {
    if (value === undefined || value === null) return '""';
    const safeValue = String(value).replace(/"/g, '""');
    return `"${safeValue}"`;
  };

  const exportFilteredOrdersCsv = async () => {
    try {
      const query = {
        ...buildOrderFilters(selectedPaymentFilter, selectedOrderStatusFilter),
        page: 1,
        limit: 5000,
        sortBy: 'createdAt',
        sortOrder: -1
      };

      const response = await orderService.getAllOrders(query);
      const exportOrders = response.orders || response.data || [];

      if (exportOrders.length === 0) {
        alert('No hay órdenes para exportar con los filtros actuales.');
        return;
      }

      const header = [
        'orderId',
        'cliente',
        'email',
        'total',
        'estadoOrden',
        'estadoPago',
        'metodoPago',
        'referenciaPago',
        'motivoRechazo',
        'fechaCreacion'
      ].join(',');

      const rows = exportOrders.map((order) => ([
        toCsvValue(order.orderId),
        toCsvValue(order.customerName),
        toCsvValue(order.customerEmail),
        toCsvValue(order.total),
        toCsvValue(order.status),
        toCsvValue(order.paymentStatus),
        toCsvValue(order.paymentInfo?.method),
        toCsvValue(order.paymentValidation?.reference),
        toCsvValue(order.paymentValidation?.rejectionReason),
        toCsvValue(new Date(order.createdAt).toISOString())
      ].join(',')));

      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ordenes-${selectedPaymentFilter}-${selectedOrderStatusFilter}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exportando órdenes a CSV:', error);
      alert('No se pudieron exportar las órdenes en CSV.');
    }
  };

  const loadUsers = async () => {
    try {
      const users = await userService.getAllUsers();
      setAllUsers(users || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const products = await productService.getAllProducts();
      setAllProducts(products.products || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const loadInventory = async () => {
    try {
      setIsInventoryLoading(true);
      const response = await inventoryService.getInventory();
      const payload = response?.data || {};
      const products = Array.isArray(payload.products) ? payload.products : [];

      setInventoryData({
        products,
        stats: payload.stats || {
          totalStock: 0,
          totalProducts: products.length,
          lowStockCount: 0,
          outOfStockCount: 0,
          inventoryValue: 0
        }
      });

      setSelectedInventoryIds((previousIds) => (
        previousIds.filter((id) => products.some((product) => product._id === id))
      ));
    } catch (error) {
      console.error('Error cargando inventario:', error);
      setInventoryData({
        products: [],
        stats: {
          totalStock: 0,
          totalProducts: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          inventoryValue: 0
        }
      });
      setSelectedInventoryIds([]);
    } finally {
      setIsInventoryLoading(false);
    }
  };

  const loadSyscomHealth = async () => {
    try {
      setIsLoadingSyscomHealth(true);
      const data = await syscomAdminService.getHealthMetrics();
      setSyscomHealth(data);
    } catch (error) {
      console.error('Error cargando salud de SYSCOM:', error);
      setSyscomHealth(null);
    } finally {
      setIsLoadingSyscomHealth(false);
    }
  };

  const handleRefreshSyscomMetrics = async () => {
    await Promise.all([
      loadSyscomHealth(),
      loadSyscomHealthHistory(selectedSyscomHistoryMinutes)
    ]);
  };

  const handleInventorySelect = (productId, checked) => {
    setSelectedInventoryIds((prev) => {
      if (checked) {
        if (prev.includes(productId)) return prev;
        return [...prev, productId];
      }

      return prev.filter((id) => id !== productId);
    });
  };

  const handleSelectAllInventory = (checked, products) => {
    if (!checked) {
      setSelectedInventoryIds([]);
      return;
    }

    setSelectedInventoryIds(products.map((product) => product._id));
  };

  const handleBulkRestock = async () => {
    if (selectedInventoryIds.length === 0) {
      alert('Selecciona al menos un producto');
      return;
    }

    const quantityInput = window.prompt('Cantidad a sumar al stock de los productos seleccionados:', '5');
    if (quantityInput === null) return;

    const quantity = Number(quantityInput);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      alert('Ingresa una cantidad valida mayor a 0');
      return;
    }

    try {
      await inventoryService.bulkUpdateStock(selectedInventoryIds, quantity, 'add');
      await loadInventory();
      alert('Stock actualizado para los productos seleccionados');
    } catch (error) {
      console.error('Error en reabastecimiento masivo:', error);
      alert('No se pudo actualizar el stock en lote');
    }
  };

  const handleBulkUpdateProductStatus = async (nextActive) => {
    if (selectedInventoryIds.length === 0) {
      alert('Selecciona al menos un producto');
      return;
    }

    const confirmMessage = nextActive
      ? '¿Activar los productos seleccionados?'
      : '¿Desactivar los productos seleccionados?';

    if (!confirm(confirmMessage)) return;

    try {
      await inventoryService.bulkUpdateProductStatus(selectedInventoryIds, nextActive);
      await loadInventory();
      alert(nextActive ? 'Productos activados' : 'Productos desactivados');
    } catch (error) {
      console.error('Error actualizando estado masivo:', error);
      alert('No se pudo actualizar el estado de los productos');
    }
  };

  const handleQuickRestock = async (productId) => {
    const quantityInput = window.prompt('Cantidad a agregar al stock:', '5');
    if (quantityInput === null) return;

    const quantity = Number(quantityInput);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      alert('Ingresa una cantidad valida mayor a 0');
      return;
    }

    try {
      await inventoryService.updateStock(productId, quantity, 'add');
      await loadInventory();
    } catch (error) {
      console.error('Error actualizando stock rapido:', error);
      alert('No se pudo actualizar el stock del producto');
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleApproveOrder = async (orderId) => {
    try {
      const reference = window.prompt('Referencia de pago (opcional):', '');
      await orderService.approveOrderPayment(orderId, { reference: reference || undefined });
      await loadOrders(selectedPaymentFilter, selectedOrderStatusFilter);
      await loadOrderPaymentSummary();
      setShowOrderModal(false);
      alert('Pago validado y orden en proceso');
    } catch (error) {
      console.error('Error aprobando pago:', error);
      alert('Error al aprobar el pago de la orden');
    }
  };

  const handleRejectOrder = async (orderId) => {
    const rejectionReason = window.prompt('Motivo de rechazo del pago:', 'Comprobante invalido');
    if (!rejectionReason) return;

    if (!confirm('¿Confirmas rechazar el pago y cancelar esta orden?')) return;
    try {
      await orderService.rejectOrderPayment(orderId, { rejectionReason });
      await loadOrders(selectedPaymentFilter, selectedOrderStatusFilter);
      await loadOrderPaymentSummary();
      setShowOrderModal(false);
      alert('Pago rechazado y orden cancelada');
    } catch (error) {
      console.error('Error rechazando pago:', error);
      alert('Error al rechazar el pago de la orden');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await orderService.updateOrderStatus(orderId, 'completed');
      await loadOrders(selectedPaymentFilter, selectedOrderStatusFilter);
      await loadOrderPaymentSummary();
      setShowOrderModal(false);
      alert('Orden marcada como completada');
    } catch (error) {
      console.error('Error completando orden:', error);
      alert('Error al completar la orden');
    }
  };

  const handleShipOrder = async (orderId) => {
    const trackingNumber = window.prompt('Ingresa el número de guía (tracking) para enviar al cliente:');
    if (!trackingNumber) return;

    try {
      await orderService.markShippedToCustomer(orderId, { trackingNumber });
      await loadOrders(selectedPaymentFilter, selectedOrderStatusFilter);
      await loadOrderPaymentSummary();
      setShowOrderModal(false);
      alert('Orden marcada como enviada y correo enviado al cliente');
    } catch (error) {
      console.error('Error enviando orden:', error);
      alert('Error al enviar la orden: ' + error.message);
    }
  };

  // Funciones para usuarios
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      await loadUsers();
      alert('Rol actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando rol:', error);
      alert('Error al actualizar el rol');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await userService.deleteUser(userId);
      await loadUsers();
      alert('Usuario eliminado');
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error al eliminar el usuario');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = !currentStatus;
    const confirmMessage = nextStatus
      ? '¿Confirmas bloquear este usuario? No podrá iniciar sesión.'
      : '¿Confirmas desbloquear este usuario?';

    if (!confirm(confirmMessage)) return;

    try {
      await userService.updateUserStatus(userId, nextStatus);
      await loadUsers();
      alert(nextStatus ? 'Usuario bloqueado' : 'Usuario desbloqueado');
    } catch (error) {
      console.error('Error actualizando estado de usuario:', error);
      alert('Error al actualizar el estado del usuario');
    }
  };

  // Funciones para categorías
  const handleSaveCategory = async () => {
    try {
      if (!categoryFormData.name) {
        alert('El nombre de la categoría es requerido');
        return;
      }

      if (selectedCategory) {
        // Actualizar
        await categoryService.updateCategory(selectedCategory._id, categoryFormData);
        alert('Categoría actualizada');
      } else {
        // Crear
        await categoryService.createCategory(categoryFormData);
        alert('Categoría creada');
      }
      await loadCategories();
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Error guardando categoría:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await categoryService.deleteCategory(categoryId);
      await loadCategories();
      alert('Categoría eliminada');
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      alert('Error al eliminar la categoría');
    }
  };

  // Funciones para cupones
  const handleSaveCoupon = async () => {
    try {
      if (!couponFormData.code || !couponFormData.discount || !couponFormData.maxUses || !couponFormData.expiryDate) {
        alert('Todos los campos son requeridos');
        return;
      }

      if (selectedCoupon) {
        // Actualizar
        await couponService.updateCoupon(selectedCoupon._id, couponFormData);
        alert('Cupón actualizado');
      } else {
        // Crear
        await couponService.createCoupon(couponFormData);
        alert('Cupón creado');
      }
      await loadCoupons();
      setShowCouponModal(false);
    } catch (error) {
      console.error('Error guardando cupón:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm('¿Eliminar este cupón?')) return;
    try {
      await couponService.deleteCoupon(couponId);
      await loadCoupons();
      alert('Cupón eliminado');
    } catch (error) {
      console.error('Error eliminando cupón:', error);
      alert('Error al eliminar el cupón');
    }
  };

  // Funciones para productos
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setProductFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      brand: product.brand || '',
      model: product.model || '',
      stock: product.stock || ''
    });
    setShowProductModal(true);
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setProductFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      model: '',
      stock: ''
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (selectedProduct) {
        // Actualizar producto existente
        await productService.updateProduct(selectedProduct._id, productFormData);
        alert('Producto actualizado');
      } else {
        // Crear nuevo producto
        await productService.createProduct(productFormData);
        alert('Producto creado');
      }
      await loadProducts();
      setShowProductModal(false);
    } catch (error) {
      console.error('Error guardando producto:', error);
      alert('Error al guardar el producto');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await productService.deleteProduct(productId);
      await loadProducts();
      alert('Producto eliminado');
    } catch (error) {
      console.error('Error eliminando producto:', error);
      alert('Error al eliminar el producto');
    }
  };

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      setConfigError(null);

      const [statsResponse, ordersResponse, categorySalesResponse, monthlySalesResponse] = await Promise.all([
        requestJson('/api/stats/dashboard'),
        requestJson('/api/stats/recent-orders?limit=5'),
        requestJson('/api/stats/sales-by-category'),
        requestJson('/api/stats/sales-by-month')
      ]);

      if (statsResponse.success) {
        const kpis = statsResponse.data.kpis || {};

        setStats({
          totalOrders: kpis.ordersMonth || 0,
          totalProducts: kpis.totalProducts || 0,
          totalUsers: kpis.totalUsers || 0,
          revenue: kpis.salesMonth || 0
        });

        setReportKpis({
          salesToday: kpis.salesToday || 0,
          salesMonth: kpis.salesMonth || 0,
          ordersToday: kpis.ordersToday || 0,
          ordersMonth: kpis.ordersMonth || 0,
          pendingOrders: kpis.pendingOrders || 0
        });

        // Procesar datos de gráficas si vienen del backend
        if (statsResponse.data.topProducts) {
          setReportTopProducts(statsResponse.data.topProducts);
          setTopProducts(statsResponse.data.topProducts.map((p, idx) => ({
            label: p.name || `Producto ${idx + 1}`,
            value: p.totalSold || 0,
            color: '#007bff'
          })));
        }
      }

      if (categorySalesResponse.success) {
        setSalesByCategory((categorySalesResponse.data || []).map((item, idx) => ({
          label: item.category,
          value: item.sales,
          color: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'][idx % 5]
        })));
      }

      if (monthlySalesResponse.success) {
        setMonthlySales((monthlySalesResponse.data || []).map((item) => ({
          label: item.month,
          value: item.sales
        })));
      }

      if (ordersResponse.success) {
        setRecentOrders((ordersResponse.data || []).map(order => ({
          id: order.id,
          cliente: order.cliente,
          fecha: order.fecha,
          total: order.total,
          estado: order.estado
        })));
      }

    } catch (error) {
      console.error('Error cargando datos del panel:', error);
      setConfigError('No se pudieron cargar los datos del panel. Verifica el backend y tus credenciales.');
      setStats({ totalOrders: 0, totalProducts: 0, totalUsers: 0, revenue: 0 });
      setRecentOrders([]);
      setTopProducts([]);
      setSalesByCategory([]);
      setMonthlySales([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDashboard = () => (
    <Row className="g-4">
      {/* KPIs - Usando el componente KpiCard existente */}
      {isLoading ? (
        <>
          <Col md={3}><KpiCardSkeleton /></Col>
          <Col md={3}><KpiCardSkeleton /></Col>
          <Col md={3}><KpiCardSkeleton /></Col>
          <Col md={3}><KpiCardSkeleton /></Col>
        </>
      ) : (
        <>
          <KpiCard
            title="Órdenes Totales"
            value={stats.totalOrders}
            icon={<FiShoppingCart size={24} className="text-primary" />}
          />
          <KpiCard
            title="Productos"
            value={stats.totalProducts}
            icon={<FiPackage size={24} className="text-success" />}
          />
          <KpiCard
            title="Usuarios"
            value={stats.totalUsers}
            icon={<FiUsers size={24} className="text-info" />}
          />
          <KpiCard
            title="Ingresos"
            value={`$${stats.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            icon={<FiDollarSign size={24} className="text-warning" />}
          />
        </>
      )}

      {/* Gráficas - Usando los componentes de gráficas existentes */}
      <Col md={8}>
        {isLoading ? (
          <ChartSkeleton height={300} />
        ) : (
          <LineChart
            data={monthlySales}
            title="Ventas Mensuales"
            height={300}
            width={700}
          />
        )}
      </Col>

      <Col md={4}>
        {isLoading ? (
          <ChartSkeleton height={300} />
        ) : (
          <DonutChart
            data={salesByCategory}
            title="Ventas por Categoría"
            size={220}
          />
        )}
      </Col>

      <Col md={12}>
        {isLoading ? (
          <ChartSkeleton height={300} />
        ) : (
          <BarChart
            data={topProducts}
            title="Productos Más Vendidos"
            height={300}
          />
        )}
      </Col>

      {/* Tabla de órdenes recientes */}
      <Col md={12}>
        <Card>
          <Card.Header>
            <h5 className="mb-0"><FiTrendingUp className="me-2" />Órdenes Recientes</h5>
          </Card.Header>
          <Card.Body>
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>#ID</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.cliente}</td>
                      <td>{order.fecha}</td>
                      <td>{order.total}</td>
                      <td>
                        <Badge bg={
                          order.estado === 'Completada' ? 'success' :
                          order.estado === 'Pendiente' ? 'warning' : 'info'
                        }>
                          {order.estado}
                        </Badge>
                      </td>
                      <td><Button size="sm" variant="outline-primary">Ver</Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderOrders = () => (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><FiShoppingCart className="me-2" />Gestión de Órdenes</h5>
          <div className="d-flex gap-2">
            <Button size="sm" variant="outline-success" onClick={exportFilteredOrdersCsv}>
              <FiDownload className="me-1" /> Exportar CSV
            </Button>
            <Button size="sm" variant="outline-primary" onClick={() => loadOrders(selectedPaymentFilter, selectedOrderStatusFilter)}>
              Actualizar
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Button
              size="sm"
              variant={selectedPaymentFilter === 'all' ? 'dark' : 'outline-dark'}
              onClick={() => handlePaymentFilterChange('all')}
            >
              Todos ({orderPaymentSummary.all})
            </Button>
            <Button
              size="sm"
              variant={selectedPaymentFilter === 'pending_validation' ? 'warning' : 'outline-warning'}
              onClick={() => handlePaymentFilterChange('pending_validation')}
            >
              Pendiente validación ({orderPaymentSummary.pending_validation})
            </Button>
            <Button
              size="sm"
              variant={selectedPaymentFilter === 'approved' ? 'success' : 'outline-success'}
              onClick={() => handlePaymentFilterChange('approved')}
            >
              Aprobado ({orderPaymentSummary.approved})
            </Button>
            <Button
              size="sm"
              variant={selectedPaymentFilter === 'rejected' ? 'danger' : 'outline-danger'}
              onClick={() => handlePaymentFilterChange('rejected')}
            >
              Rechazado ({orderPaymentSummary.rejected})
            </Button>
          </div>

          <Row className="mb-3">
            <Col md={4} lg={3}>
              <Form.Group>
                <Form.Label className="mb-1">Estado de orden</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedOrderStatusFilter}
                  onChange={(e) => handleOrderStatusFilterChange(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="processing">En proceso</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {isLoading ? (
            <TableSkeleton />
          ) : allOrders.length === 0 ? (
            <Alert variant="info">
              No hay órdenes registradas en el sistema.
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>ID Orden</th>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Pago</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map((order) => (
                  <tr key={order._id}>
                    <td><code>{order.orderId}</code></td>
                    <td>{order.customerName}</td>
                    <td>{order.customerEmail}</td>
                    <td className="fw-bold">${order.total?.toLocaleString('es-MX')}</td>
                    <td>
                      <Badge bg={
                        order.status === 'completed' ? 'success' :
                        order.status === 'processing' ? 'info' :
                        order.status === 'cancelled' ? 'danger' : 'warning'
                      }>
                        {order.status === 'pending' ? 'Pendiente' :
                         order.status === 'processing' ? 'En Proceso' :
                         order.status === 'completed' ? 'Completada' : 'Cancelada'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={
                        order.paymentStatus === 'approved' ? 'success' :
                        order.paymentStatus === 'rejected' ? 'danger' : 'warning'
                      }>
                        {order.paymentStatus === 'approved' ? 'Aprobado' :
                         order.paymentStatus === 'rejected' ? 'Rechazado' : 'Pendiente validacion'}
                      </Badge>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString('es-MX')}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => handleViewOrder(order)}
                      >
                        <FiEye /> Ver
                      </Button>
                      {order.status === 'pending' && order.paymentStatus !== 'approved' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApproveOrder(order._id)}
                        >
                          <FiCheck /> Validar pago
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de detalle de orden */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalle de Orden {selectedOrder?.orderId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <h6>Información del Cliente</h6>
                  <p className="mb-1"><strong>Nombre:</strong> {selectedOrder.customerName}</p>
                  <p className="mb-1"><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                  {selectedOrder.customerPhone && (
                    <p className="mb-1"><strong>Teléfono:</strong> {selectedOrder.customerPhone}</p>
                  )}
                </Col>
                <Col md={6}>
                  <h6>Dirección de Envío</h6>
                  <p className="mb-1">{selectedOrder.shippingAddress?.street} {selectedOrder.shippingAddress?.number}</p>
                  <p className="mb-1">{selectedOrder.shippingAddress?.neighborhood}</p>
                  <p className="mb-1">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                  <p className="mb-1">CP: {selectedOrder.shippingAddress?.zipCode}</p>
                </Col>
              </Row>

              <h6>Productos</h6>
              <Table responsive size="sm" bordered>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.products?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.product?.name || 'Producto'}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price?.toLocaleString('es-MX')}</td>
                      <td>${(item.price * item.quantity).toLocaleString('es-MX')}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="text-end">
                <p className="mb-1"><strong>Subtotal:</strong> ${selectedOrder.subtotal?.toLocaleString('es-MX')}</p>
                <p className="mb-1"><strong>Envío:</strong> ${selectedOrder.shippingCost?.toLocaleString('es-MX')}</p>
                <h5 className="text-primary"><strong>Total:</strong> ${selectedOrder.total?.toLocaleString('es-MX')}</h5>
              </div>

              <div className="mt-3">
                <h6>Estado Actual</h6>
                <Badge bg={
                  selectedOrder.status === 'completed' ? 'success' :
                  selectedOrder.status === 'processing' ? 'info' :
                  selectedOrder.status === 'cancelled' ? 'danger' : 'warning'
                } className="p-2">
                  {selectedOrder.status === 'pending' ? 'Pendiente de Validación' :
                   selectedOrder.status === 'processing' ? 'En Proceso de Preparación' :
                   selectedOrder.status === 'completed' ? 'Completada y Entregada' : 'Cancelada'}
                </Badge>
                <div className="mt-2">
                  <Badge bg={
                    selectedOrder.paymentStatus === 'approved' ? 'success' :
                    selectedOrder.paymentStatus === 'rejected' ? 'danger' : 'warning'
                  } className="p-2">
                    {selectedOrder.paymentStatus === 'approved' ? 'Pago Aprobado' :
                     selectedOrder.paymentStatus === 'rejected' ? 'Pago Rechazado' : 'Pago Pendiente de Validación'}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedOrder?.status === 'pending' && selectedOrder?.paymentStatus !== 'approved' && (
            <>
              <Button variant="danger" onClick={() => handleRejectOrder(selectedOrder._id)}>
                <FiX /> Rechazar pago
              </Button>
              <Button variant="success" onClick={() => handleApproveOrder(selectedOrder._id)}>
                <FiCheck /> Aprobar pago y procesar
              </Button>
            </>
          )}
          {(selectedOrder?.status === 'pending' || selectedOrder?.status === 'processing') && selectedOrder?.paymentStatus === 'approved' && (
            <Button variant="info" className="text-white" onClick={() => handleShipOrder(selectedOrder._id)}>
              <FiTruck /> Marcar como Enviada
            </Button>
          )}
          {selectedOrder?.status === 'processing' && (
            <Button variant="success" onClick={() => handleCompleteOrder(selectedOrder._id)}>
              <FiCheck /> Marcar como Completada
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );

  const renderProducts = () => (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><FiPackage className="me-2" />Gestión de Productos</h5>
          <Button size="sm" variant="primary" onClick={handleCreateProduct}>
            <FiPlus /> Nuevo Producto
          </Button>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <TableSkeleton />
          ) : allProducts.length === 0 ? (
            <Alert variant="info">
              No hay productos en el sistema. Crea uno nuevo.
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Marca</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {allProducts.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category || 'N/A'}</td>
                    <td>{product.brand || 'N/A'}</td>
                    <td className="fw-bold">${product.price?.toLocaleString('es-MX')}</td>
                    <td>
                      <Badge bg={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}>
                        {product.stock} unidades
                      </Badge>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => handleViewProduct(product)}
                      >
                        <FiEdit />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <FiTrash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de producto */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                    placeholder="Ej: Switch 24 puertos"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Categoría *</Form.Label>
                  <Form.Control
                    type="text"
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({...productFormData, category: e.target.value})}
                    placeholder="Ej: Redes"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Marca</Form.Label>
                  <Form.Control
                    type="text"
                    value={productFormData.brand}
                    onChange={(e) => setProductFormData({...productFormData, brand: e.target.value})}
                    placeholder="Ej: TP-Link"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Modelo</Form.Label>
                  <Form.Control
                    type="text"
                    value={productFormData.model}
                    onChange={(e) => setProductFormData({...productFormData, model: e.target.value})}
                    placeholder="Ej: TL-SG1024D"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={productFormData.description}
                onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                placeholder="Descripción del producto"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio *</Form.Label>
                  <Form.Control
                    type="number"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({...productFormData, price: e.target.value})}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock *</Form.Label>
                  <Form.Control
                    type="number"
                    value={productFormData.stock}
                    onChange={(e) => setProductFormData({...productFormData, stock: e.target.value})}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveProduct}>
            {selectedProduct ? 'Actualizar' : 'Crear'} Producto
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );

  const renderUsers = () => (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><FiUsers className="me-2" />Gestión de Usuarios</h5>
          <Button size="sm" variant="outline-primary" onClick={loadUsers}>
            Actualizar
          </Button>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <TableSkeleton />
          ) : allUsers.length === 0 ? (
            <Alert variant="info">
              No hay usuarios registrados en el sistema.
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((userItem) => (
                  <tr key={userItem._id}>
                    <td>{userItem.name}</td>
                    <td>{userItem.email}</td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={userItem.role}
                        onChange={(e) => handleChangeUserRole(userItem._id, e.target.value)}
                        disabled={userItem._id === user?.sub}
                      >
                        <option value="user">Cliente</option>
                        <option value="admin">Administrador</option>
                      </Form.Select>
                    </td>
                    <td>
                      <Badge bg={userItem.isBlocked ? 'danger' : 'success'}>
                        {userItem.isBlocked ? 'Bloqueado' : 'Activo'}
                      </Badge>
                    </td>
                    <td>{new Date(userItem.createdAt).toLocaleDateString('es-MX')}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => handleViewUser(userItem)}
                      >
                        <FiEye />
                      </Button>
                      {userItem._id !== user?.sub && (
                        <>
                          <Button
                            size="sm"
                            variant={userItem.isBlocked ? 'outline-success' : 'outline-warning'}
                            className="me-2"
                            onClick={() => handleToggleUserStatus(userItem._id, userItem.isBlocked)}
                          >
                            {userItem.isBlocked ? 'Desbloquear' : 'Bloquear'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteUser(userItem._id)}
                          >
                            <FiTrash2 />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de detalle de usuario */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Detalle de Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p><strong>Nombre:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Rol:</strong> <Badge bg={selectedUser.role === 'admin' ? 'danger' : 'primary'}>
                {selectedUser.role === 'admin' ? 'Administrador' : 'Cliente'}
              </Badge></p>
              <p><strong>Estado:</strong> <Badge bg={selectedUser.isBlocked ? 'danger' : 'success'}>
                {selectedUser.isBlocked ? 'Bloqueado' : 'Activo'}
              </Badge></p>
              <p><strong>Fecha de registro:</strong> {new Date(selectedUser.createdAt).toLocaleString('es-MX')}</p>
              {selectedUser.phone && <p><strong>Teléfono:</strong> {selectedUser.phone}</p>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );

  const renderSettings = () => (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Configuración</h5>
      </Card.Header>
      <Card.Body>
        {!systemConfig ? (
          <Alert variant="warning">No se pudo cargar la configuracion del sistema.</Alert>
        ) : (
          <>
            <h6 className="mb-3">Metodos de pago habilitados</h6>
            <Row className="mb-4">
              <Col md={4}><Form.Check type="switch" label="Transferencia bancaria" checked={paymentMethodsForm.bankTransfer} onChange={() => handlePaymentMethodToggle('bankTransfer')} /></Col>
              <Col md={4}><Form.Check type="switch" label="Efectivo" checked={paymentMethodsForm.cash} onChange={() => handlePaymentMethodToggle('cash')} /></Col>
              <Col md={4}><Form.Check type="switch" label="Tarjeta de credito" checked={paymentMethodsForm.creditCard} onChange={() => handlePaymentMethodToggle('creditCard')} /></Col>
              <Col md={4}><Form.Check type="switch" label="Tarjeta de debito" checked={paymentMethodsForm.debitCard} onChange={() => handlePaymentMethodToggle('debitCard')} /></Col>
              <Col md={4}><Form.Check type="switch" label="PayPal" checked={paymentMethodsForm.paypal} onChange={() => handlePaymentMethodToggle('paypal')} /></Col>
            </Row>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Metodos de envio</h6>
              <Button size="sm" variant="outline-primary" onClick={handleAddShippingMethod}>Agregar metodo</Button>
            </div>

            {shippingMethodsForm.length === 0 ? (
              <Alert variant="info">No hay metodos de envio configurados.</Alert>
            ) : (
              <Table responsive bordered>
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Nombre</th>
                    <th>Costo</th>
                    <th>Tiempo estimado</th>
                    <th>Activo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingMethodsForm.map((method, idx) => (
                    <tr key={`${method.code}-${idx}`}>
                      <td>
                        <Form.Control size="sm" value={method.code} onChange={(e) => handleShippingMethodChange(idx, 'code', e.target.value)} />
                      </td>
                      <td>
                        <Form.Control size="sm" value={method.name} onChange={(e) => handleShippingMethodChange(idx, 'name', e.target.value)} />
                      </td>
                      <td style={{ minWidth: '120px' }}>
                        <Form.Control size="sm" type="number" value={method.cost} onChange={(e) => handleShippingMethodChange(idx, 'cost', e.target.value)} />
                      </td>
                      <td>
                        <Form.Control size="sm" value={method.estimatedDays} onChange={(e) => handleShippingMethodChange(idx, 'estimatedDays', e.target.value)} />
                      </td>
                      <td>
                        <Form.Check type="switch" checked={method.enabled} onChange={(e) => handleShippingMethodChange(idx, 'enabled', e.target.checked)} />
                      </td>
                      <td>
                        <Button size="sm" variant="outline-danger" onClick={() => handleRemoveShippingMethod(idx)}>Eliminar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            <div className="text-end mt-3">
              <Button variant="primary" onClick={handleSaveSystemConfig} disabled={isSavingConfig}>
                {isSavingConfig ? 'Guardando...' : 'Guardar configuracion'}
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );

  const renderReports = () => (
    (() => {
      const historyPoints = Array.isArray(syscomHealthHistory?.points) ? syscomHealthHistory.points : [];
      const latencyHistoryData = historyPoints.map((point) => ({
        label: point.label,
        value: Number(point.searchAvgLatencyMs || 0)
      }));
      const failureHistoryData = historyPoints.map((point) => ({
        label: point.label,
        value: Number(point.totalFailed || 0)
      }));

      return (
    <Row className="g-4">
      <Col md={12}>
        <Card>
          <Card.Header>
            <h5 className="mb-0"><FiTrendingUp className="me-2" />Reportes de Ventas</h5>
          </Card.Header>
          <Card.Body>
            <Row className="mb-4">
              <Col md={3}>
                <div className="report-card p-3 border rounded" style={{backgroundColor: '#f0f7ff'}}>
                  <h6>Ventas Totales (Mes)</h6>
                  <h3 className="text-success">${reportKpis.salesMonth.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h3>
                  <p className="text-muted mb-0">Dato real del backend</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="report-card p-3 border rounded" style={{backgroundColor: '#f0f7ff'}}>
                  <h6>Órdenes del Mes</h6>
                  <h3 className="text-primary">{reportKpis.ordersMonth}</h3>
                  <p className="text-muted mb-0">Dato real del backend</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="report-card p-3 border rounded" style={{backgroundColor: '#f0f7ff'}}>
                  <h6>Ventas de Hoy</h6>
                  <h3 className="text-info">${reportKpis.salesToday.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h3>
                  <p className="text-muted mb-0">Dato real del backend</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="report-card p-3 border rounded" style={{backgroundColor: '#f0f7ff'}}>
                  <h6>Órdenes Pendientes</h6>
                  <h3 className="text-warning">{reportKpis.pendingOrders}</h3>
                  <p className="text-muted mb-0">Dato real del backend</p>
                </div>
              </Col>
            </Row>

            <h6 className="mb-3">Productos Top 5</h6>
            <Table responsive size="sm" bordered>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Ventas</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {reportTopProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">Sin datos de productos vendidos.</td>
                  </tr>
                ) : (
                  reportTopProducts.map((product, idx) => (
                    <tr key={`${product.name}-${idx}`}>
                      <td>{product.name}</td>
                      <td>{product.totalSold} unidades</td>
                      <td>${Number(product.revenue || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>

      <Col md={12}>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0"><FiTrendingUp className="me-2" />Salud de Integración SYSCOM</h5>
            <Button
              size="sm"
              variant="outline-primary"
              onClick={handleRefreshSyscomMetrics}
              disabled={isLoadingSyscomHealth || isLoadingSyscomHealthHistory}
            >
              {isLoadingSyscomHealth || isLoadingSyscomHealthHistory ? 'Actualizando...' : 'Actualizar métricas'}
            </Button>
          </Card.Header>
          <Card.Body>
            {!syscomHealth ? (
              <Alert variant="warning" className="mb-0">No se pudieron cargar métricas de SYSCOM.</Alert>
            ) : (
              <>
                <Row className="mb-4">
                  <Col md={3}>
                    <div className="p-3 border rounded" style={{ backgroundColor: '#f0f7ff' }}>
                      <h6>Entradas en Cache</h6>
                      <h3 className="text-primary">{Number(syscomHealth.cacheEntries || 0)}</h3>
                      <p className="text-muted mb-0">TTL: {Number(syscomHealth.cacheTtlMs || 0)} ms</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3 border rounded" style={{ backgroundColor: '#e8f9ef' }}>
                      <h6>Search Latencia Promedio</h6>
                      <h3 className="text-success">{Number(syscomHealth.endpoints?.search?.avgLatencyMs || 0)} ms</h3>
                      <p className="text-muted mb-0">Última: {Number(syscomHealth.endpoints?.search?.lastLatencyMs || 0)} ms</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3 border rounded" style={{ backgroundColor: '#fff7e8' }}>
                      <h6>Super Precio Latencia Promedio</h6>
                      <h3 className="text-warning">{Number(syscomHealth.endpoints?.superPrecio?.avgLatencyMs || 0)} ms</h3>
                      <p className="text-muted mb-0">Última: {Number(syscomHealth.endpoints?.superPrecio?.lastLatencyMs || 0)} ms</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3 border rounded" style={{ backgroundColor: '#fff0f0' }}>
                      <h6>Errores Totales</h6>
                      <h3 className="text-danger">
                        {Number(syscomHealth.endpoints?.search?.failed || 0) + Number(syscomHealth.endpoints?.superPrecio?.failed || 0)}
                      </h3>
                      <p className="text-muted mb-0">Search + Super Precio</p>
                    </div>
                  </Col>
                </Row>

                <Table responsive bordered size="sm">
                  <thead>
                    <tr>
                      <th>Endpoint</th>
                      <th>Total</th>
                      <th>Éxitos</th>
                      <th>Fallos</th>
                      <th>Cache Hit</th>
                      <th>Stale Cache</th>
                      <th>Latencia Promedio</th>
                      <th>Último Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(syscomHealth.endpoints || {}).map(([endpoint, metric]) => (
                      <tr key={endpoint}>
                        <td><strong>{endpoint}</strong></td>
                        <td>{Number(metric?.total || 0)}</td>
                        <td>{Number(metric?.success || 0)}</td>
                        <td>{Number(metric?.failed || 0)}</td>
                        <td>{Number(metric?.cacheHit || 0)}</td>
                        <td>{Number(metric?.staleCacheHit || 0)}</td>
                        <td>{Number(metric?.avgLatencyMs || 0)} ms</td>
                        <td>{metric?.lastError || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <p className="text-muted mb-0">
                  Métricas en memoria desde: {syscomHealth.uptimeStartedAt ? new Date(syscomHealth.uptimeStartedAt).toLocaleString('es-MX') : 'N/D'}
                </p>

                <hr className="my-4" />

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                  <h6 className="mb-0">Histórico Persistente</h6>
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant={selectedSyscomHistoryMinutes === 60 ? 'primary' : 'outline-primary'}
                      onClick={() => setSelectedSyscomHistoryMinutes(60)}
                    >
                      1h
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedSyscomHistoryMinutes === 180 ? 'primary' : 'outline-primary'}
                      onClick={() => setSelectedSyscomHistoryMinutes(180)}
                    >
                      3h
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedSyscomHistoryMinutes === 720 ? 'primary' : 'outline-primary'}
                      onClick={() => setSelectedSyscomHistoryMinutes(720)}
                    >
                      12h
                    </Button>
                  </div>
                </div>

                {isLoadingSyscomHealthHistory ? (
                  <ChartSkeleton height={260} />
                ) : historyPoints.length === 0 ? (
                  <Alert variant="info" className="mb-0">Aún no hay snapshots históricos en MongoDB para este rango.</Alert>
                ) : (
                  <Row className="g-3">
                    <Col md={6}>
                      <LineChart
                        data={latencyHistoryData}
                        title="Latencia promedio Search (ms)"
                        height={260}
                        width={420}
                      />
                    </Col>
                    <Col md={6}>
                      <LineChart
                        data={failureHistoryData}
                        title="Fallos acumulados Search + Super Precio"
                        height={260}
                        width={420}
                      />
                    </Col>
                  </Row>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
      );
    })()
  );

  const renderCategories = () => (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><FiPackage className="me-2" />Gestión de Categorías</h5>
          <Button size="sm" variant="primary" onClick={() => {
            setSelectedCategory(null);
            setCategoryFormData({ name: '', description: '' });
            setShowCategoryModal(true);
          }}>
            <FiPlus /> Nueva Categoría
          </Button>
        </Card.Header>
        <Card.Body>
          {categories.length === 0 ? (
            <Alert variant="info">No hay categorías registradas.</Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Productos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td><strong>{cat.name}</strong></td>
                    <td>{cat.description}</td>
                    <td><Badge bg="secondary">12 productos</Badge></td>
                    <td>
                      <Button size="sm" variant="outline-primary" className="me-2" onClick={() => {
                        setSelectedCategory(cat);
                        setCategoryFormData({ name: cat.name, description: cat.description });
                        setShowCategoryModal(true);
                      }}>
                        <FiEdit />
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDeleteCategory(cat._id)}>
                        <FiTrash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                placeholder="Ej: Networking"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                placeholder="Descripción de la categoría"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSaveCategory}>
            {selectedCategory ? 'Actualizar' : 'Crear'} Categoría
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );

  const renderInventory = () => {
    const products = inventoryData.products || [];
    const lowStockProducts = products.filter((product) => Number(product.stock || 0) < inventoryThreshold);
    const selectedSet = new Set(selectedInventoryIds);
    const allSelected = lowStockProducts.length > 0 && lowStockProducts.every((product) => selectedSet.has(product._id));

    return (
      <Card>
        <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 className="mb-0"><FiPackage className="me-2" />Control de Inventario</h5>
          <div className="d-flex gap-2 align-items-center">
            <Form.Label className="mb-0">Umbral bajo stock</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={inventoryThreshold}
              onChange={(e) => setInventoryThreshold(Math.max(1, Number(e.target.value) || 1))}
              style={{ width: '90px' }}
            />
            <Button variant="outline-primary" size="sm" onClick={loadInventory} disabled={isInventoryLoading}>
              {isInventoryLoading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={3}>
              <div className="p-3 border rounded" style={{ backgroundColor: '#f0f7ff' }}>
                <h6>Stock Total</h6>
                <h3 className="text-primary">{Number(inventoryData.stats.totalStock || 0).toLocaleString('es-MX')}</h3>
                <p className="text-muted mb-0">unidades</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3 border rounded" style={{ backgroundColor: '#fff3cd' }}>
                <h6>Bajo Stock</h6>
                <h3 className="text-warning">{lowStockProducts.length}</h3>
                <p className="text-muted mb-0">productos con &lt; {inventoryThreshold} unidades</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3 border rounded" style={{ backgroundColor: '#f8d7da' }}>
                <h6>Sin Stock</h6>
                <h3 className="text-danger">{Number(inventoryData.stats.outOfStockCount || 0)}</h3>
                <p className="text-muted mb-0">productos agotados</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3 border rounded" style={{ backgroundColor: '#d4edda' }}>
                <h6>Valor Inventario</h6>
                <h3 className="text-success">
                  ${Number(inventoryData.stats.inventoryValue || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-muted mb-0">valor total en stock</p>
              </div>
            </Col>
          </Row>

          <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
            <h6 className="mb-0">Productos con bajo stock</h6>
            <div className="d-flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline-success"
                onClick={handleBulkRestock}
                disabled={selectedInventoryIds.length === 0 || isInventoryLoading}
              >
                Reabastecer seleccionados ({selectedInventoryIds.length})
              </Button>
              <Button
                size="sm"
                variant="outline-warning"
                onClick={() => handleBulkUpdateProductStatus(false)}
                disabled={selectedInventoryIds.length === 0 || isInventoryLoading}
              >
                Desactivar seleccionados
              </Button>
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => handleBulkUpdateProductStatus(true)}
                disabled={selectedInventoryIds.length === 0 || isInventoryLoading}
              >
                Activar seleccionados
              </Button>
            </div>
          </div>

          {isInventoryLoading ? (
            <TableSkeleton rows={6} columns={7} />
          ) : lowStockProducts.length === 0 ? (
            <Alert variant="success" className="mb-0">No hay productos por debajo del umbral actual.</Alert>
          ) : (
            <Table responsive hover size="sm">
              <thead>
                <tr>
                  <th>
                    <Form.Check
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAllInventory(e.target.checked, lowStockProducts)}
                    />
                  </th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Stock Actual</th>
                  <th>Estado Stock</th>
                  <th>Estado Producto</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product) => {
                  const stock = Number(product.stock || 0);
                  const stockBadge = stock === 0 ? 'danger' : 'warning';

                  return (
                    <tr key={product._id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedSet.has(product._id)}
                          onChange={(e) => handleInventorySelect(product._id, e.target.checked)}
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>{product.category || 'Sin categoría'}</td>
                      <td>{stock}</td>
                      <td>
                        <Badge bg={stockBadge}>
                          {stock === 0 ? 'Sin Stock' : 'Bajo Stock'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={product.active === false ? 'secondary' : 'success'}>
                          {product.active === false ? 'Inactivo' : 'Activo'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleQuickRestock(product._id)}
                        >
                          Reabastecer
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderCoupons = () => (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">💰 Gestión de Cupones y Promociones</h5>
          <Button size="sm" variant="primary" onClick={() => {
            setSelectedCoupon(null);
            setCouponFormData({ code: '', discount: '', type: 'percentage', maxUses: '', expiryDate: '' });
            setShowCouponModal(true);
          }}>
            <FiPlus /> Nuevo Cupón
          </Button>
        </Card.Header>
        <Card.Body>
          {coupons.length === 0 ? (
            <Alert variant="info">No hay cupones registrados.</Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descuento</th>
                  <th>Tipo</th>
                  <th>Usos</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id}>
                    <td><code>{coupon.code}</code></td>
                    <td className="fw-bold">
                      {coupon.type === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`}
                    </td>
                    <td>{coupon.type === 'percentage' ? 'Porcentaje' : 'Cantidad Fija'}</td>
                    <td>{coupon.usedCount}/{coupon.maxUses}</td>
                    <td>{new Date(coupon.expiryDate).toLocaleDateString('es-MX')}</td>
                    <td>
                      <Badge bg={coupon.active ? 'success' : 'secondary'}>
                        {coupon.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td>
                      <Button size="sm" variant="outline-primary" className="me-2" onClick={() => {
                        setSelectedCoupon(coupon);
                        setCouponFormData({
                          code: coupon.code,
                          discount: coupon.discount,
                          type: coupon.type,
                          maxUses: coupon.maxUses,
                          expiryDate: coupon.expiryDate.split('T')[0]
                        });
                        setShowCouponModal(true);
                      }}>
                        <FiEdit />
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDeleteCoupon(coupon._id)}>
                        <FiTrash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showCouponModal} onHide={() => setShowCouponModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Código *</Form.Label>
              <Form.Control
                type="text"
                value={couponFormData.code}
                onChange={(e) => setCouponFormData({...couponFormData, code: e.target.value.toUpperCase()})}
                placeholder="Ej: DESCUENTO10"
                disabled={!!selectedCoupon}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo *</Form.Label>
                  <Form.Select
                    value={couponFormData.type}
                    onChange={(e) => setCouponFormData({...couponFormData, type: e.target.value})}
                  >
                    <option value="percentage">Porcentaje %</option>
                    <option value="fixed">Cantidad Fija $</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Descuento *</Form.Label>
                  <Form.Control
                    type="number"
                    value={couponFormData.discount}
                    onChange={(e) => setCouponFormData({...couponFormData, discount: e.target.value})}
                    placeholder={couponFormData.type === 'percentage' ? '10' : '50'}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max. Usos *</Form.Label>
                  <Form.Control
                    type="number"
                    value={couponFormData.maxUses}
                    onChange={(e) => setCouponFormData({...couponFormData, maxUses: e.target.value})}
                    placeholder="100"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Vencimiento *</Form.Label>
                  <Form.Control
                    type="date"
                    value={couponFormData.expiryDate}
                    onChange={(e) => setCouponFormData({...couponFormData, expiryDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCouponModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSaveCoupon}>
            {selectedCoupon ? 'Actualizar' : 'Crear'} Cupón
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );

  return (
    <div className="admin-panel">
      <Container fluid className="py-4">
        <Row>
          <Col md={12}>
            <div className="admin-header mb-4">
              <h2>Panel de Administración</h2>
              <p className="text-muted">Bienvenido, {user?.name}</p>
            </div>
          </Col>
        </Row>

        {configError && (
          <Row className="mb-3">
            <Col md={12}>
              <Alert variant="warning" className="mb-0">
                {configError}
              </Alert>
            </Col>
          </Row>
        )}

        <Row>
          <Col md={2}>
            <Card className="admin-sidebar">
              <Card.Body className="p-0">
                <Nav className="flex-column">
                  <Nav.Link
                    className={activeTab === 'dashboard' ? 'active' : ''}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <FiBarChart2 className="me-2" /> Dashboard
                  </Nav.Link>
                  <Nav.Link
                    className={activeTab === 'orders' ? 'active' : ''}
                    onClick={() => setActiveTab('orders')}
                  >
                    <FiShoppingCart className="me-2" /> Órdenes
                  </Nav.Link>
                  <Nav.Link
                    className={activeTab === 'products' ? 'active' : ''}
                    onClick={() => setActiveTab('products')}
                  >
                    <FiPackage className="me-2" /> Productos
                  </Nav.Link>
                  <Nav.Link
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                  >
                    <FiUsers className="me-2" /> Usuarios
                  </Nav.Link>
                  <Nav.Link
                    className={activeTab === 'settings' ? 'active' : ''}
                    onClick={() => setActiveTab('settings')}
                  >
                    <FiSettings className="me-2" /> Configuración
                  </Nav.Link>
                  <hr />
                  <h6 className="px-3 mt-3 mb-2 text-muted">Más módulos</h6>
                  <Nav.Link
                    className={activeTab === 'reports' ? 'active' : ''}
                    onClick={() => setActiveTab('reports')}
                  >
                    <FiTrendingUp className="me-2" /> Reportes
                  </Nav.Link>
                  <Nav.Link
                    className={activeTab === 'categories' ? 'active' : ''}
                    onClick={() => setActiveTab('categories')}
                  >
                    <FiPackage className="me-2" /> Categorías
                  </Nav.Link>
                  <Nav.Link
                    className={activeTab === 'inventory' ? 'active' : ''}
                    onClick={() => setActiveTab('inventory')}
                  >
                    📦 Inventario
                  </Nav.Link>
                  <Nav.Link
                    className={activeTab === 'coupons' ? 'active' : ''}
                    onClick={() => setActiveTab('coupons')}
                  >
                    💰 Cupones
                  </Nav.Link>
                  <hr />
                  <Nav.Link onClick={() => navigate('/tienda')}>
                    🛍️ Ver Catálogo
                  </Nav.Link>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col md={10}>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'settings' && renderSettings()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'categories' && renderCategories()}
            {activeTab === 'inventory' && renderInventory()}
            {activeTab === 'coupons' && renderCoupons()}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
