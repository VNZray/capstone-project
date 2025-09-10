DELIMITER $$

-- Get All Reports
DROP PROCEDURE IF EXISTS GetAllReports$$
CREATE PROCEDURE GetAllReports()
BEGIN
    SELECT 
        r.*,
        u.email as reporter_email,
        t.first_name as reporter_first_name,
        t.last_name as reporter_last_name,
        t.phone_number as reporter_contact
    FROM report r
    JOIN user u ON r.reporter_id = u.id
    LEFT JOIN tourist t ON u.tourist_id = t.id
    ORDER BY r.created_at DESC;
END$$

-- Get Report by ID
DROP PROCEDURE IF EXISTS GetReportById$$
CREATE PROCEDURE GetReportById(IN p_report_id VARCHAR(36))
BEGIN
    SELECT 
        r.*,
        u.email as reporter_email,
        t.first_name as reporter_first_name,
        t.last_name as reporter_last_name,
        t.phone_number as reporter_contact
    FROM report r
    JOIN user u ON r.reporter_id = u.id
    LEFT JOIN tourist t ON u.tourist_id = t.id
    WHERE r.id = p_report_id;
END$$

-- Get Report Status History
DROP PROCEDURE IF EXISTS GetReportStatusHistory$$
CREATE PROCEDURE GetReportStatusHistory(IN p_report_id VARCHAR(36))
BEGIN
    SELECT 
        rsh.*,
        u.email as updated_by_email
    FROM report_status_history rsh
    LEFT JOIN user u ON rsh.updated_by = u.id
    WHERE rsh.report_id = p_report_id
    ORDER BY rsh.updated_at ASC;
END$$

-- Get Report Attachments
DROP PROCEDURE IF EXISTS GetReportAttachments$$
CREATE PROCEDURE GetReportAttachments(IN p_report_id VARCHAR(36))
BEGIN
    SELECT * FROM report_attachment
    WHERE report_id = p_report_id
    ORDER BY uploaded_at ASC;
END$$

-- Get Reports by Reporter ID
DROP PROCEDURE IF EXISTS GetReportsByReporterId$$
CREATE PROCEDURE GetReportsByReporterId(IN p_reporter_id VARCHAR(36))
BEGIN
    SELECT * FROM report 
    WHERE reporter_id = p_reporter_id
    ORDER BY created_at DESC;
END$$

-- Create Report
DROP PROCEDURE IF EXISTS CreateReport$$
CREATE PROCEDURE CreateReport(
    IN p_reporter_id VARCHAR(36),
    IN p_target_type ENUM('business', 'event', 'tourist_spot', 'accommodation'),
    IN p_target_id VARCHAR(36),
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    OUT p_report_id VARCHAR(36),
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_status_history_id VARCHAR(36);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = FALSE;
        SET p_message = 'Database error occurred';
        ROLLBACK;
    END;

    START TRANSACTION;
    
    -- Validate required fields
    IF p_reporter_id IS NULL OR p_target_type IS NULL OR p_target_id IS NULL OR 
       p_title IS NULL OR p_description IS NULL THEN
        SET p_success = FALSE;
        SET p_message = 'All fields are required: reporter_id, target_type, target_id, title, description';
        ROLLBACK;
    ELSE
        SET p_report_id = UUID();
        SET v_status_history_id = UUID();
        
        -- Insert the report
        INSERT INTO report (id, reporter_id, target_type, target_id, title, description, status)
        VALUES (p_report_id, p_reporter_id, p_target_type, p_target_id, p_title, p_description, 'submitted');
        
        -- Create initial status history entry
        INSERT INTO report_status_history (id, report_id, status, remarks, updated_by)
        VALUES (v_status_history_id, p_report_id, 'submitted', 'Report submitted by user', NULL);
        
        SET p_success = TRUE;
        SET p_message = 'Report created successfully';
        COMMIT;
    END IF;
END$$

-- Update Report Status
DROP PROCEDURE IF EXISTS UpdateReportStatus$$
CREATE PROCEDURE UpdateReportStatus(
    IN p_report_id VARCHAR(36),
    IN p_status ENUM('submitted', 'under_review', 'in_progress', 'resolved', 'rejected'),
    IN p_remarks TEXT,
    IN p_updated_by VARCHAR(36),
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_status_history_id VARCHAR(36);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = FALSE;
        SET p_message = 'Database error occurred';
        ROLLBACK;
    END;

    START TRANSACTION;
    
    -- Check if report exists
    SELECT COUNT(*) INTO v_count FROM report WHERE id = p_report_id;
    
    IF v_count = 0 THEN
        SET p_success = FALSE;
        SET p_message = 'Report not found';
        ROLLBACK;
    ELSE
        -- Update report status
        UPDATE report 
        SET status = p_status, updated_at = CURRENT_TIMESTAMP
        WHERE id = p_report_id;
        
        -- Add status history entry
        SET v_status_history_id = UUID();
        INSERT INTO report_status_history (id, report_id, status, remarks, updated_by)
        VALUES (v_status_history_id, p_report_id, p_status, p_remarks, p_updated_by);
        
        SET p_success = TRUE;
        SET p_message = 'Report status updated successfully';
        COMMIT;
    END IF;
END$$

-- Delete Report
DROP PROCEDURE IF EXISTS DeleteReport$$
CREATE PROCEDURE DeleteReport(
    IN p_report_id VARCHAR(36),
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
    
    -- Check if report exists
    SELECT COUNT(*) INTO v_count FROM report WHERE id = p_report_id;
    
    IF v_count = 0 THEN
        SET p_success = FALSE;
        SET p_message = 'Report not found';
        ROLLBACK;
    ELSE
        -- Delete the report (this will cascade to related tables if FK constraints are set up)
        DELETE FROM report WHERE id = p_report_id;
        
        SET p_success = TRUE;
        SET p_message = 'Report deleted successfully';
        COMMIT;
    END IF;
END$$

-- Get Reports by Target
DROP PROCEDURE IF EXISTS GetReportsByTarget$$
CREATE PROCEDURE GetReportsByTarget(
    IN p_target_type ENUM('business', 'event', 'tourist_spot', 'accommodation'),
    IN p_target_id VARCHAR(36)
)
BEGIN
    SELECT 
        r.*,
        u.email as reporter_email
    FROM report r
    JOIN user u ON r.reporter_id = u.id
    WHERE r.target_type = p_target_type AND r.target_id = p_target_id
    ORDER BY r.created_at DESC;
END$$

-- Get Reports by Status
DROP PROCEDURE IF EXISTS GetReportsByStatus$$
CREATE PROCEDURE GetReportsByStatus(
    IN p_status ENUM('submitted', 'under_review', 'in_progress', 'resolved', 'rejected')
)
BEGIN
    SELECT 
        r.*,
        u.email as reporter_email
    FROM report r
    JOIN user u ON r.reporter_id = u.id
    WHERE r.status = p_status
    ORDER BY r.created_at DESC;
END$$

DELIMITER ;
