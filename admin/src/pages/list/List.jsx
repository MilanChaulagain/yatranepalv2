import "./list.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Calendar,
  User,
  Building2,
  Bed,
  DollarSign,
  MapPin,
  Ticket,
  Image as ImageIcon
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const List = ({ columns }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.split("/")[1];
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);
  const [confirmState, setConfirmState] = useState({ open: false, title: "", message: "", onConfirm: null, confirming: false });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || "";
    setSearchTerm(q);
  }, [location.search]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8800/api/${path}`);
      // Handle different response formats
      const responseData = response.data;
      if (responseData.data && Array.isArray(responseData.data)) {
        // Places format: { success: true, data: [...], count: ... }
        setData(responseData.data);
      } else if (Array.isArray(responseData)) {
        // Users format: [...]
        setData(responseData);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const performDelete = useCallback(async (id) => {
    return toast.promise(
      axios.delete(`http://localhost:8800/api/${path}/${id}`),
      {
        loading: 'Deleting item...',
        success: () => {
          setData(prev => prev.filter(item => item._id !== id));
          return 'Item deleted successfully!';
        },
        error: 'Failed to delete item.',
      }
    ).catch(error => console.error('Delete promise failed:', error));
  }, [path]);

  const handleDelete = useCallback((id) => {
    setConfirmState({
      open: true,
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirming: false,
      onConfirm: async () => {
        try {
          setConfirmState(prev => ({ ...prev, confirming: true }));
          await performDelete(id);
        } finally {
          setConfirmState({ open: false, title: '', message: '', onConfirm: null, confirming: false });
        }
      }
    });
  }, [performDelete]);

  const handleBulkDelete = useCallback(() => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to delete');
      return;
    }
    setConfirmState({
      open: true,
      title: `Delete ${selectedItems.length} item(s)`,
      message: 'Are you sure you want to delete the selected items? This action cannot be undone.',
      confirming: false,
      onConfirm: async () => {
        try {
          setConfirmState(prev => ({ ...prev, confirming: true }));
          await toast.promise(
            Promise.all(selectedItems.map(id => axios.delete(`http://localhost:8800/api/${path}/${id}`))),
            {
              loading: `Deleting ${selectedItems.length} items...`,
              success: () => `${selectedItems.length} items deleted successfully!`,
              error: 'Failed to delete some items.',
            }
          );
          setData(prev => prev.filter(item => !selectedItems.includes(item._id)));
          setSelectedItems([]);
        } finally {
          setConfirmState({ open: false, title: '', message: '', onConfirm: null, confirming: false });
        }
      }
    });
  }, [path, selectedItems]);

  const getIconForPath = () => {
    switch (path) {
      case 'users': return <User className="w-5 h-5" />;
      case 'hotels': return <Building2 className="w-5 h-5" />;
      case 'rooms': return <Bed className="w-5 h-5" />;
      case 'money-exchange': return <DollarSign className="w-5 h-5" />;
      case 'place': return <MapPin className="w-5 h-5" />;
      case 'admin-booking': return <Ticket className="w-5 h-5" />;
      case 'imageslider': return <ImageIcon className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getTitleForPath = () => {
    switch (path) {
      case 'users': return 'Users';
      case 'hotels': return 'Hotels';
      case 'rooms': return 'Rooms';
      case 'money-exchange': return 'Money Exchange Centers';
      case 'place': return 'Places';
      case 'admin-booking': return 'Bookings';
      case 'imageslider': return 'Image Slider';
      default: return path.charAt(0).toUpperCase() + path.slice(1);
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = Object.values(item).some(value => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesFilter = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const resolveCloudinaryUrl = (maybePublicIdOrUrl) => {
    if (!maybePublicIdOrUrl) return null;
    const value = maybePublicIdOrUrl.toString();
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return null;
    // Construct a basic delivery URL for a public_id stored in DB
    return `https://res.cloudinary.com/${cloudName}/image/upload/${value}`;
  };

  const getThumbnailUrl = (item) => {
    if (path === 'users') {
      const candidate = item.img || item.photo || item.profilePic || item.profileImage || item.avatar || item.image;
      const url = resolveCloudinaryUrl(candidate);
      return url || '/images/no-image-icon-0.jpg';
    }
    if (path === 'hotels') {
      if (Array.isArray(item.photos) && item.photos.length > 0) return item.photos[0];
      return item.img || item.photo || '/images/no-image-icon-0.jpg';
    }
    return item.img || item.photo || '/images/no-image-icon-0.jpg';
  };

  if (loading) {
    return (
      <div className="list">
        <Sidebar />
        <div className="listContainer">
          <Navbar />
          <div className="loading-container">
            <RefreshCw className="animate-spin w-8 h-8" />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <div className="list-content">
          {/* Header */}
          <div className="list-header">
            <div className="header-left">
              <div className="title-section">
                {getIconForPath()}
                <h1>{getTitleForPath()}</h1>
              </div>
              <p className="subtitle">Manage your {getTitleForPath().toLowerCase()}</p>
            </div>
            <div className="header-right">
              <button onClick={fetchData} className="refresh-button" disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link to={`/${path}/new`} className="add-button">
                <Plus className="w-4 h-4" />
                Add New
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="search-box">
              <Search className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    navigate({ pathname: location.pathname, search: searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : '' });
                  }
                }}
              />
            </div>
            <div className="filter-options">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="bulk-actions">
              {selectedItems.length > 0 && (
                <button onClick={handleBulkDelete} className="bulk-delete-btn">
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedItems.length})
                </button>
              )}
            </div>
          </div>

          {/* Data Grid */}
          <div className="data-grid">
            {filteredData.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  {getIconForPath()}
                </div>
                <h3>No {getTitleForPath().toLowerCase()} found</h3>
                <p>Try adjusting your search or filter criteria</p>
                <Link to={`/${path}/new`} className="add-first-btn">
                  <Plus className="w-4 h-4" />
                  Add Your First {getTitleForPath().slice(0, -1)}
                </Link>
              </div>
            ) : (
              <div className="cards-grid">
                {filteredData.map((item) => (
                  <div key={item._id} className="data-card">
                    <div className="card-header">
                      <div className="card-title">
                        <h3>{item.name || item.title || item.username || `Item ${item._id.slice(-6)}`}</h3>
                        <span className="card-id">#{item._id.slice(-6)}</span>
                      </div>
                      <div className="card-actions">
                        <Link to={`/${path}/${item._id}`} className="action-btn view">
                          <Eye size={16} />
                        </Link>
                        <Link to={`/${path}/${item._id}/edit`} className="action-btn edit">
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="action-btn delete"
                          title="Delete"
                        >
                          <Trash2 size={16}  />
                        </button>
                      </div>
                    </div>
                    <div className="card-content">
                      {getThumbnailUrl(item) && (
                        <div className={`thumbnail ${path === 'users' ? 'avatar' : ''}`}>
                          <img src={getThumbnailUrl(item)} alt={item.username || item.name || 'thumb'} />
                        </div>
                      )}
                      {item.email && <p><strong>Email:</strong> {item.email}</p>}
                      {item.phone && <p><strong>Phone:</strong> {item.phone}</p>}
                      {item.city && <p><strong>City:</strong> {item.city}</p>}
                      {item.address && <p><strong>Address:</strong> {item.address}</p>}
                      {item.type && <p><strong>Type:</strong> {item.type}</p>}
                      {item.status && (
                        <span className={`status-badge ${item.status}`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                    <div className="card-footer">
                      <span className="created-date">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt || item.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="stats-section">
            <div className="stat-item">
              <span className="stat-label">Total</span>
              <span className="stat-value">{data.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Showing</span>
              <span className="stat-value">{filteredData.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Selected</span>
              <span className="stat-value">{selectedItems.length}</span>
            </div>
          </div>
          {/* Confirm Modal */}
          {confirmState.open && (
            <div className="confirm-modal">
              <div className="confirm-content">
                <h3>{confirmState.title}</h3>
                <p>{confirmState.message}</p>
                <div className="confirm-actions">
                  <button
                    className="btn secondary"
                    onClick={() => setConfirmState({ open: false, title: '', message: '', onConfirm: null, confirming: false })}
                    disabled={confirmState.confirming}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn danger"
                    onClick={confirmState.onConfirm}
                    disabled={confirmState.confirming}
                  >
                    {confirmState.confirming ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default List;