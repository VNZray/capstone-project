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

    // Use InsertAddress procedure
    const [addressResult] = await db.query(
      "CALL InsertAddress(?, ?, ?)",
      [province_id, municipality_id, barangay_id]
    );
    const address_id = addressResult[0] && addressResult[0][0] ? addressResult[0][0].id : null;

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Use InsertTouristSpot procedure
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

    // Insert categories using procedure
    for (let i = 0; i < category_ids.length; i++) {
      await conn.query("CALL InsertTouristSpotCategory(?, ?)", [spotId, category_ids[i]]);
    }

    // Insert schedules using procedure
    if (Array.isArray(schedules) && schedules.length) {
      for (let idx = 0; idx < schedules.length; idx++) {
        const s = schedules[idx];
        const day = Number(s.day_of_week);
        const isClosed = !!s.is_closed;
        const open = isClosed ? null : (s.open_time ?? null);
        const close = isClosed ? null : (s.close_time ?? null);
        if (!Number.isNaN(day) && day >= 0 && day <= 6) {
          await conn.query("CALL InsertTouristSpotSchedule(?,?,?,?,?)", [spotId, day, open, close, isClosed ? 1 : 0]);
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
