DELIMITER $$

-- Get All Tourist Spots with Categories and Images
DROP PROCEDURE IF EXISTS GetAllTouristSpots$$
CREATE PROCEDURE GetAllTouristSpots()
BEGIN
    SELECT 
        ts.*, 
        t.type AS type,
        p.province AS province,
        m.municipality AS municipality,
        b.barangay AS barangay
    FROM tourist_spots ts
    LEFT JOIN type t ON ts.type_id = t.id
    LEFT JOIN province p ON ts.province_id = p.id
    LEFT JOIN municipality m ON ts.municipality_id = m.id
    LEFT JOIN barangay b ON ts.barangay_id = b.id
    WHERE ts.spot_status IN ('active','inactive')
    ORDER BY ts.name ASC;
END$$

-- Get Tourist Spot by ID
DROP PROCEDURE IF EXISTS GetTouristSpotById$$
CREATE PROCEDURE GetTouristSpotById(IN spot_id VARCHAR(36))
BEGIN
    SELECT 
        ts.*, 
        t.type AS type,
        p.province AS province,
        m.municipality AS municipality,
        b.barangay AS barangay
    FROM tourist_spots ts
    LEFT JOIN type t ON ts.type_id = t.id
    LEFT JOIN province p ON ts.province_id = p.id
    LEFT JOIN municipality m ON ts.municipality_id = m.id
    LEFT JOIN barangay b ON ts.barangay_id = b.id
    WHERE ts.id = spot_id;
END$$

-- Get Tourist Spot Categories
DROP PROCEDURE IF EXISTS GetTouristSpotCategories$$
CREATE PROCEDURE GetTouristSpotCategories(IN spot_id VARCHAR(36))
BEGIN
    SELECT c.id, c.category, c.type_id 
    FROM tourist_spot_categories tsc
    JOIN category c ON tsc.category_id = c.id
    WHERE tsc.tourist_spot_id = spot_id 
    ORDER BY c.category ASC;
END$$

-- Get Tourist Spot Images
DROP PROCEDURE IF EXISTS GetTouristSpotImages$$
CREATE PROCEDURE GetTouristSpotImages(IN spot_id VARCHAR(36))
BEGIN
    SELECT 
        id, file_url, file_format, file_size, is_primary, alt_text, uploaded_at
    FROM tourist_spot_images 
    WHERE tourist_spot_id = spot_id 
    ORDER BY is_primary DESC, uploaded_at ASC;
END$$

