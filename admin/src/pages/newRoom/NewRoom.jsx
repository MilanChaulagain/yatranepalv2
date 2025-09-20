import "./newRoom.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useRef, useState } from "react";
import { roomInputs } from "../../formSource";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import toast from "react-hot-toast";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { testCloudinaryConfig, testCloudinaryUpload } from "../../utils/cloudinaryTest";

const NewRoom = () => {
  const [info, setInfo] = useState({});
  const [hotelId, setHotelId] = useState("");
  const [rooms, setRooms] = useState("");
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef();
  const { data, loading } = useFetch("/api/hotels");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInfo((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if (!hotelId) {
      alert("Please select a hotel");
      return;
    }

    const roomNumbers = rooms
      .split(",")
      .map((room) => room.trim())
      .filter((room) => room !== "")
      .map((room) => ({ number: room }));

    try {
      // Upload photos if any
      let photos = [];
      if (files.length) {
        if (!testCloudinaryConfig()) {
          toast.error("Cloudinary configuration is missing.");
          return;
        }
        try {
          const uploaded = await Promise.all(files.map((f) => testCloudinaryUpload(f)));
          photos = uploaded.map((u) => u.url);
        } catch (e) {
          toast.error("One or more image uploads failed.");
          return;
        }
      }

      await axios.post(`/api/rooms/${hotelId}`, { ...info, roomNumbers, photos });
      toast.success("New room created successfully");
            navigate("/rooms");

    } catch (err) {
      console.error("Error creating room:", err.response?.data || err.message);
      toast.error("Room creation failed");
    }
  };

  return (
    <div className="">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="">
          <h1>Add New Room</h1>
        </div>
        <div className="bottom">
          <div className="right">
            <form>
              <div className="formInput">
                <label htmlFor="file">
                  Room Photos: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  multiple
                  ref={fileInputRef}
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                />
              </div>
              {roomInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    type={input.type}
                    placeholder={input.placeholder}
                    onChange={handleChange}
                  />
                </div>
              ))}

              <div className="formInput">
                <label>Room Numbers</label>
                <textarea
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  placeholder="Enter Room Numbers (e.g. 101,102,103)"
                />
              </div>

              <div className="formInput">
                <label>Choose a Hotel</label>
                <select
                  value={hotelId}
                  onChange={(e) => setHotelId(e.target.value)}
                >
                  <option value="">Select a hotel</option>
                  {loading
                    ? <option disabled>Loading...</option>
                    : data.map((hotel) => (
                      <option key={hotel._id} value={hotel._id}>
                        {hotel.name}
                      </option>
                    ))}
                </select>
              </div>

              <button type="submit" onClick={handleClick}>
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRoom;