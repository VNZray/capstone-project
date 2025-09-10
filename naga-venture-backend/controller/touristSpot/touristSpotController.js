import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

// Get all tourist spots
export const getAllTouristSpots = async (request, response) => {
  try {
    const [data] = await db.query("CALL GetAllTouristSpots()");
    const spots = data[0] || [];
    const categories = data[1] || [];
    const images = data[2] || [];

    // Index categories and images by spot id
    const catMap = new Map();
    for (const c of categories) {
      if (!catMap.has(c.tourist_spot_id)) catMap.set(c.tourist_spot_id, []);
      catMap.get(c.tourist_spot_id).push({ id: c.id, category: c.category, type_id: c.type_id });
    }
    const imgMap = new Map();
    for (const i of images) {
      if (!imgMap.has(i.tourist_spot_id)) imgMap.set(i.tourist_spot_id, []);
      imgMap.get(i.tourist_spot_id).push(i);
    }

    const merged = spots.map(s => ({
      ...s,
      categories: catMap.get(s.id) || [],
      images: imgMap.get(s.id) || [],
    }));

    response.json({ success: true, data: merged, message: "Tourist spots retrieved successfully" });
  } catch (error) {
    console.error("Error fetching tourist spots:", error);
    return handleDbError(error, response);
  }
};

// Get tourist spot by ID
export const getTouristSpotById = async (request, response) => {
  try {
    const { id } = request.params;
    const [data] = await db.query("CALL GetTouristSpotById(?)", [id]);

    const rows = data[0] || [];
    if (!rows.length) {
      return response.status(404).json({ success: false, message: "Tourist spot not found" });
    }

    const categories = data[1] || [];
    const images = data[2] || [];
    const touristSpot = { ...rows[0], categories, images };

    response.json({ success: true, data: touristSpot, message: "Tourist spot retrieved successfully" });
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

    // Insert into address table and get address_id
    const [addressResult] = await db.query(
      "INSERT INTO address (province_id, municipality_id, barangay_id) VALUES (?, ?, ?)",
      [province_id, municipality_id, barangay_id]
    );
    const address_id = addressResult.insertId;

    // Start transaction for composing categories and schedules around procedure-created record
    conn = await db.getConnection();
    await conn.beginTransaction();


    // Create main tourist spot via procedure to comply with no inline SQL
    const [insertRes] = await conn.query(
      "CALL InsertTouristSpot(?,?,?,?,?,?,?,?,?,?)",
      [
        name,
        description,
        address_id,
        latitude ?? null,
        longitude ?? null,
        contact_phone ?? null,
        contact_email ?? null,
        website ?? null,
        entry_fee ?? null,
        type_id,
      ]
    );
    const spotId = insertRes[0] && insertRes[0][0] ? insertRes[0][0].id : null;
    if (!spotId) {
      throw new Error("Failed to create tourist spot");
    }

    // Insert categories
    const categoryValues = [];
    const categoryPlaceholders = [];
    category_ids.forEach(categoryId => {
      categoryPlaceholders.push("(UUID(), ?, ?)");
      categoryValues.push(spotId, categoryId);
    });

    // Insert categories via procedure per category
    for (let i = 0; i < category_ids.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      await conn.query("CALL InsertTouristSpotCategory(?, ?)", [spotId, category_ids[i]]);
    }

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
        for (let idx = 0; idx < schedules.length; idx++) {
          const s = schedules[idx];
          const day = Number(s.day_of_week);
          const isClosed = !!s.is_closed;
          const open = isClosed ? null : (s.open_time ?? null);
          const close = isClosed ? null : (s.close_time ?? null);
          if (!Number.isNaN(day) && day >= 0 && day <= 6) {
            // eslint-disable-next-line no-await-in-loop
            await conn.query("CALL InsertTouristSpotSchedule(?,?,?,?,?)", [spotId, day, open, close, isClosed ? 1 : 0]);
          }
        }
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
