import PageContainer from "@/src/components/PageContainer";
import { Search } from "lucide-react";
import { Input, Select, Option } from "@mui/joy";
import Container from "@/src/components/Container";
import React, { useEffect, useMemo } from "react";
import { useBusiness } from "@/src/context/BusinessContext";
import { fetchPaymentsByBusinessId } from "@/src/services/PaymentService";
import Typography from "@/src/components/Typography";
import Table, {
  type TableColumn,
  GuestAvatar,
  type GuestInfo,
} from "@/src/components/ui/Table";
import { colors } from "@/src/utils/Colors";

// Row shape for the table derived from Payment + Booking join
interface TransactionRow {
  id: string; // payment id
  booking_id: string; // booking id
  name: string; // guest name from booking
  firstName?: string; // extracted first name
  lastName?: string; // extracted last name
  user_profile?: string; // tourist profile picture
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
  const [filter, setFilter] = React.useState<
    "day" | "week" | "month" | "year" | "all"
  >("all");
  const [selectedMonth, setSelectedMonth] = React.useState<number | "all">(
    "all"
  );
  const [selectedYear, setSelectedYear] = React.useState<number | "all">("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  // Define columns for the custom Table component
  const columns: TableColumn<TransactionRow>[] = useMemo(
    () => [
      {
        id: "name",
        label: "Guest Name",
        minWidth: 180,
        render: (row) => {
          const guest: GuestInfo = {
            firstName: row.firstName || "",
            lastName: row.lastName || "",
            user_profile: row.user_profile,
          };

          return <GuestAvatar guest={guest} size={32} />;
        },
      },
      {
        id: "payment_type",
        label: "Payment Type",
        minWidth: 120,
      },
      {
        id: "payment_method",
        label: "Payment Method",
        minWidth: 150,
      },
      {
        id: "payment_for",
        label: "Payment For",
        minWidth: 150,
      },
      {
        id: "transaction_date",
        label: "Transaction Date",
        minWidth: 150,
        format: (value: string) => {
          const d = new Date(value);
          return d.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        },
      },
      {
        id: "amount",
        label: "Amount",
        minWidth: 120,
        align: "right",
        format: (value: number) => `₱${value.toLocaleString()}`,
      },
    ],
    []
  );

  // Fetch payments for selected business (joined with booking + tourist)
  useEffect(() => {
    const load = async () => {
      if (!businessDetails?.id) return;
      setLoading(true);
      setError(null);
      try {
        const payments = await fetchPaymentsByBusinessId(
          String(businessDetails.id)
        );
        const mapped: TransactionRow[] = payments.map((p: any) => ({
          id: String(p.payment_id ?? p.id ?? ""),
          booking_id: String(p.booking_id ?? ""),
          name: [p.first_name, p.last_name].filter(Boolean).join(" ") || "—",
          firstName: p.first_name || "",
          lastName: p.last_name || "",
          user_profile: p.user_profile || undefined,
          payment_type: p.payment_type || "—",
          payment_method: p.payment_method || "—",
          payment_for: p.payment_for || "—",
          transaction_date: p.created_at
            ? new Date(p.created_at).toISOString()
            : new Date().toISOString(),
          amount: Number(p.amount ?? 0),
          status: p.status || "Pending",
        }));
        setRows(mapped);
        console.log(mapped.map((b) => ({ id: b.id, status: b.status })));
      } catch (e: any) {
        console.error("Failed to load bookings/payments", e);
        setError(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [businessDetails?.id]);

  const years = useMemo(
    () =>
      Array.from(
        new Set(rows.map((row) => new Date(row.transaction_date).getFullYear()))
      ).sort((a, b) => b - a),
    [rows]
  );

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
          <Typography.Header>Transaction History</Typography.Header>
        </Container>

        {/* Search + Filter */}
        <Container
          direction="row"
          justify="space-between"
          align="center"
          gap="16px"
          style={{ flexWrap: "wrap" }}
        >
          <Input
            startDecorator={<Search />}
            placeholder="Search Transaction"
            size="lg"
            sx={{ flex: 1 }}
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
          >
            <Option value="all">All Years</Option>
            {years.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Container>
      </Container>

      {/* Transaction Table */}
      <Table
        columns={columns}
        data={filteredData}
        rowsPerPage={10}
        loading={loading}
        emptyMessage={
          error
            ? error
            : searchTerm.trim()
            ? `No transactions match "${searchTerm}". Try a different search term.`
            : "No payment transactions found."
        }
        rowKey="id"
        stickyHeader={true}
        maxHeight="600px"
        oddRowColor={colors.odd}
      />
    </PageContainer>
  );
};

export default Transactions;
