import React from "react";
import Table, { GuestAvatar, StatusChip } from "@/src/components/ui/Table";
import type { TableColumn, GuestInfo } from "@/src/components/ui/Table";
import Typography from "../components/Typography";
import { colors } from "../utils/Colors";
import PageContainer from "../components/PageContainer";
// Example: Booking data structure
interface BookingData {
  id: string;
  guest: GuestInfo;
  pax: number;
  tripPurpose: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  balance: number;
  status: string;
}

// Example usage
const TableShowcase = () => {
  // Sample data
  const bookings: BookingData[] = [
    {
      id: "BK001",
      guest: {
        firstName: "Juan",
        middleName: "Santos",
        lastName: "Dela Cruz",
        userProfile: "https://picsum.photos/seed/user1/200",
      },
      pax: 2,
      tripPurpose: "Vacation",
      checkIn: "2025-11-15",
      checkOut: "2025-11-18",
      totalPrice: 15000,
      balance: 5000,
      status: "Reserved",
    },
    {
      id: "BK002",
      guest: {
        firstName: "Maria",
        lastName: "Santos",
        // No middle name, no profile picture
      },
      pax: 4,
      tripPurpose: "Business",
      checkIn: "2025-11-20",
      checkOut: "2025-11-22",
      totalPrice: 20000,
      balance: 0,
      status: "Checked-in",
    },
    {
      id: "BK003",
      guest: {
        firstName: "Pedro",
        middleName: "Garcia",
        lastName: "Rodriguez",
        userProfile: "https://picsum.photos/seed/user3/200",
      },
      pax: 3,
      tripPurpose: "Leisure",
      checkIn: "2025-11-25",
      checkOut: "2025-11-28",
      totalPrice: 18000,
      balance: 18000,
      status: "Pending",
    },
  ];

  // Define columns
  const columns: TableColumn<BookingData>[] = [
    {
      id: "guest",
      label: "Guest",
      minWidth: 200,
      render: (row) => <GuestAvatar guest={row.guest} size={40} />,
    },
    {
      id: "pax",
      label: "Pax",
      minWidth: 80,
      align: "center",
    },
    {
      id: "tripPurpose",
      label: "Purpose",
      minWidth: 120,
    },
    {
      id: "checkIn",
      label: "Check-in",
      minWidth: 120,
      format: (value) =>
        new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      id: "checkOut",
      label: "Check-out",
      minWidth: 120,
      format: (value) =>
        new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      id: "totalPrice",
      label: "Total Price",
      minWidth: 120,
      align: "right",
      format: (value) => `₱${value.toLocaleString()}`,
    },
    {
      id: "balance",
      label: "Balance",
      minWidth: 120,
      align: "right",
      format: (value) => `₱${value.toLocaleString()}`,
    },
    {
      id: "status",
      label: "Status",
      minWidth: 120,
      align: "center",
      render: (row) => <StatusChip status={row.status} />,
    },
  ];

  // Handle row click
  const handleRowClick = (row: BookingData, index: number) => {
    console.log("Clicked row:", row, "at index:", index);
    alert(
      `You clicked on booking ${row.id} for ${row.guest.firstName} ${row.guest.lastName}`
    );
  };

  return (
    <PageContainer style={{ padding: "24px" }}>
      <Typography.Title weight="bold" color="primary" marginBottom={2}>
        Card Component Showcase
      </Typography.Title>
      <Table
        columns={columns}
        data={bookings}
        rowsPerPage={10}
        onRowClick={handleRowClick}
        rowKey="id"
        emptyMessage="No bookings found"
        loading={false}
        stickyHeader={true}
        maxHeight="600px"
        oddRowColor={colors.odd}
        evenRowColor="#FFFFFF"
        hoverColor="#E5E7EB"
      />
    </PageContainer>
  );
};

export default TableShowcase;
