// src/controllers/statsController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

// Obtener KPIs principales para el dashboard
export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        // Ventas del día
        const todayOrders = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay },
                    status: { $in: ['completed', 'processing'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$total" },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        // Ventas del mes
        const monthlyOrders = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth },
                    status: { $in: ['completed', 'processing'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$total" },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        // Productos más vendidos
        const topProducts = await Order.aggregate([
            { $match: { status: { $in: ['completed'] } } },
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.product",
                    totalSold: { $sum: "$products.quantity" },
                    revenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $project: {
                    name: "$productInfo.name",
                    totalSold: 1,
                    revenue: 1
                }
            }
        ]);

        // Estadísticas generales
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments({ active: true });
        const pendingOrders = await Order.countDocuments({ status: 'pending' });

        // Formatear respuesta
        const stats = {
            kpis: {
                salesToday: todayOrders[0]?.totalSales || 0,
                salesMonth: monthlyOrders[0]?.totalSales || 0,
                ordersToday: todayOrders[0]?.orderCount || 0,
                ordersMonth: monthlyOrders[0]?.orderCount || 0,
                totalUsers,
                totalProducts,
                pendingOrders
            },
            topProducts: topProducts || []
        };

        return sendSuccess(res, { data: stats });

    } catch (err) {
        logger.error('Error obteniendo estadisticas dashboard', { message: err.message });
        return sendError(res, {
            status: 500,
            message: "Error al obtener estadísticas",
            error: err.message
        });
    }
};

// Obtener órdenes recientes para la tabla del dashboard
export const getRecentOrders = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .populate('products.product', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('user products total status createdAt');

        // Formatear para la tabla
        const formattedOrders = recentOrders.map(order => ({
            id: order._id,
            cliente: order.user?.name || 'Usuario desconocido',
            productos: order.products.map(item => item.product?.name || 'Producto').join(', '),
            total: `$${order.total.toFixed(2)}`,
            estado: order.status,
            fecha: order.createdAt.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }));

        return sendSuccess(res, { data: formattedOrders });

    } catch (err) {
        logger.error('Error obteniendo ordenes recientes', { message: err.message });
        return sendError(res, {
            status: 500,
            message: "Error al obtener órdenes recientes",
            error: err.message
        });
    }
};

// Obtener datos para gráficas de ventas por categoría
export const getSalesByCategory = async (req, res) => {
    try {
        const salesByCategory = await Order.aggregate([
            { $match: { status: { $in: ['completed'] } } },
            { $unwind: "$products" },
            {
                $lookup: {
                    from: "products",
                    localField: "products.product",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $group: {
                    _id: "$productInfo.category",
                    totalSales: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
                    itemsSold: { $sum: "$products.quantity" }
                }
            },
            { $sort: { totalSales: -1 } }
        ]);

        return sendSuccess(res, {
            data: salesByCategory.map(item => ({
                category: item._id || 'Sin categoría',
                sales: item.totalSales,
                items: item.itemsSold
            }))
        });

    } catch (err) {
        logger.error('Error obteniendo ventas por categoria', { message: err.message });
        return sendError(res, {
            status: 500,
            message: "Error al obtener ventas por categoría",
            error: err.message
        });
    }
};

// Obtener datos de ventas por mes (últimos 6 meses)
export const getSalesByMonth = async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const salesByMonth = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    status: { $in: ['completed'] }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalSales: { $sum: "$total" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const formattedData = salesByMonth.map(item => ({
            month: `${item._id.month}/${item._id.year}`,
            sales: item.totalSales,
            orders: item.orderCount
        }));

        return sendSuccess(res, { data: formattedData });

    } catch (err) {
        logger.error('Error obteniendo ventas por mes', { message: err.message });
        return sendError(res, {
            status: 500,
            message: "Error al obtener ventas por mes",
            error: err.message
        });
    }
};