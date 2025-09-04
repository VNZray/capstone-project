import Text from "@/src/components/Text";
import PageContainer from "@/src/components/PageContainer";
import { colors } from "@/src/utils/Colors";
import { Search } from "lucide-react";
import { Input, Select, Option } from "@mui/joy"; // 👈 Added Select
import Container from "@/src/components/Container";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Chip, TableHead } from "@mui/material";
import React from "react";

// Transaction columns
interface Column {
  id:
    | "id"
    | "booking_id"
    | "name"
    | "payment_type"
    | "payment_method"
    | "payment_for"
    | "transaction_date"
    | "amount"
    | "status";
  label: string;
  minWidth?: number;
  align?: "center" | "right" | "left";
  format?: (value: number) => string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "success";
    case "Pending Balance":
      return "warning";
    case "Failed":
      return "error";
    default:
      return "default";
  }
};

const columns: readonly Column[] = [
  { id: "id", label: "Payment ID", minWidth: 120 },
  { id: "booking_id", label: "Booking ID", minWidth: 120 },
  { id: "name", label: "Guest Name", minWidth: 150 },
  { id: "payment_type", label: "Payment Type", minWidth: 120 },
  { id: "payment_method", label: "Payment Method", minWidth: 150 },
  { id: "payment_for", label: "Payment For", minWidth: 150 },
  { id: "transaction_date", label: "Transaction Date", minWidth: 150 },
  {
    id: "amount",
    label: "Amount",
    minWidth: 120,
    align: "right",
    format: (value: number) => `₱${value.toLocaleString()}`,
  },
  { id: "status", label: "Status", minWidth: 120 },
];

// format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

// Dummy transaction data
const transactionData = [
  {
    id: "TXN-1001",
    booking_id: "BK-2001",
    name: "John Doe",
    payment_type: "Full Payment",
    payment_method: "GCash",
    payment_for: "Reservation",
    transaction_date: "2023-09-01",
    amount: 4500,
    status: "Paid",
  },
  {
    id: "TXN-1002",
    booking_id: "BK-2002",
    name: "Jane Smith",
    payment_type: "Partial Payment",
    payment_method: "Credit Card",
    payment_for: "Pending Balance",
    transaction_date: "2023-09-02",
    amount: 1500,
    status: "Pending Balance",
  },
  {
    id: "TXN-1003",
    booking_id: "BK-2003",
    name: "Mark Lee",
    payment_type: "Full Payment",
    payment_method: "PayMaya",
    payment_for: "Reservation",
    transaction_date: "2023-09-15",
    amount: 5200,
    status: "Failed",
  },
];

const Transactions = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [filter, setFilter] = React.useState<
    "day" | "week" | "month" | "year" | "all"
  >("all");
  const [selectedMonth, setSelectedMonth] = React.useState<number | "all">(
    "all"
  );
  const [selectedYear, setSelectedYear] = React.useState<number | "all">("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const years = Array.from(
    new Set(
      transactionData.map((row) => new Date(row.transaction_date).getFullYear())
    )
  ).sort((a, b) => b - a); // sort descending

  const filterByDate = (data: typeof transactionData) => {
    const today = new Date();

    return data.filter((row) => {
      const date = new Date(row.transaction_date);

      const matchesSearch =
        row.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.payment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.status.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Month/Year specific filters
      if (selectedMonth !== "all" && date.getMonth() !== selectedMonth) {
        return false;
      }
      if (selectedYear !== "all" && date.getFullYear() !== selectedYear) {
        return false;
      }

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

  const filteredData = filterByDate(transactionData);

  return (
    <PageContainer>
      {/* Transactions Section */}
      <Container gap="0" padding="0" elevation={3}>
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="16px 16px 0 16px"
        >
          <Text variant="header-title">Transaction History</Text>
        </Container>

        {/* Search + Filter */}
        <Container
          padding="16px 16px 0 16px"
          direction="row"
          justify="space-between"
          align="center"
          gap="16px"
        >
          <Input
            startDecorator={<Search />}
            placeholder="Search Transaction"
            size="lg"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* Range Filter */}
          <Select
            size="lg"
            defaultValue="all"
            onChange={(_, val) =>
              setFilter(val as "day" | "week" | "month" | "year" | "all")
            }
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

        {/* Transaction Table */}
        <Container>
          <Paper
            elevation={1}
            sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}
          >
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table size="small" stickyHeader aria-label="transaction table">
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
                        key={row.id}
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#fff" : "#f7f7f7",
                        }}
                      >
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.booking_id}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.payment_type}</TableCell>
                        <TableCell>{row.payment_method}</TableCell>
                        <TableCell>{row.payment_for}</TableCell>
                        <TableCell>{formatDate(row.transaction_date)}</TableCell>
                        <TableCell align="right">
                          ₱{row.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={getStatusColor(row.status)}
                            label={row.status}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={filteredData.length}
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

export default Transactions;
