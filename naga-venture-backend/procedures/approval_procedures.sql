DELIMITER $$

-- Get Pending Edit Requests
DROP PROCEDURE IF EXISTS GetPendingEditRequests$$
CREATE PROCEDURE GetPendingEditRequests()
BEGIN
    SELECT 
        tse.*,
        t.type,
        p.province,
        m.municipality,
        b.barangay,
        ts.name as original_name,
        ts.description as original_description,
        ot.type as original_type,
        op.province as original_province,
        om.municipality as original_municipality,
        ob.barangay as original_barangay,
        ts.contact_phone as original_contact_phone,
        ts.website as original_website,
        ts.entry_fee as original_entry_fee,
        ts.spot_status as original_status
    FROM tourist_spot_edits tse
    JOIN type t ON tse.type_id = t.id
    JOIN province p ON tse.province_id = p.id
    JOIN municipality m ON tse.municipality_id = m.id
    JOIN barangay b ON tse.barangay_id = b.id
    JOIN tourist_spots ts ON tse.tourist_spot_id = ts.id
    LEFT JOIN province op ON ts.province_id = op.id
    LEFT JOIN municipality om ON ts.municipality_id = om.id
    LEFT JOIN barangay ob ON ts.barangay_id = ob.id
    LEFT JOIN type ot ON ts.type_id = ot.id
    WHERE tse.approval_status = 'pending'
    ORDER BY tse.submitted_at DESC;
END$$

-- Get Pending Tourist Spots
DROP PROCEDURE IF EXISTS GetPendingTouristSpots$$
CREATE PROCEDURE GetPendingTouristSpots()
BEGIN
    SELECT 
        ts.id, ts.name, ts.description, ts.province_id, ts.municipality_id, ts.barangay_id,
        ts.latitude, ts.longitude, ts.contact_phone, ts.contact_email, ts.website, ts.entry_fee,
        ts.spot_status, ts.is_featured, t.type, ts.type_id,
        ts.created_at, ts.updated_at, p.province, m.municipality, b.barangay
    FROM tourist_spots ts
    JOIN type t ON ts.type_id = t.id
    JOIN province p ON ts.province_id = p.id
    JOIN municipality m ON ts.municipality_id = m.id
    JOIN barangay b ON ts.barangay_id = b.id
    WHERE ts.spot_status = 'pending'
    ORDER BY ts.created_at DESC;
END$$

