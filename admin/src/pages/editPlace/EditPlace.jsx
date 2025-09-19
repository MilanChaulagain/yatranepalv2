import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./editPlace.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { placeInputs } from "../../formSource";
import { testCloudinaryConfig, testCloudinaryUpload } from "../../utils/cloudinaryTest";

const EditPlace = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [info, setInfo] = useState({});
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingLatLng, setLoadingLatLng] = useState(false);
  const [error, setError] = useState("");
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categoryOptions = [
    { value: "archaeological", label: "Archaeological" },
    { value: "religious", label: "Religious" },
    { value: "cultural", label: "Cultural" },
    { value: "natural", label: "Natural" },
    { value: "adventure", label: "Adventure" },
    { value: "historical", label: "Historical" },
    { value: "museum", label: "Museum" },
    { value: "wildlife", label: "Wildlife" },
    { value: "trekking", label: "Trekking" },
    { value: "other", label: "Other" },
  ];

  // Fetch existing place data
  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const res = await axios.get(`/api/place/${id}`, { withCredentials: true });
        const placeData = res.data.data || res.data;
        
        // Convert location coordinates back to latitude/longitude for editing
        const location = placeData.location;
        if (location && location.coordinates) {
          placeData.longitude = location.coordinates[0].toString();
          placeData.latitude = location.coordinates[1].toString();
        }

        setInfo(placeData);
      } catch (err) {
        console.error("Failed to fetch place:", err);
        toast.error("Failed to load place data for editing.");
        navigate("/place");
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [id, navigate]);

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    setError("");
  };

  const handleLocationBlur = async (e) => {
    const location = e.target.value.trim();
    if (!location) return;

    setLoadingLatLng(true);
    setError("");
    
    try {
      const apiKey = process.env.REACT_APP_LOCATIONIQ_ACCESS_TOKEN;
      if (!apiKey) {
        throw new Error("LocationIQ API key is missing");
      }
      
      const response = await fetch(
        `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(location + ", Nepal")}&format=json`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        setInfo((prev) => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lon.toString(),
        }));
      } else {
        setError("No location found. Please try a different search term.");
      }
    } catch (err) {
      console.error("Failed to fetch coordinates:", err);
      setError("Failed to fetch coordinates. Please try again. Error: " + err.message);
    } finally {
      setLoadingLatLng(false);
    }
  };

  // Smart location suggestion function
  const handleSuggestLocation = async () => {
    const { name, city, address, location } = info;
    
    if (!name && !city && !address && !location) {
      setError("Please fill in at least the place name, city, address, or location to get suggestions.");
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
        searchQueries.push(`${name}, Nepal`);
        searchQueries.push(`${name}, Kathmandu, Nepal`);
      }

      const allSuggestions = [];
      const apiKey = process.env.REACT_APP_LOCATIONIQ_ACCESS_TOKEN;

      for (const query of searchQueries.slice(0, 3)) {
        try {
          if (!apiKey) {
            throw new Error("LocationIQ API key is missing");
          }
          
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
                confidence: getConfidenceScore(result, name, city, address)
              };
              
              if (!allSuggestions.find(s => 
                Math.abs(s.lat - suggestion.lat) < 0.001 && 
                Math.abs(s.lng - suggestion.lng) < 0.001
              )) {
                allSuggestions.push(suggestion);
              }
            });
          }
        } catch (err) {
          console.error(`Failed to fetch for query "${query}":`, err);
        }
      }

      allSuggestions.sort((a, b) => b.confidence - a.confidence);
      
      setSuggestedLocations(allSuggestions.slice(0, 5));
      setShowSuggestions(allSuggestions.length > 0);

      if (allSuggestions.length === 0) {
        setError("No location suggestions found. Please check your input and try again.");
      }

    } catch (err) {
      console.error("Failed to fetch location suggestions:", err);
      setError("Failed to get location suggestions. Please try again.");
    } finally {
      setLoadingLatLng(false);
    }
  };

  const getConfidenceScore = (result, name, city, address) => {
    let score = 0;
    const displayName = result.display_name.toLowerCase();
    
    if (name && displayName.includes(name.toLowerCase())) score += 3;
    if (city && displayName.includes(city.toLowerCase())) score += 2;
    if (address && displayName.includes(address.toLowerCase())) score += 2;
    
    if (displayName.includes('nepal')) score += 1;
    
    if (result.class === 'tourism') score += 2;
    if (result.class === 'amenity') score += 1;
    
    return score;
  };

  const handleSelectSuggestion = (suggestion) => {
    setInfo((prev) => ({
      ...prev,
      latitude: suggestion.lat.toString(),
      longitude: suggestion.lng.toString(),
    }));
    setShowSuggestions(false);
    setSuggestedLocations([]);
  };

  const handleClick = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!info.name || !info.address || !info.city || !info.category) {
      setError("Please fill in all required fields.");
      return;
    }

    const lat = parseFloat(info.latitude);
    const lng = parseFloat(info.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Please enter valid numbers for latitude and longitude.");
      return;
    }

    let photoUrls = info.img ? [info.img] : []; // Keep existing image by default

    // If new files are selected, upload them
    if (files && files.length > 0) {
      if (!testCloudinaryConfig()) {
        setError("Cloudinary configuration is missing. Please check your environment variables.");
        return;
      }

      try {
        photoUrls = await Promise.all(
          Array.from(files).map(async (file) => {
            try {
              const uploadRes = await testCloudinaryUpload(file);
              return uploadRes.url;
            } catch (uploadErr) {
              console.error("Upload error for file:", file.name, uploadErr);
              throw uploadErr;
            }
          })
        );
        toast.success("Images uploaded successfully!");
      } catch (err) {
        console.error("Image upload failed:", err);
        setError("One or more image uploads failed: " + err.message);
        return;
      }
    }

    const updatedPlace = {
      ...info,
      img: photoUrls[0] || "", 
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
    };

    // Remove fields that shouldn't be sent in update
    delete updatedPlace._id;
    delete updatedPlace.__v;
    delete updatedPlace.createdAt;
    delete updatedPlace.updatedAt;
    delete updatedPlace.latitude;
    delete updatedPlace.longitude;

    try {
      await axios.put(`/api/place/${id}`, updatedPlace, { withCredentials: true });
      toast.success("Place updated successfully!");
      navigate("/place");
    } catch (err) {
      console.error("Place update failed:", err.response?.data || err.message);
      setError("Failed to update place: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="new">
        <Sidebar />
        <div className="newContainer">
          <Navbar />
          <div className="loading" style={{ padding: "20px", textAlign: "center" }}>
            Loading place data...
          </div>
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
          <h1>Edit Place</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                files && files.length > 0
                  ? URL.createObjectURL(files[0])
                  : info.img || `${process.env.PUBLIC_URL}/images/placeholder.jpg`
              }
              alt="Preview"
            />
          </div>
          <div className="right">
            <form>
              <div className="formInput">
                <label htmlFor="file">
                  Images: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  style={{ display: "none" }}
                />
              </div>

              {placeInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    type={input.type}
                    placeholder={input.placeholder}
                    onChange={handleChange}
                    value={info[input.id] || ""}
                    {...(input.id === "location" ? { onBlur: handleLocationBlur } : {})}
                  />
                </div>
              ))}

              <div className="formInput">
                <label>Category</label>
                <select id="category" value={info.category || ""} onChange={handleChange} required>
                  <option value="" disabled>
                    -- Select a category --
                  </option>
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error message display */}
              {error && (
                <div style={{ color: "red", margin: "10px 0", padding: "10px", backgroundColor: "#ffeeee", borderRadius: "5px" }}>
                  {error}
                </div>
              )}

              {/* Smart Location Suggestion Section */}
              <div className="locationSuggestionSection" style={{ margin: "20px 0", padding: "15px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#f9f9f9" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                  <LocationOnIcon style={{ marginRight: "8px", color: "#2d5c7f" }} />
                  <h3 style={{ margin: 0, color: "#2d5c7f" }}>Smart Location Finder</h3>
                </div>
                <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "#666" }}>
                  Update the place name, city, and address above, then click the button below to get accurate location suggestions.
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
                          onClick={() => handleSelectSuggestion(suggestion)}
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
              </div>

              <div className="formInput">
                <label>Latitude</label>
                <input
                  id="latitude"
                  type="text"
                  placeholder={info.latitude ? info.latitude : "27.7172"}
                  onChange={handleChange}
                  value={info.latitude || ""}
                  readOnly={loadingLatLng}
                />
              </div>

              <div className="formInput">
                <label>Longitude</label>
                <input
                  id="longitude"
                  type="text"
                  placeholder={info.longitude ? info.longitude : "85.3240"}
                  onChange={handleChange}
                  value={info.longitude || ""}
                  readOnly={loadingLatLng}
                />
              </div>

              {loadingLatLng && (
                <div style={{ color: '#2d5c7f', fontSize: '0.95rem', margin: '10px 0' }}>
                  🔍 Fetching coordinates...
                </div>
              )}

              <button onClick={handleClick} disabled={loadingLatLng}>
                {loadingLatLng ? "Processing..." : "Update Place"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPlace;