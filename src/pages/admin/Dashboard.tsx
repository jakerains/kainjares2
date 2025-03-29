import React from 'react';
import { BarChart, Users, Radio, Clock, Mic, FileText, BookOpen, Settings, ShoppingBag, DollarSign, Package, TrendingUp, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface StoreStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  recentOrders: {
    id: number;
    customer_email: string;
    amount_total: number;
    created_at: string;
  }[];
}

const Dashboard = () => {
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storeStats, setStoreStats] = useState<StoreStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    recentOrders: []
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchBroadcastStatus();
    fetchStoreStats();
  }, []);

  const fetchBroadcastStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('broadcast_status')
        .select('*')
        .single();

      if (error) throw error;
      setIsLive(data.is_live);
    } catch (error) {
      console.error('Error fetching broadcast status:', error);
      toast.error('Failed to fetch broadcast status');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStoreStats = async () => {
    try {
      // Fetch total orders and revenue
      const { data: orderStats, error: orderError } = await supabase
        .from('orders')
        .select('id, customer_email, amount_total, created_at')
        .order('created_at', { ascending: false });

      if (orderError) throw orderError;

      // Fetch total customers
      const { count: customerCount, error: customerError } = await supabase
        .from('customer_profiles')
        .select('id', { count: 'exact' });

      if (customerError) throw customerError;

      // Fetch product stats
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('id, inventory');

      if (productError) throw productError;

      // Calculate stats
      const totalRevenue = orderStats?.reduce((sum, order) => sum + order.amount_total, 0) || 0;
      const lowStockProducts = products?.filter(p => p.inventory < 10).length || 0;

      setStoreStats({
        totalOrders: orderStats?.length || 0,
        totalRevenue,
        totalCustomers: customerCount || 0,
        totalProducts: products?.length || 0,
        lowStockProducts,
        recentOrders: orderStats?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error fetching store stats:', error);
      toast.error('Failed to load store statistics');
    }
  };

  const toggleBroadcastStatus = async () => {
    try {
      setIsLoading(true);
      const newStatus = !isLive;

      const { data: statusData, error: fetchError } = await supabase
        .from('broadcast_status')
        .select('id')
        .single();

      if (fetchError) throw fetchError;

      if (!statusData) {
        throw new Error('No broadcast status record found');
      }

      const { error } = await supabase
        .from('broadcast_status')
        .update({ 
          is_live: newStatus,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', statusData.id);

      if (error) throw error;

      setIsLive(newStatus);
      toast.success(`Broadcast status ${newStatus ? 'ON AIR' : 'OFF AIR'}`);
    } catch (error) {
      console.error('Error updating broadcast status:', error);
      toast.error('Failed to update broadcast status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Overview of your show and store performance
        </p>
      </div>

      {/* Broadcast Section */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Broadcast Control</h2>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-lg font-medium">
                  {isLive ? 'ON AIR' : 'OFF AIR'}
                </span>
              </div>
              <p className="text-gray-400">Control your live broadcast status</p>
            </div>
            
            <button
              onClick={toggleBroadcastStatus}
              disabled={isLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                isLive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } disabled:opacity-50`}
            >
              <Mic className={`w-5 h-5 ${isLive ? 'animate-pulse' : ''}`} />
              {isLive ? 'END BROADCAST' : 'GO LIVE'}
            </button>
          </div>
        </div>
      </div>

      {/* Store Overview */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Store Overview</h2>
            <Link 
              to="/admin/store/orders" 
              className="text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              View All
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <ShoppingBag className="w-8 h-8 text-teal-500" />
                <span className="text-3xl font-bold text-white">{storeStats.totalOrders}</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-200">Total Orders</h3>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <DollarSign className="w-8 h-8 text-green-500" />
                <span className="text-3xl font-bold text-white">${storeStats.totalRevenue.toFixed(2)}</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-200">Total Revenue</h3>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <Users className="w-8 h-8 text-blue-500" />
                <span className="text-3xl font-bold text-white">{storeStats.totalCustomers}</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-200">Total Customers</h3>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <Package className="w-8 h-8 text-purple-500" />
                <div className="text-right">
                  <span className="text-3xl font-bold text-white">{storeStats.totalProducts}</span>
                  {storeStats.lowStockProducts > 0 && (
                    <div className="text-sm text-yellow-400 mt-1">
                      {storeStats.lowStockProducts} low stock
                    </div>
                  )}
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-200">Total Products</h3>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-gray-700/30 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="font-semibold">Recent Orders</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {storeStats.recentOrders.map((order) => (
                    <tr key={order.id} className="text-sm">
                      <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.customer_email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${order.amount_total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Show Stats */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Show Performance</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <Radio className="w-8 h-8 text-teal-500" />
                <span className="text-3xl font-bold text-white">24</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-200">Total Episodes</h3>
              <p className="mt-1 text-sm text-teal-400">+3 this month</p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <Users className="w-8 h-8 text-blue-500" />
                <span className="text-3xl font-bold text-white">12.5k</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-200">Total Listeners</h3>
              <p className="mt-1 text-sm text-teal-400">+2.1k this month</p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <Clock className="w-8 h-8 text-purple-500" />
                <span className="text-3xl font-bold text-white">32:45</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-200">Avg. Listen Time</h3>
              <p className="mt-1 text-sm text-teal-400">+2:15 vs last month</p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <BarChart className="w-8 h-8 text-yellow-500" />
                <span className="text-3xl font-bold text-white">68%</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-200">Engagement Rate</h3>
              <p className="mt-1 text-sm text-teal-400">+5% this month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Quick Actions</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/episodes"
              className="block bg-gray-700/50 rounded-lg p-5 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Radio className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="font-medium text-white">Manage Episodes</h3>
                  <p className="text-sm text-gray-400">Add or edit episodes</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/store/products"
              className="block bg-gray-700/50 rounded-lg p-5 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-purple-500" />
                <div>
                  <h3 className="font-medium text-white">Manage Products</h3>
                  <p className="text-sm text-gray-400">Update store inventory</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/knowledge"
              className="block bg-gray-700/50 rounded-lg p-5 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-amber-500" />
                <div>
                  <h3 className="font-medium text-white">Knowledge Base</h3>
                  <p className="text-sm text-gray-400">Update archives</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/settings"
              className="block bg-gray-700/50 rounded-lg p-5 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-teal-500" />
                <div>
                  <h3 className="font-medium text-white">Settings</h3>
                  <p className="text-sm text-gray-400">Configure system</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;