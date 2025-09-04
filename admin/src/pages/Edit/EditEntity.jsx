import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./editEntity.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import toast from "react-hot-toast";
import { testCloudinaryConfig, testCloudinaryUpload } from "../../utils/cloudinaryTest";

const EditEntity = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname.split("/")[1];

    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:8800/api/${path}/${id}`, { withCredentials: true });
                // Handle different response formats
                const responseData = res.data;
                if (responseData.data) {
                    // Places format: { success: true, data: {...} }
                    setFormData(responseData.data);
                } else {
                    // Direct object format
                    setFormData(responseData);
                }
            } catch (err) {
                console.error("Failed to fetch:", err);
                toast.error("Failed to load data for editing.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, path]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = formData.img || formData.photo || "";
            
            if (file) {
                // Test Cloudinary configuration first
                if (!testCloudinaryConfig()) {
                    toast.error("Cloudinary configuration is missing. Please check your environment variables.");
                    return;
                }

                try {
                    // Use the test function for better debugging
                    const uploadRes = await testCloudinaryUpload(file);
                    imageUrl = uploadRes.url;
                    toast.success("Image uploaded successfully!");
                } catch (uploadErr) {
                    console.error("Upload error:", uploadErr);
                    toast.error("Image upload failed: " + uploadErr.message);
                    return;
                }
            }

            const payload = { ...formData };
            
            // Handle role validation for users
            if (path === 'users' && payload.role) {
                const validRoles = ['user', 'tourist guide'];
                if (!validRoles.includes(payload.role)) {
                    // If role is invalid, remove it from payload to keep existing role
                    delete payload.role;
                }
            }
            
            // Remove fields that shouldn't be updated
            delete payload._id;
            delete payload.__v;
            delete payload.createdAt;
            delete payload.updatedAt;
            delete payload.password; // Never update password through this form
            
            if (imageUrl) {
              if (payload.img !== undefined) payload.img = imageUrl;
              if (payload.photo !== undefined) payload.photo = imageUrl;
            }

            // Use the correct endpoint for users
            const updateUrl = path === 'users' 
                ? `http://localhost:8800/api/${path}/update/${id}`
                : `http://localhost:8800/api/${path}/${id}`;

            await toast.promise(
                axios.put(updateUrl, payload, { withCredentials: true }),
                {
                    loading: 'Updating item...',
                    success: 'Item updated successfully!',
                    error: 'Failed to update item.',
                }
            );
            navigate(`/${path}`);
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Update failed: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <>
            <div className="new">
                <Sidebar />
                <div className="newContainer">
                    <Navbar />
                    <div className="editEntity">
                        <div className="editHeader">
                          <button className="backButton" onClick={() => navigate(-1)}>
                            ← Back
                          </button>
                          <h2>Edit {path.slice(0, -1)}</h2>
                        </div>
                        <div className="editBody">
                          <div className="leftPreview">
                            <img
                              src={
                                file
                                  ? URL.createObjectURL(file)
                                  : formData.img || formData.photo || "/assets/images/no-image-icon-0.jpg"
                              }
                              alt="preview"
                            />
                          </div>
                          <form onSubmit={handleSubmit} className="rightForm">
                            <div className="formInput">
                              <label htmlFor="file">Image: <DriveFolderUploadOutlinedIcon className="icon" /></label>
                              <input type="file" id="file" onChange={(e) => setFile(e.target.files[0])} />
                            </div>
                            {Object.keys(formData).map((key) => {
                                // Skip system fields
                                if (key === "_id" || key === "__v" || key === "createdAt" || key === "updatedAt" || key === "password") {
                                    return null;
                                }
                                
                                // Special handling for role field in users
                                if (path === 'users' && key === 'role') {
                                    return (
                                        <div key={key} className="form-group">
                                            <select
                                                name={key}
                                                value={formData[key] || "user"}
                                                onChange={handleChange}
                                            >
                                                <option value="user">User</option>
                                                <option value="tourist guide">Tourist Guide</option>
                                            </select>
                                            <label>{key}</label>
                                        </div>
                                    );
                                }
                                
                                // Special handling for boolean fields
                                if (typeof formData[key] === 'boolean') {
                                    return (
                                        <div key={key} className="form-group">
                                            <select
                                                name={key}
                                                value={formData[key] ? "true" : "false"}
                                                onChange={(e) => handleChange({
                                                    target: {
                                                        name: key,
                                                        value: e.target.value === "true"
                                                    }
                                                })}
                                            >
                                                <option value="true">True</option>
                                                <option value="false">False</option>
                                            </select>
                                            <label>{key}</label>
                                        </div>
                                    );
                                }
                                
                                // Default text input
                                return (
                                    <div key={key} className="form-group">
                                        <input
                                            type="text"
                                            name={key}
                                            value={formData[key] || ""}
                                            onChange={handleChange}
                                            placeholder=" "
                                        />
                                        <label>{key}</label>
                                    </div>
                                );
                            })}
                            <button type="submit" className="submit-btn">Save Changes</button>
                          </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditEntity;