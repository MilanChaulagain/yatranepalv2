import { useState } from "react";
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

const List = () => {
  const [loading, setLoading] = useState(false); // Add loading state if needed
  const rows = [
    {
      id: 102938,
      service: "Everest Base Camp Trek",
      img: "https://www.earthtrekkers.com/wp-content/uploads/2020/05/Everest-Base-Camp-Trek-in-Photos.jpg",
      customer: "Milan Chaulagain",
      date: "21 May",
      amount: 1200,
      method: "Online Payment",
      status: "Approved",
    },
    {
      id: 394820,
      service: "Pokhara Sightseeing Tour",
      img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/28/88/53/b3/caption.jpg?w=500&h=400&s=1",
      customer: "Ujwal Sapkota",
      date: "20 May",
      amount: 300,
      method: "Cash on Arrival",
      status: "Pending",
    },
    {
      id: 483920,
      service: "Chitwan Jungle Safari",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBcabKMd-F7mBqCSaQ198deh_3PX96gFcoJw&s",
      customer: "Emma Rai",
      date: "18 May",
      amount: 450,
      method: "Online Payment",
      status: "Approved",
    },
    {
      id: 582394,
      service: "Lumbini Pilgrimage Tour",
      img: "https://hwwtreks.com/uploads/0000/1/2021/03/06/lmb0010.jpg",
      customer: "John Lama",
      date: "17 May",
      amount: 250,
      method: "Cash on Arrival",
      status: "Pending",
    },
    {
      id: 109283,
      service: "Annapurna Circuit",
      img: "https://www.shutterstock.com/image-photo/annapurna-circuit-trek-act-gurung-600nw-2506511357.jpg",
      customer: "Aarav Sharma",
      date: "15 May",
      amount: 980,
      method: "Online Payment",
      status: "Approved",
    },
  ];

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
                    #{row.id}
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