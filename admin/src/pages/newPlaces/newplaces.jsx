import "./newplaces.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useState, useEffect } from "react";
import { placeInputs } from "../../formSource";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const categoryOptions = [
  { label: "Cultural", value: "Cultural" },
  { label: "Natural", value: "Natural" },
  { label: "Historical", value: "Historical" },
  { label: "Adventure", value: "Adventure" },
  { label: "Religious", value: "Religious" },
];

const NewPlace = () => {
  const [files, setFiles] = useState(null);
  const [info, setInfo] = useState({});
  const [loadingLatLng, setLoadingLatLng] = useState(false);
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    return () => setLoadingLatLng(false);
  }, []);

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    setError("");
  };

const handleSuggestLocation = async () => {
  const { name, city, address, location } = info;
  if (!name && !city && !address && !location) {
    toast.error("Please fill in at least the place name, city, address, or location.");
    return;
  }

  setLoadingLatLng(true);
  setError("");

  try {
    let query = "";
    if (name && city && address) query = `${name}, ${address}, ${city}, Nepal`;
    else if (name && city) query = `${name}, ${city}, Nepal`;
    else if (name && address) query = `${name}, ${address}, Nepal`;
    else if (address && city) query = `${address}, ${city}, Nepal`;
    else if (name) query = `${name}, Nepal`;
    else if (city) query = `${city}, Nepal`;
    else if (address) query = `${address}, Nepal`;
    else if (location) query = `${location}, Nepal`;

    const apiKey = process.env.REACT_APP_LOCATIONIQ_ACCESS_TOKEN;
    const response = await fetch(
      `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(query)}&format=json`
    );

    if (!response.ok) throw new Error("Failed request");

    const data = await response.json();

    if (!data || data.length === 0) {
      toast.error("No location suggestion found.");
      return;
    }

    // Pick the best suggestion
    const scored = data.map((result) => ({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      confidence: getConfidenceScore(result, name, city, address),
      address: result.display_name
    }));

    scored.sort((a, b) => b.confidence - a.confidence);
    const best = scored[0];

    // Autofill lat/lng
    setInfo((prev) => ({
      ...prev,
      latitude: best.lat.toString(),
      longitude: best.lng.toString(),
    }));

    // Set for display
    setSuggestedLocations([best]);
    setShowSuggestions(true);
    toast.success("Location suggested successfully!");

  } catch (err) {
    toast.error("Failed to get location suggestion.");
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
    if (displayName.includes("nepal")) score += 1;
    if (result.class === "tourism") score += 2;
    if (result.class === "amenity") score += 1;
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
    if (!info.name || !info.address || !info.city || !info.category) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const lat = parseFloat(info.latitude);
    const lng = parseFloat(info.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please suggest/select valid latitude and longitude first.");
      return;
    }

    let photoUrls = [];
    if (files && files.length > 0) {
      try {
        photoUrls = await Promise.all(
          Array.from(files).map(async (file) => {
            const data = new FormData();
            data.append("file", file);
            data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

            const res = await axios.post(
              `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
              data
            );
            return res.data.url;
          })
        );
      } catch (err) {
        toast.error("Image upload failed.");
        return;
      }
    }

    const newPlace = {
      ...info,
      img: photoUrls[0] || "",
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
    };

    delete newPlace.latitude;
    delete newPlace.longitude;

    try {
      await toast.promise(
        axios.post("/place", newPlace),
        {
          loading: 'Creating new place...',
          success: 'Place saved successfully!',
          error: 'Failed to create place.',
        }
      );
      navigate("/place");
    } catch (err) {
      console.error("Failed to create place.", err);
      toast.error("Failed to create place.");
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Add New Place</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                files && files.length > 0
                  ? URL.createObjectURL(files[0])
                  : "/assets/images/no-image-icon-0.jpg"
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
                  />
                </div>
              ))}

              <div className="formInput">
                <label>Category</label>
                <select id="category" value={info.category || ""} onChange={handleChange}>
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

              {error && <div className="errorBox">{error}</div>}

              <div className="locationSuggestionSection">
                <div className="sectionHeader">
                  <LocationOnIcon className="icon" />
                  <h3>Smart Location Finder</h3>
                </div>
                <p>
                  Fill in the place details above, then click below to get accurate location
                  suggestions.
                </p>
                <button
                  type="button"
                  onClick={handleSuggestLocation}
                  disabled={loadingLatLng}
                  className="suggestBtn"
                >
                  {loadingLatLng ? "Searching..." : "🎯 Suggest Exact Location"}
                </button>

                {showSuggestions && suggestedLocations.length > 0 && (
  <div className="suggestionsBox">
    <h4>Best location match:</h4>
    <div className="suggestionItem">
      📍 {suggestedLocations[0].address}
      <br />
      Lat: {suggestedLocations[0].lat.toFixed(6)}, 
      Lng: {suggestedLocations[0].lng.toFixed(6)} —{" "}
      {suggestedLocations[0].confidence > 5
        ? "High confidence"
        : suggestedLocations[0].confidence > 2
        ? "Medium confidence"
        : "Low confidence"}
    </div>
  </div>
)}
              </div>

              <div className="formInput">
                <label>Latitude</label>
                <input
                  id="latitude"
                  type="text"
                  value={info.latitude || ""}
                  readOnly
                />
              </div>
              <div className="formInput">
                <label>Longitude</label>
                <input
                  id="longitude"
                  type="text"
                  value={info.longitude || ""}
                  readOnly
                />
              </div>

              <button onClick={handleClick} disabled={loadingLatLng}>
                {loadingLatLng ? "Processing..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPlace;
