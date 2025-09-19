import "./userDropdown.scss";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PersonOutline, Settings, Logout } from "@mui/icons-material";

const UserDropdown = ({ isOpen, onClose }) => {
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile");
    onClose();
  };

  const handleEdit = () => {
    navigate("/profile/edit");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="userDropdown">
      <div className="dropdown-content">
        <div className="dropdown-item" onClick={handleProfile}>
          <PersonOutline className="icon" />
          <span>Profile</span>
        </div>
        <div className="dropdown-item" onClick={handleEdit}>
          <Settings className="icon" />
          <span>Edit</span>
        </div>
        <div className="divider"></div>
        <div className="dropdown-item logout" onClick={handleLogout}>
          <Logout className="icon" />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default UserDropdown;
