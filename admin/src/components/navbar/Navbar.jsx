import "./navbar.scss";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FullscreenExitOutlinedIcon from "@mui/icons-material/FullscreenExitOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/AuthContext";
import { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserDropdown from "./UserDropdown";
import { User } from "lucide-react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const Navbar = () => {
  const { dispatch } = useContext(DarkModeContext);
  const { user } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const defaultAvatar = "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-High-Quality-Image.png";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateNavState = () => {
      const idx = window.history.state?.idx ?? 0;
      const len = window.history.length ?? 0;
      setCanGoBack(idx > 0);
      setCanGoForward(idx < len - 1);
    };
    updateNavState();
    window.addEventListener('popstate', updateNavState);
    return () => window.removeEventListener('popstate', updateNavState);
  }, [location]);

  // Search functionality is currently disabled; form is commented out.

  const goBack = () => navigate(-1);
  const goForward = () => navigate(1);

  return (
    <div className="navbar">
      <div className="wrapper">
        <div className="left">
          <div className="nav-history">
            <button
              type="button"
              className={`history-btn back${canGoBack ? '' : ' disabled'}`}
              onClick={goBack}
              disabled={!canGoBack}
              aria-label="Go back"
              title={canGoBack ? 'Go back' : 'No previous page'}
            >
              <ChevronLeftIcon className="history-icon" />
            </button>
            <button
              type="button"
              className={`history-btn forward${canGoForward ? '' : ' disabled'}`}
              onClick={goForward}
              disabled={!canGoForward}
              aria-label="Go forward"
              title={canGoForward ? 'Go forward' : 'No next page'}
            >
              <ChevronRightIcon className="history-icon" />
            </button>
          </div>
          {/* <form className="search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search users, hotels, places..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" style={{ display: 'contents' }} aria-label="Search">
              <SearchOutlinedIcon className="search-icon"/>
            </button>
          </form> */}
        </div>
        <div className="right">
          <div className="item">
            <LanguageOutlinedIcon className="icon" />
            English
          </div>
          <div className="item">
            <DarkModeOutlinedIcon
              className="icon"
              onClick={() => dispatch({ type: "TOGGLE" })}
            />
          </div>
          <div className="item">
            <FullscreenExitOutlinedIcon className="icon" />
          </div>
          <div className="item">
            <NotificationsNoneOutlinedIcon className="icon" />
            <div className="counter">1</div>
          </div>
          <div className="item">
            <ChatBubbleOutlineOutlinedIcon className="icon" />
            <div className="counter">2</div>
          </div>
          <div className="item" ref={dropdownRef}>
            <div onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {user?.img ? (
                <img
                  src={user.img}
                  alt={user.username}
                  className="avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                  }}
                />
              ) : (
                <div className="avatar-placeholder">
                  <User className="user-icon" />
                </div>
              )}
            </div>
            <UserDropdown 
              isOpen={isDropdownOpen} 
              onClose={() => setIsDropdownOpen(false)}
              user={user}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
