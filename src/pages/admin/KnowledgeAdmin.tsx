import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

type KnowledgeEntry = {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl: string;
  link: string;
  created_at: string;
};

type FormData = Omit<KnowledgeEntry, 'id' | 'created_at'> & {
  id?: number;
};

const KnowledgeAdmin = () => {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    imageUrl: '',
    link: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('knowledge_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching knowledge entries:', error);
      toast.error('Failed to load knowledge entries');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry: KnowledgeEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentEntry({
      title: '',
      description: '',
      category: '',
      difficulty: 'beginner',
      imageUrl: '',
      link: '',
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this knowledge entry?')) {
      try {
        const { error } = await supabase
          .from('knowledge_entries')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        setEntries(entries.filter(entry => entry.id !== id));
        toast.success('Knowledge entry deleted successfully');
      } catch (error) {
        console.error('Error deleting knowledge entry:', error);
        toast.error('Failed to delete knowledge entry');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && currentEntry.id) {
        // Update existing entry
        const { error } = await supabase
          .from('knowledge_entries')
          .update({
            title: currentEntry.title,
            description: currentEntry.description,
            category: currentEntry.category,
            difficulty: currentEntry.difficulty,
            imageUrl: currentEntry.imageUrl,
            link: currentEntry.link,
          })
          .eq('id', currentEntry.id);

        if (error) throw error;
        toast.success('Knowledge entry updated successfully');
      } else {
        // Create new entry
        const { error } = await supabase
          .from('knowledge_entries')
          .insert([{
            title: currentEntry.title,
            description: currentEntry.description,
            category: currentEntry.category,
            difficulty: currentEntry.difficulty,
            imageUrl: currentEntry.imageUrl,
            link: currentEntry.link,
          }]);

        if (error) throw error;
        toast.success('Knowledge entry created successfully');
      }
      
      setIsModalOpen(false);
      fetchEntries();
    } catch (error) {
      console.error('Error saving knowledge entry:', error);
      toast.error('Failed to save knowledge entry');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentEntry(prev => ({ ...prev, [name]: value }));
  };

  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Knowledge Archive Management</h1>
        <button
          onClick={handleAdd}
          className="bg-alien-glow hover:bg-alien-bright text-space-dark px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Entry
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search knowledge entries..."
          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-alien-glow"></div>
          <p className="mt-2 text-gray-400">Loading entries...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-8 bg-gray-800 rounded-lg">
          <p className="text-gray-400">No knowledge entries found</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{entry.title}</div>
                    <div className="text-sm text-gray-400 line-clamp-1">{entry.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{entry.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      entry.difficulty === 'beginner' 
                        ? 'bg-green-900 text-green-300' 
                        : entry.difficulty === 'intermediate'
                          ? 'bg-blue-900 text-blue-300'
                          : 'bg-purple-900 text-purple-300'
                    }`}>
                      {entry.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="text-teal-400 hover:text-teal-300 transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for adding/editing entries */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Edit Knowledge Entry' : 'Add New Knowledge Entry'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={currentEntry.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={currentEntry.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={currentEntry.category}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Difficulty</label>
                    <select
                      name="difficulty"
                      value={currentEntry.difficulty}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={currentEntry.imageUrl}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Link</label>
                  <input
                    type="text"
                    name="link"
                    value={currentEntry.link}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-alien-glow hover:bg-alien-bright text-space-dark rounded-lg transition-colors"
                >
                  {isEditing ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeAdmin; 