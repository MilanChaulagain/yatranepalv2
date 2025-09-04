import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { testCloudinaryConfig, testCloudinaryUpload } from "../../utils/cloudinaryTest";

const New = ({ inputs, title }) => {
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    let imageUrl = "";

    if (file) {
      // Test Cloudinary configuration first
      if (!testCloudinaryConfig()) {
        toast.error("Cloudinary configuration is missing. Please check your environment variables.");
        return;
      }

      try {
        // Use the test function for better debugging
        const uploadRes = await testCloudinaryUpload(file);
        imageUrl = uploadRes.url;
        toast.success("Image uploaded successfully!");
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Image upload failed: " + err.message);
        return;
      }
    }

    const newUser = {
      ...info,
      img: imageUrl,
    };

    try {
      await toast.promise(
        axios.post("http://localhost:8800/api/auth/register", newUser),
        {
          loading: 'Creating new item...',
          success: 'Item created successfully!',
          error: 'Failed to create item.',
        }
      );
      navigate("/users");
    } catch (err) {
      console.error("Item creation failed:", err.response?.data || err.message);
      toast.error("Failed to create item: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt="preview"
            />
          </div>
          <div className="right">
            <form>
              <div className="formInput">
                <label htmlFor="file">
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>

              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label htmlFor={input.id}>{input.label}</label>
                  <input
                    id={input.id}
                    type={input.type}
                    placeholder={input.placeholder}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}

              <button onClick={handleClick}>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;
