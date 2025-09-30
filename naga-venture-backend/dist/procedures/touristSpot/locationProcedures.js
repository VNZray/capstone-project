// Location-related procedures
export async function createLocationProcedures(knex) {
  await knex.raw(`
    CREATE PROCEDURE GetLocationData()
    BEGIN
      SELECT * FROM province ORDER BY province ASC;
      SELECT * FROM municipality ORDER BY municipality ASC;
      SELECT * FROM barangay ORDER BY barangay ASC;
    END;
  `);
  await knex.raw(`
    CREATE PROCEDURE GetMunicipalitiesByProvince(IN p_province_id INT)
    BEGIN
      SELECT * FROM municipality WHERE province_id = p_province_id ORDER BY municipality ASC;
    END;
  `);
  await knex.raw(`
    CREATE PROCEDURE GetBarangaysByMunicipality(IN p_municipality_id INT)
    BEGIN
      SELECT * FROM barangay WHERE municipality_id = p_municipality_id ORDER BY barangay ASC;
    END;
  `);
}

export async function dropLocationProcedures(knex) {
  const names = [
    'GetLocationData', 'GetMunicipalitiesByProvince', 'GetBarangaysByMunicipality'
  ];
  for (const n of names) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
}
