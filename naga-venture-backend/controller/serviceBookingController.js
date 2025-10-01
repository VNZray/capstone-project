import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

// ==================== SERVICE BOOKINGS ====================

// Get all service bookings
export async function getAllServiceBookings(req, res) {
  try {
    const [data] = await db.query("CALL GetAllServiceBookings()");
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get service bookings by business ID
export async function getServiceBookingsByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetServiceBookingsByBusinessId(?)", [businessId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get service bookings by user ID
export async function getServiceBookingsByUserId(req, res) {
  const { userId } = req.params;
  try {
    const [data] = await db.query("CALL GetServiceBookingsByUserId(?)", [userId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get service booking by ID
export async function getServiceBookingById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetServiceBookingById(?)", [id]);
    
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Service booking not found" });
    }
    
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Insert a new service booking
export async function insertServiceBooking(req, res) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const bookingId = uuidv4();
    const { 
      service_id, 
      business_id, 
      user_id, 
      booking_datetime, 
      duration_minutes,
      number_of_people = 1,
      special_requests,
      payment_method = "cash_on_site"
    } = req.body;

    // Get service details
    const [serviceData] = await connection.query("CALL GetServiceById(?)", [service_id]);
    if (!serviceData || serviceData.length === 0) {
      throw new Error("Service not found");
    }
    
    const service = serviceData[0];
    
    // Check if business accepts service bookings
    const [settingsData] = await connection.query("CALL GetBusinessSettings(?)", [business_id]);
    const settings = settingsData && settingsData.length > 0 ? settingsData[0] : null;
    
    if (settings && !settings.accepts_service_bookings) {
      throw new Error("This business is not currently accepting service bookings");
    }

    // Calculate price based on service pricing
    let basePrice = service.base_price;
    let totalPrice = basePrice;

    // Apply any active sales/discounts
    if (service.sale_type && service.sale_value > 0) {
      if (service.sale_type === 'percentage') {
        totalPrice = basePrice - (basePrice * service.sale_value / 100);
      } else if (service.sale_type === 'fixed') {
        totalPrice = Math.max(0, basePrice - service.sale_value);
      }
    }

    // Multiply by number of people if applicable
    totalPrice = totalPrice * number_of_people;

    // Generate booking number
    const timestamp = Date.now().toString().slice(-8);
    const bookingNumber = `SB-${timestamp}`;

    // Get default duration if not provided
    const bookingDuration = duration_minutes || 
                           (settings ? settings.service_default_duration_minutes : 60);

    // Insert booking using stored procedure
    const [bookingResult] = await connection.query(
      "CALL InsertServiceBooking(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
      [
        bookingId, 
        service_id, 
        business_id, 
        user_id, 
        bookingNumber, 
        booking_datetime,
        bookingDuration,
        number_of_people,
        basePrice,
        totalPrice,
        special_requests || null,
        payment_method
      ]
    );

    // Auto-confirm if business setting is enabled
    if (settings && settings.auto_confirm_bookings) {
      await connection.query("CALL UpdateServiceBookingStatus(?, ?)", [bookingId, "confirmed"]);
    }

    // Create notification for user
    if (settings && settings.send_notifications) {
      const notificationId = uuidv4();
      await connection.query(
        "CALL InsertNotification(?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          notificationId,
          user_id,
          "booking_created",
          bookingId,
          "service_booking",
          "Booking Confirmed",
          `Your booking for ${service.name} has been created for ${new Date(booking_datetime).toLocaleString()}.`,
          JSON.stringify({ 
            service_name: service.name, 
            business_name: service.business_name,
            booking_number: bookingNumber 
          }),
          "in_app"
        ]
      );
    }

    await connection.commit();
    
    res.status(201).json({
      message: "Service booking created successfully",
      data: bookingResult[0]
    });
  } catch (error) {
    await connection.rollback();
    return handleDbError(error, res);
  } finally {
    connection.release();
  }
}

// Update service booking status
export async function updateServiceBookingStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const [data] = await db.query("CALL UpdateServiceBookingStatus(?, ?)", [id, status]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Service booking not found" });
    }

    res.json({
      message: "Service booking status updated successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update payment status
export async function updateServiceBookingPaymentStatus(req, res) {
  const { id } = req.params;
  const { payment_status } = req.body;
  
  try {
    const [data] = await db.query("CALL UpdateServiceBookingPaymentStatus(?, ?)", [id, payment_status]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Service booking not found" });
    }

    res.json({
      message: "Payment status updated successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Cancel service booking
export async function cancelServiceBooking(req, res) {
  const { id } = req.params;
  const { cancellation_reason } = req.body;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get booking details
    const [bookingData] = await connection.query("CALL GetServiceBookingById(?)", [id]);
    if (!bookingData || bookingData.length === 0) {
      throw new Error("Service booking not found");
    }
    
    const booking = bookingData[0];

    // Get business settings for cancellation policy
    const [settingsData] = await connection.query("CALL GetBusinessSettings(?)", [booking.business_id]);
    const settings = settingsData && settingsData.length > 0 ? settingsData[0] : null;

    // Check if cancellation is allowed
    if (settings && !settings.allow_customer_cancellation) {
      throw new Error("Cancellations are not allowed for this business");
    }

    // Calculate refund amount based on policy
    let refundAmount = 0;
    if (booking.payment_status === 'paid') {
      const now = new Date();
      const bookingDate = new Date(booking.booking_datetime);
      const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);

      if (settings && settings.cancellation_deadline_hours) {
        if (hoursUntilBooking < settings.cancellation_deadline_hours) {
          // Past deadline - apply penalty
          if (settings.cancellation_penalty_percentage > 0) {
            refundAmount = booking.total_price * (1 - settings.cancellation_penalty_percentage / 100);
          } else if (settings.cancellation_penalty_fixed > 0) {
            refundAmount = Math.max(0, booking.total_price - settings.cancellation_penalty_fixed);
          } else {
            refundAmount = booking.total_price;
          }
        } else {
          // Before deadline - full refund
          refundAmount = booking.total_price;
        }
      } else {
        // No deadline - full refund
        refundAmount = booking.total_price;
      }
    }

    // Cancel the booking
    const [data] = await connection.query(
      "CALL CancelServiceBooking(?, ?, ?)", 
      [id, cancellation_reason || null, refundAmount]
    );

    // Create notification
    if (settings && settings.send_notifications) {
      const notificationId = uuidv4();
      await connection.query(
        "CALL InsertNotification(?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          notificationId,
          booking.user_id,
          "booking_cancelled",
          id,
          "service_booking",
          "Booking Cancelled",
          `Your booking for ${booking.service_name} has been cancelled.${refundAmount > 0 ? ` Refund amount: $${refundAmount.toFixed(2)}` : ''}`,
          JSON.stringify({ 
            service_name: booking.service_name,
            refund_amount: refundAmount
          }),
          "in_app"
        ]
      );
    }

    await connection.commit();

    res.json({
      message: "Service booking cancelled successfully",
      data: data[0],
      refund_amount: refundAmount
    });
  } catch (error) {
    await connection.rollback();
    return handleDbError(error, res);
  } finally {
    connection.release();
  }
}

// Mark customer as arrived
export async function markCustomerArrived(req, res) {
  const { id } = req.params;
  
  try {
    const [data] = await db.query("CALL MarkCustomerArrivedForService(?)", [id]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Service booking not found" });
    }

    res.json({
      message: "Customer arrival recorded successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get upcoming bookings for business
export async function getUpcomingServiceBookings(req, res) {
  const { businessId } = req.params;
  
  try {
    const [data] = await db.query("CALL GetUpcomingServiceBookings(?)", [businessId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get service booking statistics for business
export async function getServiceBookingStatsByBusiness(req, res) {
  const { businessId } = req.params;
  const { period = '30' } = req.query; // days
  
  try {
    const [results] = await db.query("CALL GetServiceBookingStatsByBusiness(?, ?)", [businessId, parseInt(period)]);
    
    if (!results || results.length < 3) {
      return res.status(404).json({ message: "Business not found or no data available" });
    }

    const overview = results[0][0];
    const daily_stats = results[1];
    const popular_services = results[2];

    res.json({
      overview: overview,
      daily_stats: daily_stats,
      popular_services: popular_services
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}
