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
import { TableHead } from "@mui/material";
import React, { useEffect } from "react";
import { useBusiness } from "@/src/context/BusinessContext";
// import type { Booking } from "@/src/types/Booking";
// import { fetchBookingsByBusinessId } from "@/src/services/BookingService";
import { fetchPaymentsByBusinessId } from "@/src/services/PaymentService";
import ResponsiveText from "@/src/components/ResponsiveText";
import NoDataFound from "@/src/components/NoDataFound";
// import type { Payment } from "@/src/types/Payment";

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

const columns: readonly Column[] = [
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
];

// format date with time
const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Row shape for the table derived from Payment + Booking join
interface TransactionRow {
  id: string; // payment id
  booking_id: string; // booking id
  name: string; // guest name from booking
  payment_type: string;
  payment_method: string;
  payment_for: string;
  transaction_date: string; // created_at
  amount: number;
  status: string;
}

const Transactions = () => {
  const { businessDetails } = useBusiness();

  const [rows, setRows] = React.useState<TransactionRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
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

  // Local helper to normalize status casing differences from backend
  // const normalizeStatus = (status?: string) => {
  //   if (!status) return "Pending";
  //   const lower = status.toLowerCase();
  //   if (lower === "checked-in" || lower === "checked_in") return "Checked-in";
  //   if (lower === "checked-out" || lower === "checked_out")
  //     return "Checked-out";
  //   return status.charAt(0).toUpperCase() + status.slice(1);
  // };

  // Fetch payments for selected business (joined with booking + tourist)
  useEffect(() => {
    const load = async () => {
      if (!businessDetails?.id) return;
      setLoading(true);
      setError(null);
      try {
        const payments = await fetchPaymentsByBusinessId(String(businessDetails.id));
        const mapped: TransactionRow[] = payments.map((p: any) => ({
          id: String(p.payment_id ?? p.id ?? ''),
          booking_id: String(p.booking_id ?? ''),
          name: [p.first_name, p.last_name].filter(Boolean).join(' ') || '—',
          payment_type: p.payment_type || '—',
          payment_method: p.payment_method || '—',
          payment_for: p.payment_for || '—',
          transaction_date: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
          amount: Number(p.amount ?? 0),
          status: p.status || 'Pending',
        }));
        setRows(mapped);
      } catch (e: any) {
        console.error("Failed to load bookings/payments", e);
        setError(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [businessDetails?.id]);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const years = Array.from(
    new Set(rows.map((row) => new Date(row.transaction_date).getFullYear()))
  ).sort((a, b) => b - a);

  const filterByDate = (data: TransactionRow[]) => {
    const today = new Date();

    return data.filter((row) => {
      const date = new Date(row.transaction_date);

      const matchesSearch =
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

  const filteredData = filterByDate(rows);

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
          <ResponsiveText type="title-small" weight="bold">Transaction History</ResponsiveText>
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
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        Loading payments...
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        <NoDataFound
                          icon={searchTerm.trim() ? "search" : "database"}
                          title={searchTerm.trim() ? "No Results Found" : "No Transactions"}
                          message={error ? error : searchTerm.trim() ? `No transactions match "${searchTerm}". Try a different search term.` : "No payment transactions found."}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#fff" : "#f7f7f7",
                        }}
                      >
                        <TableCell>{row.booking_id}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.payment_type}</TableCell>
                        <TableCell>{row.payment_method}</TableCell>
                        <TableCell>{row.payment_for}</TableCell>
                        <TableCell>
                          {formatDate(row.transaction_date)}
                        </TableCell>
                        <TableCell align="right">
                          ₱{row.amount.toLocaleString()}
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
