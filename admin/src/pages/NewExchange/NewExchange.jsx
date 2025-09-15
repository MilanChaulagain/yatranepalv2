import "./NewExchange.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { moneyexchangeInputs } from "../../formSource";

const NewExchange = ({ title }) => {
  const [info, setInfo] = useState({});
  const [files, setFiles] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingLatLng, setLoadingLatLng] = useState(false);
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      setLoadingLatLng(false);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (name === "isActive") {
      val = value === "true";
    }

    setInfo((prev) => ({ ...prev, [name]: val }));
    setError("");
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).slice(0, 3);
    setFiles(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!info.name || !info.address || !info.city || !info.phone) {
      setError("Please fill in all required fields (Name, Address, City, Phone).");
      return;
    }

    const lat = parseFloat(info.latitude);
    const lng = parseFloat(info.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Please enter valid numbers for latitude and longitude.");
      return;
    }

    setUploading(true);

    try {
      let imageUrls = [];
      if (files && files.length > 0) {
        imageUrls = await Promise.all(
          Array.from(files).map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append(
              "upload_preset",
              process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
            );

            const res = await axios.post(
              `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            return res.data.secure_url;
          })
        );
      }

      const newExchange = {
        ...info,
        images: imageUrls,
        location: {
          type: "Point",
          coordinates: [lng, lat],
        },
      };

      delete newExchange.latitude;
      delete newExchange.longitude;

      await axios.post("/money-exchange", newExchange, {
        withCredentials: true,
      });

      if (!isMounted.current) return;
      alert("Exchange Center created successfully!");
      navigate("/money-exchange");
    } catch (err) {
      if (!isMounted.current) return;
      console.error("Create error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || "Failed to create Exchange Center."
      );
    } finally {
      if (isMounted.current) setUploading(false);
    }
  };

  const handleLocationBlur = async (e) => {
    const location = e.target.value;
    if (!location) return;

    if (!isMounted.current) return;
    setLoadingLatLng(true);
    setError("");

    try {
      const apiKey = process.env.REACT_APP_LOCATIONIQ_ACCESS_TOKEN;
      if (!apiKey) throw new Error("LocationIQ API key is missing");

      const response = await fetch(
        `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(
          location + ", Nepal"
        )}&format=json`
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        if (isMounted.current) {
          setInfo((prev) => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lon.toString(),
          }));
        }
      } else {
        if (isMounted.current) setError("No location found.");
      }
    } catch (err) {
      console.error("Failed to fetch coordinates:", err);
      if (isMounted.current) setError("Failed to fetch coordinates.");
    } finally {
      if (isMounted.current) setLoadingLatLng(false);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title || "Add New Exchange Center"}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                files && files.length > 0
                  ? URL.createObjectURL(files[0])
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt="Preview"
            />
          </div>
          <div className="right">
            <form onSubmit={handleSubmit}>
              <div className="formInput">
                <label htmlFor="file">
                  Upload Images (Max 3): <DriveFolderUploadOutlinedIcon />
                </label>
                <input
                  type="file"
                  id="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>

              <div className="formGrid">
                {moneyexchangeInputs
                  .filter(input => !["latitude", "longitude"].includes(input.id.trim().toLowerCase()))
                  .map(input => (
                    <div className="formInput" key={input.id}>
                      <label htmlFor={input.id}>{input.label}</label>
                      <input
                        id={input.id}
                        name={input.id}
                        type={input.type}
                        placeholder={input.placeholder}
                        onChange={handleChange}
                        required={input.required}
                        step={input.step}
                        min={input.min}
                        max={input.max}
                        value={input.id === "location" ? info.location || "" : info[input.id] || ""}
                        onBlur={input.id === "location" ? handleLocationBlur : undefined}
                      />
                    </div>
                  ))}

                <div className="formInput">
                  <label htmlFor="isActive">Is Active?</label>
                  <select
                    id="isActive"
                    name="isActive"
                    onChange={handleChange}
                    required
                    value={info.isActive !== undefined ? info.isActive.toString() : ""}
                  >
                    <option value="">Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                {/* Smart Location Suggestion Section */}
                <div className="locationSuggestionSection" style={{ margin: "20px 0", padding: "15px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#f9f9f9" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                    <LocationOnIcon style={{ marginRight: "8px", color: "#2d5c7f" }} />
                    <h3 style={{ margin: 0, color: "#2d5c7f" }}>Smart Location Finder</h3>
                  </div>
                  <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "#666" }}>
                    Fill in the exchange name, city, and address above, then click the button below to get accurate location suggestions.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      const { name, city, address, location } = info;
                      if (!name && !city && !address && !location) {
                        setError("Please fill in at least the exchange name, city, address, or location to get suggestions.");
                        return;
                      }
                      setLoadingLatLng(true);
                      setSuggestedLocations([]);
                      setShowSuggestions(false);
                      setError("");
                      try {
                        const searchQueries = [];
                        if (name && city && address) {
                          searchQueries.push(`${name}, ${address}, ${city}, Nepal`);
                        } else if (name && city) {
                          searchQueries.push(`${name}, ${city}, Nepal`);
                        } else if (name && address) {
                          searchQueries.push(`${name}, ${address}, Nepal`);
                        } else if (address && city) {
                          searchQueries.push(`${address}, ${city}, Nepal`);
                        } else if (name) {
                          searchQueries.push(`${name}, Nepal`);
                        } else if (city) {
                          searchQueries.push(`${city}, Nepal`);
                        } else if (address) {
                          searchQueries.push(`${address}, Nepal`);
                        } else if (location) {
                          searchQueries.push(`${location}, Nepal`);
                        }
                        if (name) {
                          searchQueries.push(`${name}, Kathmandu Valley, Nepal`);
                          searchQueries.push(`${name}, Kathmandu, Nepal`);
                        }
                        const allSuggestions = [];
                        const apiKey = process.env.REACT_APP_LOCATIONIQ_ACCESS_TOKEN;
                        for (const query of searchQueries.slice(0, 3)) {
                          try {
                            if (!apiKey) throw new Error("LocationIQ API key is missing");
                            const response = await fetch(
                              `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(query)}&format=json`
                            );
                            if (!response.ok) continue;
                            const data = await response.json();
                            if (data.length > 0) {
                              data.slice(0, 3).forEach((result) => {
                                const lat = parseFloat(result.lat);
                                const lon = parseFloat(result.lon);
                                const suggestion = {
                                  id: `${lat}-${lon}-${Math.random()}`,
                                  address: result.display_name,
                                  lat: lat,
                                  lng: lon,
                                  placeId: result.place_id,
                                  confidence: (() => {
                                    let score = 0;
                                    const displayName = result.display_name.toLowerCase();
                                    if (name && displayName.includes(name.toLowerCase())) score += 3;
                                    if (city && displayName.includes(city.toLowerCase())) score += 2;
                                    if (address && displayName.includes(address.toLowerCase())) score += 2;
                                    if (displayName.includes('nepal')) score += 1;
                                    if (result.class === 'tourism') score += 2;
                                    if (result.class === 'amenity') score += 1;
                                    return score;
                                  })()
                                };
                                if (!allSuggestions.find(s => Math.abs(s.lat - suggestion.lat) < 0.001 && Math.abs(s.lng - suggestion.lng) < 0.001)) {
                                  allSuggestions.push(suggestion);
                                }
                              });
                            }
                          } catch (err) {}
                        }
                        allSuggestions.sort((a, b) => b.confidence - a.confidence);
                        setSuggestedLocations(allSuggestions.slice(0, 5));
                        setShowSuggestions(allSuggestions.length > 0);
                        if (allSuggestions.length === 0) {
                          setError("No location suggestions found. Please check your input and try again.");
                        }
                      } catch (err) {
                        setError("Failed to get location suggestions. Please try again.");
                      } finally {
                        setLoadingLatLng(false);
                      }
                    }}
                    disabled={loadingLatLng}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: loadingLatLng ? "#ccc" : "#2d5c7f",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: loadingLatLng ? "not-allowed" : "pointer",
                      fontSize: "0.95rem",
                      fontWeight: "500"
                    }}
                  >
                    {loadingLatLng ? "Searching..." : "🎯 Suggest Exact Location"}
                  </button>

                  {/* Location Suggestions */}
                  {showSuggestions && suggestedLocations.length > 0 && (
                    <div style={{ marginTop: "15px" }}>
                      <h4 style={{ margin: "0 0 10px 0", color: "#2d5c7f" }}>Select the most accurate location:</h4>
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {suggestedLocations.map((suggestion, index) => (
                          <div
                            key={suggestion.id}
                            onClick={() => {
                              setInfo((prev) => ({
                                ...prev,
                                latitude: suggestion.lat.toString(),
                                longitude: suggestion.lng.toString(),
                              }));
                              setShowSuggestions(false);
                              setSuggestedLocations([]);
                            }}
                            style={{
                              padding: "10px",
                              margin: "5px 0",
                              border: "1px solid #ddd",
                              borderRadius: "5px",
                              cursor: "pointer",
                              backgroundColor: "white",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#e3f2fd";
                              e.target.style.borderColor = "#2d5c7f";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "white";
                              e.target.style.borderColor = "#ddd";
                            }}
                          >
                            <div style={{ fontWeight: "500", color: "#2d5c7f", marginBottom: "3px" }}>
                              #{index + 1} {suggestion.address}
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "#666" }}>
                              📍 Lat: {suggestion.lat.toFixed(6)}, Lng: {suggestion.lng.toFixed(6)}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "2px" }}>
                              Confidence: {suggestion.confidence > 5 ? "High" : suggestion.confidence > 2 ? "Medium" : "Low"}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSuggestions(false)}
                        style={{
                          marginTop: "10px",
                          padding: "5px 15px",
                          backgroundColor: "transparent",
                          color: "#666",
                          border: "1px solid #ddd",
                          borderRadius: "3px",
                          cursor: "pointer",
                          fontSize: "0.85rem"
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Latitude and Longitude Inputs (below suggestion button) */}
                  <div className="formInput">
                    <label htmlFor="latitude">Latitude</label>
                    <input
                      id="latitude"
                      name="latitude"
                      type="text"
                      placeholder="27.7172"
                      onChange={handleChange}
                      value={info.latitude || ""}
                      readOnly={loadingLatLng}
                    />
                  </div>
                  <div className="formInput">
                    <label htmlFor="longitude">Longitude</label>
                    <input
                      id="longitude"
                      name="longitude"
                      type="text"
                      placeholder="85.3240"
                      onChange={handleChange}
                      value={info.longitude || ""}
                      readOnly={loadingLatLng}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ color: "red", margin: "10px 0" }}>{error}</div>
              )}

              {loadingLatLng && (
                <div style={{ color: "#2d5c7f", margin: "10px 0" }}>
                  🔍 Fetching coordinates...
                </div>
              )}

              <button type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : "Create"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewExchange;