-- Approve Tourist Spot
DROP PROCEDURE IF EXISTS ApproveTouristSpot$$
CREATE PROCEDURE ApproveTouristSpot(
    IN p_spot_id VARCHAR(36),
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_current_status VARCHAR(20);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = FALSE;
        SET p_message = 'Database error occurred';
        ROLLBACK;
    END;

    START TRANSACTION;
    
    -- Check if tourist spot exists and get current status
    SELECT COUNT(*), IFNULL(spot_status, '') INTO v_count, v_current_status
    FROM tourist_spots 
    WHERE id = p_spot_id;
    
    IF v_count = 0 THEN
        SET p_success = FALSE;
        SET p_message = 'Tourist spot not found';
        ROLLBACK;
    ELSEIF v_current_status != 'pending' THEN
        SET p_success = FALSE;
        SET p_message = 'Tourist spot is not pending approval';
        ROLLBACK;
    ELSE
        -- Update status to active
        UPDATE tourist_spots 
        SET spot_status = 'active', updated_at = CURRENT_TIMESTAMP 
        WHERE id = p_spot_id;
        
        SET p_success = TRUE;
        SET p_message = 'Tourist spot approved successfully';
        COMMIT;
    END IF;
END$$

-- Approve Edit Request
DROP PROCEDURE IF EXISTS ApproveEditRequest$$
CREATE PROCEDURE ApproveEditRequest(
    IN p_edit_id VARCHAR(36),
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_tourist_spot_id VARCHAR(36);
    DECLARE v_name VARCHAR(255);
    DECLARE v_description TEXT;
    DECLARE v_province_id INT;
    DECLARE v_municipality_id INT;
    DECLARE v_barangay_id INT;
    DECLARE v_latitude DECIMAL(10,8);
    DECLARE v_longitude DECIMAL(11,8);
    DECLARE v_contact_phone VARCHAR(20);
    DECLARE v_contact_email VARCHAR(100);
    DECLARE v_website VARCHAR(255);
    DECLARE v_entry_fee DECIMAL(10,2);
    DECLARE v_type_id INT;
    DECLARE v_spot_status ENUM('active', 'inactive', 'pending', 'rejected');
    DECLARE v_is_featured BOOLEAN;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = FALSE;
        SET p_message = 'Database error occurred';
        ROLLBACK;
    END;

    START TRANSACTION;
    
    -- Get the edit request details
    SELECT COUNT(*), tourist_spot_id, name, description, province_id, municipality_id, barangay_id,
           latitude, longitude, contact_phone, contact_email, website, entry_fee, 
           type_id, spot_status, is_featured
    INTO v_count, v_tourist_spot_id, v_name, v_description, v_province_id, v_municipality_id, v_barangay_id,
         v_latitude, v_longitude, v_contact_phone, v_contact_email, v_website, v_entry_fee, 
         v_type_id, v_spot_status, v_is_featured
    FROM tourist_spot_edits 
    WHERE id = p_edit_id AND approval_status = 'pending';
    
    IF v_count = 0 THEN
        SET p_success = FALSE;
        SET p_message = 'Edit request not found or already processed';
        ROLLBACK;
    ELSE
        -- Update the main tourist_spots table
        UPDATE tourist_spots SET
            name = v_name,
            description = v_description,
            province_id = v_province_id,
            municipality_id = v_municipality_id,
            barangay_id = v_barangay_id,
            latitude = v_latitude,
            longitude = v_longitude,
            contact_phone = v_contact_phone,
            contact_email = v_contact_email,
            website = v_website,
            entry_fee = v_entry_fee,
            spot_status = v_spot_status,
            is_featured = v_is_featured,
            type_id = v_type_id,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_tourist_spot_id;
        
        -- Mark the edit request as approved
        UPDATE tourist_spot_edits 
        SET approval_status = 'approved', reviewed_at = CURRENT_TIMESTAMP 
        WHERE id = p_edit_id;
        
        SET p_success = TRUE;
        SET p_message = 'Edit request approved and applied successfully';
        COMMIT;
    END IF;
END$$

-- Reject Edit Request
DROP PROCEDURE IF EXISTS RejectEditRequest$$
CREATE PROCEDURE RejectEditRequest(
    IN p_edit_id VARCHAR(36),
    IN p_reason TEXT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = FALSE;
        SET p_message = 'Database error occurred';
        ROLLBACK;
    END;

    START TRANSACTION;
    
    -- Check if edit request exists and is pending
    SELECT COUNT(*) INTO v_count
    FROM tourist_spot_edits 
    WHERE id = p_edit_id AND approval_status = 'pending';
    
    IF v_count = 0 THEN
        SET p_success = FALSE;
        SET p_message = 'Edit request not found or already processed';
        ROLLBACK;
    ELSE
        -- Mark the edit request as rejected
        UPDATE tourist_spot_edits 
        SET approval_status = 'rejected', 
            reviewed_at = CURRENT_TIMESTAMP, 
            remarks = IFNULL(p_reason, '')
        WHERE id = p_edit_id;
        
        SET p_success = TRUE;
        SET p_message = 'Edit request rejected successfully';
        COMMIT;
    END IF;
END$$

-- Reject Tourist Spot
DROP PROCEDURE IF EXISTS RejectTouristSpot$$
CREATE PROCEDURE RejectTouristSpot(
    IN p_spot_id VARCHAR(36),
    IN p_reason TEXT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_current_status VARCHAR(20);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = FALSE;
        SET p_message = 'Database error occurred';
        ROLLBACK;
    END;

    START TRANSACTION;
    
    -- Check if spot exists and get current status
    SELECT COUNT(*), IFNULL(spot_status, '') INTO v_count, v_current_status
    FROM tourist_spots 
    WHERE id = p_spot_id;
    
    IF v_count = 0 THEN
        SET p_success = FALSE;
        SET p_message = 'Tourist spot not found';
        ROLLBACK;
    ELSEIF v_current_status != 'pending' THEN
        SET p_success = FALSE;
        SET p_message = 'Tourist spot is not pending approval';
        ROLLBACK;
    ELSE
        -- Update status to rejected
        UPDATE tourist_spots 
        SET spot_status = 'rejected', updated_at = CURRENT_TIMESTAMP 
        WHERE id = p_spot_id;
        
        SET p_success = TRUE;
        SET p_message = 'Tourist spot rejected successfully';
        COMMIT;
    END IF;
END$$

-- Check Pending Edit Request Exists
DROP PROCEDURE IF EXISTS CheckPendingEditRequest$$
CREATE PROCEDURE CheckPendingEditRequest(
    IN p_tourist_spot_id VARCHAR(36),
    OUT p_exists BOOLEAN,
    OUT p_edit_id VARCHAR(36)
)
BEGIN
    SELECT COUNT(*), IFNULL(id, '') INTO p_exists, p_edit_id
    FROM tourist_spot_edits 
    WHERE tourist_spot_id = p_tourist_spot_id AND approval_status = 'pending';
    
    SET p_exists = p_exists > 0;
END$$

DELIMITER ;
