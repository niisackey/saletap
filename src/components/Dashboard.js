import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Drawer, List, ListItem, ListItemText, ListItemIcon, IconButton, AppBar, Toolbar,
  Alert, TextField, Button, CircularProgress, useMediaQuery, InputAdornment, MenuItem,
  TableFooter, TablePagination, Grid
} from "@mui/material";
import { 
  Inventory, BarChart as BarChartIcon, Logout, Menu as MenuIcon,
  Search, ChevronLeft, ChevronRight 
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { getToken, getRole, clearAuth } from "../utils/authUtils";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, 
  ResponsiveContainer 
} from 'recharts';

const STATUSES = {
  OUT_OF_STOCK: "Out of Stock",
  LOW_STOCK: "Low Stock",
  IN_STOCK: "In Stock"
};

const Dashboard = () => {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [currentView, setCurrentView] = useState("sales");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const CHART_COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#FF8042'
  ];

  useEffect(() => {
    setPage(0);
  }, [currentView]);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const inventoryTotal = filteredInventory.length;
  const paginatedInventory = filteredInventory.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const salesTotal = sales.length;
  const paginatedSales = sales.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const processChartData = () => {
    const dailySales = {};
    const paymentMethods = {};

    sales.forEach(sale => {
      const date = sale.date.split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + sale.total_amount;
      const method = sale.payment_method || 'Unknown';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    return {
      dailySales: Object.entries(dailySales).map(([date, total]) => ({ date, total })),
      paymentMethods: Object.entries(paymentMethods).map(([name, value]) => ({ name, value }))
    };
  };

  const { dailySales, paymentMethods } = processChartData();

  useEffect(() => {
    const token = getToken();
    const role = getRole();
    if (!token || role !== "Store Owner") {
      clearAuth();
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleSidebarHover = useCallback(() => {
    if (!isMobile && !sidebarOpen) {
      setSidebarHovered(true);
    }
  }, [isMobile, sidebarOpen]);

  const handleSidebarLeave = useCallback(() => {
    if (!isMobile && !sidebarOpen) {
      setSidebarHovered(false);
    }
  }, [isMobile, sidebarOpen]);

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const fetchSales = useCallback(async () => {
    if (!startDate || !endDate) {
      setSales([]); // Ensure no sales appear until both dates are selected.
      return;
    }
  
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/sales`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { start_date: startDate, end_date: endDate },
      });
  
      if (!response.data || response.data.length === 0) {
        setSales([]);
        setTotalSales(0);
        return;
      }
  
      setSales([...response.data]);
      setTotalSales(response.data.reduce((acc, sale) => acc + sale.total_amount, 0));
    } catch (error) {
      setError("Failed to fetch sales.");
      console.error("Sales fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);
  




  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.data || response.data.length === 0) {
        setError("No inventory available.");
        setInventory([]);
        return;
      }
  
      const updatedInventory = response.data.map((item) => ({
        ...item,
        status: item.status || STATUSES.IN_STOCK,
      }));
  
      setInventory(updatedInventory);
    } catch (error) {
      setError("Failed to fetch inventory.");
      console.error("Inventory fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentView === "sales") fetchSales();
    if (currentView === "inventory") fetchInventory();
  }, [currentView, fetchSales, fetchInventory]);

  return (
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#f5f6fa" }}>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={sidebarOpen || sidebarHovered}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: sidebarOpen ? 240 : 72,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidebarOpen ? 240 : 72,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: sidebarOpen 
                ? theme.transitions.duration.enteringScreen
                : theme.transitions.duration.leavingScreen,
            }),
            borderRight: "none",
            boxShadow: theme.shadows[3],
            overflowX: "hidden",
          },
        }}
        onMouseEnter={handleSidebarHover}
        onMouseLeave={handleSidebarLeave}
      >
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {sidebarOpen && (
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              SaleTap
            </Typography>
          )}
          <IconButton 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ ml: sidebarOpen ? "auto" : 0 }}
          >
            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Box>
        
        <List sx={{ px: 1 }}>
          {[
            { text: "Sales", icon: <BarChartIcon />, view: "sales" },
            { text: "Inventory", icon: <Inventory />, view: "inventory" },
            { text: "Logout", icon: <Logout />, action: handleLogout },
          ].map((item) => (
            <ListItem
              key={item.text}
              button
              onClick={item.action || (() => setCurrentView(item.view))}
              sx={{
                borderRadius: 2,
                mb: 1,
                "&:hover": { backgroundColor: theme.palette.action.hover },
              }}
            >
              <ListItemIcon sx={{ minWidth: "46px", color: theme.palette.text.primary }}>
                {item.icon}
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ml: isMobile ? 0 : `${sidebarOpen ? 240 : 72}px`,
          width: `calc(100% - ${sidebarOpen ? 240 : 72}px)`,
        }}
      >
        <AppBar 
          position="sticky" 
          sx={{ 
            backgroundColor: "background.paper",
            color: "text.primary",
            boxShadow: "none",
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {currentView === "sales" ? "Sales Analytics" : "Inventory Management"}
            </Typography>
            
            {currentView === "inventory" && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  select
                  label="Filter by Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="small"
                  sx={{ width: 150 }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value={STATUSES.IN_STOCK}>In Stock</MenuItem>
                  <MenuItem value={STATUSES.LOW_STOCK}>Low Stock</MenuItem>
                  <MenuItem value={STATUSES.OUT_OF_STOCK}>Out of Stock</MenuItem>
                </TextField>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search inventory..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: isMobile ? "180px" : "300px" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {loading && <CircularProgress sx={{ display: 'block', mx: 'auto' }} />}

          {currentView === "sales" && (
            <Box sx={{ 
              backgroundColor: "background.paper",
              borderRadius: 4,
              p: 3,
              boxShadow: theme.shadows[1]
            }}>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <TextField
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={fetchSales}>
                  Filter Sales
                </Button>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Total Sales: GHS {totalSales.toFixed(2)}
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ p: 2, backgroundColor: '#fff', borderRadius: 2, boxShadow: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      Daily Sales Performance
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dailySales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" fill="#8884d8" name="Daily Sales" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, backgroundColor: '#fff', borderRadius: 2, boxShadow: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      Payment Methods Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={paymentMethods}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          nameKey="name"
                        >
                          {paymentMethods.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={CHART_COLORS[index % CHART_COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Total Amount (GHS)</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.id}</TableCell>
                        <TableCell>
                          {sale.items.map((item, index) => (
                            <div key={index}>
                              {item.name} (x{item.quantity})
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>{sale.total_amount.toFixed(2)}</TableCell>
                        <TableCell>{sale.payment_method || "N/A"}</TableCell>
                        <TableCell>{sale.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        count={salesTotal}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                          setRowsPerPage(parseInt(event.target.value, 10));
                          setPage(0);
                        }}
                      />
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Box>
          )}

          {currentView === "inventory" && (
            <Box sx={{ 
              backgroundColor: "background.paper",
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: theme.shadows[1]
            }}>
              <TableContainer sx={{ maxHeight: "70vh", overflow: "auto" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Stock Level</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedInventory.map((item) => {
                      const statusConfig = {
                        [STATUSES.OUT_OF_STOCK]: {
                          bg: theme.palette.error.light,
                          color: theme.palette.error.contrastText
                        },
                        [STATUSES.LOW_STOCK]: {
                          bg: theme.palette.warning.light,
                          color: theme.palette.warning.contrastText
                        },
                        [STATUSES.IN_STOCK]: {
                          bg: theme.palette.success.light,
                          color: theme.palette.success.contrastText
                        }
                      };

                      const statusStyle = statusConfig[item.status] || statusConfig[STATUSES.IN_STOCK];

                      return (
                        <TableRow key={item.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 4,
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.color,
                              }}
                            >
                              {item.status}
                            </Box>
                          </TableCell>
                          <TableCell>GHS {item.price.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        count={inventoryTotal}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                          setRowsPerPage(parseInt(event.target.value, 10));
                          setPage(0);
                        }}
                      />
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;