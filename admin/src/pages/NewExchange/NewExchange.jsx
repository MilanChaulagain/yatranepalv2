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
                  .filter(
                    (input, index, self) =>
                      !["latitude", "longitude"].includes(
                        input.id.trim().toLowerCase()
                      ) &&
                      index === self.findIndex((i) => i.id === input.id)
                  )
                  .map((input) => (
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
                        {...(input.id === "location"
                          ? { onBlur: handleLocationBlur }
                          : {})}
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
