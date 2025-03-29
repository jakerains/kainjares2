import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  regions: string[];
  postcodes: string[];
}

interface ShippingMethod {
  id: string;
  zone_id: string;
  name: string;
  description: string;
  price: number;
  free_shipping_threshold: number | null;
  min_order_amount: number;
  max_order_amount: number | null;
  is_enabled: boolean;
  estimated_days_min: number;
  estimated_days_max: number;
}

const ShippingSettings = () => {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ShippingZone | ShippingMethod>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchShippingData();
  }, []);

  const fetchShippingData = async () => {
    try {
      setLoading(true);
      
      // Fetch zones
      const { data: zonesData, error: zonesError } = await supabase
        .from('shipping_zones')
        .select('*')
        .order('name');
      
      if (zonesError) throw zonesError;
      
      // Fetch methods
      const { data: methodsData, error: methodsError } = await supabase
        .from('shipping_methods')
        .select('*')
        .order('name');
      
      if (methodsError) throw methodsError;
      
      setZones(zonesData || []);
      setMethods(methodsData || []);
    } catch (err) {
      console.error('Error fetching shipping data:', err);
      toast.error('Failed to load shipping settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitZone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('shipping_zones')
          .update(formData)
          .eq('id', formData.id);
          
        if (error) throw error;
        toast.success('Shipping zone updated');
      } else {
        const { error } = await supabase
          .from('shipping_zones')
          .insert([formData]);
          
        if (error) throw error;
        toast.success('Shipping zone created');
      }
      
      setIsZoneModalOpen(false);
      fetchShippingData();
    } catch (err) {
      console.error('Error saving shipping zone:', err);
      toast.error('Failed to save shipping zone');
    }
  };

  const handleSubmitMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('shipping_methods')
          .update(formData)
          .eq('id', formData.id);
          
        if (error) throw error;
        toast.success('Shipping method updated');
      } else {
        const { error } = await supabase
          .from('shipping_methods')
          .insert([{ ...formData, zone_id: selectedZone }]);
          
        if (error) throw error;
        toast.success('Shipping method created');
      }
      
      setIsMethodModalOpen(false);
      fetchShippingData();
    } catch (err) {
      console.error('Error saving shipping method:', err);
      toast.error('Failed to save shipping method');
    }
  };

  const handleDeleteZone = async (id: string) => {
    if (!window.confirm('Are you sure? This will also delete all associated shipping methods.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('shipping_zones')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Shipping zone deleted');
      fetchShippingData();
    } catch (err) {
      console.error('Error deleting shipping zone:', err);
      toast.error('Failed to delete shipping zone');
    }
  };

  const handleDeleteMethod = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this shipping method?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('shipping_methods')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Shipping method deleted');
      fetchShippingData();
    } catch (err) {
      console.error('Error deleting shipping method:', err);
      toast.error('Failed to delete shipping method');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Shipping Settings</h1>
        <p className="mt-2 text-gray-400">
          Configure shipping zones and delivery methods
        </p>
      </div>

      {/* Shipping Zones */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Shipping Zones</h2>
          <button
            onClick={() => {
              setIsEditing(false);
              setFormData({});
              setIsZoneModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            <Plus size={16} />
            Add Zone
          </button>
        </div>

        <div className="grid gap-6">
          {zones.map(zone => (
            <div
              key={zone.id}
              className="border border-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{zone.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {zone.countries.join(', ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedZone(zone.id);
                      setIsMethodModalOpen(true);
                    }}
                    className="text-sm px-3 py-1 bg-teal-500/20 text-teal-300 rounded hover:bg-teal-500/30 transition-colors"
                  >
                    Add Method
                  </button>
                  <button
                    onClick={() => handleDeleteZone(zone.id)}
                    className="text-sm px-3 py-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Shipping methods for this zone */}
              <div className="mt-4 space-y-3">
                {methods
                  .filter(method => method.zone_id === zone.id)
                  .map(method => (
                    <div
                      key={method.id}
                      className="flex justify-between items-center bg-gray-700/50 rounded p-3"
                    >
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-gray-400">{method.description}</div>
                        <div className="text-sm mt-1">
                          <span className="text-teal-400">${method.price.toFixed(2)}</span>
                          {method.free_shipping_threshold && (
                            <span className="text-gray-400 ml-2">
                              (Free over ${method.free_shipping_threshold.toFixed(2)})
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMethod(method.id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Modal */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Shipping Zone' : 'Add Shipping Zone'}
            </h2>
            
            <form onSubmit={handleSubmitZone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Countries (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.countries?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    countries: e.target.value.split(',').map(c => c.trim()) 
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Method Modal */}
      {isMethodModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Shipping Method' : 'Add Shipping Method'}
            </h2>
            
            <form onSubmit={handleSubmitMethod} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Method Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Free Shipping Threshold
                </label>
                <input
                  type="number"
                  value={formData.free_shipping_threshold || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    free_shipping_threshold: e.target.value ? Number(e.target.value) : null 
                  })}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                  placeholder="Leave empty for no free shipping"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Min. Delivery Days
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_days_min || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      estimated_days_min: Number(e.target.value) 
                    })}
                    min="0"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Max. Delivery Days
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_days_max || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      estimated_days_max: Number(e.target.value) 
                    })}
                    min="0"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMethodModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingSettings;