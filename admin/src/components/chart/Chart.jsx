import "./chart.scss";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";

const Chart = ({ aspect }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8800/api/reservations", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const items = Array.isArray(res.data) ? res.data : [];
        // Aggregate by month (last 6 months)
        const now = new Date();
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('default', { month: 'short' }) });
        }
        const counts = months.map(m => ({ name: m.label, Total: 0 }));
        items.forEach((r) => {
          const d = new Date(r.createdAt || r.updatedAt || now);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          const idx = months.findIndex(m => m.key === key);
          if (idx >= 0) counts[idx].Total += 1;
        });
        setData(counts);
      } catch (e) {
        setData([]);
      }
    };
    fetchStats();
  }, []);
  return (
    <div className="chart">
      <div className="title">Bookings (Last 6 Months)</div>
      <ResponsiveContainer width="100%" aspect={aspect}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00aaff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#00aaff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="gray" />
          <CartesianGrid strokeDasharray="3 3" className="chartGrid" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="Total"
            stroke="#00aaff"
            fillOpacity={1}
            fill="url(#total)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
