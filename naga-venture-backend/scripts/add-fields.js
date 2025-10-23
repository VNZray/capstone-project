import db from "../db.js";

async function addFields() {
  try {
    console.log("Adding missing fields to event table...");
    
    const fields = [
      "ALTER TABLE event ADD COLUMN start_time TIME NULL",
      "ALTER TABLE event ADD COLUMN end_time TIME NULL", 
      "ALTER TABLE event ADD COLUMN contact_number VARCHAR(20) NULL",
      "ALTER TABLE event ADD COLUMN website VARCHAR(255) NULL",
      "ALTER TABLE event ADD COLUMN facebook VARCHAR(255) NULL",
      "ALTER TABLE event ADD COLUMN instagram VARCHAR(255) NULL",
      "ALTER TABLE event ADD COLUMN twitter VARCHAR(255) NULL"
    ];
    
    for (const sql of fields) {
      try {
        await db.query(sql);
        console.log(`✅ Added field: ${sql.split(' ')[4]}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  Field already exists: ${sql.split(' ')[4]}`);
        } else {
          console.error(`❌ Error adding field: ${error.message}`);
        }
      }
    }
    
    console.log("✅ All fields processed!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await db.end();
  }
}

addFields();
