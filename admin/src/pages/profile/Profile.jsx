import "./profile.scss";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { Mail, Phone, MapPin, Calendar, Camera, User } from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
    country: user?.country || "",
  });

  const defaultAvatar = "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-High-Quality-Image.png";

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrl = user?.img;
      
      // Upload new image if changed
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
        
        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                  const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  );
                  console.log(`Upload progress: ${percentCompleted}%`);
                },
              }
            );
        imageUrl = uploadRes.data.secure_url;
      }

      // Update user profile
      const updateRes = await axios.put(
        `http://localhost:8800/api/users/${user._id}`,
        {
          ...formData,
          img: imageUrl
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (updateRes.data) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) return null;

  return (
    <div className="admin-profile">
      <Sidebar />
      <div className="profile-container">
        <Navbar />
        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-header">
              <div className="image-container">
                <div className="profile-image-wrapper">
                  {(imagePreview || user?.img) ? (
                    <img
                      src={imagePreview || user.img}
                      alt={user.username}
                      className="profile-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultAvatar;
                      }}
                    />
                  ) : (
                    <div className="profile-placeholder">
                      <User size={40} />
                    </div>
                  )}
                  {isEditing && (
                    <label htmlFor="profileImage" className="image-upload-button">
                      <Camera size={16} />
                      <input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
              </div>
              <h1>{user.username}</h1>
              <span className="role-badge">Administrator</span>
            </div>

            <div className="profile-body">
              <form onSubmit={handleSubmit}>
                <div className="info-grid">
                  <div className="info-item">
                    <label>
                      <User size={16} />
                      Username
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    ) : (
                      <span>{user.username}</span>
                    )}
                  </div>

                  <div className="info-item">
                    <label>
                      <Mail size={16} />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    ) : (
                      <span>{user.email}</span>
                    )}
                  </div>

                  <div className="info-item">
                    <label>
                      <Phone size={16} />
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    ) : (
                      <span>{user.phone || "Not provided"}</span>
                    )}
                  </div>

                  <div className="info-item">
                    <label>
                      <MapPin size={16} />
                      Location
                    </label>
                    {isEditing ? (
                      <div className="location-inputs">
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="City"
                        />
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          placeholder="Country"
                        />
                      </div>
                    ) : (
                      <span>
                        {user.city && user.country 
                          ? `${user.city}, ${user.country}`
                          : "Not provided"}
                      </span>
                    )}
                  </div>

                  <div className="info-item">
                    <label>
                      <Calendar size={16} />
                      Member Since
                    </label>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </div>

                <div className="action-buttons">
                  {isEditing ? (
                    <>
                      <button 
                        type="submit" 
                        className="save-button"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                      <button 
                        type="button" 
                        className="cancel-button"
                        onClick={() => setIsEditing(false)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button 
                      type="button" 
                      className="edit-button"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
