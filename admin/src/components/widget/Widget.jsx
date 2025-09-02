import "./widget.scss";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const Widget = ({ type }) => {
  let data;
  const [amount, setAmount] = useState(0);
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (type === "user") {
          const res = await axios.get("http://localhost:8800/api/users");
          setAmount(Array.isArray(res.data) ? res.data.length : 0);
        } else if (type === "order") {
          const res = await axios.get("http://localhost:8800/api/reservations");
          setAmount(Array.isArray(res.data) ? res.data.length : 0);
        } else if (type === "earning") {
          const res = await axios.get("http://localhost:8800/api/reservations");
          const total = (Array.isArray(res.data) ? res.data : []).reduce((sum, r) => sum + (r.totalPrice || 0), 0);
          setAmount(total);
        } else if (type === "balance") {
          const res = await axios.get("http://localhost:8800/api/place");
          const data = res.data?.data || res.data || [];
          setAmount(Array.isArray(data) ? data.length : 0);
        }
        // Optional: compute diff based on last 7 days vs previous 7 days if needed
      } catch (e) {
        setAmount(0);
      }
    };
    fetchStats();
  }, [type]);

  switch (type) {
    case "user":
      data = {
        title: "TOURISTS",
        isMoney: false,
        link: "View all tourists",
        icon: (
          <PersonOutlinedIcon
            className="icon"
            style={{
              color: "crimson",
              backgroundColor: "rgba(255, 0, 0, 0.2)",
            }}
          />
        ),
      };
      break;
    case "order":
      data = {
        title: "BOOKINGS",
        isMoney: false,
        link: "View all bookings",
        icon: (
          <ShoppingCartOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(218, 165, 32, 0.2)",
              color: "goldenrod",
            }}
          />
        ),
      };
      break;
    case "earning":
      data = {
        title: "REVENUE",
        isMoney: true,
        link: "View revenue details",
        icon: (
          <MonetizationOnOutlinedIcon
            className="icon"
            style={{ backgroundColor: "rgba(0, 128, 0, 0.2)", color: "green" }}
          />
        ),
      };
      break;
    case "balance":
      data = {
        title: "DESTINATIONS",
        isMoney: false,
        link: "Explore destinations",
        icon: (
          <AccountBalanceWalletOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(128, 0, 128, 0.2)",
              color: "purple",
            }}
          />
        ),
      };
      break;
    default:
      break;
  }

  return (
    <div className="widget">
      <div className="left">
        <span className="title">{data.title}</span>
        <span className="counter">
          {data.isMoney && "$"} {amount}
        </span>
        <span className="link">{data.link}</span>
      </div>
      <div className="right">
        <div className={`percentage ${diff >= 0 ? "positive" : "negative"}`}>
          <KeyboardArrowUpIcon />
          {diff}%
        </div>
        {data.icon}
      </div>
    </div>
  );
};

export default Widget;
