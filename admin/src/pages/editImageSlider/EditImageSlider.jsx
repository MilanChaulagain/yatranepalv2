import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import "./editImageSlider.scss";

const EditImageSlider = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [slider, setSlider] = useState({ name: "", imagePath: "", imageType: "" });

  const fallbackNoImage = "/images/no-image-icon-0.jpg";

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    if (!slider?.imagePath) return fallbackNoImage;
    const value = slider.imagePath.toString();
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    return cloudName ? `https://res.cloudinary.com/${cloudName}/image/upload/${value}` : fallbackNoImage;
  }, [file, slider?.imagePath]);

  useEffect(() => {
    const ac = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:8800/api/imageslider/${id}`, { signal: ac.signal, withCredentials: true });
        setSlider({
          name: res.data?.name || "",
          imagePath: res.data?.imagePath || "",
          imageType: res.data?.imageType || "",
        });
      } catch (e) {
        if (axios.isCancel(e)) return;
        console.error("Failed to load slider", e);
        toast.error("Failed to load slider");
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
    return () => ac.abort();
  }, [id]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSlider((prev) => ({ ...prev, [id]: value }));
  };

  const uploadToCloudinary = async (imageFile) => {
    const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error("Missing Cloudinary config (REACT_APP_CLOUDINARY_CLOUD_NAME/UPLOAD_PRESET)");
    }
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", UPLOAD_PRESET);
    const uploadClient = axios.create();
    const uploadRes = await uploadClient.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      data
    );
    return {
      imagePath: uploadRes.data.secure_url,
      imageType: imageFile.type,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slider.name || slider.name.trim() === "") {
      toast.error("Please enter an image title");
      return;
    }
    try {
      setSaving(true);
      let payload = { name: slider.name };
      if (file) {
        const { imagePath, imageType } = await uploadToCloudinary(file);
        payload.imagePath = imagePath;
        payload.imageType = imageType;
      }
      const res = await axios.put(`http://localhost:8800/api/imageslider/${id}`, payload, { withCredentials: true });
      toast.success("Slider updated successfully");
      navigate("/imageslider");
      return res;
    } catch (err) {
      console.error("Failed to update slider", err);
      const msg = err?.response?.data?.error || "Update failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="imageslider">
        <Sidebar />
        <div className="imagesliderContainer">
          <Navbar />
          <div className="imagesliderTop"><h1>Loading slider...</h1></div>
        </div>
      </div>
    );
  }

  return (
    <div className="imageslider">
      <Sidebar />
      <div className="imagesliderContainer">
        <Navbar />
        <div className="imagesliderTop">
          <h1>Edit Slider Image</h1>
        </div>
        <div className="imagesliderBottom">
          <div className="imagesliderPreview">
            <img src={previewUrl} alt="preview" className="imagesliderPreviewImage" onError={(e) => {
              if (e.currentTarget.src !== fallbackNoImage) e.currentTarget.src = fallbackNoImage;
            }} />
          </div>
          <div className="imagesliderFormContainer">
            <form className="imagesliderForm" onSubmit={handleSubmit}>
              <div className="imagesliderFormGroup">
                <label htmlFor="file" className="imagesliderUploadLabel">
                  <DriveFolderUploadOutlinedIcon className="imagesliderUploadIcon" />
                  <span>Replace Image (optional)</span>
                </label>
                <input
                  type="file"
                  id="file"
                  accept="image/jpeg, image/png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="imagesliderFileInput"
                />
                {file && <p className="imagesliderFileName">{file.name}</p>}
              </div>

              <div className="imagesliderFormGroup">
                <label htmlFor="name">Image Title</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Beautiful Landscape"
                  value={slider.name}
                  onChange={handleChange}
                  required
                  className="imagesliderInput"
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="imagesliderSubmitButton" onClick={() => navigate("/imageslider")}
                  style={{ background: "#e5e7eb", color: "#111827" }}
                >
                  Cancel
                </button>
                <button type="submit" className="imagesliderSubmitButton" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditImageSlider;
