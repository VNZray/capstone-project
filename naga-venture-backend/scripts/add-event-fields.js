/**
 * Script: add-event-fields.js
 * Purpose: Add missing fields to the `event` table if they don't exist.
 * Related controller: ../controller/categoryAndTypeController.js
 *
 * Note:
 * - This script is a lightweight migration helper for development.
 * - It checks existing columns using `SHOW COLUMNS` and runs ALTER TABLE
 *   statements for missing fields.
 * - It is safe to run multiple times (idempotent checks).
 *
 * Usage (powershell):
 * node scripts\add-event-fields.js
 *
 * If you need to add category relations or event photos as columns,
 * prefer creating proper knex migration files under `migrations/` for
 * production deployments. This script is intended for quick local fixes.
 *
 * Related migration:
 * - migrations/20250817125523_category_table.cjs (creates `category` table)
 */

import db from "../db.js";

async function addEventFields() {
  try {
    console.log("Adding missing fields to event table...");
    
    // Check if fields already exist
    const [columns] = await db.query("SHOW COLUMNS FROM event");
    const existingColumns = columns.map((col) => col.Field);

    // All possible event fields we want to consider
    const allFields = [
      "event_name",
      "description",
      "event_start_date",
      "event_end_date",
      "address",
      "longitude",
      "latitude",
      "start_time",
      "end_time",
      "contact_number",
      "website",
      "facebook",
      "instagram",
      "twitter",
    ];

    const fields = allFields.filter((field) => existingColumns.includes(field));
    console.log("Existing event fields:", fields);

    const fieldsToAdd = [
      { name: "start_time", type: "TIME" },
      { name: "end_time", type: "TIME" },
      { name: "contact_number", type: "VARCHAR(20)" },
      { name: "website", type: "VARCHAR(255)" },
      { name: "facebook", type: "VARCHAR(255)" },
      { name: "instagram", type: "VARCHAR(255)" },
      { name: "twitter", type: "VARCHAR(255)" },
      // JSON column for inline event photos (optional)
      { name: "event_photos", type: "JSON" },
    ];

    for (const field of fieldsToAdd) {
      if (!existingColumns.includes(field.name)) {
        // For MySQL, use TEXT fallback for JSON if necessary
        const colType =
          field.type === "JSON" && (db.config?.client === "mysql" || db.config?.client === "mysql2")
            ? "TEXT"
            : field.type;
        await db.query(`ALTER TABLE event ADD COLUMN ${field.name} ${colType} NULL`);
        console.log(`Added field: ${field.name}`);
      } else {
        console.log(`Field already exists: ${field.name}`);
      }
    }

    // Add category_id FK to category(id) if missing
    if (!existingColumns.includes("category_id")) {
      try {
        await db.query("ALTER TABLE event ADD COLUMN category_id INT NULL");
        await db.query(
          "ALTER TABLE event ADD CONSTRAINT fk_event_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL ON UPDATE CASCADE"
        );
        console.log("Added category_id column and FK to category(id)");
      } catch (fkError) {
        console.error("Error adding category_id FK (maybe already exists or missing category table):", fkError.message || fkError);
      }
    } else {
      console.log("Field already exists: category_id");
    }
    
    console.log("Event table fields updated successfully!");
  } catch (error) {
    console.error("Error adding fields:", error);
  } finally {
    await db.end();
  }
}

addEventFields();
