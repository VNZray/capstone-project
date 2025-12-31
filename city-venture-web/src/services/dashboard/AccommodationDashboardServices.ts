import { fetchRoomsByBusinessId } from "@/src/services/RoomService";
import { fetchBookingsByBusinessId } from "@/src/services/BookingService";
import { fetchPaymentsByBusinessId } from "@/src/services/PaymentService";
import type { Room } from "@/src/types/Business";
import type { Booking } from "@/src/types/Booking";

// ==================== Types ====================
export interface FilterPeriod {
  period: "week" | "month" | "year" | "all";
  month?: number;
  year?: number;
}

export interface KPIStats {
  profileViews: number;
  profileViewsChange: number;
  totalBookings: number;
  totalBookingsChange: number;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
  occupancyRateChange: number;
  averageBookingValue: number;
}

export interface RevenueStats {
  monthlyRevenue: number;
  monthlyRevenueChange: number;
  annualRevenue: number;
  annualRevenueChange: number;
}

export interface BookingStatusStats {
  reserved: number;
  checkedIn: number;
  checkedOut: number;
  canceled: number;
}

export interface TouristStats {
  local: number;
  domestic: number;
  foreign: number;
  overseas: number;
  total: number;
}

export interface RoomRank {
  roomNumber: string;
  roomType: string;
  bookings: number;
  revenue: number;
  rank: number;
}

export interface RecentBooking {
  id: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: "Pending" | "Reserved" | "Checked-in" | "Checked-out" | "Canceled";
  amount: number;
  touristId: string;
  createdAt?: string;
}

export interface RecentPayment {
  id: string;
  guestName: string;
  bookingId: string;
  amount: number;
  date: string;
  method: string;
  status: "Completed" | "Pending" | "Failed";
}

export interface DashboardData {
  rooms: Room[];
  bookings: Booking[];
  payments: any[];
}

// ==================== Data Fetching ====================

export const fetchDashboardData = async (
  businessId: string
): Promise<DashboardData> => {
  const [roomsData, bookingsData, paymentsData] = await Promise.all([
    fetchRoomsByBusinessId(businessId),
    fetchBookingsByBusinessId(businessId),
    fetchPaymentsByBusinessId(String(businessId)),
  ]);

  const filteredRooms = Array.isArray(roomsData) ? roomsData : [];

  return {
    rooms: filteredRooms,
    bookings: bookingsData || [],
    payments: paymentsData || [],
  };
};

// ==================== Date Filtering ====================

const filterByDatePeriod = <
  T extends { created_at?: string | Date; check_in_date?: string | Date }
>(
  items: T[],
  filter: FilterPeriod,
  dateField: "created_at" | "check_in_date" = "created_at"
): T[] => {
  if (filter.period === "all") return items;

  return items.filter((item) => {
    const itemDate = new Date(item[dateField] || item.created_at || "");

    if (filter.period === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return itemDate >= weekAgo;
    } else if (filter.period === "month" && filter.month !== undefined) {
      return (
        itemDate.getMonth() === filter.month &&
        itemDate.getFullYear() === filter.year!
      );
    } else if (filter.period === "year" && filter.year !== undefined) {
      return itemDate.getFullYear() === filter.year;
    }
    return true;
  });
};

const getPreviousPeriodFilter = (filter: FilterPeriod): FilterPeriod => {
  if (filter.period === "month" && filter.month !== undefined) {
    const prevMonth = filter.month === 0 ? 11 : filter.month - 1;
    const prevYear = filter.month === 0 ? filter.year! - 1 : filter.year!;
    return { period: "month", month: prevMonth, year: prevYear };
  } else if (filter.period === "year" && filter.year !== undefined) {
    return { period: "year", year: filter.year - 1 };
  }
  return filter;
};

const calculatePercentageChange = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// ==================== KPI (Key Performance Indicator) Statistics ====================

