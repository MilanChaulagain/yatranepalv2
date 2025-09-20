import "../newRoom/newRoom.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useEffect, useRef, useState } from "react";
import { roomInputs } from "../../formSource";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { testCloudinaryConfig, testCloudinaryUpload } from "../../utils/cloudinaryTest";

const EditRoom = () => {
  const { id } = useParams();
  const [info, setInfo] = useState({});
  const [hotelId, setHotelId] = useState("");
  const [roomsText, setRoomsText] = useState("");
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef();
  const { data: hotels, loading: loadingHotels } = useFetch("/hotels");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`/api/rooms/${id}`);
        setInfo({
          title: data.title || "",
          price: data.price ?? "",
          maxPeople: data.maxPeople ?? "",
          desc: data.desc || "",
        });
        setHotelId(data.hotel || "");
        const nums = Array.isArray(data.roomNumbers)
          ? data.roomNumbers.map((rn) => rn.number).join(",")
          : "";
        setRoomsText(nums);
        setExistingPhotos(Array.isArray(data.photos) ? data.photos : []);
      } catch (err) {
        toast.error("Failed to load room");
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hotelId) {
      toast.error("Please select a hotel");
      return;
    }

    const roomNumbers = roomsText
      .split(",")
      .map((room) => room.trim())
      .filter((room) => room !== "")
      .map((room) => ({ number: Number(room) }));

    // upload images if selected
    let photoUrls = [];
    if (files.length) {
      if (!testCloudinaryConfig()) {
        toast.error("Cloudinary configuration is missing.");
        return;
      }
      try {
        const uploaded = await Promise.all(files.map((f) => testCloudinaryUpload(f)));
        photoUrls = uploaded.map((u) => u.url);
      } catch (e) {
        toast.error("Image upload failed.");
        return;
      }
    }

    const payload = {
      ...info,
      hotel: hotelId,
      roomNumbers,
      photos: [...existingPhotos, ...photoUrls],
    };

    try {
      await axios.put(`/api/rooms/${id}`, payload);
      toast.success("Room updated successfully");
      navigate("/rooms");
    } catch (err) {
      toast.error("Failed to update room");
    }
  };

  return (
    <div className="">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="">
          <h1>Edit Room</h1>
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
              {existingPhotos.length > 0 && (
                <div className="formInput">
                  <label>Existing Photos</label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {existingPhotos.map((url, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={url} alt={`Room ${i+1}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} />
                        <button type="button" onClick={() => setExistingPhotos((prev) => prev.filter((p) => p !== url))} style={{ position: "absolute", top: -6, right: -6, background: "#fff", border: "1px solid #ddd", borderRadius: "50%", width: 22, height: 22, cursor: "pointer" }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {roomInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    type={input.type}
                    placeholder={input.placeholder}
                    value={info[input.id] ?? ""}
                    onChange={handleChange}
                  />
                </div>
              ))}

              <div className="formInput">
                <label>Room Numbers</label>
                <textarea
                  value={roomsText}
                  onChange={(e) => setRoomsText(e.target.value)}
                  placeholder="Enter Room Numbers (e.g. 101,102,103)"
                />
              </div>

              <div className="formInput">
                <label>Choose a Hotel</label>
                <select value={hotelId} onChange={(e) => setHotelId(e.target.value)}>
                  <option value="">Select a hotel</option>
                  {loadingHotels ? (
                    <option disabled>Loading...</option>
                  ) : (
                    hotels.map((hotel) => (
                      <option key={hotel._id} value={hotel._id}>
                        {hotel.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <button type="submit" onClick={handleUpdate}>
                Save
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRoom;
