
import React, { useState, useRef } from "react";
import "./newHotel.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewHotel = () => {
  const [files, setFiles] = useState([]);
  const [info, setInfo] = useState({});
  const [rooms, setRooms] = useState([]);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const { data, loading } = useFetch("/rooms");

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelect = (e) => {
    const value = Array.from(e.target.selectedOptions, (option) => option.value);
    setRooms(value);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleRemoveFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    let photoUrls = [];
    if (files && files.length > 0) {
      try {
        photoUrls = await Promise.all(
          files.map(async (file) => {
            const data = new FormData();
            data.append("file", file);
            data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
            const res = await axios.post(
              `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
              data,
              { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data.url;
          })
        );
      } catch (err) {
        alert("One or more image uploads failed!");
        return;
      }
    }
    const newHotel = { ...info, rooms, photos: photoUrls };
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/hotels", newHotel, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      alert("Hotel created successfully!");
      navigate("/hotels");
    } catch (err) {
      alert("Failed to create hotel: " + (err.response?.data?.message || err.message));
    }
  };

  // Step 1: Images
  // Step 2: Basic Info
  // Step 3: Details & Rooms

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Add New Hotel</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <div
              className="image-drop-area"
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current.click()}
              style={{ cursor: "pointer" }}
            >
              <input
                type="file"
                id="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {files.length === 0 ? (
                <div className="image-drop-placeholder">
                  <DriveFolderUploadOutlinedIcon style={{ fontSize: 48, color: "#4cc9f0" }} />
                  <p>Drag & drop hotel images here, or click to select</p>
                </div>
              ) : (
                <div className="image-preview-list">
                  {files.map((file, idx) => (
                    <div key={idx} className="image-preview-item">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${idx + 1}`}
                        className="image-preview"
                      />
                      <button type="button" className="remove-image-btn" onClick={() => handleRemoveFile(idx)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="right">
            <form>
              <div className="form-section">
                <h2>Basic Info</h2>
                <div className="formInput">
                  <label>Name</label>
                  <input id="name" type="text" placeholder="Hotel Name" onChange={handleChange} required />
                </div>
                <div className="formInput">
                  <label>Type</label>
                  <input id="type" type="text" placeholder="hotel/apartment/resort" onChange={handleChange} required />
                </div>
                <div className="formInput">
                  <label>City</label>
                  <input id="city" type="text" placeholder="City" onChange={handleChange} required />
                </div>
                <div className="formInput">
                  <label>Address</label>
                  <input id="address" type="text" placeholder="123 Main St" onChange={handleChange} required />
                </div>
              </div>
              <div className="form-section">
                <h2>Details</h2>
                <div className="formInput">
                  <label>Distance (from center)</label>
                  <input id="distance" type="text" placeholder="500m" onChange={handleChange} required />
                </div>
                <div className="formInput">
                  <label>Title</label>
                  <input id="title" type="text" placeholder="Hotel title" onChange={handleChange} required />
                </div>
                <div className="formInput">
                  <label>Description</label>
                  <textarea id="desc" placeholder="Hotel description" onChange={handleChange} required />
                </div>
                <div className="formInput">
                  <label>Cheapest Price</label>
                  <input id="cheapestPrice" type="number" placeholder="100" onChange={handleChange} required />
                </div>
                <div className="formInput">
                  <label>Rating (0-5)</label>
                  <input id="rating" type="number" min="0" max="5" step="0.1" placeholder="4.5" onChange={handleChange} />
                </div>
                <div className="formInput">
                  <label>Featured</label>
                  <select id="featured" onChange={handleChange}>
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </select>
                </div>
              </div>
              <div className="form-section">
                <h2>Rooms</h2>
                <div className="selectRooms">
                  <label>Choose Rooms</label>
                  <select id="rooms" multiple onChange={handleSelect}>
                    {loading
                      ? "Loading..."
                      : data && data.map((room) => (
                          <option key={room._id} value={room._id}>
                            {room.title}
                          </option>
                        ))}
                  </select>
                </div>
              </div>
              <button className="submit-btn" onClick={handleClick}>Add Hotel</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHotel;
