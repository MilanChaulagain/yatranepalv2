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
    const fetchBookings = async () => {
      try {
        const res = await axios.get("http://localhost:8800/api/reservations");
        const items = Array.isArray(res.data) ? res.data : [];
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let t = 0, w = 0, m = 0;
        items.forEach((b) => {
          const created = new Date(b.createdAt || b.updatedAt || now);
          if (created >= startOfToday) t += 1;
          if (created >= startOfWeek) w += 1;
          if (created >= startOfMonth) m += 1;
        });
        setToday(t); setLastWeek(w); setLastMonth(m);
      } catch (e) {
        setToday(0); setLastWeek(0); setLastMonth(0);
      }
    };
    fetchBookings();
  }, []);

  const pct = lastMonth ? Math.min(100, Math.round((today / lastMonth) * 100)) : (today ? 100 : 0);

  return (
    <div className="featured">
      <div className="top">
        <h1 className="title">Total Bookings</h1>
        <MoreVertIcon fontSize="small" />
      </div>
      <div className="bottom">
        <div className="featuredChart">
          <CircularProgressbar value={pct} text={`${pct}%`} strokeWidth={5} />
        </div>
        <p className="title">Bookings made today</p>
        <p className="amount">{today}</p>
        <p className="desc">
          Booking data is being updated in real-time. Pending bookings may not be reflected yet.
        </p>
        <div className="summary">
          <div className="item">
            <div className="itemTitle">Target</div>
            <div className="itemResult negative">
              <KeyboardArrowDownIcon fontSize="small" />
              <div className="resultAmount">{Math.max(0, lastMonth - lastWeek)}</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Week</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small" />
              <div className="resultAmount">{lastWeek}</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Month</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small" />
              <div className="resultAmount">{lastMonth}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;
