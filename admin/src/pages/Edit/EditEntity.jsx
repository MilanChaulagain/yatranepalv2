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
    const [files, setFiles] = useState([]);

    const isPlace = path === 'place';
    const isHotel = path === 'hotels';
    const isUser = path === 'users';

    const PLACE_CATEGORIES = [
        'Cultural', 'Natural', 'Historical', 'Adventure', 'Religious', 'Food Destinations', 'Photography'
    ];
    const CITIES = ['kathmandu', 'lalitpur', 'bhaktapur', 'pokhara'];

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

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        const parsed = value === '' ? '' : Number(value);
        setFormData({ ...formData, [name]: parsed });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let photos = formData.photos || [];
            // If files are selected, upload to Cloudinary
            if (files && files.length > 0) {
                if (!testCloudinaryConfig()) {
                    toast.error("Cloudinary configuration is missing. Please check your environment variables.");
                    return;
                }
                try {
                    const uploadedUrls = await Promise.all(
                        files.map(async (file) => {
                            const uploadRes = await testCloudinaryUpload(file);
                            return uploadRes.url;
                        })
                    );
                    photos = uploadedUrls;
                    toast.success("Images uploaded successfully!");
                } catch (uploadErr) {
                    toast.error("Image upload failed: " + uploadErr.message);
                    return;
                }
            }

            const payload = { ...formData };
            // For hotels, update photos array
            if (isHotel) {
                payload.photos = photos;
            }
            // Handle role validation for users
            if (isUser && payload.role) {
                const validRoles = ['user', 'tourist guide'];
                if (!validRoles.includes(payload.role)) {
                    delete payload.role;
                }
            }
            // Remove fields that shouldn't be updated
            delete payload._id;
            delete payload.__v;
            delete payload.createdAt;
            delete payload.updatedAt;
            delete payload.password;

            // Use the correct endpoint for users
            const updateUrl = isUser 
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
                                                    <div className="headerLeft">
                                                        <button className="backButton" onClick={() => navigate(-1)}>
                                                            ← Back
                                                        </button>
                                                        <h2>Edit {path.slice(0, -1)}</h2>
                                                    </div>
                                                    <div className="headerActions">
                                                        <button className="secondary-btn" type="button" onClick={() => navigate(`/${path}`)}>Cancel</button>
                                                        <button className="primary-btn" type="submit" form="editEntityForm">Save Changes</button>
                                                    </div>
                                                </div>
                                                <div className="editBody">
                                                    <div className="leftPreview" onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{
                                                        e.preventDefault();
                                                        const dropped = Array.from(e.dataTransfer.files || []);
                                                        if (!dropped.length) return;
                                                        setFiles(dropped);
                                                    }}>
                                                        {/* Show first photo for hotels, else fallback */}
                                                        <img
                                                            src={
                                                                files.length > 0
                                                                    ? URL.createObjectURL(files[0])
                                                                    : (Array.isArray(formData.photos) && formData.photos.length > 0)
                                                                        ? formData.photos[0]
                                                                        : formData.img || formData.photo || "/images/no-image-icon-0.jpg"
                                                            }
                                                            alt="preview"
                                                        />
                                                    </div>
                                                    <form onSubmit={handleSubmit} id="editEntityForm" className="rightForm">
                                                        {/* Media uploader */}
                                                        {isHotel ? (
                                                            <div className="formInput">
                                                                <label htmlFor="file">Images <DriveFolderUploadOutlinedIcon className="icon" /></label>
                                                                <input type="file" id="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
                                                                {files.length > 0 && (
                                                                    <div className="fileChips">
                                                                        {files.map((f, i) => (
                                                                            <span key={i} className="chip" title={f.name}>{f.name}</span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="formInput">
                                                                <label htmlFor="file">Image <DriveFolderUploadOutlinedIcon className="icon" /></label>
                                                                <input type="file" id="file" onChange={(e) => setFiles([e.target.files[0]])} />
                                                                {files.length > 0 && (
                                                                    <div className="fileChips">
                                                                        <span className="chip" title={files[0].name}>{files[0].name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Current images grid for hotels */}
                                                        {isHotel && Array.isArray(formData.photos) && formData.photos.length > 0 && (
                                                            <div className="form-group">
                                                                <label>Current Images</label>
                                                                <div className="thumbGrid">
                                                                    {formData.photos.map((url, idx) => (
                                                                        <img key={idx} src={url} alt={`Hotel ${idx + 1}`} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Dynamic fields */}
                                                        {Object.keys(formData).map((key) => {
                                                            if (key === "_id" || key === "__v" || key === "createdAt" || key === "updatedAt" || key === "password") {
                                                                return null;
                                                            }
                                                            if (isUser && key === 'role') {
                                                                return (
                                                                    <div key={key} className="form-group">
                                                                        <label>Role</label>
                                                                        <select name={key} value={formData[key] || "user"} onChange={handleChange}>
                                                                            <option value="user">User</option>
                                                                            <option value="tourist guide">Tourist Guide</option>
                                                                        </select>
                                                                    </div>
                                                                );
                                                            }
                                                            if (typeof formData[key] === 'boolean') {
                                                                return (
                                                                    <div key={key} className="form-group">
                                                                        <label>{key}</label>
                                                                        <select
                                                                            name={key}
                                                                            value={formData[key] ? "true" : "false"}
                                                                            onChange={(e) => handleChange({ target: { name: key, value: e.target.value === "true" } })}
                                                                        >
                                                                            <option value="true">True</option>
                                                                            <option value="false">False</option>
                                                                        </select>
                                                                    </div>
                                                                );
                                                            }
                                                            if (isPlace && key === 'category') {
                                                                return (
                                                                    <div key={key} className="form-group">
                                                                        <label>Category</label>
                                                                        <select name={key} value={formData[key] || ''} onChange={handleChange}>
                                                                            <option value="">Select category</option>
                                                                            {PLACE_CATEGORIES.map(cat => (
                                                                                <option key={cat} value={cat}>{cat}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                );
                                                            }
                                                            if (isPlace && key === 'city') {
                                                                return (
                                                                    <div key={key} className="form-group">
                                                                        <label>City</label>
                                                                        <select name={key} value={formData[key] || ''} onChange={handleChange}>
                                                                            <option value="">Select city</option>
                                                                            {CITIES.map(c => (
                                                                                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                );
                                                            }
                                                            if (key.toLowerCase().includes('description')) {
                                                                const val = formData[key] || '';
                                                                return (
                                                                    <div key={key} className="form-group">
                                                                        <label>Description</label>
                                                                        <textarea name={key} value={val} onChange={handleChange} placeholder="Write a clear, concise description..." />
                                                                        <div className="helper-text">{val.length}/1000</div>
                                                                    </div>
                                                                );
                                                            }
                                                            if (/(price|rating|distance|lat|lng)/i.test(key)) {
                                                                return (
                                                                    <div key={key} className="form-group">
                                                                        <label>{key}</label>
                                                                        <input type="number" step="any" name={key} value={formData[key] ?? ''} onChange={handleNumberChange} placeholder="0" />
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <div key={key} className="form-group">
                                                                    <label>{key}</label>
                                                                    <input type="text" name={key} value={formData[key] || ''} onChange={handleChange} placeholder=" " />
                                                                </div>
                                                            );
                                                        })}

                                                        <div className="formActions">
                                                            <button type="button" className="secondary-btn" onClick={() => navigate(`/${path}`)}>Cancel</button>
                                                            <button type="submit" className="submit-btn">Save Changes</button>
                                                        </div>
                                                    </form>
                                                </div>
                                        </div>
                </div>
            </div>
        </>
    );
};

export default EditEntity;