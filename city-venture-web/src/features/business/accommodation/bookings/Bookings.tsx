import React, { useEffect, useState } from "react";
import Text from "@/src/components/Text";
import InfoCard from "@/src/components/InfoCard";
import PageContainer from "@/src/components/PageContainer";
import { colors } from "@/src/utils/Colors";
import {
  Bed,
  DoorOpen,
  User,
  LogIn,
  LogOut,
  XCircle,
  Search,
  Eye,
} from "lucide-react";
import {
  Grid,
  Input,
  Button,
  Menu,
  MenuItem,
  MenuList,
  Card,
  CardContent,
  CircularProgress,
  SvgIcon,
  Typography,
} from "@mui/joy";
import Container from "@/src/components/Container";
import Tabs from "./components/Tabs";
import { Select, Option } from "@mui/joy";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Chip, TableHead } from "@mui/material";

// Booking columns
interface Column {
  id:
    | "guest"
    | "pax"
    | "trip_purpose"
    | "check_in_date"
    | "check_out_date"
    | "total_price"
    | "balance"
    | "booking_status"
    | "actions";
  label: string;
  minWidth?: number;
  align?: "center" | "right" | "left";
  format?: (value: number) => string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "default";
    case "Reserved":
      return "success";
    case "Checked-in":
      return "warning";
    case "Checked-out":
      return "info";
    case "Canceled":
      return "error";
    default:
      return "primary"; // fallback
  }
};

const columns: readonly Column[] = [
  { id: "guest", label: "Guest", minWidth: 120 },
  { id: "pax", label: "Pax", minWidth: 50, align: "center" },
  { id: "trip_purpose", label: "Purpose", minWidth: 120 },
  { id: "check_in_date", label: "Check-in", minWidth: 120 },
  { id: "check_out_date", label: "Check-out", minWidth: 120 },
  {
    id: "total_price",
    label: "Total Price",
    minWidth: 120,
    align: "right",
    format: (value: number) => `₱${value.toLocaleString()}`,
  },
  {
    id: "balance",
    label: "Balance",
    minWidth: 120,
    align: "right",
    format: (value: number) => `₱${value.toLocaleString()}`,
  },
  { id: "booking_status", label: "Status", minWidth: 120 },
  { id: "actions", label: "Actions", minWidth: 150, align: "center" },
];

// Dummy booking data (replace with API call later)
const bookingData = [
  {
    id: "1",
    pax: 3,
    trip_purpose: "Vacation",
    check_in_date: "2025-09-01",
    check_out_date: "2025-09-05",
    total_price: 4500,
    balance: 1000,
    booking_status: "Pending",
  },
  {
    id: "2",
    pax: 2,
    trip_purpose: "Business",
    check_in_date: "2025-09-02",
    check_out_date: "2025-09-04",
    total_price: 3000,
    balance: 0,
    booking_status: "Reserved",
  },
  {
    id: "3",
    pax: 1,
    trip_purpose: "Conference",
    check_in_date: "2025-09-03",
    check_out_date: "2025-09-06",
    total_price: 4000,
    balance: 500,
    booking_status: "Checked-in",
  },
  {
    id: "4",
    pax: 4,
    trip_purpose: "Family Trip",
    check_in_date: "2025-09-05",
    check_out_date: "2025-09-10",
    total_price: 6000,
    balance: 0,
    booking_status: "Checked-out",
  },
  {
    id: "5",
    pax: 2,
    trip_purpose: "Anniversary",
    check_in_date: "2025-09-07",
    check_out_date: "2025-09-09",
    total_price: 3500,
    balance: 3500,
    booking_status: "Canceled",
  },
  {
    id: "6",
    pax: 2,
    trip_purpose: "Anniversary",
    check_in_date: "2025-09-07",
    check_out_date: "2025-09-09",
    total_price: 3500,
    balance: 3500,
    booking_status: "Canceled",
  },
  {
    id: "7",
    pax: 2,
    trip_purpose: "Anniversary",
    check_in_date: "2025-09-07",
    check_out_date: "2025-09-09",
    total_price: 3500,
    balance: 3500,
    booking_status: "Canceled",
  },
  {
    id: "8",
    pax: 2,
    trip_purpose: "Anniversary",
    check_in_date: "2025-09-07",
    check_out_date: "2025-09-09",
    total_price: 3500,
    balance: 3500,
    booking_status: "Canceled",
  },
];

