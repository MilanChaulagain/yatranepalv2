import { useState, useEffect } from "react";
import {
  DataGrid,
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector
} from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  Pagination,
  Stack,
  Tooltip,
  Paper,
  Divider
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  Visibility,
  Refresh
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import "./datatable.scss";

const CustomPagination = () => {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
      <Pagination
        color="primary"
        count={pageCount}
        page={page + 1}
        onChange={(event, value) => apiRef.current.setPage(value - 1)}
        shape="rounded"
        size="large"
        sx={{
          background: "#fff",
          borderRadius: 2,
          boxShadow: 1,
        }}
      />
    </Box>
  );
};


const Datatable = ({ columns }) => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const [list, setList] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const { data, loading, error, refetch } = useFetch(`/${path}`);

  useEffect(() => {
    if (Array.isArray(data)) {
      setList(data);
    } else if (data?.data && Array.isArray(data.data)) {
      setList(data.data);
    } else {
      setList([]);
    }
  }, [data]);

  const handleDelete = async (id) => {
    const entityName = path.endsWith("s") ? path.slice(0, -1) : path;
    if (!window.confirm(`Are you sure you want to delete this ${entityName}?`)) return;
    setLoadingState(true);
    try {
      await axios.delete(`/${path}/${id}`, { withCredentials: true });
      setList((prev) => prev.filter((item) => item._id !== id));
      alert("Deleted successfully!");
    } catch (err) {
      alert("Failed to delete.");
      console.error(err);
    } finally {
      setLoadingState(false);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Actions",
      width: 170,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit">
            <IconButton
              component={Link}
              to={`/${path}/${params.row._id}/edit`}
              size="medium"
              sx={{
                color: "#5e35b1",
                background: "#ede7f6",
                borderRadius: 2,
                transition: "all 0.2s",
                '&:hover': { background: "#5e35b1", color: "#fff" }
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View">
            <IconButton
              component={Link}
              to={`/${path}/${params.row._id}`}
              size="medium"
              sx={{
                color: "#039be5",
                background: "#e1f5fe",
                borderRadius: 2,
                transition: "all 0.2s",
                '&:hover': { background: "#039be5", color: "#fff" }
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="medium"
              onClick={() => handleDelete(params.row._id)}
              sx={{
                color: "#e53935",
                background: "#ffebee",
                borderRadius: 2,
                transition: "all 0.2s",
                '&:hover': { background: "#e53935", color: "#fff" }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const formattedColumns = columns.map(col => ({
    ...col,
    headerClassName: "datatable-header",
    cellClassName: "datatable-cell",
    headerAlign: "center",
    align: "center",
    minWidth: col.minWidth || 120,
    flex: col.flex || 1,
  }));

  return (
    <Box className="datatable-outer" sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', py: 4 }}>
      <Paper elevation={4} className="datatable-container" sx={{ maxWidth: 1200, mx: 'auto', borderRadius: 4, p: { xs: 2, md: 4 }, boxShadow: 6 }}>
        {/* Header */}
        <Box className="datatable-header-container" sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2 }}>
          <Typography variant="h4" className="datatable-title" sx={{ fontWeight: 800, letterSpacing: 1, mb: { xs: 2, md: 0 }, background: 'linear-gradient(90deg, #5e35b1 0%, #039be5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {path.charAt(0).toUpperCase() + path.slice(1)} Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Refresh data">
              <span>
                <IconButton
                  onClick={handleRefresh}
                  className="refresh-button"
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #5e35b1 0%, #039be5 100%)',
                    color: '#fff',
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    '&:hover': { background: 'linear-gradient(135deg, #039be5 0%, #5e35b1 100%)', transform: 'rotate(180deg)' },
                    '&:disabled': { background: '#bdbdbd' }
                  }}
                >
                  <Refresh />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              component={Link}
              to={`/${path}/new`}
              variant="contained"
              startIcon={<Add />}
              className="add-button"
              sx={{
                background: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                boxShadow: 3,
                textTransform: 'none',
                fontSize: 16,
                '&:hover': { background: 'linear-gradient(135deg, #96c93d 0%, #00b09b 100%)', boxShadow: 6 }
              }}
            >
              Add New
            </Button>
          </Stack>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {/* Status Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading data: {error.message}
          </Alert>
        )}
        {/* Data Grid */}
        <Box className="datatable-grid-container" sx={{ height: { xs: 480, md: 600 }, width: '100%', background: '#fff', borderRadius: 3, boxShadow: 2, p: 2 }}>
          <DataGrid
            rows={list}
            columns={formattedColumns.concat(actionColumn)}
            loading={loading || loadingState}
            getRowId={(row) => row._id}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            disableSelectionOnClick
            components={{
              LoadingOverlay: LinearProgress,
              Pagination: CustomPagination,
            }}
            sx={{
              border: 'none',
              fontSize: 15,
              minHeight: 400,
              '& .MuiDataGrid-columnHeaders': {
                background: 'linear-gradient(90deg, #5e35b1 0%, #039be5 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f0f0f0',
                fontSize: 15,
                py: 1.5,
              },
              '& .MuiDataGrid-row': {
                transition: 'background 0.2s',
                '&:nth-of-type(even)': { background: '#f8fafc' },
                '&:hover': { background: '#e3f2fd !important' },
              },
              '& .MuiCheckbox-root': { color: '#5e35b1' },
              '& .MuiDataGrid-selectedRowCount': { color: '#5e35b1' },
            }}
          />
        </Box>
        {/* Stats Footer */}
        <Box className="datatable-footer" sx={{ mt: 3, p: 2, background: '#f8fafc', borderRadius: 2, textAlign: 'center', boxShadow: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Total: {list.length} items
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Datatable;