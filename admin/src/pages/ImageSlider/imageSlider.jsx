import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./imageSlider.scss";

const NewImageSlider = ({ inputs = [], title }) => {

    // Debug environment variables
  console.log("Cloudinary Cloud Name:", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);
  console.log("Cloudinary Upload Preset:", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

  const [file, setFile] = useState(null);
  const [info, setInfo] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!info.name || info.name.trim() === "") {
      alert("Please enter an image title");
      return;
    }
    if (!file) {
      alert("Please select an image file");
      return;
    }

    const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      alert("Missing Cloudinary config. Please set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET.");
      return;
    }

    let imageUrl = "";
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
        credentials: 'omit',
        mode: 'cors',
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Upload failed ${resp.status}: ${txt}`);
      }
      const json = await resp.json();
      imageUrl = json.secure_url || json.url;
    } catch (err) {
      console.error("Cloudinary upload failed", err);
      alert("Image upload failed");
      return;
    }

    // Prepare data to send to backend
    const sliderData = {
      name: info.name,
      imageType: file.type,
      imagePath: imageUrl,
    };

    try {
      await axios.post("http://localhost:8800/api/imageslider", sliderData, { withCredentials: true });
      setShowSuccess(true);
    } catch (err) {
      console.error("Failed to create image slider:", err);
      alert("Error saving data");
    }
  };

  return (
    <div className="imageslider">
      <Sidebar />
      <div className="imagesliderContainer">
        <Navbar />
        <div className="imagesliderTop">
          <h1>{title || "Add New Slider Image"}</h1>
        </div>
        <div className="imagesliderBottom">
          <div className="imagesliderPreview">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://www.freeiconspng.com/thumbs/no-image-icon/no-image-icon-6.png"
              }
              alt="preview"
              className="imagesliderPreviewImage"
            />
          </div>
          <div className="imagesliderFormContainer">
            <form className="imagesliderForm" onSubmit={handleClick}>
              <div className="imagesliderFormGroup">
                <label htmlFor="file" className="imagesliderUploadLabel">
                  <DriveFolderUploadOutlinedIcon className="imagesliderUploadIcon" />
                  <span>Choose Slider Image</span>
                </label>
                <input
                  type="file"
                  id="file"
                  accept="image/jpeg, image/png"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="imagesliderFileInput"
                />
                {file && <p className="imagesliderFileName">{file.name}</p>}
              </div>

              {inputs.map((input) => (
                <div className="imagesliderFormGroup" key={input.id}>
                  <label htmlFor={input.id}>{input.label}</label>
                  {input.type === "textarea" ? (
                    <textarea
                      id={input.id}
                      placeholder={input.placeholder}
                      onChange={handleChange}
                      required={input.required}
                      className="imagesliderTextarea"
                    />
                  ) : (
                    <input
                      id={input.id}
                      type={input.type}
                      placeholder={input.placeholder}
                      onChange={handleChange}
                      required={input.required}
                      className="imagesliderInput"
                    />
                  )}
                </div>
              ))}

              <button type="submit" className="imagesliderSubmitButton">
                Upload Slider Image
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {showSuccess && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            width: "min(520px, 92vw)",
            boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
            textAlign: "center",
          }}>
            <h3 style={{ margin: 0, marginBottom: 8, color: "#1f2937" }}>Slider Image Added</h3>
            <p style={{ margin: 0, marginBottom: 20, color: "#4b5563" }}>
              Your slider image has been uploaded successfully.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => navigate("/imageslider")}
                style={{
                  padding: "10px 16px",
                  background: "#2d5c7f",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Go to Slider Images
              </button>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setFile(null);
                  setInfo({});
                }}
                style={{
                  padding: "10px 16px",
                  background: "#f3f4f6",
                  color: "#111827",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Add Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewImageSlider;