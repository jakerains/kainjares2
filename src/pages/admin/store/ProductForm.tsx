import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Plus, Trash2, Upload } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { uploadToS3 } from '../../../lib/s3';
import toast from 'react-hot-toast';
import type { Product } from '../../../types/store';

interface Category {
  id: string;
  name: string;
  description: string;
}

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    inventory: 0,
    images: [],
    sizes: [],
    category_id: '',
    is_virtual: false
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [newSize, setNewSize] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  
  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [isEditing, id]);
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    }
  };
  
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      setFormData(data);
    } catch (err) {
      console.error('Error fetching product:', err);
      toast.error('Failed to load product');
      navigate('/admin/store/products');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'inventory' ? Number(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setImageUploading(true);
      const imageUrl = await uploadToS3(file, 'products');
      
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), imageUrl]
      }));
      
      toast.success('Image uploaded successfully');
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };
  
  const handleAddSize = () => {
    if (!newSize.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      sizes: [...(prev.sizes || []), newSize.trim()]
    }));
    setNewSize('');
  };
  
  const handleRemoveSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes?.filter(s => s !== size)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }
    
    try {
      setLoading(true);
      
      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', id);
          
        if (error) throw error;
        
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{ ...formData, id: crypto.randomUUID() }]);
          
        if (error) throw error;
        
        toast.success('Product created successfully');
      }
      
      navigate('/admin/store/products');
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isEditing ? 'Edit Product' : 'Create Product'}
          </h1>
          <p className="mt-2 text-gray-400">
            {isEditing ? 'Update product details' : 'Add a new product to your store'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/store/products')}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Inventory
              </label>
              <div className="space-y-2">
                <input
                  type="number"
                  name="inventory"
                  value={formData.inventory}
                  onChange={handleInputChange}
                  required
                  min="0"
                  disabled={formData.is_virtual}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500 disabled:opacity-50"
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_virtual"
                    name="is_virtual"
                    checked={formData.is_virtual}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-teal-500 border-gray-600 rounded focus:ring-teal-500 focus:ring-offset-gray-800"
                  />
                  <label htmlFor="is_virtual" className="ml-2 text-sm text-gray-300">
                    This is a virtual product (no inventory tracking)
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Images</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {formData.images?.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-600 hover:border-teal-500 transition-colors cursor-pointer">
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                disabled={imageUploading}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {imageUploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
                ) : (
                  <>
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-400">Add Image</span>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Sizes</h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.sizes?.map((size) => (
              <div
                key={size}
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded-full"
              >
                <span className="text-sm text-white">{size}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSize(size)}
                  className="p-1 text-gray-400 hover:text-red-400 rounded-full"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="Add size..."
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
            />
            <button
              type="button"
              onClick={handleAddSize}
              disabled={!newSize.trim()}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/store/products')}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 transition-colors"
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;