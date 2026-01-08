// Approval-related procedures
export async function createTouristSpotApprovalProcedures(knex) {
  const approvalProcs = [
    'GetPendingEditRequests', 'GetPendingTouristSpots', 'ApproveTouristSpot',
    'ApproveTouristSpotEdit', 'RejectTouristSpotEdit', 'RejectTouristSpot',
    'GetPendingDeletionRequests', 'ApproveDeletionRequest', 'RejectDeletionRequest',
    // Business approval procedures
    'GetPendingBusinesses', 'ApproveBusiness', 'RejectBusiness',
    // Event approval procedures
    'GetPendingEvents', 'ApproveEvent', 'RejectEvent'
  ];
  for (const n of approvalProcs) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
  await knex.raw(`
    CREATE PROCEDURE GetPendingEditRequests()
    BEGIN
      SELECT 
        tse.*,
        p.province,
        m.municipality,
        b.barangay,
        ts.name AS original_name,
        ts.description AS original_description,
        op.province AS original_province,
        om.municipality AS original_municipality,
        ob.barangay AS original_barangay,
        ts.contact_phone AS original_contact_phone,
        ts.website AS original_website,
        ts.entry_fee AS original_entry_fee,
        ts.spot_status AS original_status,
        u.email AS submitter_email,
        CONCAT(COALESCE(ts_staff.first_name, u.email), ' ', COALESCE(ts_staff.last_name, '')) AS submitter_name
      FROM tourist_spot_edits tse
      JOIN barangay b ON tse.barangay_id = b.id
      JOIN municipality m ON b.municipality_id = m.id
      JOIN province p ON m.province_id = p.id
      JOIN tourist_spots ts ON tse.tourist_spot_id = ts.id
      LEFT JOIN barangay ob ON ts.barangay_id = ob.id
      LEFT JOIN municipality om ON ob.municipality_id = om.id
      LEFT JOIN province op ON om.province_id = op.id
      LEFT JOIN user u ON tse.submitted_by = u.id
      LEFT JOIN tourism ts_staff ON u.id = ts_staff.user_id
      WHERE tse.approval_status = 'pending'
      ORDER BY tse.submitted_at DESC;

      SELECT 
        ec.entity_id AS tourist_spot_id,
        c.id,
        c.title AS category,
        c.parent_category
      FROM entity_categories ec
      JOIN categories c ON ec.category_id = c.id
      WHERE ec.entity_type = 'tourist_spot'
        AND ec.entity_id IN (
          SELECT tourist_spot_id FROM tourist_spot_edits WHERE approval_status = 'pending'
        )
      ORDER BY c.title ASC;
    END;
  `);
  await knex.raw(`
    CREATE PROCEDURE GetPendingTouristSpots()
    BEGIN
      SELECT 
        ts.id, ts.name, ts.description, ts.barangay_id,
        ts.latitude, ts.longitude, ts.contact_phone, ts.contact_email, ts.website, ts.entry_fee,
        ts.spot_status, ts.is_featured,
        ts.created_at, ts.updated_at, p.province, m.municipality, b.barangay,
        u.email AS submitter_email,
        CONCAT(COALESCE(ts_staff.first_name, u.email), ' ', COALESCE(ts_staff.last_name, '')) AS submitter_name
      FROM tourist_spots ts
      JOIN barangay b ON ts.barangay_id = b.id
      JOIN municipality m ON b.municipality_id = m.id
      JOIN province p ON m.province_id = p.id
      LEFT JOIN user u ON ts.submitted_by = u.id
      LEFT JOIN tourism ts_staff ON u.id = ts_staff.user_id
      WHERE ts.spot_status = 'pending'
      ORDER BY ts.created_at DESC;

      SELECT 
        ec.entity_id AS tourist_spot_id,
        c.id,
        c.title AS category,
        c.parent_category
      FROM entity_categories ec
      JOIN categories c ON ec.category_id = c.id
      WHERE ec.entity_type = 'tourist_spot'
        AND ec.entity_id IN (
          SELECT id FROM tourist_spots WHERE spot_status = 'pending'
        )
      ORDER BY c.title ASC;

      SELECT 
        s.tourist_spot_id,
        s.day_of_week,
        s.open_time,
        s.close_time,
        s.is_closed
      FROM tourist_spot_schedules s
      WHERE s.tourist_spot_id IN (
        SELECT id FROM tourist_spots WHERE spot_status = 'pending'
      )
      ORDER BY s.tourist_spot_id, s.day_of_week ASC;

      -- Primary images for pending tourist spots
      SELECT i.tourist_spot_id, i.file_url
      FROM tourist_spot_images i
      WHERE i.is_primary = 1 AND i.tourist_spot_id IN (
        SELECT id FROM tourist_spots WHERE spot_status = 'pending'
      );
    END;
  `);
  await knex.raw(`
    CREATE PROCEDURE ApproveTouristSpot(IN p_id CHAR(64))
    BEGIN
      DECLARE v_status VARCHAR(32);
      SELECT spot_status AS current_status INTO v_status FROM tourist_spots WHERE id = p_id;
      UPDATE tourist_spots 
      SET spot_status = 'active', updated_at = CURRENT_TIMESTAMP 
      WHERE id = p_id AND spot_status = 'pending';
      IF ROW_COUNT() > 0 THEN
        CALL LogApprovalRecord('new', 'tourist_spot', p_id, 'approved', NULL, NULL);
      END IF;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);
  await knex.raw(`
    CREATE PROCEDURE ApproveTouristSpotEdit(IN p_edit_id CHAR(64))
    BEGIN
      DECLARE v_exists INT DEFAULT 0;
      DECLARE v_spot_id CHAR(64);
      SELECT tourist_spot_id INTO v_spot_id FROM tourist_spot_edits WHERE id = p_edit_id;
      SELECT COUNT(*) INTO v_exists FROM tourist_spot_edits WHERE id = p_edit_id AND approval_status = 'pending';
      IF v_exists = 0 THEN
        SELECT 'not_found' AS status;
      ELSE
        START TRANSACTION;
        UPDATE tourist_spots ts
          JOIN tourist_spot_edits tse ON tse.id = p_edit_id AND ts.id = tse.tourist_spot_id
          SET ts.name = tse.name,
            ts.description = tse.description,
            ts.barangay_id = tse.barangay_id,
            ts.latitude = tse.latitude,
            ts.longitude = tse.longitude,
            ts.contact_phone = tse.contact_phone,
            ts.contact_email = tse.contact_email,
            ts.website = tse.website,
            ts.entry_fee = tse.entry_fee,
            ts.spot_status = tse.spot_status,
            ts.is_featured = tse.is_featured,
            ts.updated_at = CURRENT_TIMESTAMP;

        UPDATE tourist_spot_edits 
        SET approval_status = 'approved', reviewed_at = CURRENT_TIMESTAMP
        WHERE id = p_edit_id;

        CALL LogApprovalRecord('edit', 'tourist_spot', p_edit_id, 'approved', NULL, NULL);

        COMMIT;
        SELECT 'approved' AS status;
      END IF;
    END;
  `);
  await knex.raw(`
    CREATE PROCEDURE RejectTouristSpotEdit(IN p_edit_id CHAR(64), IN p_reason VARCHAR(255))
    BEGIN
      DECLARE v_spot_id CHAR(64);
      SELECT tourist_spot_id INTO v_spot_id FROM tourist_spot_edits WHERE id = p_edit_id;
      UPDATE tourist_spot_edits
      SET approval_status = 'rejected', reviewed_at = CURRENT_TIMESTAMP, remarks = IFNULL(p_reason, '')
      WHERE id = p_edit_id AND approval_status = 'pending';
      CALL LogApprovalRecord('edit', 'tourist_spot', p_edit_id, 'rejected', NULL, p_reason);
      SELECT id, approval_status, remarks, reviewed_at FROM tourist_spot_edits WHERE id = p_edit_id;
    END;
  `);
  await knex.raw(`
    CREATE PROCEDURE RejectTouristSpot(IN p_id CHAR(64), IN p_reason VARCHAR(255))
    BEGIN
      UPDATE tourist_spots SET spot_status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = p_id AND spot_status = 'pending';
      IF ROW_COUNT() > 0 THEN
        CALL LogApprovalRecord('new', 'tourist_spot', p_id, 'rejected', NULL, p_reason);
      END IF;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetPendingDeletionRequests()
    BEGIN
      SELECT 
        ts.id, ts.name, ts.description, ts.barangay_id,
        ts.spot_status, ts.deletion_requested_by,
        ts.created_at, ts.updated_at, p.province, m.municipality, b.barangay,
        u.email AS submitter_email,
        CONCAT(COALESCE(ts_staff.first_name, u.email), ' ', COALESCE(ts_staff.last_name, '')) AS submitter_name
      FROM tourist_spots ts
      JOIN barangay b ON ts.barangay_id = b.id
      JOIN municipality m ON b.municipality_id = m.id
      JOIN province p ON m.province_id = p.id
      LEFT JOIN user u ON ts.deletion_requested_by = u.id
      LEFT JOIN tourism ts_staff ON u.id = ts_staff.user_id
      WHERE ts.spot_status = 'pending_deletion'
      ORDER BY ts.updated_at DESC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE ApproveDeletionRequest(IN p_id CHAR(64))
    BEGIN
      CALL DeleteTouristSpot(p_id);
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE RejectDeletionRequest(IN p_id CHAR(64))
    BEGIN
      UPDATE tourist_spots SET spot_status = 'active', deletion_requested_by = NULL WHERE id = p_id;
    END;
  `);

  // ==================== BUSINESS APPROVAL PROCEDURES ====================
  await knex.raw(`
    CREATE PROCEDURE GetPendingBusinesses()
    BEGIN
      SELECT 
        b.*,
        (SELECT c.title FROM entity_categories ec 
         JOIN categories c ON ec.category_id = c.id 
         WHERE ec.entity_id = b.id AND ec.entity_type = 'business' AND ec.is_primary = 1 
         LIMIT 1) AS primary_category_name
      FROM business b
      WHERE b.status = 'Pending'
      ORDER BY b.created_at DESC;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE ApproveBusiness(IN p_id CHAR(64))
    BEGIN
      -- Set business Active only if currently Pending
      UPDATE business 
      SET status='Active'
      WHERE id = p_id AND status='Pending';

      IF ROW_COUNT() > 0 THEN
        -- Cascade approve related registration (if pending)
        UPDATE registration 
        SET status = 'Approved', approved_at = CURRENT_TIMESTAMP
        WHERE business_id = p_id AND status = 'Pending';

        -- Cascade approve related permits (if pending)
        UPDATE permit 
        SET status = 'approved', approved_at = CURRENT_TIMESTAMP
        WHERE business_id = p_id AND status = 'pending';

        -- Log business approval
        CALL LogApprovalRecord('new', 'business', p_id, 'approved', NULL, NULL);
        SELECT 1 AS success;
      ELSE
        SELECT 0 AS success; -- Not found or not pending
      END IF;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE RejectBusiness(IN p_id CHAR(64))
    BEGIN
      -- Set business Inactive only if currently Pending
      UPDATE business 
      SET status='Inactive'
      WHERE id = p_id AND status='Pending';

      IF ROW_COUNT() > 0 THEN
        -- Cascade reject related registration (if pending)
        UPDATE registration 
        SET status = 'Rejected'
        WHERE business_id = p_id AND status = 'Pending';

        -- Cascade reject related permits (if pending)
        UPDATE permit 
        SET status = 'rejected'
        WHERE business_id = p_id AND status = 'pending';

        -- Log business rejection
        CALL LogApprovalRecord('new', 'business', p_id, 'rejected', NULL, NULL);
        SELECT 1 AS success;
      ELSE
        SELECT 0 AS success; -- Not found or not pending
      END IF;
    END;
  `);

  // ==================== EVENT APPROVAL PROCEDURES ====================
  await knex.raw(`
    CREATE PROCEDURE GetPendingEvents()
    BEGIN
      SELECT 
        e.*,
        ec.name as category_name,
        b.barangay as barangay_name,
        u.email as submitter_email,
        CONCAT(COALESCE(ts_staff.first_name, u.email), ' ', COALESCE(ts_staff.last_name, '')) AS submitter_name
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.id
      LEFT JOIN barangay b ON e.barangay_id = b.id
      LEFT JOIN user u ON e.submitted_by = u.id
      LEFT JOIN tourism ts_staff ON u.id = ts_staff.user_id
      WHERE e.status = 'pending'
      ORDER BY e.created_at ASC;

      -- Return primary image for each pending event
      SELECT event_id, file_url 
      FROM event_images 
      WHERE is_primary = 1 AND event_id IN (
         SELECT id FROM events WHERE status = 'pending'
      );
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE ApproveEvent(IN p_id CHAR(64), IN p_approver_id CHAR(64))
    BEGIN
      UPDATE events 
      SET status = 'published', approved_by = p_approver_id, approved_at = NOW() 
      WHERE id = p_id AND status = 'pending';
      
      IF ROW_COUNT() > 0 THEN
         CALL LogApprovalRecord('new', 'event', p_id, 'approved', p_approver_id, NULL);
      END IF;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE RejectEvent(IN p_id CHAR(64), IN p_approver_id CHAR(64), IN p_reason VARCHAR(255))
    BEGIN
      UPDATE events 
      SET status = 'rejected', approved_by = p_approver_id, approved_at = NOW(), rejection_reason = p_reason
      WHERE id = p_id AND status = 'pending';
      
      IF ROW_COUNT() > 0 THEN
         CALL LogApprovalRecord('new', 'event', p_id, 'rejected', p_approver_id, p_reason);
      END IF;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);
}

export async function dropTouristSpotApprovalProcedures(knex) {
  const names = [
    'GetPendingEditRequests', 'GetPendingTouristSpots', 'ApproveTouristSpot',
    'ApproveTouristSpotEdit', 'RejectTouristSpotEdit', 'RejectTouristSpot',
    'GetPendingDeletionRequests', 'ApproveDeletionRequest', 'RejectDeletionRequest',
    'GetPendingBusinesses', 'ApproveBusiness', 'RejectBusiness',
    'GetPendingEvents', 'ApproveEvent', 'RejectEvent'
  ];
  for (const n of names) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
}
