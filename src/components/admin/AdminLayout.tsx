import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Radio, LayoutGrid, Settings, LogOut, Cloud, Terminal, BookOpen, FileText, Store, Package, Users, ShoppingBag, Tag, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  // If no user, redirect to login
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <nav className="fixed top-0 left-0 h-screen w-64 bg-gray-800 p-4 z-10">
        <div className="flex items-center gap-2 mb-8">
          <Radio className="w-8 h-8 text-teal-500" />
          <span className="text-xl font-bold text-gradient">Admin Panel</span>
        </div>
        <div className="space-y-2">
          <NavLink to="/admin" icon={LayoutGrid} active={location.pathname === '/admin'}>
            Dashboard
          </NavLink>
          
          {/* Content Management */}
          <div className="pt-4 pb-2">
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Content
            </h3>
          </div>
          <NavLink to="/admin/episodes" icon={Radio} active={location.pathname.includes('/episodes')}>
            Episodes
          </NavLink>
          <NavLink to="/admin/mission-logs" icon={FileText} active={location.pathname.includes('/mission-logs')}>
            Mission Logs
          </NavLink>
          <NavLink to="/admin/knowledge" icon={BookOpen} active={location.pathname.includes('/knowledge')}>
            Knowledge Archive
          </NavLink>
          <NavLink to="/admin/commands" icon={Terminal} active={location.pathname.includes('/commands')}>
            Terminal Commands
          </NavLink>
          
          {/* Store Management */}
          <div className="pt-4 pb-2">
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Store
            </h3>
          </div>
          <NavLink to="/admin/store/products" icon={Package} active={location.pathname.includes('/store/products')}>
            Products
          </NavLink>
          <NavLink to="/admin/store/categories" icon={Tag} active={location.pathname.includes('/store/categories')}>
            Categories
          </NavLink>
          <NavLink to="/admin/store/orders" icon={ShoppingBag} active={location.pathname.includes('/store/orders')}>
            Orders
          </NavLink>
          <NavLink to="/admin/store/customers" icon={Users} active={location.pathname.includes('/store/customers')}>
            Customers
          </NavLink>
          <NavLink to="/admin/sticker-requests" icon={Star} active={location.pathname.includes('/sticker-requests')}>
            Free Stickers
          </NavLink>
          
          {/* System */}
          <div className="pt-4 pb-2">
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              System
            </h3>
          </div>
          <NavLink to="/admin/s3test" icon={Cloud} active={location.pathname.includes('/s3test')}>
            S3 Test
          </NavLink>
          <NavLink to="/admin/settings" icon={Settings} active={location.pathname.includes('/settings')}>
            Settings
          </NavLink>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </nav>
      <main className="ml-64 p-8 flex-1 h-screen overflow-y-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.FC<{ className?: string }>;
  active: boolean;
  children: React.ReactNode;
}

const NavLink = ({ to, icon: Icon, active, children }: NavLinkProps) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      active
        ? 'bg-gray-700 text-white'
        : 'text-gray-400 hover:text-white hover:bg-gray-700'
    }`}
  >
    <Icon className="w-5 h-5" />
    {children}
  </Link>
);

export default AdminLayout;