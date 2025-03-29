import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading from './components/Loading';

// Pages
import Home from './pages/Home';
import Streams from './pages/Streams';
import Knowledge from './pages/Knowledge';
import MissionLog from './pages/MissionLog';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Store pages
import Store from './pages/store/Store';
import Success from './pages/store/Success';
import Cancel from './pages/store/Cancel';

// Admin pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLayout from './components/admin/AdminLayout';
import Terminal from './pages/Terminal';
import Dashboard from './pages/admin/Dashboard';
import Episodes from './pages/admin/Episodes';
import EpisodeCreate from './pages/admin/EpisodeCreate';
import EpisodeEdit from './pages/admin/EpisodeEdit';
import S3Test from './pages/admin/S3Test';
import CommandsPage from './pages/admin/CommandsPage';
import Settings from './pages/admin/Settings';
import KnowledgeAdmin from './pages/admin/KnowledgeAdmin';
import MissionLogAdmin from './pages/admin/MissionLogAdmin';
import MissionLogForm from './pages/admin/MissionLogForm';

// Store admin pages
import ProductsAdmin from './pages/admin/store/ProductsAdmin';
import CategoriesAdmin from './pages/admin/store/CategoriesAdmin';
import OrdersAdmin from './pages/admin/store/OrdersAdmin';
import CustomersAdmin from './pages/admin/store/CustomersAdmin';
import ProductForm from './pages/admin/store/ProductForm';
import StickerRequests from './pages/admin/StickerRequests';

// Context
import { AuthProvider } from './context/AuthContext';
import { CommandProvider } from './context/CommandContext';
import { CartProvider } from './context/CartContext';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for the alien tech to "initialize"
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <CommandProvider>
        <CartProvider>
          <div className="min-h-screen bg-space-dark relative">
            <div className="stars"></div>
            
            <AnimatePresence mode="wait">
              {loading ? (
                <Loading key="loading" />
              ) : (
                <motion.div
                  key="app"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col min-h-screen"
                >
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
                    <Route path="/streams" element={<><Navbar /><Streams /><Footer /></>} />
                    <Route path="/knowledge" element={<><Navbar /><Knowledge /><Footer /></>} />
                    <Route path="/mission-log" element={<><Navbar /><MissionLog /><Footer /></>} />
                    <Route path="/terminal" element={<Terminal />} />
                    <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />
                    
                    {/* Store routes */}
                    <Route path="/store" element={<><Navbar /><Store /><Footer /></>} />
                    <Route path="/store/success" element={<><Navbar /><Success /><Footer /></>} />
                    <Route path="/store/cancel" element={<><Navbar /><Cancel /><Footer /></>} />
                    
                    {/* Auth routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Admin routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="episodes" element={<Episodes />} />
                      <Route path="episodes/create" element={<EpisodeCreate />} />
                      <Route path="episodes/:id/edit" element={<EpisodeEdit />} />
                      <Route path="s3test" element={<S3Test />} />
                      <Route path="commands" element={<CommandsPage />} />
                      <Route path="knowledge" element={<KnowledgeAdmin />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="mission-logs" element={<MissionLogAdmin />} />
                      <Route path="mission-logs/create" element={<MissionLogForm />} />
                      <Route path="mission-logs/edit/:id" element={<MissionLogForm />} />
                      
                      {/* Store admin routes */}
                      <Route path="store/products" element={<ProductsAdmin />} />
                      <Route path="store/products/create" element={<ProductForm />} />
                      <Route path="store/products/:id/edit" element={<ProductForm />} />
                      <Route path="store/categories" element={<CategoriesAdmin />} />
                      <Route path="store/orders" element={<OrdersAdmin />} />
                      <Route path="store/customers" element={<CustomersAdmin />} />
                      <Route path="sticker-requests" element={<StickerRequests />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CartProvider>
      </CommandProvider>
    </AuthProvider>
  );
}

export default App;