export const calculateKPIStats = (
  data: DashboardData,
  filter: FilterPeriod
): KPIStats => {
  const { rooms, bookings } = data;

  console.log("📊 calculateKPIStats - Total bookings:", bookings.length);
  console.log("📊 calculateKPIStats - Filter:", filter);

  const filteredBookings = filterByDatePeriod(
    bookings,
    filter,
    "check_in_date"
  );
  console.log(
    "📊 calculateKPIStats - Filtered bookings:",
    filteredBookings.length
  );

  const previousFilter = getPreviousPeriodFilter(filter);
  const previousBookings = filterByDatePeriod(
    bookings,
    previousFilter,
    "check_in_date"
  );

  const bookingsChange = calculatePercentageChange(
    filteredBookings.length,
    previousBookings.length
  );

  // Calculate occupancy rate based on bookings
  let occupancyRate = 0;

  if (rooms.length > 0) {
    if (
      filter.period === "month" &&
      filter.month !== undefined &&
      filter.year !== undefined
    ) {
      // Calculate days in the selected month
      const daysInMonth = new Date(filter.year, filter.month + 1, 0).getDate();
      const totalRoomDays = rooms.length * daysInMonth;

      // Calculate total booked days (only for Checked-In and Checked-Out bookings)
      const bookedDays = filteredBookings
        .filter(
          (b) =>
            b.booking_status === "Checked-In" ||
            b.booking_status === "Checked-Out"
        )
        .reduce((sum, booking) => {
          const checkIn = new Date(booking.check_in_date || "");
          const checkOut = new Date(booking.check_out_date || "");
          const nights = Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + (nights > 0 ? nights : 0);
        }, 0);

      occupancyRate =
        totalRoomDays > 0 ? (bookedDays / totalRoomDays) * 100 : 0;
    } else if (filter.period === "year" && filter.year !== undefined) {
      // Calculate days in the year
      const daysInYear =
        (filter.year % 4 === 0 && filter.year % 100 !== 0) ||
        filter.year % 400 === 0
          ? 366
          : 365;
      const totalRoomDays = rooms.length * daysInYear;

      // Calculate total booked days
      const bookedDays = filteredBookings
        .filter(
          (b) =>
            b.booking_status === "Checked-In" ||
            b.booking_status === "Checked-Out"
        )
        .reduce((sum, booking) => {
          const checkIn = new Date(booking.check_in_date || "");
          const checkOut = new Date(booking.check_out_date || "");
          const nights = Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + (nights > 0 ? nights : 0);
        }, 0);

      occupancyRate =
        totalRoomDays > 0 ? (bookedDays / totalRoomDays) * 100 : 0;
    } else if (filter.period === "week") {
      // Calculate for the last 7 days
      const totalRoomDays = rooms.length * 7;

      const bookedDays = filteredBookings
        .filter(
          (b) =>
            b.booking_status === "Checked-In" ||
            b.booking_status === "Checked-Out"
        )
        .reduce((sum, booking) => {
          const checkIn = new Date(booking.check_in_date || "");
          const checkOut = new Date(booking.check_out_date || "");
          const nights = Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + (nights > 0 ? nights : 0);
        }, 0);

      occupancyRate =
        totalRoomDays > 0 ? (bookedDays / totalRoomDays) * 100 : 0;
    } else {
      // For "all" period, calculate based on available date range
      if (bookings.length > 0) {
        const allDates = bookings
          .map((b) => new Date(b.check_in_date || "").getTime())
          .filter((d) => !isNaN(d));
        if (allDates.length > 0) {
          const minDate = new Date(Math.min(...allDates));
          const maxDate = new Date();
          const totalDays = Math.ceil(
            (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          const totalRoomDays = rooms.length * totalDays;

          const bookedDays = filteredBookings
            .filter(
              (b) =>
                b.booking_status === "Checked-In" ||
                b.booking_status === "Checked-Out"
            )
            .reduce((sum, booking) => {
              const checkIn = new Date(booking.check_in_date || "");
              const checkOut = new Date(booking.check_out_date || "");
              const nights = Math.ceil(
                (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
              );
              return sum + (nights > 0 ? nights : 0);
            }, 0);

          occupancyRate =
            totalRoomDays > 0 ? (bookedDays / totalRoomDays) * 100 : 0;
        }
      }
    }
  }

  // Calculate previous period occupancy rate for comparison
  let previousOccupancyRate = 0;
  if (rooms.length > 0) {
    if (
      previousFilter.period === "month" &&
      previousFilter.month !== undefined &&
      previousFilter.year !== undefined
    ) {
      const daysInMonth = new Date(
        previousFilter.year,
        previousFilter.month + 1,
        0
      ).getDate();
      const totalRoomDays = rooms.length * daysInMonth;

      const bookedDays = previousBookings
        .filter(
          (b) =>
            b.booking_status === "Checked-In" ||
            b.booking_status === "Checked-Out"
        )
        .reduce((sum, booking) => {
          const checkIn = new Date(booking.check_in_date || "");
          const checkOut = new Date(booking.check_out_date || "");
          const nights = Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + (nights > 0 ? nights : 0);
        }, 0);

      previousOccupancyRate =
        totalRoomDays > 0 ? (bookedDays / totalRoomDays) * 100 : 0;
    }
  }

  const occupancyRateChange =
    previousOccupancyRate > 0
      ? ((occupancyRate - previousOccupancyRate) / previousOccupancyRate) * 100
      : 0;

  // Room statistics
  const availableRooms = rooms.filter((r) => r.status === "Available").length;
  const occupiedRooms = rooms.filter((r) => r.status === "Occupied").length;
  const maintenanceRooms = rooms.filter(
    (r) => r.status === "Maintenance"
  ).length;

  // Average booking value
  const averageBookingValue =
    filteredBookings.length > 0
      ? filteredBookings.reduce(
          (sum, b) => sum + (Number(b.total_price) || 0),
          0
        ) / filteredBookings.length
      : 0;

  // Mock profile views (would come from analytics API)
  const profileViews = Math.floor(Math.random() * 5000) + 1000;

  return {
    profileViews,
    profileViewsChange: Math.floor(Math.random() * 40) - 10,
    totalBookings: filteredBookings.length,
    totalBookingsChange: bookingsChange,
    totalRooms: rooms.length,
    availableRooms,
    occupiedRooms,
    maintenanceRooms,
    occupancyRate,
    occupancyRateChange,
    averageBookingValue,
  };
};

// ==================== Revenue Statistics ====================

export const calculateRevenueStats = (
  payments: any[],
  filter: FilterPeriod
): RevenueStats => {
  const filteredPayments = filterByDatePeriod(payments, filter);
  const previousFilter = getPreviousPeriodFilter(filter);
  const previousPayments = filterByDatePeriod(payments, previousFilter);

  const currentRevenue = filteredPayments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );
  const previousRevenue = previousPayments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );

  const revenueChange = calculatePercentageChange(
    currentRevenue,
    previousRevenue
  );

  // Calculate annual revenue
  const currentYear = new Date().getFullYear();
  const annualRevenue = payments
    .filter((p) => new Date(p.created_at || "").getFullYear() === currentYear)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return {
    monthlyRevenue: filter.period === "month" ? currentRevenue : 0,
    monthlyRevenueChange: revenueChange,
    annualRevenue: filter.period === "year" ? currentRevenue : annualRevenue,
    annualRevenueChange: revenueChange,
  };
};

// ==================== Booking Statistics ====================

export const calculateBookingStatusStats = (
  bookings: Booking[],
  filter: FilterPeriod
): BookingStatusStats => {
  console.log(
    "📊 calculateBookingStatusStats - Total bookings:",
    bookings.length
  );
  const filteredBookings = filterByDatePeriod(
    bookings,
    filter,
    "check_in_date"
  );
  console.log(
    "📊 calculateBookingStatusStats - Filtered bookings:",
    filteredBookings.length
  );

  const stats = {
    reserved: filteredBookings.filter((b) => b.booking_status === "Reserved")
      .length,
    checkedIn: filteredBookings.filter((b) => b.booking_status === "Checked-In")
      .length,
    checkedOut: filteredBookings.filter(
      (b) => b.booking_status === "Checked-Out"
    ).length,
    canceled: filteredBookings.filter((b) => b.booking_status === "Canceled")
      .length,
  };

  console.log("📊 calculateBookingStatusStats - Stats:", stats);
  return stats;
};

// ==================== Recent Bookings ====================

export const getRecentBookings = (
  bookings: Booking[],
  rooms: Room[],
  limit: number = 10
): RecentBooking[] => {
  console.log("📋 getRecentBookings - Input bookings:", bookings.length);
  console.log("📋 getRecentBookings - Input rooms:", rooms.length);

  const recentBookings = bookings
    .sort(
      (a, b) =>
        new Date(b.created_at || b.check_in_date || "").getTime() -
        new Date(a.created_at || a.check_in_date || "").getTime()
    )
    .slice(0, limit)
    .map((booking) => {
      const room = rooms.find((r) => r.id === booking.room_id);
      return {
        id: booking.id || "",
        guestName: `Guest ${booking.tourist_id?.substring(0, 8) || "Unknown"}`,
        roomNumber: room?.room_number || "N/A",
        roomType: room?.room_type || "Unknown",
        checkIn: String(booking.check_in_date || ""),
        checkOut: String(booking.check_out_date || ""),
        status: (booking.booking_status ||
          "Pending") as RecentBooking["status"],
        amount: Number(booking.total_price) || 0,
        touristId: booking.tourist_id || "",
        createdAt: booking.created_at ? String(booking.created_at) : undefined,
      };
    });

  console.log("📋 getRecentBookings - Output:", recentBookings.length);
  return recentBookings;
};

// ==================== Recent Payments ====================

export const getRecentPayments = (payments: any[]): RecentPayment[] => {
  return payments
    .sort(
      (a, b) =>
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime()
    )
    .slice(0, 5)
    .map((payment) => ({
      id: payment.payment_id || payment.id || "",
      guestName:
        [payment.first_name, payment.last_name].filter(Boolean).join(" ") ||
        "Unknown Guest",
      bookingId: String(payment.booking_id || "N/A"),
      amount: Number(payment.amount) || 0,
      date: payment.created_at || "",
      method: payment.payment_method || "N/A",
      status: (payment.status === "Completed" || payment.status === "completed"
        ? "Completed"
        : "Pending") as RecentPayment["status"],
    }));
};

// ==================== Room Rankings ====================

const calculateRoomRankings = (
  bookings: Booking[],
  rooms: Room[]
): Record<string, { count: number; revenue: number; roomType: string }> => {
  const roomBookingCount: Record<
    string,
    { count: number; revenue: number; roomType: string }
  > = {};

  bookings.forEach((booking) => {
    const roomId = booking.room_id;
    if (!roomId) return;

    if (!roomBookingCount[roomId]) {
      const room = rooms.find((r) => r.id === roomId);
      roomBookingCount[roomId] = {
        count: 0,
        revenue: 0,
        roomType: room?.room_type || "Unknown",
      };
    }

    roomBookingCount[roomId].count++;
    roomBookingCount[roomId].revenue += Number(booking.total_price) || 0;
  });

  return roomBookingCount;
};

export const getTopRoomsByBookings = (
  bookings: Booking[],
  rooms: Room[],
  limit: number = 5
): RoomRank[] => {
  const roomBookingCount = calculateRoomRankings(bookings, rooms);

  return Object.entries(roomBookingCount)
    .map(([roomId, data]) => {
      const room = rooms.find((r) => r.id === roomId);
      return {
        roomNumber: room?.room_number || roomId.substring(0, 6),
        roomType: data.roomType,
        bookings: data.count,
        revenue: data.revenue,
        rank: 0,
      };
    })
    .sort((a, b) => b.bookings - a.bookings)
    .map((room, index) => ({ ...room, rank: index + 1 }))
    .slice(0, limit);
};

export const getTopRoomsByRevenue = (
  bookings: Booking[],
  rooms: Room[],
  limit: number = 5
): RoomRank[] => {
  const roomBookingCount = calculateRoomRankings(bookings, rooms);

  return Object.entries(roomBookingCount)
    .map(([roomId, data]) => {
      const room = rooms.find((r) => r.id === roomId);
      return {
        roomNumber: room?.room_number || roomId.substring(0, 6),
        roomType: data.roomType,
        bookings: data.count,
        revenue: data.revenue,
        rank: 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .map((room, index) => ({ ...room, rank: index + 1 }))
    .slice(0, limit);
};

// ==================== Tourist Statistics ====================

export const calculateTouristStats = (
  bookings: Booking[],
  filter: FilterPeriod
): TouristStats => {
  const filteredBookings = filterByDatePeriod(
    bookings,
    filter,
    "check_in_date"
  );

  const local = filteredBookings.reduce(
    (sum, b) => sum + (Number(b.local_counts) || 0),
    0
  );
  const domestic = filteredBookings.reduce(
    (sum, b) => sum + (Number(b.domestic_counts) || 0),
    0
  );
  const foreign = filteredBookings.reduce(
    (sum, b) => sum + (Number(b.foreign_counts) || 0),
    0
  );
  const overseas = filteredBookings.reduce(
    (sum, b) => sum + (Number(b.overseas_counts) || 0),
    0
  );

  return {
    local,
    domestic,
    foreign,
    overseas,
    total: local + domestic + foreign + overseas,
  };
};
