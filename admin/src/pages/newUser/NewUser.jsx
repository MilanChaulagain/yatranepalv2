import "../new/new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { testCloudinaryConfig, testCloudinaryUpload } from "../../utils/cloudinaryTest";

const NewUser = () => {
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState({ role: "user" });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    let v = value;
    if (type === "checkbox") v = checked;
    setInfo((prev) => ({ ...prev, [id]: v }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    let imageUrl = "";
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
        username: info.username || "",
        email: info.email || "",
        password: info.password || "",
        phone: info.phone || "",
        city: info.city || "",
        country: info.country || "",
        role: info.role || "user",
        img: imageUrl,
      };

      await toast.promise(
        axios.post("/api/auth/register", payload, { withCredentials: true }),
        {
          loading: "Creating user...",
          success: "User created successfully!",
          error: "Failed to create user.",
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
        <div className="top">
          <h1>Add New User</h1>
        </div>
        <div className="bottom">
          <div className="left" onClick={() => fileInputRef.current?.click()} style={{ cursor: "pointer" }}>
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt="preview"
            />
          </div>
          <div className="right">
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
                <input id="username" type="text" placeholder="johndoe" onChange={handleChange} required />
              </div>
              <div className="formInput">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="john@example.com" onChange={handleChange} required />
              </div>
              <div className="formInput">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" placeholder="••••••••" onChange={handleChange} required />
              </div>
              <div className="formInput">
                <label htmlFor="phone">Phone</label>
                <input id="phone" type="text" placeholder="98xxxxxxxx" onChange={handleChange} required />
              </div>
              <div className="formInput">
                <label htmlFor="city">City</label>
                <input id="city" type="text" placeholder="Kathmandu" onChange={handleChange} required />
              </div>
              <div className="formInput">
                <label htmlFor="country">Country</label>
                <input id="country" type="text" placeholder="Nepal" onChange={handleChange} required />
              </div>
              <div className="formInput">
                <label htmlFor="role">Role</label>
                <select id="role" value={info.role} onChange={handleChange}>
                  <option value="user">User</option>
                  <option value="tourist guide">Tourist Guide</option>
                </select>
              </div>

              <button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Create User"}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewUser;
