import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./editEntity.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import toast from "react-hot-toast";

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
                const data = new FormData();
                data.append("file", file);
                data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
                const uploadRes = await axios.post(
                  `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
                  data,
                  { headers: { "Content-Type": "multipart/form-data" } }
                );
                imageUrl = uploadRes.data.url;
            }

            const payload = { ...formData };
            if (imageUrl) {
              if (payload.img !== undefined) payload.img = imageUrl;
              if (payload.photo !== undefined) payload.photo = imageUrl;
            }

            await toast.promise(
                axios.put(`http://localhost:8800/api/${path}/${id}`, payload, { withCredentials: true }),
                {
                    loading: 'Updating item...',
                    success: 'Item updated successfully!',
                    error: 'Failed to update item.',
                }
            );
            navigate(`/${path}`);
        } catch (err) {
            console.error(err);
            toast.error("Update failed. Please try again.");
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
                            {Object.keys(formData).map((key) =>
                                key === "_id" || key === "__v" ? null : (
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
                                )
                            )}
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