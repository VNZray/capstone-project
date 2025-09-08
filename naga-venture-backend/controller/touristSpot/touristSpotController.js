import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

// Get all tourist spots
export const getAllTouristSpots = async (request, response) => {
  try {
    const [data] = await db.execute(`
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
      ORDER BY ts.name ASC
    `);

    // Get categories and images for each tourist spot
    for (let spot of data) {
      // Get categories
      const [categories] = await db.execute(
        `SELECT c.id, c.category, c.type_id 
         FROM tourist_spot_categories tsc
         JOIN category c ON tsc.category_id = c.id
         WHERE tsc.tourist_spot_id = ? 
         ORDER BY c.category ASC`,
        [spot.id]
      );
      spot.categories = categories;

      // Get images
      const [images] = await db.execute(
        `SELECT 
          id, file_url, file_format, file_size, is_primary, alt_text, uploaded_at
        FROM tourist_spot_images 
        WHERE tourist_spot_id = ? 
        ORDER BY is_primary DESC, uploaded_at ASC`,
        [spot.id]
      );
      spot.images = images;
    }

    response.json({
      success: true,
      data: data,
      message: "Tourist spots retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching tourist spots:", error);
    return handleDbError(error, response);
  }
};

// Get tourist spot by ID
export const getTouristSpotById = async (request, response) => {
  try {
    const { id } = request.params;

    const [data] = await db.execute(`
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
      WHERE ts.id = ?
    `, [id]);

    if (data.length === 0) {
      return response.status(404).json({
        success: false,
        message: "Tourist spot not found",
      });
    }

    const touristSpot = data[0];

    // Get categories for this tourist spot
    const [categories] = await db.execute(
      `SELECT c.id, c.category, c.type_id 
       FROM tourist_spot_categories tsc
       JOIN category c ON tsc.category_id = c.id
       WHERE tsc.tourist_spot_id = ? 
       ORDER BY c.category ASC`,
      [id]
    );
    touristSpot.categories = categories;

    // Get images for this tourist spot
    const [images] = await db.execute(
      `SELECT 
        id, file_url, file_format, file_size, is_primary, alt_text, uploaded_at
      FROM tourist_spot_images 
      WHERE tourist_spot_id = ? 
      ORDER BY is_primary DESC, uploaded_at ASC`,
      [id]
    );
    touristSpot.images = images;

    response.json({
      success: true,
      data: touristSpot,
      message: "Tourist spot retrieved successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

export const createTouristSpot = async (request, response) => {
  let conn;
  try {
    const {
      name,
      description,
      province_id,
      municipality_id,
      barangay_id,
      latitude,
      longitude,
      contact_phone,
      contact_email,
      website,
      entry_fee,
      category_ids,
      type_id,
      schedules,
    } = request.body;

    if (
      !name ||
      !description ||
      !province_id ||
      !municipality_id ||
      !barangay_id ||
      !type_id ||
      !Array.isArray(category_ids) ||
      category_ids.length === 0
    ) {
      return response.status(400).json({
        success: false,
        message:
          "Name, description, province_id, municipality_id, barangay_id, type_id, and category_ids are required",
      });
    }

    // Validate categories and their relation to type
    const placeholders = category_ids.map(() => '?').join(',');
    const [
      [categoryCheck],
      [typeCheck],
      [provinceCheck],
      [municipalityCheck],
      [barangayCheck],
    ] = await Promise.all([
      db.execute(`SELECT id FROM category WHERE id IN (${placeholders}) AND type_id = ?`, [...category_ids, type_id]),
      db.execute("SELECT id FROM type WHERE id = ?", [type_id]),
      db.execute("SELECT id FROM province WHERE id = ?", [province_id]),
      db.execute(
        "SELECT id FROM municipality WHERE id = ? AND province_id = ?",
        [municipality_id, province_id]
      ),
      db.execute(
        "SELECT id FROM barangay WHERE id = ? AND municipality_id = ?",
        [barangay_id, municipality_id]
      ),
    ]);

    if (categoryCheck.length !== category_ids.length) {
      return response
        .status(400)
        .json({ success: false, message: "One or more invalid category_ids or categories don't match the type" });
    }
    if (typeCheck.length === 0) {
      return response
        .status(400)
        .json({ success: false, message: "Invalid type_id" });
    }
    if (provinceCheck.length === 0) {
      return response
        .status(400)
        .json({ success: false, message: "Invalid province_id" });
    }
    if (municipalityCheck.length === 0) {
      return response
        .status(400)
        .json({
          success: false,
          message: "Invalid municipality_id for the selected province",
        });
    }
    if (barangayCheck.length === 0) {
      return response
        .status(400)
        .json({
          success: false,
          message: "Invalid barangay_id for the selected municipality",
        });
    }

    // Start transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Generate a UUID here so we can reference it for schedules and categories
    const [[{ id: spotId }]] = await conn.execute("SELECT UUID() AS id");

    await conn.execute(
      `
      INSERT INTO tourist_spots (
        id, name, description, province_id, municipality_id, barangay_id,
        latitude, longitude, contact_phone, contact_email, website, entry_fee, 
        type_id, spot_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
      [
        spotId,
        name,
        description,
        province_id,
        municipality_id,
        barangay_id,
        latitude ?? null,
        longitude ?? null,
        contact_phone ?? null,
        contact_email ?? null,
        website ?? null,
        entry_fee ?? null,
        type_id,
      ]
    );

    // Insert categories
    const categoryValues = [];
    const categoryPlaceholders = [];
    category_ids.forEach(categoryId => {
      categoryPlaceholders.push("(UUID(), ?, ?)");
      categoryValues.push(spotId, categoryId);
    });

    await conn.execute(
      `INSERT INTO tourist_spot_categories (id, tourist_spot_id, category_id) 
       VALUES ${categoryPlaceholders.join(",")}`,
      categoryValues
    );

    // Optionally insert schedules if provided
    if (Array.isArray(schedules) && schedules.length) {
      const values = [];
      const placeholders = [];
      schedules.forEach((s) => {
        const day = Number(s.day_of_week);
        const isClosed = !!s.is_closed;
        const open = isClosed ? null : (s.open_time ?? null);
        const close = isClosed ? null : (s.close_time ?? null);
        if (!Number.isNaN(day) && day >= 0 && day <= 6) {
          placeholders.push("(?, ?, ?, ?, ?)");
          values.push(spotId, day, open, close, isClosed ? 1 : 0);
        }
      });
      if (placeholders.length) {
        await conn.execute(
          `INSERT INTO tourist_spot_schedules (tourist_spot_id, day_of_week, open_time, close_time, is_closed)
           VALUES ${placeholders.join(",")}`,
          values
        );
      }
    }

    await conn.commit();

    response.status(201).json({
      success: true,
      message: "Tourist spot created successfully",
      data: { id: spotId },
    });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    return handleDbError(error, response);
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

export const updateTouristSpot = async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const {
      name, description, province_id, municipality_id, barangay_id,
      latitude, longitude, contact_phone, contact_email, website,
      entry_fee, category_ids, type_id,
    } = req.body;

    if (
      !name || !description || !province_id || !municipality_id ||
      !barangay_id || !contact_phone || !type_id ||
      !Array.isArray(category_ids) || category_ids.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check existence and validity in parallel
    const placeholders = category_ids.map(() => '?').join(',');
    const [
      [spot], [categories], [type], [prov], [mun], [bar]
    ] = await Promise.all([
      db.execute("SELECT id FROM tourist_spots WHERE id = ?", [id]),
      db.execute(`SELECT id FROM category WHERE id IN (${placeholders}) AND type_id = ?`, [...category_ids, type_id]),
      db.execute("SELECT id FROM type WHERE id = ?", [type_id]),
      db.execute("SELECT id FROM province WHERE id = ?", [province_id]),
      db.execute("SELECT id FROM municipality WHERE id = ? AND province_id = ?", [municipality_id, province_id]),
      db.execute("SELECT id FROM barangay WHERE id = ? AND municipality_id = ?", [barangay_id, municipality_id]),
    ]);

    if (!spot.length) return res.status(404).json({ success: false, message: "Tourist spot not found" });
    if (categories.length !== category_ids.length) return res.status(400).json({ success: false, message: "One or more invalid category_ids or categories don't match the type" });
    if (!type.length) return res.status(400).json({ success: false, message: "Invalid type_id" });
    if (!prov.length) return res.status(400).json({ success: false, message: "Invalid province_id" });
    if (!mun.length) return res.status(400).json({ success: false, message: "Invalid municipality_id for the selected province" });
    if (!bar.length) return res.status(400).json({ success: false, message: "Invalid barangay_id for the selected municipality" });

    // Start transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Update tourist spot
    await conn.execute(
      `UPDATE tourist_spots SET
        name=?, description=?, province_id=?, municipality_id=?, barangay_id=?,
        latitude=?, longitude=?, contact_phone=?, contact_email=?, website=?,
        entry_fee=?, type_id=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?`,
      [
        name, description, province_id, municipality_id, barangay_id,
        latitude ?? null, longitude ?? null, contact_phone, contact_email ?? null,
        website ?? null, entry_fee ?? null, type_id, id,
      ]
    );

    // Delete existing categories for this tourist spot
    await conn.execute(
      "DELETE FROM tourist_spot_categories WHERE tourist_spot_id = ?",
      [id]
    );

    // Insert new categories
    const categoryValues = [];
    const categoryPlaceholders = [];
    category_ids.forEach(categoryId => {
      categoryPlaceholders.push("(UUID(), ?, ?)");
      categoryValues.push(id, categoryId);
    });

    await conn.execute(
      `INSERT INTO tourist_spot_categories (id, tourist_spot_id, category_id) 
       VALUES ${categoryPlaceholders.join(",")}`,
      categoryValues
    );

    await conn.commit();

    res.json({ success: true, message: "Tourist spot updated successfully" });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    return handleDbError(error, res);
  } finally {
    if (conn) {
      conn.release();
    }
  }
};
