import "./navbar.scss";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FullscreenExitOutlinedIcon from "@mui/icons-material/FullscreenExitOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserDropdown from "./UserDropdown";
import toast from "react-hot-toast";

const Navbar = () => {
  const { dispatch } = useContext(DarkModeContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = search.trim();
    if (!term) return;

    const normalized = term.toLowerCase();
    const sectionMap = {
      users: "users",
      user: "users",
      hotels: "hotels",
      hotel: "hotels",
      rooms: "rooms",
      room: "rooms",
      places: "place",
      place: "place",
      exchange: "money-exchange",
      money: "money-exchange",
      tourist: "touristguide",
      guides: "touristguide",
      images: "imageslider",
      slider: "imageslider",
      events: "chadparba",
      event: "chadparba",
      booking: "admin-booking",
      bookings: "admin-booking",
    };

    if (sectionMap[normalized]) {
      navigate(`/${sectionMap[normalized]}`);
      return;
    }

    const pathSeg = location.pathname.split("/")[1] || "users";
    navigate(`/${pathSeg}?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="navbar">
      <div className="wrapper">
        <div className="left">
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
              <img
                src="https://documents.bcci.tv/resizedimageskirti/164_compress.png"
                alt=""
                className="avatar"
              />
            </div>
            <UserDropdown 
              isOpen={isDropdownOpen} 
              onClose={() => setIsDropdownOpen(false)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
