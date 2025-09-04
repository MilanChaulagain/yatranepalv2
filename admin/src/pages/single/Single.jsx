import "./single.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MapPin,
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
  Phone,
  Mail,
  Building,
  Copy,
  ExternalLink
} from "lucide-react";

const Single = () => {
  const { id } = useParams();
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/api/${path}/${id}`, { withCredentials: true });
        // Handle different response formats
        const responseData = response.data;
        if (responseData.data) {
          // Places format: { success: true, data: {...} }
          setData(responseData.data);
        } else {
          // Direct object format
          setData(responseData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load item details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, path]);
  if (loading) {
    return (
      <div className="single">
        <Sidebar />
        <div className="singleContainer">
          <Navbar />
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="single">
        <Sidebar />
        <div className="singleContainer">
          <Navbar />
          <div className="error">Item not found</div>
        </div>
      </div>
    );
  }

  const resolveCloudinaryUrl = (maybePublicIdOrUrl) => {
    if (!maybePublicIdOrUrl) return null;
    const value = maybePublicIdOrUrl.toString();
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return null;
    return `https://res.cloudinary.com/${cloudName}/image/upload/${value}`;
  };

  const fallbackNoImage = "/assets/images/no-image-icon-0.jpg";
  const mainImage =
    resolveCloudinaryUrl(
      data.img || data.photo || data.profilePic || data.profileImage || data.avatar || data.image
    ) ||
    fallbackNoImage;

  const handleDelete = async () => {
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await toast.promise(
        axios.delete(`http://localhost:8800/api/${path}/${id}`, { withCredentials: true }),
        {
          loading: 'Deleting item...',
          success: 'Item deleted successfully!',
          error: 'Failed to delete item.',
        }
      );
      navigate(`/${path}`);
    } catch (e) {
      console.error('Failed to delete:', e);
      toast.error('Failed to delete item.');
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'cultural': return '🏛️';
      case 'natural': return '🌿';
      case 'historical': return '🏺';
      case 'adventure': return '⛰️';
      case 'religious': return '🕉️';
      case 'food destinations': return '🍽️';
      case 'photography': return '📸';
      default: return '📍';
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'cultural': return '#8B5CF6';
      case 'natural': return '#10B981';
      case 'historical': return '#F59E0B';
      case 'adventure': return '#EF4444';
      case 'religious': return '#3B82F6';
      case 'food destinations': return '#F97316';
      case 'photography': return '#EC4899';
      default: return '#6B7280';
    }
  };

  const formatCoordinates = (coordinates) => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) return null;
    return `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`;
  };

  const getGoogleMapsUrl = (coordinates) => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) return null;
    return `https://www.google.com/maps?q=${coordinates[1]},${coordinates[0]}`;
  };

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        
        {/* Header Section */}
        <div className="header-section">
          <div className="header-content">
            <Link to={`/${path}`} className="back-button">
              <ArrowLeft size={20} />
              Back to {path === 'users' ? 'Users' : path === 'place' ? 'Places' : 'List'}
            </Link>
            <div className="header-actions">
              <Link to={`/${path}/${id}/edit`} className="action-btn edit-btn">
                <Edit size={18} />
                Edit
              </Link>
              <button
                className="action-btn delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 size={18} />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-image">
              <img
                src={mainImage}
                alt={data.name || data.title || data.username || "Item"}
                onError={(e) => {
                  if (e.currentTarget.src !== fallbackNoImage) {
                    e.currentTarget.src = fallbackNoImage;
                  }
                }}
              />
              {data.category && (
                <div 
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(data.category) }}
                >
                  <span className="category-icon">{getCategoryIcon(data.category)}</span>
                  {data.category}
                </div>
              )}
            </div>
            
            <div className="hero-info">
              <div className="title-section">
                <h1 className="main-title">
                  {data.name || data.title || data.username || "Unknown"}
                </h1>
                {data.email && (
                  <div className="subtitle">
                    <Mail size={16} />
                    {data.email}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="quick-stats">
                {data.city && (
                  <div className="stat-item">
                    <MapPin size={16} />
                    <span>{data.city}</span>
                  </div>
                )}
                {data.phone && (
                  <div className="stat-item">
                    <Phone size={16} />
                    <span>{data.phone}</span>
                  </div>
                )}
                {data.type && (
                  <div className="stat-item">
                    <Building size={16} />
                    <span>{data.type}</span>
                  </div>
                )}
                {data.createdAt && (
                  <div className="stat-item">
                    <Calendar size={16} />
                    <span>Created {new Date(data.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="details-grid">
            {/* Basic Information */}
            <div className="detail-card">
              <div className="card-header">
                <h3>Basic Information</h3>
              </div>
              <div className="card-content">
                {data.description && (
                  <div className="detail-row">
                    <label>Description</label>
                    <p className="description-text">{data.description}</p>
                  </div>
                )}
                {data.address && (
                  <div className="detail-row">
                    <label>Address</label>
                    <div className="address-container">
                      <span>{data.address}</span>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(data.address)}
                        title="Copy address"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
                {data.category && (
                  <div className="detail-row">
                    <label>Category</label>
                    <div 
                      className="category-tag"
                      style={{ backgroundColor: getCategoryColor(data.category) }}
                    >
                      <span className="category-icon">{getCategoryIcon(data.category)}</span>
                      {data.category}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Information */}
            {data.location?.coordinates && (
              <div className="detail-card">
                <div className="card-header">
                  <h3>Location</h3>
                </div>
                <div className="card-content">
                  <div className="detail-row">
                    <label>Coordinates</label>
                    <div className="coordinates-container">
                      <span className="coordinates">
                        {formatCoordinates(data.location.coordinates)}
                      </span>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(formatCoordinates(data.location.coordinates))}
                        title="Copy coordinates"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="detail-row">
                    <label>View on Map</label>
                    <a 
                      href={getGoogleMapsUrl(data.location.coordinates)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-link"
                    >
                      <ExternalLink size={16} />
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="detail-card">
              <div className="card-header">
                <h3>Additional Details</h3>
              </div>
              <div className="card-content">
                {data._id && (
                  <div className="detail-row">
                    <label>ID</label>
                    <div className="id-container">
                      <span className="id-text">{data._id}</span>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(data._id)}
                        title="Copy ID"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
                {data.updatedAt && (
                  <div className="detail-row">
                    <label>Last Updated</label>
                    <span>{new Date(data.updatedAt).toLocaleString()}</span>
                  </div>
                )}
                {data.createdAt && (
                  <div className="detail-row">
                    <label>Created</label>
                    <span>{new Date(data.createdAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="analytics-section">
            <Chart aspect={3 / 1} title="Analytics" />
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="modal-header">
              <h3>Delete {path === 'users' ? 'User' : path === 'place' ? 'Place' : 'Item'}</h3>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete this {path === 'users' ? 'user' : path === 'place' ? 'place' : 'item'}? This action cannot be undone.</p>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Single;