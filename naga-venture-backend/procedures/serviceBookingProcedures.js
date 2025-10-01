async function createServiceBookingProcedures(knex) {
  // ==================== SERVICE BOOKINGS ====================
  
  // Get all service bookings
  await knex.raw(`
    CREATE PROCEDURE GetAllServiceBookings()
    BEGIN
      SELECT sb.*, 
        s.name as service_name, 
        s.image_url as service_image,
        b.business_name, 
        u.email as user_email,
        CONCAT(t.first_name, ' ', t.last_name) as user_name,
        u.phone_number as user_phone
      FROM service_booking sb 
      LEFT JOIN service s ON sb.service_id = s.id 
      LEFT JOIN business b ON sb.business_id = b.id 
      LEFT JOIN user u ON sb.user_id = u.id
      LEFT JOIN tourist t ON u.id = t.user_id
      ORDER BY sb.booking_datetime DESC;
    END;
  `);

  // Get service bookings by business ID
  await knex.raw(`
    CREATE PROCEDURE GetServiceBookingsByBusinessId(IN p_businessId CHAR(36))
    BEGIN
      SELECT sb.*, 
        s.name as service_name,
        s.image_url as service_image,
        u.email as user_email,
        CONCAT(t.first_name, ' ', t.last_name) as user_name,
        u.phone_number as user_phone
      FROM service_booking sb 
      LEFT JOIN service s ON sb.service_id = s.id 
      LEFT JOIN user u ON sb.user_id = u.id
      LEFT JOIN tourist t ON u.id = t.user_id
      WHERE sb.business_id = p_businessId
      ORDER BY sb.booking_datetime DESC;
    END;
  `);

  // Get service bookings by user ID
  await knex.raw(`
    CREATE PROCEDURE GetServiceBookingsByUserId(IN p_userId CHAR(36))
    BEGIN
      SELECT sb.*, 
        s.name as service_name,
        s.description as service_description,
        s.image_url as service_image,
        b.business_name,
        b.phone_number as business_phone,
        b.email as business_email
      FROM service_booking sb 
      LEFT JOIN service s ON sb.service_id = s.id 
      LEFT JOIN business b ON sb.business_id = b.id 
      WHERE sb.user_id = p_userId
      ORDER BY sb.booking_datetime DESC;
    END;
  `);

  // Get service booking by ID
  await knex.raw(`
    CREATE PROCEDURE GetServiceBookingById(IN p_bookingId CHAR(36))
    BEGIN
      SELECT sb.*, 
        s.name as service_name,
        s.description as service_description,
        s.image_url as service_image,
        s.duration_estimate,
        s.requirements,
        b.business_name,
        b.phone_number as business_phone,
        b.email as business_email,
        u.email as user_email,
        CONCAT(t.first_name, ' ', t.last_name) as user_name,
        u.phone_number as user_phone
      FROM service_booking sb 
      LEFT JOIN service s ON sb.service_id = s.id 
      LEFT JOIN business b ON sb.business_id = b.id 
      LEFT JOIN user u ON sb.user_id = u.id
      LEFT JOIN tourist t ON u.id = t.user_id
      WHERE sb.id = p_bookingId;
    END;
  `);

  // Insert service booking
  await knex.raw(`
    CREATE PROCEDURE InsertServiceBooking(
      IN p_id CHAR(36),
      IN p_service_id CHAR(36),
      IN p_business_id CHAR(36),
      IN p_user_id CHAR(36),
      IN p_booking_number VARCHAR(50),
      IN p_booking_datetime TIMESTAMP,
      IN p_duration_minutes INT,
      IN p_number_of_people INT,
      IN p_base_price DECIMAL(10,2),
      IN p_total_price DECIMAL(10,2),
      IN p_special_requests TEXT,
      IN p_payment_method VARCHAR(50)
    )
    BEGIN
      INSERT INTO service_booking (
        id, service_id, business_id, user_id, booking_number, booking_datetime,
        duration_minutes, number_of_people, base_price, total_price, 
        special_requests, payment_method
      ) VALUES (
        p_id, p_service_id, p_business_id, p_user_id, p_booking_number, p_booking_datetime,
        p_duration_minutes, p_number_of_people, p_base_price, p_total_price,
        p_special_requests, IFNULL(p_payment_method, 'cash_on_site')
      );
      
      SELECT sb.*, 
        s.name as service_name, 
        b.business_name, 
        u.email as user_email
      FROM service_booking sb 
      LEFT JOIN service s ON sb.service_id = s.id 
      LEFT JOIN business b ON sb.business_id = b.id 
      LEFT JOIN user u ON sb.user_id = u.id 
      WHERE sb.id = p_id;
    END;
  `);

  // Update service booking status
  await knex.raw(`
    CREATE PROCEDURE UpdateServiceBookingStatus(
      IN p_bookingId CHAR(36), 
      IN p_status VARCHAR(50)
    )
    BEGIN
      UPDATE service_booking 
      SET status = p_status,
          confirmed_at = IF(p_status = 'confirmed', NOW(), confirmed_at),
          service_started_at = IF(p_status = 'in_progress', NOW(), service_started_at),
          service_completed_at = IF(p_status = 'completed', NOW(), service_completed_at),
          updated_at = NOW()
      WHERE id = p_bookingId;
      
      SELECT sb.*, 
        s.name as service_name, 
        b.business_name, 
        u.email as user_email
      FROM service_booking sb 
      LEFT JOIN service s ON sb.service_id = s.id 
      LEFT JOIN business b ON sb.business_id = b.id 
      LEFT JOIN user u ON sb.user_id = u.id 
      WHERE sb.id = p_bookingId;
    END;
  `);

  // Update payment status for service booking
  await knex.raw(`
    CREATE PROCEDURE UpdateServiceBookingPaymentStatus(
      IN p_bookingId CHAR(36), 
      IN p_payment_status VARCHAR(50)
    )
    BEGIN
      UPDATE service_booking 
      SET payment_status = p_payment_status,
          updated_at = NOW()
      WHERE id = p_bookingId;
      
      SELECT sb.*, 
        s.name as service_name, 
        b.business_name, 
        u.email as user_email
      FROM service_booking sb 
      LEFT JOIN service s ON sb.service_id = s.id 
      LEFT JOIN business b ON sb.business_id = b.id 
      LEFT JOIN user u ON sb.user_id = u.id 
      WHERE sb.id = p_bookingId;
    END;
  `);

  // Cancel service booking
  await knex.raw(`
    CREATE PROCEDURE CancelServiceBooking(
      IN p_bookingId CHAR(36),
      IN p_cancellation_reason TEXT,
      IN p_refund_amount DECIMAL(10,2)
    )
    BEGIN
      UPDATE service_booking 
      SET status = 'cancelled',
          cancelled_at = NOW(),
          cancellation_reason = p_cancellation_reason,
          refund_amount = p_refund_amount,
          payment_status = IF(p_refund_amount > 0, 'refunded', payment_status),
          updated_at = NOW()
      WHERE id = p_bookingId;
      
      SELECT sb.*, 
        s.name as service_name, 
        b.business_name, 
        u.email as user_email
      FROM service_booking sb 
      LEFT JOIN service s ON sb.service_id = s.id 
      LEFT JOIN business b ON sb.business_id = b.id 
      LEFT JOIN user u ON sb.user_id = u.id 
      WHERE sb.id = p_bookingId;
    END;
  `);

  // Mark customer as arrived
  await knex.raw(`
    CREATE PROCEDURE MarkCustomerArrivedForService(IN p_bookingId CHAR(36))
    BEGIN
      UPDATE service_booking 
      SET customer_arrived_at = NOW(),
          updated_at = NOW()
      WHERE id = p_bookingId;
      
      SELECT sb.*, 
        s.name as service_name, 
        b.business_name, 
        u.email as user_email
      FROM service_booking sb 
      LEFT JOIN service s ON sb.service_id = s.id 
      LEFT JOIN business b ON sb.business_id = b.id 
      LEFT JOIN user u ON sb.user_id = u.id 
      WHERE sb.id = p_bookingId;
    END;
  `);

  // Get upcoming bookings for a business (next 7 days)
  await knex.raw(`
    CREATE PROCEDURE GetUpcomingServiceBookings(IN p_businessId CHAR(36))
    BEGIN
      SELECT sb.*, 
        s.name as service_name,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.phone_number as user_phone
      FROM service_booking sb 
      LEFT JOIN service s ON sb.service_id = s.id 
      LEFT JOIN user u ON sb.user_id = u.id 
      WHERE sb.business_id = p_businessId
        AND sb.booking_datetime BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
        AND sb.status IN ('pending', 'confirmed')
      ORDER BY sb.booking_datetime ASC;
    END;
  `);

  // Get booking statistics for business
  await knex.raw(`
    CREATE PROCEDURE GetServiceBookingStatsByBusiness(
      IN p_businessId CHAR(36),
      IN p_days INT
    )
    BEGIN
      -- Overview statistics
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN status IN ('pending', 'confirmed') THEN 1 END) as upcoming_bookings,
        SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status = 'completed' THEN total_price END) as average_booking_value
      FROM service_booking
      WHERE business_id = p_businessId
        AND created_at >= DATE_SUB(NOW(), INTERVAL p_days DAY);
      
      -- Daily statistics
      SELECT 
        DATE(booking_datetime) as date,
        COUNT(*) as bookings_count,
        SUM(total_price) as revenue
      FROM service_booking
      WHERE business_id = p_businessId
        AND booking_datetime >= DATE_SUB(NOW(), INTERVAL p_days DAY)
      GROUP BY DATE(booking_datetime)
      ORDER BY date DESC;
      
      -- Popular services
      SELECT 
        s.id,
        s.name,
        COUNT(sb.id) as booking_count,
        SUM(sb.total_price) as total_revenue
      FROM service_booking sb
      LEFT JOIN service s ON sb.service_id = s.id
      WHERE sb.business_id = p_businessId
        AND sb.created_at >= DATE_SUB(NOW(), INTERVAL p_days DAY)
      GROUP BY s.id, s.name
      ORDER BY booking_count DESC
      LIMIT 10;
    END;
  `);
}

async function dropServiceBookingProcedures(knex) {
  const procedures = [
    "GetAllServiceBookings",
    "GetServiceBookingsByBusinessId",
    "GetServiceBookingsByUserId",
    "GetServiceBookingById",
    "InsertServiceBooking",
    "UpdateServiceBookingStatus",
    "UpdateServiceBookingPaymentStatus",
    "CancelServiceBooking",
    "MarkCustomerArrivedForService",
    "GetUpcomingServiceBookings",
    "GetServiceBookingStatsByBusiness"
  ];

  for (const procedure of procedures) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${procedure}`);
  }
}

export { createServiceBookingProcedures, dropServiceBookingProcedures };
