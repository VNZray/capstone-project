/**
 * Address Stored Procedures
 * Handles province, municipality, and barangay operations
 */

/**
 * Create address-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createAddressProcedures(sequelize) {
  // Get all provinces
  await sequelize.query(`
    CREATE PROCEDURE GetAllProvinces()
    BEGIN
      SELECT * FROM province ORDER BY province ASC;
    END;
  `);

  // Get province by ID
  await sequelize.query(`
    CREATE PROCEDURE GetProvinceById(IN p_id INT)
    BEGIN
      SELECT * FROM province WHERE id = p_id;
    END;
  `);

  // Get all municipalities
  await sequelize.query(`
    CREATE PROCEDURE GetAllMunicipalities()
    BEGIN
      SELECT * FROM municipality ORDER BY municipality ASC;
    END;
  `);

  // Get municipality by ID
  await sequelize.query(`
    CREATE PROCEDURE GetMunicipalityById(IN p_id INT)
    BEGIN
      SELECT * FROM municipality WHERE id = p_id;
    END;
  `);

  // Get municipalities by province ID
  await sequelize.query(`
    CREATE PROCEDURE GetMunicipalitiesByProvinceId(IN p_province_id INT)
    BEGIN
      SELECT * FROM municipality WHERE province_id = p_province_id;
    END;
  `);

  // Get all barangays
  await sequelize.query(`
    CREATE PROCEDURE GetAllBarangays()
    BEGIN
      SELECT * FROM barangay ORDER BY barangay ASC;
    END;
  `);

  // Get barangay by ID
  await sequelize.query(`
    CREATE PROCEDURE GetBarangayById(IN p_id INT)
    BEGIN
      SELECT * FROM barangay WHERE id = p_id;
    END;
  `);

  // Get barangays by municipality ID
  await sequelize.query(`
    CREATE PROCEDURE GetBarangaysByMunicipalityId(IN p_municipality_id INT)
    BEGIN
      SELECT * FROM barangay WHERE municipality_id = p_municipality_id ORDER BY barangay ASC;
    END;
  `);

  // Get full address by barangay ID (joins all address tables)
  await sequelize.query(`
    CREATE PROCEDURE GetFullAddressByBarangayId(IN p_barangay_id INT)
    BEGIN
      SELECT
        b.id AS barangay_id, b.barangay AS barangay_name,
        m.id AS municipality_id, m.municipality AS municipality_name,
        p.id AS province_id, p.province AS province_name
      FROM barangay b
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE b.id = p_barangay_id;
    END;
  `);
}

/**
 * Drop address-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropAddressProcedures(sequelize) {
  const procedures = [
    'GetAllProvinces',
    'GetProvinceById',
    'GetAllMunicipalities',
    'GetMunicipalityById',
    'GetMunicipalitiesByProvinceId',
    'GetAllBarangays',
    'GetBarangayById',
    'GetBarangaysByMunicipalityId',
    'GetFullAddressByBarangayId'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