-- Create Tourist Spot
DROP PROCEDURE IF EXISTS CreateTouristSpot$$
CREATE PROCEDURE CreateTouristSpot(
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_province_id INT,
    IN p_municipality_id INT,
    IN p_barangay_id INT,
    IN p_latitude DECIMAL(10,8),
    IN p_longitude DECIMAL(11,8),
    IN p_contact_phone VARCHAR(20),
    IN p_contact_email VARCHAR(100),
    IN p_website VARCHAR(255),
    IN p_entry_fee DECIMAL(10,2),
    IN p_type_id INT,
    OUT p_spot_id VARCHAR(36)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    SET p_spot_id = UUID();
    
    INSERT INTO tourist_spots (
        id, name, description, province_id, municipality_id, barangay_id,
        latitude, longitude, contact_phone, contact_email, website, entry_fee, 
        type_id, spot_status
    )
    VALUES (
        p_spot_id, p_name, p_description, p_province_id, p_municipality_id, p_barangay_id,
        p_latitude, p_longitude, p_contact_phone, p_contact_email, p_website, p_entry_fee, 
        p_type_id, 'pending'
    );
    
    COMMIT;
END$$

-- Add Tourist Spot Category
DROP PROCEDURE IF EXISTS AddTouristSpotCategory$$
CREATE PROCEDURE AddTouristSpotCategory(
    IN p_tourist_spot_id VARCHAR(36),
    IN p_category_id INT
)
BEGIN
    INSERT INTO tourist_spot_categories (id, tourist_spot_id, category_id) 
    VALUES (UUID(), p_tourist_spot_id, p_category_id);
END$$

-- Remove Tourist Spot Categories
DROP PROCEDURE IF EXISTS RemoveTouristSpotCategories$$
CREATE PROCEDURE RemoveTouristSpotCategories(IN p_tourist_spot_id VARCHAR(36))
BEGIN
    DELETE FROM tourist_spot_categories WHERE tourist_spot_id = p_tourist_spot_id;
END$$

-- Add Tourist Spot Schedule
DROP PROCEDURE IF EXISTS AddTouristSpotSchedule$$
CREATE PROCEDURE AddTouristSpotSchedule(
    IN p_tourist_spot_id VARCHAR(36),
    IN p_day_of_week INT,
    IN p_open_time TIME,
    IN p_close_time TIME,
    IN p_is_closed BOOLEAN
)
BEGIN
    INSERT INTO tourist_spot_schedules (tourist_spot_id, day_of_week, open_time, close_time, is_closed)
    VALUES (p_tourist_spot_id, p_day_of_week, p_open_time, p_close_time, p_is_closed);
END$$

-- Update Tourist Spot Categories Only
DROP PROCEDURE IF EXISTS UpdateTouristSpotCategoriesOnly$$
CREATE PROCEDURE UpdateTouristSpotCategoriesOnly(IN p_tourist_spot_id VARCHAR(36))
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- Remove existing categories
    DELETE FROM tourist_spot_categories WHERE tourist_spot_id = p_tourist_spot_id;
    
    -- Update timestamp
    UPDATE tourist_spots SET updated_at = CURRENT_TIMESTAMP WHERE id = p_tourist_spot_id;
    
    COMMIT;
END$$

-- Submit Edit Request
DROP PROCEDURE IF EXISTS SubmitEditRequest$$
CREATE PROCEDURE SubmitEditRequest(
    IN p_tourist_spot_id VARCHAR(36),
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_province_id INT,
    IN p_municipality_id INT,
    IN p_barangay_id INT,
    IN p_latitude DECIMAL(10,8),
    IN p_longitude DECIMAL(11,8),
    IN p_contact_phone VARCHAR(20),
    IN p_contact_email VARCHAR(100),
    IN p_website VARCHAR(255),
    IN p_entry_fee DECIMAL(10,2),
    IN p_type_id INT,
    IN p_spot_status ENUM('active', 'inactive', 'pending', 'rejected'),
    IN p_is_featured BOOLEAN,
    OUT p_edit_id VARCHAR(36)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    SET p_edit_id = UUID();
    
    INSERT INTO tourist_spot_edits (
        id, tourist_spot_id, name, description, province_id, municipality_id, barangay_id,
        latitude, longitude, contact_phone, contact_email, website, entry_fee, 
        type_id, spot_status, is_featured, approval_status
    )
    VALUES (
        p_edit_id, p_tourist_spot_id, p_name, p_description, p_province_id, p_municipality_id, p_barangay_id,
        p_latitude, p_longitude, p_contact_phone, p_contact_email, p_website, p_entry_fee, 
        p_type_id, p_spot_status, p_is_featured, 'pending'
    );
    
    COMMIT;
END$$

-- Check if Tourist Spot Exists
DROP PROCEDURE IF EXISTS CheckTouristSpotExists$$
CREATE PROCEDURE CheckTouristSpotExists(
    IN p_tourist_spot_id VARCHAR(36),
    OUT p_exists BOOLEAN,
    OUT p_status VARCHAR(20)
)
BEGIN
    SELECT COUNT(*), IFNULL(spot_status, '') 
    INTO p_exists, p_status
    FROM tourist_spots 
    WHERE id = p_tourist_spot_id;
    
    SET p_exists = p_exists > 0;
END$$

-- Validate Location IDs
DROP PROCEDURE IF EXISTS ValidateLocationIds$$
CREATE PROCEDURE ValidateLocationIds(
    IN p_type_id INT,
    IN p_province_id INT,
    IN p_municipality_id INT,
    IN p_barangay_id INT,
    OUT p_type_valid BOOLEAN,
    OUT p_province_valid BOOLEAN,
    OUT p_municipality_valid BOOLEAN,
    OUT p_barangay_valid BOOLEAN
)
BEGIN
    SELECT COUNT(*) INTO p_type_valid FROM type WHERE id = p_type_id;
    SELECT COUNT(*) INTO p_province_valid FROM province WHERE id = p_province_id;
    SELECT COUNT(*) INTO p_municipality_valid FROM municipality WHERE id = p_municipality_id AND province_id = p_province_id;
    SELECT COUNT(*) INTO p_barangay_valid FROM barangay WHERE id = p_barangay_id AND municipality_id = p_municipality_id;
    
    SET p_type_valid = p_type_valid > 0;
    SET p_province_valid = p_province_valid > 0;
    SET p_municipality_valid = p_municipality_valid > 0;
    SET p_barangay_valid = p_barangay_valid > 0;
END$$

-- Validate Categories for Type
DROP PROCEDURE IF EXISTS ValidateCategoriesForType$$
CREATE PROCEDURE ValidateCategoriesForType(
    IN p_category_ids TEXT,
    IN p_type_id INT,
    OUT p_valid_count INT,
    OUT p_expected_count INT
)
BEGIN
    -- This would need to be handled differently in the application layer
    -- since MySQL stored procedures don't handle arrays well
    -- For now, we'll validate individual categories
    SET p_valid_count = 0;
    SET p_expected_count = 0;
END$$

DELIMITER ;
