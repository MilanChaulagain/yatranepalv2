import "./featured.scss";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useEffect, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import axios from "axios";

const Featured = () => {
  const [today, setToday] = useState(0);
  const [lastWeek, setLastWeek] = useState(0);
  const [lastMonth, setLastMonth] = useState(0);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8800/api/reservations", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const bookings = Array.isArray(res.data) ? res.data : [];
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let todayRev = 0, weekRev = 0, monthRev = 0;
        bookings.forEach((b) => {
          const created = new Date(b.createdAt || b.updatedAt || now);
          const amount = b.totalPrice || 0;
          if (created >= startOfToday) todayRev += amount;
          if (created >= startOfWeek) weekRev += amount;
          if (created >= startOfMonth) monthRev += amount;
        });
        setToday(todayRev);
        setLastWeek(weekRev);
        setLastMonth(monthRev);
      } catch (e) {
        console.error("Error fetching revenue:", e);
        setToday(0);
        setLastWeek(0);
        setLastMonth(0);
      }
    };
    fetchRevenue();
    // Set up interval for real-time updates
    const interval = setInterval(fetchRevenue, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const pct = lastMonth ? Math.min(100, Math.round((today / lastMonth) * 100)) : (today ? 100 : 0);

  return (
    <div className="featured">
      <div className="top">
        <h1 className="title">Total Revenue</h1>
        <MoreVertIcon fontSize="small" />
      </div>
      <div className="bottom">
        <div className="featuredChart">
          <CircularProgressbar 
            value={pct} 
            text={`${pct}%`} 
            strokeWidth={5}
            styles={{
              path: { stroke: '#22c55e' },
              text: { fill: '#22c55e', fontSize: '1.5rem' },
            }}
          />
        </div>
        <p className="title">Revenue today</p>
  <p className="amount">Rs. {today.toLocaleString()}</p>
        <p className="desc">
          Revenue data is updated in real-time. Previous transactions and pending payments may affect these values.
        </p>
        <div className="summary">
          <div className="item">
            <div className="itemTitle">Monthly Target</div>
            <div className={`itemResult ${lastMonth >= 10000 ? "positive" : "negative"}`}>
              {lastMonth >= 10000 ? (
                <KeyboardArrowUpOutlinedIcon fontSize="small" />
              ) : (
                <KeyboardArrowDownIcon fontSize="small" />
              )}
              <div className="resultAmount">Rs. {(10000 - lastMonth).toLocaleString()}</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Week</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small" />
              <div className="resultAmount">Rs. {lastWeek.toLocaleString()}</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">This Month</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small" />
              <div className="resultAmount">Rs. {lastMonth.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;