const Bookings = () => {
  const [activeTab, setActiveTab] = useState<
    "All" | "Pending" | "Reserved" | "Checked-in" | "Checked-out" | "Canceled"
  >("All");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<
    "day" | "week" | "month" | "year" | "all"
  >("all");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [bookingCount, setBookingCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [reservedCount, setReservedCount] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [checkedOutCount, setCheckedOutCount] = useState(0);
  const [canceledCount, setCanceledCount] = useState(0);

  useEffect(() => {
    setBookingCount(bookingData.length);
    setPendingCount(
      bookingData.filter((b) => b.booking_status === "Pending").length
    );
    setReservedCount(
      bookingData.filter((b) => b.booking_status === "Reserved").length
    );
    setCheckedInCount(
      bookingData.filter((b) => b.booking_status === "Checked-in").length
    );
    setCheckedOutCount(
      bookingData.filter((b) => b.booking_status === "Checked-out").length
    );
    setCanceledCount(
      bookingData.filter((b) => b.booking_status === "Canceled").length
    );
  }, [bookingData]);

  // format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Extract available years from bookingData
  const years = Array.from(
    new Set(bookingData.map((row) => new Date(row.check_in_date).getFullYear()))
  ).sort((a, b) => b - a);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleStatusChange = (id: string, status: string) => {
    console.log(`Update booking ${id} to ${status}`);
    // TODO: API call
  };

  // Filtering Logic
  const filterByDateAndSearch = (data: typeof bookingData) => {
    const today = new Date();

    return data.filter((row) => {
      const date = new Date(row.check_in_date);

      // Search filter
      const matchesSearch =
        row.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.trip_purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.booking_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.pax.toString().includes(searchTerm) ||
        row.total_price.toString().includes(searchTerm) ||
        row.balance.toString().includes(searchTerm);

      if (!matchesSearch) return false;

      // Month/Year filters
      if (selectedMonth !== "all" && date.getMonth() !== selectedMonth) {
        return false;
      }
      if (selectedYear !== "all" && date.getFullYear() !== selectedYear) {
        return false;
      }

      // Range filters
      switch (filter) {
        case "day":
          return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          );
        case "week": {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return date >= startOfWeek && date <= endOfWeek;
        }
        case "month":
          return (
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          );
        case "year":
          return date.getFullYear() === today.getFullYear();
        default:
          return true;
      }
    });
  };

  // Prevent division by zero
  const calcPercentage = (count: number) => {
    return bookingData.length > 0 ? (count / bookingData.length) * 100 : 0;
  };

  const filteredData = filterByDateAndSearch(
    activeTab === "All"
      ? bookingData
      : bookingData.filter((b) => b.booking_status === activeTab)
  );

  return (
    <PageContainer>
      {/* Summary cards */}
      <Container direction="row" padding="0" background="transparent">
        {/* Total Bookings */}
        <Card
          sx={{ flex: 1, backgroundColor: colors.primary }}
          variant="solid"
          invertedColors
        >
          <CardContent orientation="horizontal">
            <CircularProgress
              size="lg"
              determinate
              value={calcPercentage(bookingCount)}
            >
              <SvgIcon>
                {/* Calendar Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3.75 9h16.5m-15 3.75h6.75M3.75 5.25h16.5v15H3.75v-15z"
                  />
                </svg>
              </SvgIcon>
            </CircularProgress>
            <CardContent>
              <Typography level="body-md">Total Bookings</Typography>
              <Typography level="h2">{bookingCount}</Typography>
            </CardContent>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card sx={{ flex: 1 }} variant="solid" color="neutral" invertedColors>
          <CardContent orientation="horizontal">
            <CircularProgress
              size="lg"
              determinate
              value={calcPercentage(pendingCount)}
            >
              <SvgIcon>
                {/* Clock Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5M12 3.75A8.25 8.25 0 1112 20.25 8.25 8.25 0 0112 3.75z"
                  />
                </svg>
              </SvgIcon>
            </CircularProgress>
            <CardContent>
              <Typography level="body-md">Pending</Typography>
              <Typography level="h2">{pendingCount}</Typography>
            </CardContent>
          </CardContent>
        </Card>

        {/* Reserved */}
        <Card sx={{ flex: 1 }} variant="solid" color="success" invertedColors>
          <CardContent orientation="horizontal">
            <CircularProgress
              size="lg"
              determinate
              value={calcPercentage(reservedCount)}
            >
              <SvgIcon>
                {/* Bookmark Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.25v13.5L12 15l6.75 3.75V5.25a2.25 2.25 0 00-2.25-2.25H7.5a2.25 2.25 0 00-2.25 2.25z"
                  />
                </svg>
              </SvgIcon>
            </CircularProgress>
            <CardContent>
              <Typography level="body-md">Reserved</Typography>
              <Typography level="h2">{reservedCount}</Typography>
            </CardContent>
          </CardContent>
        </Card>

        {/* Checked-in */}
        <Card sx={{ flex: 1 }} variant="solid" color="warning" invertedColors>
          <CardContent orientation="horizontal">
            <CircularProgress
              size="lg"
              determinate
              value={calcPercentage(checkedInCount)}
            >
              <SvgIcon>
                {/* Door Open Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 3.75h8.25v16.5H9.75m0-16.5L4.5 6v12l5.25 2.25m0-16.5V21"
                  />
                </svg>
              </SvgIcon>
            </CircularProgress>
            <CardContent>
              <Typography level="body-md">Checked-in</Typography>
              <Typography level="h2">{checkedInCount}</Typography>
            </CardContent>
          </CardContent>
        </Card>

        {/* Checked-out */}
        <Card
          sx={{ flex: 1 }}
          color="primary"
          variant="solid"
          invertedColors
        >
          <CardContent orientation="horizontal">
            <CircularProgress
              size="lg"
              determinate
              value={calcPercentage(checkedOutCount)}
            >
              <SvgIcon>
                {/* Door Closed Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 3.75h8.25v16.5H9.75V3.75zM9.75 3.75L4.5 6v12l5.25 2.25"
                  />
                </svg>
              </SvgIcon>
            </CircularProgress>
            <CardContent>
              <Typography level="body-md">Checked-out</Typography>
              <Typography level="h2">{checkedOutCount}</Typography>
            </CardContent>
          </CardContent>
        </Card>

        {/* Canceled */}
        <Card sx={{ flex: 1 }} variant="solid" color="danger" invertedColors>
          <CardContent orientation="horizontal">
            <CircularProgress
              size="lg"
              determinate
              value={calcPercentage(canceledCount)}
            >
              <SvgIcon>
                {/* X Circle Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21.75A9.75 9.75 0 1112 2.25a9.75 9.75 0 010 19.5zm-3-12.75l6 6m0-6l-6 6"
                  />
                </svg>
              </SvgIcon>
            </CircularProgress>
            <CardContent>
              <Typography level="body-md">Canceled</Typography>
              <Typography level="h2">{canceledCount}</Typography>
            </CardContent>
          </CardContent>
        </Card>
      </Container>

      {/* Reservations */}
      <Container gap="0" padding="0" elevation={3}>
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="16px 16px 0 16px"
        >
          <Text variant="header-title">Manage Reservation</Text>
        </Container>

        {/* Search + Filters */}
        <Container
          padding="16px 16px 0 16px"
          direction="row"
          justify="space-between"
          align="center"
          gap="16px"
        >
          <Input
            startDecorator={<Search />}
            placeholder="Search Reservations"
            size="lg"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // 👈 bind state
          />

          {/* Range Filter */}
          <Select
            size="lg"
            defaultValue="all"
            onChange={(_, val) => setFilter(val as typeof filter)}
            sx={{ minWidth: 160 }}
          >
            <Option value="all">All</Option>
            <Option value="day">Today</Option>
            <Option value="week">This Week</Option>
            <Option value="month">This Month</Option>
            <Option value="year">This Year</Option>
          </Select>

          {/* Month Filter */}
          <Select
            size="lg"
            defaultValue="all"
            onChange={(_, val) => setSelectedMonth(val as number | "all")}
            sx={{ minWidth: 160 }}
          >
            <Option value="all">All Months</Option>
            {Array.from({ length: 12 }).map((_, i) => (
              <Option key={i} value={i}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </Option>
            ))}
          </Select>

          {/* Year Filter */}
          <Select
            size="lg"
            defaultValue="all"
            onChange={(_, val) => setSelectedYear(val as number | "all")}
            sx={{ minWidth: 140 }}
          >
            <Option value="all">All Years</Option>
            {years.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Container>

        {/* Tabs */}
        <Tabs active={activeTab} onChange={setActiveTab} />

        {/* Booking Table */}
        <Container>
          <Paper
            elevation={1}
            sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}
          >
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table size="small" stickyHeader aria-label="booking table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        size="medium"
                        key={column.id}
                        align={column.align}
                        style={{
                          minWidth: column.minWidth,
                          backgroundColor: colors.primary,
                          color: colors.white,
                          fontFamily: "poppins",
                          fontWeight: 600,
                        }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow
                        role="checkbox"
                        tabIndex={-1}
                        key={row.id}
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#fff" : "#D3D3D3", // 👈 odd row color
                        }}
                      >
                        <TableCell>Guest #{row.id}</TableCell>
                        <TableCell align="center">{row.pax}</TableCell>
                        <TableCell>{row.trip_purpose}</TableCell>
                        <TableCell>{formatDate(row.check_in_date)}</TableCell>
                        <TableCell>{formatDate(row.check_out_date)}</TableCell>
                        <TableCell align="right">
                          ₱{row.total_price.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          ₱{row.balance.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={getStatusColor(row.booking_status)}
                            label={row.booking_status}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="sm"
                            variant="outlined"
                            color="neutral"
                            startDecorator={<Eye size={16} />}
                            sx={{ mr: 1 }}
                          >
                            View
                          </Button>

                          <Button
                            size="sm"
                            variant="solid"
                            color="primary"
                            onClick={() =>
                              handleStatusChange(row.id, "Confirmed")
                            }
                          >
                            Confirm
                          </Button>
                          <Menu>
                            <MenuList>
                              {[
                                "Reserved",
                                "Checked-in",
                                "Checked-out",
                                "Canceled",
                              ].map((status) => (
                                <MenuItem
                                  key={status}
                                  onClick={() =>
                                    handleStatusChange(row.id, status)
                                  }
                                >
                                  {status}
                                </MenuItem>
                              ))}
                            </MenuList>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={bookingData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Container>
      </Container>
    </PageContainer>
  );
};

export default Bookings;
