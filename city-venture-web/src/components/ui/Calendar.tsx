import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Lock, Plus } from "lucide-react";
import Typography from "../Typography";
import IconButton from "../IconButton";
import Container from "../Container";
import { colors } from "../../utils/Colors";
import { Tooltip } from "@mui/joy";

interface CalendarEvent {
  date: Date;
  status: "Available" | "Reserved" | "Occupied" | "Maintenance" | "Blocked";
  label?: string;
  bookingId?: string;
  blockId?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date, event?: CalendarEvent) => void;
  onBlockClick?: (date: Date) => void;
  selectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  showBlockButton?: boolean;
  interactive?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  events = [],
  onDateClick,
  onBlockClick,
  selectedDate,
  minDate,
  maxDate,
  showBlockButton = false,
  interactive = true,
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
      case "Blocked":
        return colors.info;
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

  const handleDateClick = (date: Date | null, event?: CalendarEvent) => {
    if (!date || isDisabled(date) || !interactive) return;
    if (onDateClick) {
      onDateClick(date, event);
    }
  };

  const handleBlockClick = (date: Date | null, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!date || !onBlockClick) return;
    onBlockClick(date);
  };

  return (
    <Container padding="clamp(12px, 3vw, 20px)" gap="clamp(12px, 2vw, 16px)">
      <style>
        {`
          .calendar-day:hover .block-button {
            opacity: 1 !important;
          }
        `}
      </style>
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
          marginBottom: 16,
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
          const isBlocked = event?.status === "Blocked";
          const canBlock = showBlockButton && date && !disabled && !event;

          const dayContent = (
            <Container
              className="calendar-day"
              hover={interactive && !disabled}
              hoverEffect="highlight"
              hoverBackground={colors.primary}
              key={index}
              onClick={() => handleDateClick(date, event)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "1",
                padding: "clamp(4px, 1vw, 6px)",
                borderRadius: "8px",
                cursor:
                  date && !disabled && interactive ? "pointer" : "default",
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
              {isBlocked && (
                <Lock
                  size={10}
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    opacity: 0.7,
                  }}
                />
              )}
              {canBlock && (
                <div
                  onClick={(e) => handleBlockClick(date, e)}
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    opacity: 0,
                    transition: "opacity 0.2s",
                    cursor: "pointer",
                  }}
                  className="block-button"
                >
                  <Plus size={10} />
                </div>
              )}
              <Typography.Body size="md">{date?.getDate()}</Typography.Body>
            </Container>
          );

          if (event?.label) {
            return (
              <Tooltip key={index} title={event.label} placement="top">
                {dayContent}
              </Tooltip>
            );
          }

          return dayContent;
        })}
      </div>

      {/* Legend */}
      <Container padding="0" gap="clamp(6px, 1.5vw, 8px)">
        <Typography.Label size="xs">Status Legend</Typography.Label>
        <Container
          padding="0"
          direction="row"
          justify="space-between"
          style={{ flexWrap: "wrap", gap: "8px" }}
        >
          <Container padding="0" direction="row" align="center" gap="6px">
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

          <Container padding="0" direction="row" align="center" gap="6px">
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

          <Container padding="0" direction="row" align="center" gap="6px">
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

          <Container padding="0" direction="row" align="center" gap="6px">
            <div
              style={{
                width: "clamp(12px, 2.5vw, 16px)",
                height: "clamp(12px, 2.5vw, 16px)",
                borderRadius: "4px",
                backgroundColor: colors.info,
                flexShrink: 0,
              }}
            />
            <Typography.Body size="xs">Blocked</Typography.Body>
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export default Calendar;
