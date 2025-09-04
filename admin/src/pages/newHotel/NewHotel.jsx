import "./newHotel.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewHotel = () => {
  const [files, setFiles] = useState(null);
  const [info, setInfo] = useState({});
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  const { data, loading } = useFetch("/rooms");

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelect = (e) => {
    const value = Array.from(e.target.selectedOptions, (option) => option.value);
    setRooms(value);
  };

  const handleClick = async (e) => {
    e.preventDefault();

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

    const newHotel = {
      ...info,
      rooms,
      photos: photoUrls,
    };

    try {
      const token = localStorage.getItem("token");
      await axios.post("/hotels", newHotel, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      alert("Hotel created successfully!");
      navigate("/hotels");
    } catch (err) {
      console.error("Hotel creation error:", err.response?.data || err.message);
      alert("Failed to create hotel: " + (err.response?.data?.message || err.message));
    }
  };

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
            <form>
              {/* File Upload */}
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

              {/* Schema required fields */}
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

              {/* Optional fields */}
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

              {/* Room selection */}
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

              <button onClick={handleClick}>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHotel;
