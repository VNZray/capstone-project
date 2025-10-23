import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";
// ------------------------------------------------------------
// Copy this template
// rename the file
// rename the function name, event, and fields
// ------------------------------------------------------------

// fetch all data
export async function getAllData(request, response) {
  try {
    // First try to get events with categories
    try {
      const [data] = await db.query(`
        SELECT 
          e.*,
          GROUP_CONCAT(
            JSON_OBJECT('id', c.id, 'category', c.category)
            SEPARATOR '|'
          ) as categories
        FROM event e
        LEFT JOIN event_category ec ON e.id = ec.event_id
        LEFT JOIN category c ON ec.category_id = c.id
        GROUP BY e.id
        ORDER BY e.created_at DESC
      `);
      
      // Parse categories for each event
      const eventsWithCategories = data.map(event => {
        if (event.categories) {
          event.categories = event.categories
            .split('|')
            .map(cat => {
              try {
                return JSON.parse(cat);
              } catch {
                return null;
              }
            })
            .filter(Boolean);
        } else {
          event.categories = [];
        }
        return event;
      });
      
      response.json(eventsWithCategories);
    } catch (joinError) {
      console.log("Category join failed, returning basic event data:", joinError.message);
      // Fallback to basic event data without categories
      const [data] = await db.query("SELECT * FROM event ORDER BY created_at DESC");
      const eventsWithEmptyCategories = data.map(event => ({
        ...event,
        categories: []
      }));
      response.json(eventsWithEmptyCategories);
    }
  } catch (error) {
    handleDbError(error, response);
  }
}

