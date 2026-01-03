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
      catMap.get(c.tourist_spot_id).push({ 
        id: c.id, 
        category_id: c.id,
        category: c.category, 
        category_title: c.category,
        parent_category: c.parent_category, 
        level: c.level 
      });
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

    const categories = (data[1] || []).map(c => ({
      ...c,
      category_title: c.category
    }));
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
      barangay_id,
      latitude,
      longitude,
      contact_phone,
      contact_email,
      website,
      entry_fee,
      category_ids,
      primary_category_id,
      schedules,
    } = request.body;

    if (
      !name ||
      !description ||
      !barangay_id ||
      !Array.isArray(category_ids) ||
      category_ids.length === 0
    ) {
      return response.status(400).json({
        success: false,
        message:
          "Name, description, barangay_id, and category_ids are required",
      });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // Use InsertTouristSpot procedure (without type_id)
    const [insertRes] = await conn.query(
      "CALL InsertTouristSpot(?,?,?,?,?,?,?,?,?)",
      [
        name,
        description,
        barangay_id,
        latitude ?? null,
        longitude ?? null,
        contact_phone ?? null,
        contact_email ?? null,
        website ?? null,
        entry_fee ?? null,
      ]
    );
    const spotId = insertRes[0] && insertRes[0][0] ? insertRes[0][0].id : null;
    if (!spotId) {
      throw new Error("Failed to create tourist spot");
    }

    // Insert categories using entity_categories via procedure
    for (let i = 0; i < category_ids.length; i++) {
      const isPrimary = category_ids[i] === primary_category_id || (i === 0 && !primary_category_id);
      await conn.query("CALL InsertTouristSpotCategory(?, ?, ?)", [spotId, category_ids[i], isPrimary]);
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

// Featured management
export const getFeaturedTouristSpots = async (request, response) => {
  try {
    const [data] = await db.query("CALL GetFeaturedTouristSpots()");
    const spots = data[0] || [];
    const categories = (data[1] || []).map(c => ({
      ...c,
      category_title: c.category
    }));
    const images = data[2] || [];

    const catMap = new Map();
    for (const c of categories) {
      if (!catMap.has(c.tourist_spot_id)) catMap.set(c.tourist_spot_id, []);
      catMap.get(c.tourist_spot_id).push({ 
        id: c.id, 
        category_id: c.id,
        category: c.category, 
        category_title: c.category,
        parent_category: c.parent_category, 
        level: c.level 
      });
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
    response.json({ success: true, data: merged, message: "Featured tourist spots retrieved successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

export const getNonFeaturedTouristSpots = async (request, response) => {
  try {
    const [data] = await db.query("CALL GetNonFeaturedTouristSpots()");
    const rows = data[0] || [];
    response.json({ success: true, data: rows, message: "Non-featured tourist spots retrieved successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

export const featureTouristSpot = async (request, response) => {
  try {
    const { id } = request.params;
    const [resArr] = await db.query("CALL FeatureTouristSpot(?)", [id]);
    const affected = resArr && resArr[0] && resArr[0][0] ? resArr[0][0].affected_rows : 0;
    if (affected === 0) {
      return response.status(400).json({ success: false, message: "Unable to feature tourist spot" });
    }
    response.json({ success: true, message: "Tourist spot featured successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

export const unfeatureTouristSpot = async (request, response) => {
  try {
    const { id } = request.params;
    const [resArr] = await db.query("CALL UnfeatureTouristSpot(?)", [id]);
    const affected = resArr && resArr[0] && resArr[0][0] ? resArr[0][0].affected_rows : 0;
    if (affected === 0) {
      return response.status(400).json({ success: false, message: "Unable to unfeature tourist spot" });
    }
    response.json({ success: true, message: "Tourist spot unfeatured successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};

export const deleteTouristSpot = async (request, response) => {
  try {
    const { id } = request.params;
    await db.query("CALL DeleteTouristSpot(?)", [id]);
    response.json({ success: true, message: "Tourist spot deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
};
