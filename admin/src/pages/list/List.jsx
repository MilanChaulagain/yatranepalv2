import "./list.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  RefreshCw,
  Download,
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

  useEffect(() => {
    fetchData();
  }, [path]);

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

  const handleDelete = useCallback(async (id) => {
    toast.promise(
      axios.delete(`http://localhost:8800/api/${path}/${id}`),
      {
        loading: 'Deleting item...',
        success: () => {
          setData(data.filter(item => item._id !== id));
          return 'Item deleted successfully!';
        },
        error: 'Failed to delete item.',
      }
    ).catch(error => console.error('Delete promise failed:', error));
  }, [path, data]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to delete');
      return;
    }

    toast.promise(
      Promise.all(
        selectedItems.map(id => axios.delete(`http://localhost:8800/api/${path}/${id}`))
      ),
      {
        loading: `Deleting ${selectedItems.length} items...`,
        success: () => {
          setData(data.filter(item => !selectedItems.includes(item._id)));
          setSelectedItems([]);
          return `${selectedItems.length} items deleted successfully!`;
        },
        error: 'Failed to delete some items.',
      }
    ).catch(error => console.error('Bulk delete promise failed:', error));
  }, [path, data, selectedItems]);

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
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link to={`/${path}/${item._id}/edit`} className="action-btn edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(item._id)} 
                          className="action-btn delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="card-content">
                      {(item.img || item.photo) && (
                        <div className="thumbnail">
                          <img src={item.img || item.photo} alt="thumb" />
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
        </div>
      </div>
    </div>
  );
};

export default List;