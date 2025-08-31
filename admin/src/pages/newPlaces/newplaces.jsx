import "./newplaces.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { placeInputs } from "../../formSource";
import axios from "axios";
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
  const navigate = useNavigate();


  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // Auto-fetch latitude and longitude when location field loses focus
  const handleLocationBlur = async (e) => {
    const location = e.target.value;
    if (!location) return;
    setLoadingLatLng(true);
    try {
      // Use Google Maps Geocoding API
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setInfo((prev) => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));
      }
    } catch (err) {
      // Optionally handle error
      console.error("Failed to fetch coordinates:", err);
    } finally {
      setLoadingLatLng(false);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!info.name || !info.address || !info.city || !info.category) {
      alert("Please fill in all required fields.");
      return;
    }

    const lat = parseFloat(info.latitude);
    const lng = parseFloat(info.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Please enter valid numbers for latitude and longitude.");
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
              data,
              {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        }
            );
            return res.data.url;
          })
        );
      } catch (err) {
        console.error("Image upload failed:", err);
        alert("One or more image uploads failed!");
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
      await axios.post("/place", newPlace);
      alert("Place created successfully!");
      navigate("/place");
    } catch (err) {
      console.error("Place creation failed:", err.response?.data || err.message);
      alert("Failed to create place: " + (err.response?.data?.message || err.message));
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
                    {...(input.id === "location" ? { onBlur: handleLocationBlur } : {})}
                  />
                </div>
              ))}

              <div className="formInput">
                <label>Category</label>
                <select id="category" defaultValue="" onChange={handleChange} required>
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


              <div className="formInput">
                <label>Latitude</label>
                <input
                  id="latitude"
                  type="text"
                  placeholder="27.7172"
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
                  placeholder="85.3240"
                  onChange={handleChange}
                  value={info.longitude || ""}
                  readOnly={loadingLatLng}
                />
              </div>

              {loadingLatLng && <div style={{ color: '#2d5c7f', fontSize: '0.95rem' }}>Fetching coordinates...</div>}

              <button onClick={handleClick}>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPlace;
