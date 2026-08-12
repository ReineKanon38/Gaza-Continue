import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// --- 1. IMPORTAR EL GUARDIÁN ---
import ProtectedRoute from './components/ProtectedRoute';

const Index = lazy(() => import('./pages/Index'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Profile = lazy(() => import('./pages/Profile'));
const Reset = lazy(() => import('./pages/Reset'));
const ResetConfirm = lazy(() => import('./pages/ResetConfirm'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const SuperPrecio = lazy(() => import('./pages/SuperPrecio'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));

function App() {
  return (
    <Suspense fallback={<div className="text-center mt-5">Cargando...</div>}>
    <Routes>
      {/* --- Rutas Públicas --- */}
      {/* Cualquiera puede ver estas */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset" element={<Reset />} />
      <Route path="/reset/:token" element={<ResetConfirm />} />

      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      {/* --- Rutas Protegidas --- */}
      {/* Usamos el guardián. Solo se puede acceder si 'userLoggedIn' es 'true' */}
      <Route element={<ProtectedRoute />}>
        {/* ── Rutas principales (URL limpias y profesionales) ── */}
        <Route path="/tienda" element={<Catalog />} />
        <Route path="/ofertas" element={<SuperPrecio />} />
        <Route path="/mi-cuenta" element={<Profile />} />
        <Route path="/mis-pedidos/:id" element={<OrderTracking />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route path="/categorias" element={<Dashboard />} />
        {/* ── Redirecciones desde URLs antiguas (backwards compat) ── */}
        <Route path="/catalog" element={<Navigate replace to="/tienda" />} />
        <Route path="/super-precio" element={<Navigate replace to="/ofertas" />} />
        <Route path="/profile" element={<Navigate replace to="/mi-cuenta" />} />
        <Route path="/orders/:id" element={<Navigate replace to="/mis-pedidos/:id" />} />
        <Route path="/catalogo" element={<Navigate replace to="/categorias" />} />
      </Route>
      
      {/* Opcional: Una ruta "catch-all" para páginas no encontradas */}
      <Route path="*" element={<h2>Error 404: Página no encontrada</h2>} />

    </Routes>
    </Suspense>
  );
}

export default App;
