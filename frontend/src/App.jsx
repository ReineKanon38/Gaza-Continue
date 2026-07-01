import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
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
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route path="/catalogo" element={<Dashboard />} />
        <Route path="/super-precio" element={<SuperPrecio />} />
        <Route path="/orders/:id" element={<OrderTracking />} />
        {/* Si tuvieras más rutas de admin, irían aquí dentro.
        <Route path="/app/perfil" element={<Perfil />} />
        <Route path="/app/configuracion" element={<Configuracion />} /> 
        */}
      </Route>
      
      {/* Opcional: Una ruta "catch-all" para páginas no encontradas */}
      <Route path="*" element={<h2>Error 404: Página no encontrada</h2>} />

    </Routes>
    </Suspense>
  );
}

export default App;
