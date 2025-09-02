import "./single.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import List from "../../components/table/Table";
import { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import toast from "react-hot-toast";

const Single = () => {
  const { id } = useParams();
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/api/${path}/${id}`, { withCredentials: true });
        // Handle different response formats
        const responseData = response.data;
        if (responseData.data) {
          // Places format: { success: true, data: {...} }
          setData(responseData.data);
        } else {
          // Direct object format
          setData(responseData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load item details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, path]);
  if (loading) {
    return (
      <div className="single">
        <Sidebar />
        <div className="singleContainer">
          <Navbar />
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="single">
        <Sidebar />
        <div className="singleContainer">
          <Navbar />
          <div className="error">Item not found</div>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await toast.promise(
          axios.delete(`http://localhost:8800/api/${path}/${id}`, { withCredentials: true }),
          {
            loading: 'Deleting item...',
            success: 'Item deleted successfully!',
            error: 'Failed to delete item.',
          }
        );
        navigate(`/${path}`);
      } catch (e) {
        console.error('Failed to delete:', e);
        toast.error('Failed to delete item.');
      }
    }
  };

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div className="top">
          <div className="left">
            <Link to={`/${path}/${id}/edit`} className="editButton">Edit</Link>
            <button
              className="deleteButton"
              onClick={handleDelete}
            >
              <DeleteOutlineIcon style={{ fontSize: 18, marginRight: 6 }} /> Delete
            </button>
            <h1 className="title">Information</h1>
            <div className="item">
              <img
                src={data.img || data.photo || "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"}
                alt=""
                className="itemImg"
              />
              <div className="details">
                <h1 className="itemTitle">{data.name || data.title || data.username || "Unknown"}</h1>
                {data.email && (
                  <div className="detailItem">
                    <span className="itemKey">Email:</span>
                    <span className="itemValue">{data.email}</span>
                  </div>
                )}
                {data.phone && (
                  <div className="detailItem">
                    <span className="itemKey">Phone:</span>
                    <span className="itemValue">{data.phone}</span>
                  </div>
                )}
                {data.address && (
                  <div className="detailItem">
                    <span className="itemKey">Address:</span>
                    <span className="itemValue">{data.address}</span>
                  </div>
                )}
                {data.city && (
                  <div className="detailItem">
                    <span className="itemKey">City:</span>
                    <span className="itemValue">{data.city}</span>
                  </div>
                )}
                {data.category && (
                  <div className="detailItem">
                    <span className="itemKey">Category:</span>
                    <span className="itemValue">{data.category}</span>
                  </div>
                )}
                {data.type && (
                  <div className="detailItem">
                    <span className="itemKey">Type:</span>
                    <span className="itemValue">{data.type}</span>
                  </div>
                )}
                {data.description && (
                  <div className="detailItem">
                    <span className="itemKey">Description:</span>
                    <span className="itemValue">{data.description}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="right">
            <Chart aspect={3 / 1} title="Analytics" />
          </div>
        </div>
        <div className="bottom">
          <h1 className="title">Related Information</h1>
          <List/>
        </div>
      </div>
    </div>
  );
};

export default Single;