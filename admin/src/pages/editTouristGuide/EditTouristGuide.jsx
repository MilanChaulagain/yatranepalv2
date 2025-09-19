import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import axios from "axios";
import toast from "react-hot-toast";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { touristguideInputs } from "../../formSource";
import { testCloudinaryConfig, testCloudinaryUpload } from "../../utils/cloudinaryTest";
import "./editTouristGuide.scss";

const CATEGORY_OPTIONS = touristguideInputs.find(i => i.id === 'category')?.options || [];

const EditTouristGuide = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [info, setInfo] = useState({});
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    const controller = new AbortController();
    isMounted.current = true;

    const fetchGuide = async () => {
      try {
        const res = await axios.get(`http://localhost:8800/api/touristguide/${id}`, { withCredentials: true, signal: controller.signal });
        if (!isMounted.current) return;
        setInfo(res.data || {});
      } catch (err) {
        if (!isMounted.current) return;
        if (err?.name === 'CanceledError') return;
        console.error("Failed to fetch guide:", err);
        toast.error("Failed to load tourist guide");
        navigate("/touristguide");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchGuide();
    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, multiple, options, type } = e.target;
    if (multiple) {
      const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
      setInfo(prev => ({ ...prev, [name]: selected }));
    } else if (type === 'number') {
      setInfo(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  const isValid = () => {
    const required = [
      'name','location','language','experience','contactNumber','availability','licenseNumber','category'
    ];
    for (const key of required) {
      const v = info[key];
      if (key === 'category') {
        if (!Array.isArray(v) || v.length === 0) return false;
      } else if (v === undefined || v === null || String(v).trim() === '') {
        return false;
      }
    }
    // License format: uppercase letters/digits only
    if (!/^[A-Z0-9]+$/.test(String(info.licenseNumber || '').toUpperCase())) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!isValid()) {
      toast.error("Please fill all required fields correctly.");
      return;
    }
    setSaving(true);
    try {
      let imageUrl = info.img || '';
      if (file) {
        if (!testCloudinaryConfig()) {
          toast.error("Cloudinary configuration missing.");
          if (isMounted.current) setSaving(false);
          return;
        }
        const uploaded = await testCloudinaryUpload(file);
        imageUrl = uploaded.url;
      }

      const payload = {
        name: info.name,
        img: imageUrl,
        location: info.location,
        language: info.language,
        experience: Number(info.experience),
        contactNumber: info.contactNumber,
        availability: info.availability,
        licenseNumber: String(info.licenseNumber).toUpperCase(),
        category: Array.isArray(info.category) ? info.category : [],
      };
      // server ignores email/userId on update; ensure we don't send them

      await toast.promise(
        axios.put(`http://localhost:8800/api/touristguide/${id}`, payload, { withCredentials: true }),
        {
          loading: 'Updating guide...',
          success: 'Guide updated successfully!',
          error: 'Failed to update guide.'
        }
      );
      navigate(`/touristguide/${id}`);
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      if (isMounted.current) setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="new">
        <Sidebar />
        <div className="newContainer">
          <Navbar />
          <div className="loading" style={{ padding: 20, textAlign: 'center' }}>Loading guide...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Edit Tourist Guide</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={file ? URL.createObjectURL(file) : (info.img || "/images/no-image-icon-0.jpg")}
              alt="Preview"
            />
          </div>
          <div className="right">
            <form onSubmit={handleSubmit}>
              <div className="formInput">
                <label htmlFor="file">Profile Image <DriveFolderUploadOutlinedIcon className="icon" /></label>
                <input type="file" id="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
              </div>

              {/* Read-only Email */}
              {info.email && (
                <div className="formInput">
                  <label>Email (linked user)</label>
                  <input type="email" value={info.email} readOnly />
                </div>
              )}

              {/* Editable fields */}
              <div className="formInput">
                <label>Name</label>
                <input name="name" type="text" value={info.name || ''} onChange={handleChange} required />
              </div>
              <div className="formInput">
                <label>Location</label>
                <input name="location" type="text" value={info.location || ''} onChange={handleChange} required />
              </div>
              <div className="formInput">
                <label>Language</label>
                <input name="language" type="text" value={info.language || ''} onChange={handleChange} required />
              </div>
              <div className="formInput">
                <label>Experience (years)</label>
                <input name="experience" type="number" step="1" min="0" value={info.experience ?? ''} onChange={handleChange} required />
              </div>
              <div className="formInput">
                <label>Contact Number</label>
                <input name="contactNumber" type="text" value={info.contactNumber || ''} onChange={handleChange} required />
              </div>
              <div className="formInput">
                <label>Availability</label>
                <input name="availability" type="text" value={info.availability || ''} onChange={handleChange} required />
              </div>
              <div className="formInput">
                <label>License Number</label>
                <input name="licenseNumber" type="text" value={info.licenseNumber || ''} onChange={(e)=>{
                  const v = e.target.value.toUpperCase();
                  setInfo(prev=>({...prev, licenseNumber: v}));
                }} required />
              </div>
              <div className="formInput">
                <label>Category</label>
                <select name="category" multiple value={Array.isArray(info.category) ? info.category : []} onChange={handleChange}>
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={saving || !isValid()}>
                {saving ? 'Saving...' : 'Update Guide'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTouristGuide;
