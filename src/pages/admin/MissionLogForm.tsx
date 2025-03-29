import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Plus, Calendar, Image, Clock } from 'lucide-react';
import { createMissionLog, getMissionLogBySlug, updateMissionLog } from '../../services/missionLogService';
import { MissionLogWithTags, MissionLogInsert, MissionLogUpdate } from '../../types/missionLog';
import { supabase } from '../../lib/supabase';

interface Tag {
  id: string;
  name: string;
}

const MissionLogForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<MissionLogInsert | MissionLogUpdate>({
    title: '',
    excerpt: '',
    content: '',
    read_time: '',
    author_name: 'Kain Jarres', // Default author
    slug: '',
    published_at: null
  });
  
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch tags
    const fetchTags = async () => {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        setAllTags(data || []);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError('Failed to load tags');
      }
    };
    
    fetchTags();
    
    // If editing, fetch the mission log
    if (isEditing && id) {
      const fetchMissionLog = async () => {
        try {
          setLoading(true);
          const missionLog = await getMissionLogBySlug(id);
          
          if (missionLog) {
            setFormData({
              title: missionLog.title,
              excerpt: missionLog.excerpt,
              content: missionLog.content,
              read_time: missionLog.read_time,
              author_name: missionLog.author_name,
              author_avatar_url: missionLog.author_avatar_url,
              image_url: missionLog.image_url,
              slug: missionLog.slug,
              published_at: missionLog.published_at
            });
            
            // Get tag IDs
            const { data: tagData } = await supabase
              .from('mission_log_tags')
              .select('tag_id')
              .eq('mission_log_id', id);
              
            setSelectedTagIds(tagData?.map(t => t.tag_id) || []);
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error fetching mission log:', err);
          setError('Failed to load mission log');
          setLoading(false);
        }
      };
      
      fetchMissionLog();
    }
  }, [id, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      setIsAddingTag(true);
      
      // Check if tag already exists
      const existingTag = allTags.find(tag => 
        tag.name.toLowerCase() === newTagName.trim().toLowerCase()
      );
      
      if (existingTag) {
        if (!selectedTagIds.includes(existingTag.id)) {
          setSelectedTagIds(prev => [...prev, existingTag.id]);
        }
        setNewTagName('');
        setIsAddingTag(false);
        return;
      }
      
      // Create new tag
      const { data, error } = await supabase
        .from('tags')
        .insert({ name: newTagName.trim() })
        .select()
        .single();
        
      if (error) throw error;
      
      setAllTags(prev => [...prev, data]);
      setSelectedTagIds(prev => [...prev, data.id]);
      setNewTagName('');
      setIsAddingTag(false);
    } catch (err) {
      console.error('Error adding tag:', err);
      setError('Failed to add tag');
      setIsAddingTag(false);
    }
  };

  const handlePublishToggle = () => {
    setFormData(prev => ({
      ...prev,
      published_at: prev.published_at ? null : new Date().toISOString()
    }));
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
      
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.excerpt || !formData.content || !formData.read_time) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!formData.slug) {
      generateSlug();
      setError('Please provide a slug');
      return;
    }
    
    try {
      setSaveLoading(true);
      
      if (isEditing && id) {
        await updateMissionLog(id, formData as MissionLogUpdate, selectedTagIds);
        setSuccessMessage('Mission log updated successfully');
      } else {
        await createMissionLog(formData as MissionLogInsert, selectedTagIds);
        setSuccessMessage('Mission log created successfully');
        
        // Reset form after successful creation
        setFormData({
          title: '',
          excerpt: '',
          content: '',
          read_time: '',
          author_name: 'Kain Jarres',
          slug: '',
          published_at: null
        });
        setSelectedTagIds([]);
      }
      
      setSaveLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        if (isEditing) {
          navigate('/admin/mission-logs');
        }
      }, 3000);
    } catch (err) {
      console.error('Error saving mission log:', err);
      setError('Failed to save mission log');
      setSaveLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Edit Mission Log' : 'Create Mission Log'}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/mission-logs')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            <X size={16} />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveLoading}
            className="flex items-center gap-2 px-4 py-2 bg-alien-glow text-space-dark font-medium rounded-md hover:bg-alien-glow/90 disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            <span>{saveLoading ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-md">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-300 hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 text-green-300 rounded-md">
          {successMessage}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-space-purple/20 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-space-purple/20 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-space-purple/20 rounded"></div>
                <div className="h-4 bg-space-purple/20 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="bg-space-purple/10 border border-space-purple/30 rounded-lg p-6">
            <h2 className="text-xl font-medium mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={() => !formData.slug && generateSlug()}
                  className="w-full px-4 py-2 bg-space-purple/20 border border-space-purple rounded-lg text-white focus:outline-none focus:border-alien-glow"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Slug *</label>
                <div className="flex">
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 bg-space-purple/20 border border-space-purple rounded-l-lg text-white focus:outline-none focus:border-alien-glow"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="px-4 py-2 bg-space-purple/40 border border-space-purple rounded-r-lg text-white hover:bg-space-purple/60 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Author Name *</label>
                <input
                  type="text"
                  name="author_name"
                  value={formData.author_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-space-purple/20 border border-space-purple rounded-lg text-white focus:outline-none focus:border-alien-glow"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Read Time *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Clock size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="read_time"
                    placeholder="e.g. 5 min"
                    value={formData.read_time}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-space-purple/20 border border-space-purple rounded-lg text-white focus:outline-none focus:border-alien-glow"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-gray-300 mb-2">Excerpt *</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 bg-space-purple/20 border border-space-purple rounded-lg text-white focus:outline-none focus:border-alien-glow"
                required
              ></textarea>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="bg-space-purple/10 border border-space-purple/30 rounded-lg p-6">
            <h2 className="text-xl font-medium mb-4">Content</h2>
            
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={15}
              className="w-full px-4 py-2 bg-space-purple/20 border border-space-purple rounded-lg text-white focus:outline-none focus:border-alien-glow font-mono"
              required
            ></textarea>
            <p className="text-gray-400 mt-2 text-sm">
              Content supports Markdown formatting
            </p>
          </div>
          
          {/* Media Section */}
          <div className="bg-space-purple/10 border border-space-purple/30 rounded-lg p-6">
            <h2 className="text-xl font-medium mb-4">Media</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Featured Image URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Image size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full pl-10 pr-4 py-2 bg-space-purple/20 border border-space-purple rounded-lg text-white focus:outline-none focus:border-alien-glow"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Author Avatar URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Image size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="author_avatar_url"
                    value={formData.author_avatar_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full pl-10 pr-4 py-2 bg-space-purple/20 border border-space-purple rounded-lg text-white focus:outline-none focus:border-alien-glow"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Tags and Publishing Section */}
          <div className="bg-space-purple/10 border border-space-purple/30 rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              {/* Tags */}
              <div className="flex-1">
                <h2 className="text-xl font-medium mb-4">Tags</h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {allTags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedTagIds.includes(tag.id)
                          ? 'bg-alien-glow text-space-dark font-medium'
                          : 'bg-space-purple/40 text-white hover:bg-space-purple/60'
                      } transition-colors`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
                
                <div className="flex">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Add new tag..."
                    className="flex-1 px-4 py-2 bg-space-purple/20 border border-space-purple rounded-l-lg text-white focus:outline-none focus:border-alien-glow"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={isAddingTag || !newTagName.trim()}
                    className="px-4 py-2 bg-space-purple/40 border border-space-purple rounded-r-lg text-white hover:bg-space-purple/60 disabled:opacity-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              {/* Publishing */}
              <div className="md:w-1/3">
                <h2 className="text-xl font-medium mb-4">Publishing</h2>
                
                <div className="bg-space-purple/20 border border-space-purple/40 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      formData.published_at ? 'bg-green-900/30 text-green-300' : 'bg-yellow-900/30 text-yellow-300'
                    }`}>
                      {formData.published_at ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  
                  {formData.published_at && (
                    <div className="flex items-center mb-4">
                      <Calendar size={16} className="mr-2 text-gray-400" />
                      <span className="text-gray-300 text-sm">
                        {new Date(formData.published_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={handlePublishToggle}
                    className={`w-full px-4 py-2 rounded-md font-medium ${
                      formData.published_at
                        ? 'bg-yellow-600 text-white hover:bg-yellow-500'
                        : 'bg-green-600 text-white hover:bg-green-500'
                    } transition-colors`}
                  >
                    {formData.published_at ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/mission-logs')}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 py-2 bg-alien-glow text-space-dark font-medium rounded-md hover:bg-alien-glow/90 disabled:opacity-50 transition-colors"
            >
              {saveLoading ? 'Saving...' : 'Save Mission Log'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MissionLogForm; 