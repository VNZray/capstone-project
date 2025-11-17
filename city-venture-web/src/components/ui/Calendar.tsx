import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Typography from "../Typography";
import IconButton from "../IconButton";
import Container from "../Container";
import { colors } from "../../utils/Colors";

interface CalendarEvent {
  date: Date;
  status: "Available" | "Reserved" | "Occupied" | "Maintenance";
  label?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({
  events = [],
  onDateClick,
  selectedDate,
  minDate,
  maxDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  console.log("Calendar received events:", events);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get first day of the month
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  // Get last day of the month
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Get total days in month
  const totalDays = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days of the month
    for (let day = 1; day <= totalDays; day++) {
      days.push(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      );
    }

    return days;
  }, [currentDate, firstDayOfWeek, totalDays]);

  // Navigate to previous month
  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Check if date is today
  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (date: Date | null): boolean => {
    if (!date || !selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Get event status for a date
  const getEventStatus = (date: Date | null): CalendarEvent | undefined => {
    if (!date) return undefined;

    const found = events.find((event) => {
      const eventDate = new Date(event.date);
      const match =
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear();

      if (match) {
        console.log("Found matching event:", {
          date: date.toDateString(),
          eventDate: eventDate.toDateString(),
          status: event.status,
        });
      }

      return match;
    });

    return found;
  };

  // Get background color based on status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Available":
        return "transparent";
      case "Reserved":
        return colors.secondary;
      case "Occupied":
        return colors.warning;
      case "Maintenance":
        return colors.error;
      default:
        return "transparent";
    }
  };

  // Check if date is disabled
  const isDisabled = (date: Date | null): boolean => {
    if (!date) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDateClick = (date: Date | null) => {
    if (!date || isDisabled(date)) return;
    if (onDateClick) {
      onDateClick(date);
    }
  };

  return (
    <Container padding="clamp(12px, 3vw, 20px)" gap="clamp(12px, 2vw, 16px)">
      {/* Calendar Header */}
      <Container
        direction="row"
        align="center"
        justify="space-between"
        padding="0"
        gap="8px"
      >
        <IconButton
          size="sm"
          variant="outlined"
          colorScheme="primary"
          onClick={handlePreviousMonth}
          hoverEffect="scale"
        >
          <ChevronLeft size={18} />
        </IconButton>

        <Typography.CardTitle size="sm">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Typography.CardTitle>

        <IconButton
          size="sm"
          variant="outlined"
          colorScheme="primary"
          onClick={handleNextMonth}
          hoverEffect="scale"
        >
          <ChevronRight size={18} />
        </IconButton>
      </Container>

      {/* Calendar Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "clamp(4px, 1vw, 8px)",
          width: "100%",
        }}
      >
        {/* Day Names */}
        {dayNames.map((day) => (
          <div
            key={day}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "clamp(6px, 1.5vw, 8px)",
              fontWeight: 600,
              fontSize: "clamp(0.7rem, 1.8vw, 0.75rem)",
              color: colors.secondary,
            }}
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((date, index) => {
          const event = getEventStatus(date);
          const disabled = isDisabled(date);
          const today = isToday(date);
          const selected = isSelected(date);

          return (
            <Container
              hover
              hoverEffect="highlight"
              hoverBackground={colors.primary}
              key={index}
              onClick={() => handleDateClick(date)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "1",
                padding: "clamp(4px, 1vw, 6px)",
                borderRadius: "8px",
                cursor: date && !disabled ? "pointer" : "default",
                backgroundColor: event
                  ? getStatusColor(event.status)
                  : "transparent",
                border: today
                  ? `2px solid ${colors.primary}`
                  : selected
                  ? `2px solid ${colors.info}`
                  : "2px solid transparent",
                opacity: disabled ? 0.3 : date ? 1 : 0,
                transition: "all 0.2s ease-in-out",
                fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)",
                fontWeight: event ? 600 : 400,
                position: "relative",
              }}
            >
              {event ? (
                <Typography.Body size="md">{date?.getDate()}</Typography.Body>
              ) : (
                <Typography.Body size="md">{date?.getDate()}</Typography.Body>
              )}
            </Container>
          );
        })}
      </div>

      {/* Legend */}
      <Container padding="clamp(8px, 2vw, 12px)" gap="clamp(6px, 1.5vw, 8px)">
        <Typography.Label size="xs" sx={{ marginBottom: "4px" }}>
          Status Legend
        </Typography.Label>
        <Container direction="row" justify="space-between">
          <Container direction="row" align="center" gap="6px">
            <div
              style={{
                width: "clamp(12px, 2.5vw, 16px)",
                height: "clamp(12px, 2.5vw, 16px)",
                borderRadius: "4px",
                backgroundColor: colors.secondary,
                flexShrink: 0,
              }}
            />
            <Typography.Body size="xs">Reserved</Typography.Body>
          </Container>

          <Container direction="row" align="center" gap="6px">
            <div
              style={{
                width: "clamp(12px, 2.5vw, 16px)",
                height: "clamp(12px, 2.5vw, 16px)",
                borderRadius: "4px",
                backgroundColor: colors.warning,
                flexShrink: 0,
              }}
            />
            <Typography.Body size="xs">Occupied</Typography.Body>
          </Container>

          <Container direction="row" align="center" gap="6px">
            <div
              style={{
                width: "clamp(12px, 2.5vw, 16px)",
                height: "clamp(12px, 2.5vw, 16px)",
                borderRadius: "4px",
                backgroundColor: colors.error,
                flexShrink: 0,
              }}
            />
            <Typography.Body size="xs">Maintenance</Typography.Body>
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export default Calendar;
