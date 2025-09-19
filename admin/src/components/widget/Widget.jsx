import "./widget.scss";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import { useEffect, useState } from "react";
import axios from "axios";

const Widget = ({ type }) => {
  let data;
  const [amount, setAmount] = useState(0);
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };
        if (type === "user") {
          const res = await axios.get("http://localhost:8800/api/users", config);
          const users = Array.isArray(res.data) ? res.data : [];
          setAmount(users.length);
          
          // Calculate growth rate (last 7 days vs previous 7 days)
          const now = new Date();
          const last7Days = users.filter(u => 
            (new Date(u.createdAt) > new Date(now - 7 * 24 * 60 * 60 * 1000))
          ).length;
          const prev7Days = users.filter(u => {
            const date = new Date(u.createdAt);
            return date <= new Date(now - 7 * 24 * 60 * 60 * 1000) && 
                   date > new Date(now - 14 * 24 * 60 * 60 * 1000);
          }).length;
          
          setDiff(prev7Days ? Math.round((last7Days - prev7Days) / prev7Days * 100) : 0);
          
        } else if (type === "order") {
          const res = await axios.get("http://localhost:8800/api/reservations", config);
          const bookings = Array.isArray(res.data) ? res.data : [];
          setAmount(bookings.length);
          
          // Calculate booking growth
          const now = new Date();
          const last7Days = bookings.filter(b => 
            (new Date(b.createdAt) > new Date(now - 7 * 24 * 60 * 60 * 1000))
          ).length;
          const prev7Days = bookings.filter(b => {
            const date = new Date(b.createdAt);
            return date <= new Date(now - 7 * 24 * 60 * 60 * 1000) && 
                   date > new Date(now - 14 * 24 * 60 * 60 * 1000);
          }).length;
          
          setDiff(prev7Days ? Math.round((last7Days - prev7Days) / prev7Days * 100) : 0);
          
        } else if (type === "earning") {
          const res = await axios.get("http://localhost:8800/api/reservations", config);
          const bookings = Array.isArray(res.data) ? res.data : [];
          
          // Calculate total revenue
          const total = bookings.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
          setAmount(total);
          
          // Calculate revenue growth
          const now = new Date();
          const last7DaysRev = bookings
            .filter(b => new Date(b.createdAt) > new Date(now - 7 * 24 * 60 * 60 * 1000))
            .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
          const prev7DaysRev = bookings
            .filter(b => {
              const date = new Date(b.createdAt);
              return date <= new Date(now - 7 * 24 * 60 * 60 * 1000) && 
                     date > new Date(now - 14 * 24 * 60 * 60 * 1000);
            })
            .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
          
          setDiff(prev7DaysRev ? Math.round((last7DaysRev - prev7DaysRev) / prev7DaysRev * 100) : 0);
          
        } else if (type === "balance") {
          const [placesRes, reviewsRes] = await Promise.all([
            axios.get("http://localhost:8800/api/place", config),
            axios.get("http://localhost:8800/api/review", config)
          ]);
          
          const places = placesRes.data?.data || placesRes.data || [];
          const reviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
          
          setAmount(Array.isArray(places) ? places.length : 0);
          
          // Calculate review growth for places
          const now = new Date();
          const last7DaysReviews = reviews.filter(r => 
            r.reviewedModel === "Place" && new Date(r.createdAt) > new Date(now - 7 * 24 * 60 * 60 * 1000)
          ).length;
          const prev7DaysReviews = reviews.filter(r => {
            if (r.reviewedModel !== "Place") return false;
            const date = new Date(r.createdAt);
            return date <= new Date(now - 7 * 24 * 60 * 60 * 1000) && 
                   date > new Date(now - 14 * 24 * 60 * 60 * 1000);
          }).length;
          
          setDiff(prev7DaysReviews ? Math.round((last7DaysReviews - prev7DaysReviews) / prev7DaysReviews * 100) : 0);
        }
      } catch (e) {
        console.error("Error fetching widget stats:", e);
        setAmount(0);
        setDiff(0);
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
          {data.isMoney ? `Rs. ${amount.toLocaleString()}` : amount}
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
