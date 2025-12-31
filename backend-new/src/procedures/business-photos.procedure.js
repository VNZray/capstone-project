/**
 * Business Photos Stored Procedures
 * Extracted from migration: 20251017000001-business-photos-table.cjs
 *
 * Procedures:
 * - InsertBusinessPhoto: Insert a new business photo (handles primary photo logic)
 * - GetBusinessPhotosByBusinessId: Get all photos for a business
 * - GetBusinessPhotosByType: Get photos by business and type
 * - SetPrimaryBusinessPhoto: Set a photo as primary for its type
 * - DeleteBusinessPhoto: Delete a business photo
 */

/**
 * Create business photos stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createBusinessPhotosProcedures(sequelize) {
  // InsertBusinessPhoto - Insert a new business photo
  await sequelize.query(`
    CREATE PROCEDURE InsertBusinessPhoto(
      IN p_business_id CHAR(64),
      IN p_photo_url TEXT,
      IN p_caption VARCHAR(255),
      IN p_photo_type ENUM('cover', 'gallery', 'logo', 'menu', 'facility'),
      IN p_is_primary BOOLEAN,
      IN p_sort_order INT
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();

      -- If this is set as primary for this type, unset other primary photos
      IF p_is_primary = true THEN
        UPDATE business_photo SET is_primary = false
        WHERE business_id = p_business_id AND photo_type = p_photo_type;
      END IF;

      INSERT INTO business_photo (id, business_id, photo_url, caption, photo_type, is_primary, sort_order)
      VALUES (new_id, p_business_id, p_photo_url, p_caption, IFNULL(p_photo_type, 'gallery'), IFNULL(p_is_primary, false), IFNULL(p_sort_order, 0));
      SELECT * FROM business_photo WHERE id = new_id;
    END;
  `);

  // GetBusinessPhotosByBusinessId - Get all photos for a business
  await sequelize.query(`
    CREATE PROCEDURE GetBusinessPhotosByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT * FROM business_photo WHERE business_id = p_business_id ORDER BY photo_type, is_primary DESC, sort_order ASC;
    END;
  `);

  // GetBusinessPhotosByType - Get photos by business and type
  await sequelize.query(`
    CREATE PROCEDURE GetBusinessPhotosByType(IN p_business_id CHAR(64), IN p_photo_type VARCHAR(20))
    BEGIN
      SELECT * FROM business_photo
      WHERE business_id = p_business_id AND photo_type = p_photo_type
      ORDER BY is_primary DESC, sort_order ASC;
    END;
  `);

  // SetPrimaryBusinessPhoto - Set a photo as primary for its type
  await sequelize.query(`
    CREATE PROCEDURE SetPrimaryBusinessPhoto(IN p_id CHAR(64))
    BEGIN
      DECLARE v_business_id CHAR(64);
      DECLARE v_photo_type VARCHAR(20);

      SELECT business_id, photo_type INTO v_business_id, v_photo_type FROM business_photo WHERE id = p_id;

      UPDATE business_photo SET is_primary = false
      WHERE business_id = v_business_id AND photo_type = v_photo_type;
      UPDATE business_photo SET is_primary = true WHERE id = p_id;

      SELECT * FROM business_photo WHERE id = p_id;
    END;
  `);

  // DeleteBusinessPhoto - Delete a business photo
  await sequelize.query(`
    CREATE PROCEDURE DeleteBusinessPhoto(IN p_id CHAR(64))
    BEGIN
      DELETE FROM business_photo WHERE id = p_id;
    END;
  `);
}

/**
 * Drop business photos stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropBusinessPhotosProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertBusinessPhoto;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetBusinessPhotosByBusinessId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetBusinessPhotosByType;');
  await sequelize.query('DROP PROCEDURE IF EXISTS SetPrimaryBusinessPhoto;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteBusinessPhoto;');
}
