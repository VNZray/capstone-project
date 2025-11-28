// Approval-related procedures
export async function createTouristSpotApprovalProcedures(knex) {
  const approvalProcs = [
    'GetPendingEditRequests', 'GetPendingTouristSpots', 'ApproveTouristSpot',
    'ApproveTouristSpotEdit', 'RejectTouristSpotEdit', 'RejectTouristSpot',
    // Business approval procedures
    'GetPendingBusinesses', 'ApproveBusiness', 'RejectBusiness'
  ];
  for (const n of approvalProcs) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
  await knex.raw(`
    CREATE PROCEDURE GetPendingEditRequests()
    BEGIN
      SELECT 
        tse.*,
        t.type,
        p.province,
        m.municipality,
        b.barangay,
        ts.name AS original_name,
        ts.description AS original_description,
        ot.type AS original_type,
        op.province AS original_province,
        om.municipality AS original_municipality,
        ob.barangay AS original_barangay,
        ts.contact_phone AS original_contact_phone,
        ts.website AS original_website,
        ts.entry_fee AS original_entry_fee,
        ts.spot_status AS original_status
      FROM tourist_spot_edits tse
      JOIN type t ON tse.type_id = t.id
      JOIN barangay b ON tse.barangay_id = b.id
      JOIN municipality m ON b.municipality_id = m.id
      JOIN province p ON m.province_id = p.id
      JOIN tourist_spots ts ON tse.tourist_spot_id = ts.id
      LEFT JOIN barangay ob ON ts.barangay_id = ob.id
      LEFT JOIN municipality om ON ob.municipality_id = om.id
      LEFT JOIN province op ON om.province_id = op.id
      LEFT JOIN type ot ON ts.type_id = ot.id
      WHERE tse.approval_status = 'pending'
      ORDER BY tse.submitted_at DESC;

      SELECT 
        tsc.tourist_spot_id,
        c.id,
        c.category,
        c.type_id
      FROM tourist_spot_categories tsc
      JOIN category c ON tsc.category_id = c.id
      WHERE tsc.tourist_spot_id IN (
        SELECT tourist_spot_id FROM tourist_spot_edits WHERE approval_status = 'pending'
      )
      ORDER BY c.category ASC;
    END;
  `);
  await knex.raw(`
    CREATE PROCEDURE GetPendingTouristSpots()
    BEGIN
      SELECT 
        ts.id, ts.name, ts.description, ts.barangay_id,
        ts.latitude, ts.longitude, ts.contact_phone, ts.contact_email, ts.website, ts.entry_fee,
        ts.spot_status, ts.is_featured, t.type, ts.type_id,
        ts.created_at, ts.updated_at, p.province, m.municipality, b.barangay
      FROM tourist_spots ts
      JOIN type t ON ts.type_id = t.id
      JOIN barangay b ON ts.barangay_id = b.id
      JOIN municipality m ON b.municipality_id = m.id
      JOIN province p ON m.province_id = p.id
      WHERE ts.spot_status = 'pending'
      ORDER BY ts.created_at DESC;

      SELECT 
        tsc.tourist_spot_id,
        c.id,
        c.category,
        c.type_id
      FROM tourist_spot_categories tsc
      JOIN category c ON tsc.category_id = c.id
      WHERE tsc.tourist_spot_id IN (
        SELECT id FROM tourist_spots WHERE spot_status = 'pending'
      )
      ORDER BY c.category ASC;

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
            ts.type_id = tse.type_id,
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
    CREATE PROCEDURE RejectTouristSpot(IN p_id CHAR(64))
    BEGIN
      UPDATE tourist_spots SET spot_status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = p_id AND spot_status = 'pending';
      IF ROW_COUNT() > 0 THEN
        CALL LogApprovalRecord('new', 'tourist_spot', p_id, 'rejected', NULL, NULL);
      END IF;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  // ==================== BUSINESS APPROVAL PROCEDURES ====================
  await knex.raw(`
    CREATE PROCEDURE GetPendingBusinesses()
    BEGIN
      SELECT 
        b.*, 
        t.type AS business_type_name,
        c.category AS business_category_name
      FROM business b
      LEFT JOIN type t ON b.business_type_id = t.id
      LEFT JOIN category c ON b.business_category_id = c.id
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
}

export async function dropTouristSpotApprovalProcedures(knex) {
  const names = [
    'GetPendingEditRequests', 'GetPendingTouristSpots', 'ApproveTouristSpot',
    'ApproveTouristSpotEdit', 'RejectTouristSpotEdit', 'RejectTouristSpot',
    'GetPendingBusinesses', 'ApproveBusiness', 'RejectBusiness'
  ];
  for (const n of names) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
}