// fetch data by ID
export async function getDataById(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query(`
      SELECT 
        e.*,
        GROUP_CONCAT(
          JSON_OBJECT('id', c.id, 'category', c.category)
          SEPARATOR '|'
        ) as categories
      FROM event e
      LEFT JOIN event_category ec ON e.id = ec.event_id
      LEFT JOIN category c ON ec.category_id = c.id
      WHERE e.id = ?
      GROUP BY e.id
    `, [id]);
    
    if (data.length === 0) {
      return response.status(404).json({ message: "Data not found" });
    }
    
    const event = data[0];
    if (event.categories) {
      event.categories = event.categories
        .split('|')
        .map(cat => {
          try {
            return JSON.parse(cat);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    } else {
      event.categories = [];
    }
    
    response.json([event]);
  } catch (error) {
    return handleDbError(error, response);
  }
}



// insert into table
export async function insertData(request, response) {
  try {
    console.log("Inserting event with data:", JSON.stringify(request.body, null, 2));
    
    const id = uuidv4();
    // Check which fields exist in the database
    const [columns] = await db.query("SHOW COLUMNS FROM event");
    const existingColumns = columns.map(col => col.Field);
    
    // Only include fields that exist in the database
    const allFields = ["id", "event_name", "description", "event_start_date", "event_end_date", "address", "longitude", "latitude", "start_time", "end_time", "contact_number", "website", "facebook", "instagram", "twitter"];
    const fields = ["id", ...allFields.slice(1).filter(field => existingColumns.includes(field))];
    
    console.log("Existing columns:", existingColumns);
    console.log("Fields to insert:", fields);

    const values = [id, ...fields.slice(1).map((f) => request.body[f] ?? null)];
    
    console.log("Fields:", fields);
    console.log("Values:", values);

    await db.query(
      `INSERT INTO event (${fields.join(", ")})
       VALUES (${fields.map(() => "?").join(", ")})`,
      values
    );

    // Insert category relationships if provided
    if (request.body.category_ids && Array.isArray(request.body.category_ids)) {
      try {
        for (const categoryId of request.body.category_ids) {
          await db.query(
            "INSERT INTO event_category (event_id, category_id) VALUES (?, ?)",
            [id, categoryId]
          );
        }
      } catch (categoryError) {
        console.log("Category relationship insertion failed:", categoryError.message);
        // Continue without categories
      }
    }

    // Fetch the complete event with categories
    try {
      const [data] = await db.query(`
        SELECT 
          e.*,
          GROUP_CONCAT(
            JSON_OBJECT('id', c.id, 'category', c.category)
            SEPARATOR '|'
          ) as categories
        FROM event e
        LEFT JOIN event_category ec ON e.id = ec.event_id
        LEFT JOIN category c ON ec.category_id = c.id
        WHERE e.id = ?
        GROUP BY e.id
      `, [id]);

      if (data.length === 0) {
        return response.status(404).json({ error: "Inserted row not found" });
      }

      const event = data[0];
      if (event.categories) {
        event.categories = event.categories
          .split('|')
          .map(cat => {
            try {
              return JSON.parse(cat);
            } catch {
              return null;
            }
          })
          .filter(Boolean);
      } else {
        event.categories = [];
      }

      response.json([event]);
    } catch (fetchError) {
      console.log("Category fetch failed, returning basic event data:", fetchError.message);
      // Fallback to basic event data
      const [data] = await db.query("SELECT * FROM event WHERE id = ?", [id]);
      if (data.length === 0) {
        return response.status(404).json({ error: "Inserted row not found" });
      }
      const event = { ...data[0], categories: [] };
      response.json([event]);
    }
  } catch (error) {
    return handleDbError(error, response);
  }
}

// update data by ID
export async function updateData(request, response) {
  const { id } = request.params;
  try {
    // Check which fields exist in the database
    const [columns] = await db.query("SHOW COLUMNS FROM event");
    const existingColumns = columns.map(col => col.Field);
    
    // Only include fields that exist in the database
    const allFields = ["event_name", "description", "event_start_date", "event_end_date", "address", "longitude", "latitude", "start_time", "end_time", "contact_number", "website", "facebook", "instagram", "twitter"];
    const fields = allFields.filter(field => existingColumns.includes(field));
    
    console.log("Update - Existing columns:", existingColumns);
    console.log("Update - Fields to update:", fields);
    
    const updates = fields.map((f) => request.body[f] ?? null);

    const [data] = await db.query(
      `UPDATE event 
       SET ${fields.map((f) => `${f} = ?`).join(", ")}
       WHERE id = ?`,
      [...updates, id]
    );

    if (data.affectedRows === 0) {
      return response.status(404).json({ message: "Data not found" });
    }

    // Update category relationships if provided
    if (request.body.category_ids && Array.isArray(request.body.category_ids)) {
      // Delete existing relationships
      await db.query("DELETE FROM event_category WHERE event_id = ?", [id]);
      
      // Insert new relationships
      for (const categoryId of request.body.category_ids) {
        await db.query(
          "INSERT INTO event_category (event_id, category_id) VALUES (?, ?)",
          [id, categoryId]
        );
      }
    }

    // Fetch the complete updated event with categories
    const [updated] = await db.query(`
      SELECT 
        e.*,
        GROUP_CONCAT(
          JSON_OBJECT('id', c.id, 'category', c.category)
          SEPARATOR '|'
        ) as categories
      FROM event e
      LEFT JOIN event_category ec ON e.id = ec.event_id
      LEFT JOIN category c ON ec.category_id = c.id
      WHERE e.id = ?
      GROUP BY e.id
    `, [id]);

    if (updated.length === 0) {
      return response.status(404).json({ message: "Updated event not found" });
    }

    const event = updated[0];
    if (event.categories) {
      event.categories = event.categories
        .split('|')
        .map(cat => {
          try {
            return JSON.parse(cat);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    } else {
      event.categories = [];
    }

    response.json([event]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// delete data by ID
export async function deleteData(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("DELETE FROM event WHERE id = ?", [id]);

    if (data.affectedRows === 0) {
      return response.status(404).json({ message: "Data not found" });
    }

    response.json({ message: "Row deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
}

// get event categories
export async function getEventCategories(request, response) {
  try {
    // Get categories that are suitable for events (Cultural, Food, Adventure, Religious)
    const [data] = await db.query(`
      SELECT id, category 
      FROM category 
      WHERE category IN ('Cultural', 'Food', 'Adventure', 'Religious')
      ORDER BY category
    `);
    
    // If no categories found, insert default event categories
    if (data.length === 0) {
      const defaultCategories = [
        { category: 'Cultural' },
        { category: 'Food' },
        { category: 'Adventure' },
        { category: 'Religious' }
      ];
      
      for (const cat of defaultCategories) {
        await db.query("INSERT INTO category (category, type_id) VALUES (?, 4)", [cat.category]);
      }
      
      // Fetch the newly inserted categories
      const [newData] = await db.query(`
        SELECT id, category 
        FROM category 
        WHERE category IN ('Cultural', 'Food', 'Adventure', 'Religious')
        ORDER BY category
      `);
      
      return response.json(newData);
    }
    
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Debug endpoint to test event creation
export async function debugEventCreation(request, response) {
  try {
    console.log("Debug - Request body:", JSON.stringify(request.body, null, 2));
    
    // Check if event table has required fields
    const [columns] = await db.query("SHOW COLUMNS FROM event");
    const columnNames = columns.map(col => col.Field);
    console.log("Debug - Event table columns:", columnNames);
    
    response.json({
      message: "Debug info logged",
      requestBody: request.body,
      tableColumns: columnNames
    });
  } catch (error) {
    console.error("Debug error:", error);
    response.status(500).json({ error: error.message });
  }
}

