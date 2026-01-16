async function createAddressProcedures(knex) {
  // Get all provinces
  await knex.raw(`
    CREATE PROCEDURE GetAllProvinces()
    BEGIN
      SELECT * FROM province ORDER BY province ASC;
    END;
  `);

  // Get province by ID
  await knex.raw(`
    CREATE PROCEDURE GetProvinceById(IN p_id INT)
    BEGIN
      SELECT * FROM province WHERE id = p_id;
    END;
  `);

  // Get all municipalities
  await knex.raw(`
    CREATE PROCEDURE GetAllMunicipalities()
    BEGIN
      SELECT * FROM municipality ORDER BY municipality ASC;
    END;
  `);

  // Get municipality by ID
  await knex.raw(`
    CREATE PROCEDURE GetMunicipalityById(IN p_id INT)
    BEGIN
      SELECT * FROM municipality WHERE id = p_id;
    END;
  `);

  // Get municipalities by province ID
  await knex.raw(`
    CREATE PROCEDURE GetMunicipalitiesByProvinceId(IN p_province_id INT)
    BEGIN
      SELECT * FROM municipality WHERE province_id = p_province_id;
    END;
  `);

  // Get all barangays
  await knex.raw(`
    CREATE PROCEDURE GetAllBarangays()
    BEGIN
      SELECT * FROM barangay ORDER BY barangay ASC;
    END;
  `);

  // Get barangay by ID
  await knex.raw(`
    CREATE PROCEDURE GetBarangayById(IN p_id INT)
    BEGIN
      SELECT * FROM barangay WHERE id = p_id;
    END;
  `);

  // Get barangays by municipality ID
  await knex.raw(`
    CREATE PROCEDURE GetBarangaysByMunicipalityId(IN p_municipality_id INT)
    BEGIN
      SELECT * FROM barangay WHERE municipality_id = p_municipality_id ORDER BY barangay ASC;
    END;
  `);

  // Join barangay, municipality, province tables to get full address by barangay_id
  await knex.raw(`
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

async function dropAddressProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllProvinces;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetProvinceById;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllMunicipalities;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetMunicipalityById;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetMunicipalitiesByProvinceId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllBarangays;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBarangayById;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBarangaysByMunicipalityId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetFullAddressByBarangayId;");
}

module.exports = { createAddressProcedures, dropAddressProcedures };
