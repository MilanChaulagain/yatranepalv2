
import React, { useState, useRef } from "react";
import "./newHotel.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewHotel = () => {
  const [files, setFiles] = useState([]);
  const [info, setInfo] = useState({});
  const [rooms, setRooms] = useState([]);
  // const [step, setStep] = useState(1);
  const [loadingLatLng, setLoadingLatLng] = useState(false);
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geoError, setGeoError] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [showSuccess, setShowSuccess] = useState(false);

  const { data, loading, error } = useFetch("/api/rooms");

  const handleChange = (e) => {
    const { id, value } = e.target;
    let parsed = value;
    if (id === "featured") parsed = value === "true";
    if (id === "cheapestPrice" || id === "rating" || id === "latitude" || id === "longitude") {
      parsed = value === "" ? "" : Number(value);
    }
    setInfo((prev) => ({ ...prev, [id]: parsed }));
  if (geoError) setGeoError("");
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
            
            // Use XMLHttpRequest to bypass any fetch/axios interceptors
            return new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              
              xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`);
              
              // Explicitly set withCredentials to false to prevent sending auth
              xhr.withCredentials = false;
              
              xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                  try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response.secure_url || response.url);
                  } catch (e) {
                    reject(new Error('Failed to parse response'));
                  }
                } else {
                  reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                }
              };
              
              xhr.onerror = function() {
                reject(new Error('Network error occurred'));
              };
              
              xhr.send(data);
            });
          })
        );
      } catch (err) {
        alert("One or more image uploads failed: " + err.message);
        return;
      }
    }
    const roomsPayload = Array.isArray(rooms) ? rooms.filter(Boolean) : [];
    const newHotel = { ...info, rooms: roomsPayload, photos: photoUrls };
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/hotels", newHotel, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setShowSuccess(true);
      // Only clear form after successful submission
      setInfo({});
      setRooms([]);
      setFiles([]);
    } catch (err) {
      alert("Failed to create hotel: " + (err.response?.data?.message || err.message));
      // Don't clear the form on error - user can fix and retry
    }
  };

  const handleAddAnother = () => {
    setInfo({});
    setRooms([]);
    setFiles([]);
    setShowSuccess(false);
  };

  // Auto-fetch latitude and longitude when address loses focus
  const handleLocationBlur = async (e) => {
    const address = e.target.value;
    if (!address) return;
    setLoadingLatLng(true);
  setGeoError("");
    try {
      const apiKey = process.env.REACT_APP_LOCATIONIQ_ACCESS_TOKEN;
  if (!apiKey) throw new Error("LocationIQ API key is missing");
      const resp = await fetch(
        `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(address + ", Nepal")}&format=json`
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const results = await resp.json();
      if (Array.isArray(results) && results.length > 0) {
        const lat = parseFloat(results[0].lat);
        const lon = parseFloat(results[0].lon);
        setInfo((prev) => ({ ...prev, latitude: lat, longitude: lon }));
      } else {
        setGeoError("No location found. Try a different address.");
      }
    } catch (err) {
      setGeoError("Failed to fetch coordinates: " + err.message);
    } finally {
      setLoadingLatLng(false);
    }
  };

  const getConfidenceScore = (result, name, city, address) => {
    let score = 0;
    const displayName = (result.display_name || "").toLowerCase();
    if (name && displayName.includes(String(name).toLowerCase())) score += 3;
    if (city && displayName.includes(String(city).toLowerCase())) score += 2;
    if (address && displayName.includes(String(address).toLowerCase())) score += 2;
    if (displayName.includes("nepal")) score += 1;
    if (result.class === "tourism") score += 1;
    return score;
  };

  const handleSuggestLocation = async () => {
    const { name, city, address } = info;
    if (!name && !city && !address) {
      setGeoError("Please fill name, city or address for suggestions.");
      return;
    }
    setLoadingLatLng(true);
    setSuggestedLocations([]);
    setShowSuggestions(false);
  setGeoError("");
    try {
      const queries = [];
      if (name && city && address) queries.push(`${name}, ${address}, ${city}, Nepal`);
      if (name && city) queries.push(`${name}, ${city}, Nepal`);
      if (name && address) queries.push(`${name}, ${address}, Nepal`);
      if (address && city) queries.push(`${address}, ${city}, Nepal`);
      if (name) queries.push(`${name}, Nepal`);
      if (city) queries.push(`${city}, Nepal`);
      if (address) queries.push(`${address}, Nepal`);
      if (name) queries.push(`${name}, Kathmandu, Nepal`);

      const apiKey = process.env.REACT_APP_LOCATIONIQ_ACCESS_TOKEN;
      if (!apiKey) throw new Error("LocationIQ API key is missing");

      const all = [];
      for (const q of queries.slice(0, 3)) {
        try {
          const resp = await fetch(
            `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(q)}&format=json`
          );
          if (!resp.ok) continue;
          const data = await resp.json();
          data.slice(0, 3).forEach((r) => {
            const lat = parseFloat(r.lat);
            const lng = parseFloat(r.lon);
            const suggestion = {
              id: `${lat}-${lng}-${Math.random()}`,
              address: r.display_name,
              lat,
              lng,
              placeId: r.place_id,
              confidence: getConfidenceScore(r, name, city, address),
            };
            if (!all.find((s) => Math.abs(s.lat - lat) < 0.001 && Math.abs(s.lng - lng) < 0.001)) {
              all.push(suggestion);
            }
          });
        } catch (e) {
          // ignore individual query errors
        }
      }
      all.sort((a, b) => b.confidence - a.confidence);
      setSuggestedLocations(all.slice(0, 5));
      setShowSuggestions(all.length > 0);
      if (all.length === 0) setGeoError("No location suggestions found.");
    } catch (err) {
      setGeoError("Failed to get location suggestions.");
    } finally {
      setLoadingLatLng(false);
    }
  };

  const handleSelectSuggestion = (s) => {
    setInfo((prev) => ({ ...prev, latitude: s.lat, longitude: s.lng }));
    setShowSuggestions(false);
    setSuggestedLocations([]);
  };

  // Step 1: Images
  // Step 2: Basic Info
  // Step 3: Details & Rooms

  return (
    <div className="">
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
                  <input id="address" type="text" placeholder="123 Main St" onChange={handleChange} onBlur={handleLocationBlur} required />
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
                {geoError && (
                  <div style={{ color: "red", margin: "10px 0", padding: "10px", backgroundColor: "#ffeeee", borderRadius: 5 }}>
                    {geoError}
                  </div>
                )}
                <div className="locationSuggestionSection" style={{ margin: "20px 0", padding: 15, border: "1px solid #ddd", borderRadius: 5, backgroundColor: "#f9f9f9" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                    <LocationOnIcon style={{ marginRight: 8, color: "#2d5c7f" }} />
                    <h3 style={{ margin: 0, color: "#2d5c7f" }}>Smart Location Finder</h3>
                  </div>
                  <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "#666" }}>
                    Fill the hotel name, city, and address above, then click below to get accurate location suggestions.
                  </p>
                  <button
                    type="button"
                    onClick={handleSuggestLocation}
                    disabled={loadingLatLng}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: loadingLatLng ? "#ccc" : "#2d5c7f",
                      color: "white",
                      border: "none",
                      borderRadius: 5,
                      cursor: loadingLatLng ? "not-allowed" : "pointer",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    }}
                  >
                    {loadingLatLng ? "Searching..." : "🎯 Suggest Exact Location"}
                  </button>

                  {showSuggestions && suggestedLocations.length > 0 && (
                    <div style={{ marginTop: 15 }}>
                      <h4 style={{ margin: "0 0 10px 0", color: "#2d5c7f" }}>Select the most accurate location:</h4>
                      <div style={{ maxHeight: 200, overflowY: "auto" }}>
                        {suggestedLocations.map((s, index) => (
                          <div
                            key={s.id}
                            onClick={() => handleSelectSuggestion(s)}
                            style={{
                              padding: 10,
                              margin: "5px 0",
                              border: "1px solid #ddd",
                              borderRadius: 5,
                              cursor: "pointer",
                              backgroundColor: "white",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#e3f2fd";
                              e.currentTarget.style.borderColor = "#2d5c7f";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "white";
                              e.currentTarget.style.borderColor = "#ddd";
                            }}
                          >
                            <div style={{ fontWeight: 500, color: "#2d5c7f", marginBottom: 3 }}>
                              #{index + 1} {s.address}
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "#666" }}>
                              📍 Lat: {s.lat.toFixed(6)}, Lng: {s.lng.toFixed(6)}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 2 }}>
                              Confidence: {s.confidence > 5 ? "High" : s.confidence > 2 ? "Medium" : "Low"}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSuggestions(false)}
                        style={{
                          marginTop: 10,
                          padding: "5px 15px",
                          backgroundColor: "transparent",
                          color: "#666",
                          border: "1px solid #ddd",
                          borderRadius: 3,
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="formInput">
                  <label>Latitude</label>
                  <input
                    id="latitude"
                    type="text"
                    placeholder={info.latitude ? String(info.latitude) : "27.7172"}
                    onChange={handleChange}
                    value={info.latitude ?? ""}
                    readOnly={loadingLatLng}
                  />
                </div>

                <div className="formInput">
                  <label>Longitude</label>
                  <input
                    id="longitude"
                    type="text"
                    placeholder={info.longitude ? String(info.longitude) : "85.3240"}
                    onChange={handleChange}
                    value={info.longitude ?? ""}
                    readOnly={loadingLatLng}
                  />
                </div>

                {loadingLatLng && (
                  <div style={{ color: "#2d5c7f", fontSize: "0.95rem", margin: "10px 0" }}>
                    🔍 Fetching coordinates...
                  </div>
                )}
              </div>
              <div className="form-section">
                <h2>Rooms</h2>
                <div className="selectRooms">
                  <label>Choose Rooms</label>
                  <select id="rooms" multiple onChange={handleSelect} disabled={loading || !!error}>
                    {loading && <option>Loading rooms...</option>}
                    {!loading && error && <option disabled>Failed to load rooms</option>}
                    {!loading && !error && data && data.length === 0 && (
                      <option disabled>No rooms found</option>
                    )}
                    {!loading && !error && data &&
                      data.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.title}
                        </option>
                      ))}
                  </select>
                  <div className="rooms-helper">{rooms.length} room(s) selected</div>
                </div>
              </div>
              <button className="submit-btn" onClick={handleClick}>Add Hotel</button>
            </form>
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
              <h3 style={{ margin: 0, marginBottom: 8, color: "#1f2937" }}>Hotel Created</h3>
              <p style={{ margin: 0, marginBottom: 20, color: "#4b5563" }}>
                Your hotel has been added successfully.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  onClick={() => navigate("/hotels")}
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
                  Go to Hotels
                </button>
                <button
                  onClick={handleAddAnother}
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
    </div>
  );
};

export default NewHotel;
