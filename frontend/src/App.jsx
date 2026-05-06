import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Reset from './pages/Reset';
import AdminPanel from './pages/AdminPanel';
import SuperPrecio from './pages/SuperPrecio';
import OrderTracking from './pages/OrderTracking';
// --- 1. IMPORTAR EL GUARDIÁN ---
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* --- Rutas Públicas --- */}
      {/* Cualquiera puede ver estas */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset" element={<Reset />} />

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
  );
}

export default App;
