import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./home.scss";
import Widget from "../../components/widget/Widget";
import Featured from "../../components/featured/Featured";
import Chart from "../../components/chart/Chart";
import Table from "../../components/table/Table";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


const Home = () => {
  const [reservations, setReservations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [places, setPlaces] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem("token");
        // console.log("Fetched token: ", token);
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Create headers with the token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const [usersRes, hotelsRes, roomsRes, placesRes, reservationsRes, reviewsRes] = await Promise.all([
          axios.get("http://localhost:8800/api/users", config),
          axios.get("http://localhost:8800/api/hotels", config),
          axios.get("http://localhost:8800/api/rooms", config),
          axios.get("http://localhost:8800/api/place", config),
          axios.get("http://localhost:8800/api/reservations", config),
          axios.get("http://localhost:8800/api/review", config),
        ]);
        setReservations(Array.isArray(reservationsRes.data) ? reservationsRes.data : []);
        setHotels(Array.isArray(hotelsRes.data) ? hotelsRes.data : []);
        setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
        setPlaces(Array.isArray(placesRes.data?.data) ? placesRes.data.data : (Array.isArray(placesRes.data) ? placesRes.data : []));
        setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data?.data || []));
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      } catch (e) {
        console.error("Loading data error", e);
      }
    };
    load();
  }, []);

  // Analytics builders
  const bookingsByCity = (() => {
    const hotelById = new Map(hotels.map(h => [String(h._id), h]));
    const counts = {};
    reservations.forEach(r => {
      const hid = r.hotelId?._id || r.hotelId; // populated or id
      const h = hotelById.get(String(hid));
      const city = h?.city || "Unknown";
      counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  })();

  const topPlacesByReviews = (() => {
    const placeById = new Map(places.map(p => [String(p._id), p]));
    const countMap = new Map();
    const ratingMap = new Map();
    reviews.forEach(rv => {
      if (rv.reviewedModel !== "Place") return;
      const id = String(rv.reviewedItem?._id || rv.reviewedItem);
      const c = countMap.get(id) || 0;
      countMap.set(id, c + 1);
      const agg = ratingMap.get(id) || { sum: 0, n: 0 };
      ratingMap.set(id, { sum: agg.sum + (rv.rating || 0), n: agg.n + 1 });
    });
    const list = Array.from(countMap.entries()).map(([id, count]) => {
      const r = ratingMap.get(id) || { sum: 0, n: 0 };
      const avg = r.n ? (r.sum / r.n) : 0;
      return { id, name: placeById.get(id)?.name || "Place", count, avg };
    });
    const topByCount = [...list].sort((a, b) => b.count - a.count).slice(0, 5);
    const topLiked = [...list].filter(x => x.count >= 2).sort((a, b) => b.avg - a.avg).slice(0, 5);
    return { topByCount, topLiked };
  })();

  const revenueByMonth = (() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('default', { month: 'short' }) });
    }
    const sums = months.map(m => ({ name: m.label, Total: 0 }));
    reservations.forEach(r => {
      const d = new Date(r.createdAt || r.updatedAt || now);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = months.findIndex(m => m.key === key);
      if (idx >= 0) sums[idx].Total += (r.totalPrice || 0);
    });
    return sums;
  })();

  const usersByMonth = (() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('default', { month: 'short' }) });
    }
    const counts = months.map(m => ({ name: m.label, Total: 0 }));
    users.forEach(u => {
      const d = new Date(u.createdAt || u.updatedAt || now);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = months.findIndex(m => m.key === key);
      if (idx >= 0) counts[idx].Total += 1;
    });
    return counts;
  })();

  // Derived dashboards
  const totalRevenue = reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const cancelled = reservations.filter(r => r.status === 'cancelled').length;
  const pendingCancels = reservations.filter(r => r.status === 'cancel_requested').length;
  const occupancyRate = (() => {
    const totalNights = reservations.reduce((acc, r) => acc + (Array.isArray(r.dates) ? r.dates.length : 0), 0);
    const totalRooms = rooms.length || 1; // rooms from state
    return totalRooms ? Math.min(100, Math.round((totalNights / (totalRooms * 30)) * 100)) : 0;
  })();

  const hotelsByBookings = (() => {
    const map = new Map();
    reservations.forEach(r => {
      const hid = String(r.hotelId?._id || r.hotelId);
      map.set(hid, (map.get(hid) || 0) + 1);
    });
    return [...map.entries()]
      .map(([id, count]) => ({ id, count, name: hotels.find(h => String(h._id) === id)?.name || 'Hotel' }))
      .sort((a,b)=>b.count-a.count)
      .slice(0,5);
  })();

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div className="widgets">
          <Widget type="user" />
          <Widget type="order" />
          <Widget type="earning" />
          <Widget type="balance" />
        </div>
        <div className="kpis">
          <div className="kpi-card">
            <div className="kpi-title">Total Revenue</div>
            <div className="kpi-value">Rs. {totalRevenue.toLocaleString()}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-title">Cancelled Bookings</div>
            <div className="kpi-value">{cancelled}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-title">Pending Cancellations</div>
            <div className="kpi-value">{pendingCancels}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-title">Occupancy (est.)</div>
            <div className="kpi-value">{occupancyRate}%</div>
          </div>
        </div>
        <div className="charts">
          <Featured />
          <Chart title="Last 6 Months (Revenue)" aspect={2 / 1} />
        </div>
        {/* Analytics section */}
        <div className="charts" style={{ gap: 20 }}>
          <div className="chart card" style={{ flex: 1 }}>
            <div className="title">Revenue by Month</div>
            <ResponsiveContainer width="100%" aspect={2 / 1}>
              <AreaChart data={revenueByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="gray" />
                <CartesianGrid strokeDasharray="3 3" className="chartGrid" />
                <Tooltip />
                <Area type="monotone" dataKey="Total" stroke="#22c55e" fillOpacity={1} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart card" style={{ flex: 1 }}>
            <div className="title">New Users (Last 6 Months)</div>
            <ResponsiveContainer width="100%" aspect={2 / 1}>
              <AreaChart data={usersByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="usr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="gray" />
                <CartesianGrid strokeDasharray="3 3" className="chartGrid" />
                <Tooltip />
                <Area type="monotone" dataKey="Total" stroke="#3b82f6" fillOpacity={1} fill="url(#usr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="charts" style={{ gap: 20 }}>
          <div className="card" style={{ flex: 1 }}>
            <div className="title">Bookings by City (Top 5)</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {bookingsByCity.map(item => (
                <li key={item.city} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span>{item.city}</span>
                  <strong>{item.count}</strong>
                </li>
              ))}
            </ul>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <div className="title">Top Hotels (by bookings)</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {hotelsByBookings.map(h => (
                <li key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span>{h.name}</span>
                  <strong>{h.count}</strong>
                </li>
              ))}
            </ul>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <div className="title">Top 5 Places (by reviews)</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {topPlacesByReviews.topByCount.map(p => (
                <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span>{p.name}</span>
                  <span>{p.count} reviews</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <div className="title">Top Liked Places (avg rating)</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {topPlacesByReviews.topLiked.map(p => (
                <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span>{p.name}</span>
                  <span>{p.avg.toFixed(1)} ★</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="listContainer">
          <div className="listTitle">Latest Transactions</div>
          <Table />
        </div>
      </div>
    </div>
  );
};

export default Home;