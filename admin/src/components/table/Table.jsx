import { useEffect, useState } from "react";
import "./table.scss";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  LinearProgress
} from "@mui/material";
import axios from "axios";

const List = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setLoading(true);
        // axios is globally configured with Authorization and withCredentials
        const { data } = await axios.get("http://localhost:8800/api/reservations", {
          withCredentials: true,
        });
        const list = (Array.isArray(data) ? data : []).slice(0, 10).map((r) => ({
          id: r._id,
          service: r.hotelId?.name || "Hotel",
          img: (r.hotelId?.photos && r.hotelId.photos[0]) || `${process.env.PUBLIC_URL}/images/placeholder.jpg`,
          customer: r.userId?.username || "User",
          date: new Date(r.createdAt || r.updatedAt).toLocaleDateString(),
          amount: r.totalPrice || 0,
          method: r.paymentStatus || "pending",
          status: (r.status || "pending").charAt(0).toUpperCase() + (r.status || "pending").slice(1),
        }));
        setRows(list);
      } catch (e) {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <Box className="table-wrapper">
      <Box className="table-header">
        <Typography variant="h6" className="table-title">
          Recent Bookings
        </Typography>
      </Box>
      
      <TableContainer 
        component={Paper} 
        className="table"
        elevation={0}
      >
        {loading && <LinearProgress />}
        <Table sx={{ minWidth: 650 }} aria-label="tour bookings table">
          <TableHead>
            <TableRow>
              <TableCell className="tableCell header">Booking ID</TableCell>
              <TableCell className="tableCell header">Tour Package</TableCell>
              <TableCell className="tableCell header">Customer</TableCell>
              <TableCell className="tableCell header">Date</TableCell>
              <TableCell className="tableCell header">Amount ($)</TableCell>
              <TableCell className="tableCell header">Payment Method</TableCell>
              <TableCell className="tableCell header">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow 
                key={row.id}
                className="table-row"
                hover
              >
                <TableCell className="tableCell">
                  <Typography variant="body2" className="id-cell">
                    #{String(row.id).slice(-6)}
                  </Typography>
                </TableCell>
                <TableCell className="tableCell">
                  <div className="cellWrapper">
                    <img src={row.img} alt={row.service} className="image" />
                    <Typography variant="body2" className="service-name">
                      {row.service}
                    </Typography>
                  </div>
                </TableCell>
                <TableCell className="tableCell">
                  <Typography variant="body2">
                    {row.customer}
                  </Typography>
                </TableCell>
                <TableCell className="tableCell">
                  <Typography variant="body2" className="date-cell">
                    {row.date}
                  </Typography>
                </TableCell>
                <TableCell className="tableCell">
                  <Typography variant="body2" className="amount-cell">
                    ${row.amount}
                  </Typography>
                </TableCell>
                <TableCell className="tableCell">
                  <Typography variant="body2" className="method-cell">
                    {row.method}
                  </Typography>
                </TableCell>
                <TableCell className="tableCell">
                  <Chip
                    label={row.status}
                    className={`status-chip ${row.status.toLowerCase()}`}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default List;