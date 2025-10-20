import "../new/new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { testCloudinaryConfig, testCloudinaryUpload } from "../../utils/cloudinaryTest";

const EditUser = () => {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`/api/users/${id}`, { withCredentials: true });
        setInfo({
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          city: data.city || "",
          country: data.country || "",
          role: data.role || "user",
          isAdmin: !!data.isAdmin,
          img: data.img || "",
        });
      } catch (err) {
        toast.error("Failed to load user");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setInfo((prev) => ({ ...prev, [id]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    let imageUrl = info.img || "";
    try {
      if (file) {
        if (!testCloudinaryConfig()) {
          toast.error("Cloudinary configuration missing.");
          setSubmitting(false);
          return;
        }
        const uploadRes = await testCloudinaryUpload(file);
        imageUrl = uploadRes.url;
      }

      const payload = {
        username: info.username,
        email: info.email,
        phone: info.phone,
        city: info.city,
        country: info.country,
        role: info.role,
        isAdmin: !!info.isAdmin,
        img: imageUrl,
      };

      await toast.promise(
        axios.put(`/api/users/update/${id}`, payload, { withCredentials: true }),
        {
          loading: "Updating user...",
          success: "User updated successfully!",
          error: "Failed to update user.",
        }
      );
      navigate("/users");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
          <h1>Edit User</h1>
        <div className="bottom">
          <div className="left" onClick={() => fileInputRef.current?.click()} style={{ cursor: "pointer" }}>
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : info.img || "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt="preview"
            />
          </div>
          <div className="right">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="formInput">
                  <label htmlFor="file">
                    Avatar: <DriveFolderUploadOutlinedIcon className="icon" />
                  </label>
                  <input
                    type="file"
                    id="file"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                </div>

                <div className="formInput">
                  <label htmlFor="username">Username</label>
                  <input id="username" type="text" value={info.username} onChange={handleChange} required />
                </div>
                <div className="formInput">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" value={info.email} onChange={handleChange} required />
                </div>
                <div className="formInput">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" type="text" value={info.phone} onChange={handleChange} required />
                </div>
                <div className="formInput">
                  <label htmlFor="city">City</label>
                  <input id="city" type="text" value={info.city} onChange={handleChange} required />
                </div>
                <div className="formInput">
                  <label htmlFor="country">Country</label>
                  <input id="country" type="text" value={info.country} onChange={handleChange} required />
                </div>
                <div className="formInput">
                  <label htmlFor="role">Role</label>
                  <select id="role" value={info.role} onChange={handleChange}>
                    <option value="user">User</option>
                    <option value="tourist guide">Tourist Guide</option>
                  </select>
                </div>
                <div className="formInput" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label htmlFor="isAdmin">Admin</label>
                  <input id="isAdmin" type="checkbox" checked={!!info.isAdmin} onChange={handleChange} />
                </div>

                <button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
