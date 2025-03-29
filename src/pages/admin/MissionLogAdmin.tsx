import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Calendar, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMissionLogs, deleteMissionLog } from '../../services/missionLogService';
import { MissionLogWithTags } from '../../types/missionLog';
import { format } from 'date-fns';

const MissionLogAdmin = () => {
  const [missionLogs, setMissionLogs] = useState<MissionLogWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<MissionLogWithTags[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMissionLogs();
  }, []);

  const fetchMissionLogs = async () => {
    try {
      setLoading(true);
      const logs = await getMissionLogs();
      setMissionLogs(logs);
      setFilteredLogs(logs);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching mission logs:', err);
      setError('Failed to load mission logs');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredLogs(missionLogs);
    } else {
      const filtered = missionLogs.filter(log => 
        log.title.toLowerCase().includes(term.toLowerCase()) || 
        log.excerpt.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredLogs(filtered);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      setIsDeleting(true);
      await deleteMissionLog(deleteId);
      setMissionLogs(missionLogs.filter(log => log.id !== deleteId));
      setFilteredLogs(filteredLogs.filter(log => log.id !== deleteId));
      setDeleteId(null);
      setIsDeleting(false);
    } catch (err) {
      console.error('Error deleting mission log:', err);
      setError('Failed to delete mission log');
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Draft';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mission Logs</h1>
        <Link 
          to="/admin/mission-logs/create" 
          className="flex items-center gap-2 px-4 py-2 bg-alien-glow text-space-dark font-medium rounded-md hover:bg-alien-glow/90 transition-colors"
        >
          <Plus size={16} />
          <span>New Mission Log</span>
        </Link>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-md">
          {error}
          <button 
            onClick={fetchMissionLogs}
            className="ml-2 underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}
      
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search mission logs..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 bg-space-purple/20 border border-space-purple rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-alien-glow"
          />
        </div>
      </div>
      
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
        <div className="overflow-hidden rounded-lg border border-space-purple/40">
          <table className="min-w-full divide-y divide-space-purple/40">
            <thead className="bg-space-purple/20">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tags</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-space-dark divide-y divide-space-purple/40">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No mission logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-space-purple/10">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="line-clamp-1">{log.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.published_at ? 'bg-green-900/30 text-green-300' : 'bg-yellow-900/30 text-yellow-300'
                      }`}>
                        {log.published_at ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {formatDate(log.published_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex flex-wrap gap-1">
                        {log.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-space-purple/30 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                        {log.tags.length > 2 && (
                          <span className="px-2 py-0.5 bg-space-purple/30 rounded-full text-xs">
                            +{log.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/mission-logs/edit/${log.id}`}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(log.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-space-dark border border-space-purple/40 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this mission log? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionLogAdmin; 