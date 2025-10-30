/**
 * Service Inquiry Procedures
 * Manages inquiry tracking when tourists express interest in services
 */

async function createServiceInquiryProcedures(knex) {
  console.log("Creating service inquiry procedures...");

  // ==================== GET PROCEDURES ====================

  // Get all inquiries (admin)
  await knex.raw(`
    CREATE PROCEDURE GetAllServiceInquiries()
    BEGIN
      SELECT 
        si.*,
        s.name as service_name,
        s.base_price,
        b.name as business_name,
        COALESCE(u.firstname, g.name) as inquirer_name,
        COALESCE(u.email, g.email) as inquirer_email,
        COALESCE(u.contact_number, g.phone_number) as inquirer_phone
      FROM service_inquiry si
      INNER JOIN service s ON si.service_id = s.id
      INNER JOIN business b ON si.business_id = b.id
      LEFT JOIN user u ON si.user_id = u.id
      LEFT JOIN guest g ON si.guest_id = g.id
      ORDER BY si.created_at DESC;
    END;
  `);

  // Get inquiries by business
  await knex.raw(`
    CREATE PROCEDURE GetServiceInquiriesByBusiness(IN p_businessId CHAR(36))
    BEGIN
      SELECT 
        si.*,
        s.name as service_name,
        s.base_price,
        s.image_url as service_image,
        COALESCE(u.firstname, g.name) as inquirer_name,
        COALESCE(u.email, g.email) as inquirer_email,
        COALESCE(u.contact_number, g.phone_number) as inquirer_phone
      FROM service_inquiry si
      INNER JOIN service s ON si.service_id = s.id
      LEFT JOIN user u ON si.user_id = u.id
      LEFT JOIN guest g ON si.guest_id = g.id
      WHERE si.business_id = p_businessId
      ORDER BY si.created_at DESC;
    END;
  `);

  // Get inquiries by service
  await knex.raw(`
    CREATE PROCEDURE GetServiceInquiriesByService(IN p_serviceId CHAR(36))
    BEGIN
      SELECT 
        si.*,
        COALESCE(u.firstname, g.name) as inquirer_name,
        COALESCE(u.email, g.email) as inquirer_email,
        COALESCE(u.contact_number, g.phone_number) as inquirer_phone
      FROM service_inquiry si
      LEFT JOIN user u ON si.user_id = u.id
      LEFT JOIN guest g ON si.guest_id = g.id
      WHERE si.service_id = p_serviceId
      ORDER BY si.created_at DESC;
    END;
  `);

  // Get inquiries by user/tourist
  await knex.raw(`
    CREATE PROCEDURE GetServiceInquiriesByUser(
      IN p_userId CHAR(36),
      IN p_guestId CHAR(36)
    )
    BEGIN
      SELECT 
        si.*,
        s.name as service_name,
        s.base_price,
        s.image_url as service_image,
        b.name as business_name
      FROM service_inquiry si
      INNER JOIN service s ON si.service_id = s.id
      INNER JOIN business b ON si.business_id = b.id
      WHERE (p_userId IS NOT NULL AND si.user_id = p_userId)
         OR (p_guestId IS NOT NULL AND si.guest_id = p_guestId)
      ORDER BY si.created_at DESC;
    END;
  `);

  // Get single inquiry by ID
  await knex.raw(`
    CREATE PROCEDURE GetServiceInquiryById(IN p_inquiryId CHAR(36))
    BEGIN
      SELECT 
        si.*,
        s.name as service_name,
        s.base_price,
        s.contact_phone,
        s.contact_email,
        s.contact_facebook,
        s.contact_viber,
        s.contact_whatsapp,
        s.external_booking_url,
        b.name as business_name,
        b.contact_number as business_phone,
        COALESCE(u.firstname, g.name) as inquirer_name,
        COALESCE(u.email, g.email) as inquirer_email,
        COALESCE(u.contact_number, g.phone_number) as inquirer_phone
      FROM service_inquiry si
      INNER JOIN service s ON si.service_id = s.id
      INNER JOIN business b ON si.business_id = b.id
      LEFT JOIN user u ON si.user_id = u.id
      LEFT JOIN guest g ON si.guest_id = g.id
      WHERE si.id = p_inquiryId;
    END;
  `);

  // ==================== INSERT PROCEDURES ====================

  // Create new inquiry
  await knex.raw(`
    CREATE PROCEDURE InsertServiceInquiry(
      IN p_service_id CHAR(36),
      IN p_business_id CHAR(36),
      IN p_user_id CHAR(36),
      IN p_guest_id CHAR(36),
      IN p_inquiry_number VARCHAR(50),
      IN p_message TEXT,
      IN p_number_of_people INT,
      IN p_preferred_date DATE,
      IN p_contact_method VARCHAR(50)
    )
    BEGIN
      INSERT INTO service_inquiry (
        id, service_id, business_id, user_id, guest_id,
        inquiry_number, message, number_of_people, preferred_date, contact_method
      ) VALUES (
        UUID(), p_service_id, p_business_id, p_user_id, p_guest_id,
        p_inquiry_number, p_message, p_number_of_people, p_preferred_date, p_contact_method
      );
      
      SELECT LAST_INSERT_ID() as inquiry_id;
    END;
  `);

  // ==================== UPDATE PROCEDURES ====================

  // Update inquiry status
  await knex.raw(`
    CREATE PROCEDURE UpdateServiceInquiryStatus(
      IN p_inquiry_id CHAR(36),
      IN p_status VARCHAR(50)
    )
    BEGIN
      UPDATE service_inquiry
      SET status = p_status,
          updated_at = NOW()
      WHERE id = p_inquiry_id;
      
      SELECT * FROM service_inquiry WHERE id = p_inquiry_id;
    END;
  `);

  // Mark inquiry as viewed by merchant
  await knex.raw(`
    CREATE PROCEDURE MarkServiceInquiryViewed(IN p_inquiry_id CHAR(36))
    BEGIN
      UPDATE service_inquiry
      SET merchant_viewed = TRUE,
          merchant_viewed_at = NOW(),
          updated_at = NOW()
      WHERE id = p_inquiry_id;
      
      SELECT * FROM service_inquiry WHERE id = p_inquiry_id;
    END;
  `);

  // Update merchant notes
  await knex.raw(`
    CREATE PROCEDURE UpdateServiceInquiryNotes(
      IN p_inquiry_id CHAR(36),
      IN p_notes TEXT
    )
    BEGIN
      UPDATE service_inquiry
      SET merchant_notes = p_notes,
          updated_at = NOW()
      WHERE id = p_inquiry_id;
      
      SELECT * FROM service_inquiry WHERE id = p_inquiry_id;
    END;
  `);

  // ==================== ANALYTICS PROCEDURES ====================

  // Get inquiry stats for a business
  await knex.raw(`
    CREATE PROCEDURE GetServiceInquiryStatsByBusiness(IN p_businessId CHAR(36))
    BEGIN
      SELECT 
        COUNT(*) as total_inquiries,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_inquiries,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_inquiries,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_inquiries,
        COUNT(CASE WHEN merchant_viewed = FALSE THEN 1 END) as unviewed_inquiries,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_inquiries,
        COUNT(CASE WHEN WEEK(created_at) = WEEK(CURDATE()) THEN 1 END) as this_week_inquiries,
        COUNT(CASE WHEN MONTH(created_at) = MONTH(CURDATE()) THEN 1 END) as this_month_inquiries
      FROM service_inquiry
      WHERE business_id = p_businessId;
    END;
  `);

  // Get popular services by inquiry count
  await knex.raw(`
    CREATE PROCEDURE GetPopularServicesByInquiries(IN p_businessId CHAR(36))
    BEGIN
      SELECT 
        s.id,
        s.name,
        s.base_price,
        s.image_url,
        COUNT(si.id) as inquiry_count,
        COUNT(CASE WHEN si.status = 'converted' THEN 1 END) as conversion_count,
        ROUND((COUNT(CASE WHEN si.status = 'converted' THEN 1 END) / COUNT(si.id)) * 100, 2) as conversion_rate
      FROM service s
      LEFT JOIN service_inquiry si ON s.id = si.service_id
      WHERE s.business_id = p_businessId
      GROUP BY s.id, s.name, s.base_price, s.image_url
      HAVING inquiry_count > 0
      ORDER BY inquiry_count DESC
      LIMIT 10;
    END;
  `);

  console.log("✅ Service inquiry procedures created successfully");
}

async function dropServiceInquiryProcedures(knex) {
  console.log("Dropping service inquiry procedures...");

  const procedures = [
    "GetAllServiceInquiries",
    "GetServiceInquiriesByBusiness",
    "GetServiceInquiriesByService",
    "GetServiceInquiriesByUser",
    "GetServiceInquiryById",
    "InsertServiceInquiry",
    "UpdateServiceInquiryStatus",
    "MarkServiceInquiryViewed",
    "UpdateServiceInquiryNotes",
    "GetServiceInquiryStatsByBusiness",
    "GetPopularServicesByInquiries"
  ];

  for (const proc of procedures) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${proc}`);
  }

  console.log("✅ Service inquiry procedures dropped successfully");
}

export { createServiceInquiryProcedures, dropServiceInquiryProcedures };
