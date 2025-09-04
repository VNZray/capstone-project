import { response } from "express";
import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

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

// Get schedules for a tourist spot
export const getTouristSpotSchedules = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      `SELECT * FROM tourist_spot_schedules WHERE tourist_spot_id = ? ORDER BY day_of_week ASC`,
      [id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    return handleDbError(error, res);
  }
};

// Replace schedules for a tourist spot
export const upsertTouristSpotSchedules = async (req, res) => {
  const { id } = req.params;
  const { schedules } = req.body;
  if (!Array.isArray(schedules)) {
    return res.status(400).json({ success: false, message: "'schedules' must be an array" });
  }
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    await conn.execute("DELETE FROM tourist_spot_schedules WHERE tourist_spot_id = ?", [id]);

    if (schedules.length) {
      const values = [];
      const placeholders = [];
      schedules.forEach((s) => {
        const day = Number(s.day_of_week);
        const isClosed = !!s.is_closed;
        const open = isClosed ? null : (s.open_time ?? null);
        const close = isClosed ? null : (s.close_time ?? null);
        if (!Number.isNaN(day) && day >= 0 && day <= 6) {
          placeholders.push("(UUID(), ?, ?, ?, ?, ?)");
          values.push(id, day, open, close, isClosed ? 1 : 0);
        }
      });
      if (placeholders.length) {
        await conn.execute(
          `INSERT INTO tourist_spot_schedules (id, tourist_spot_id, day_of_week, open_time, close_time, is_closed)
           VALUES ${placeholders.join(",")}`,
          values
        );
      }
    }

    await conn.commit();
    res.json({ success: true, message: "Schedules saved" });
  } catch (error) {
    if (conn) await conn.rollback();
    return handleDbError(error, res);
  } finally {
    if (conn) conn.release();
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

export const submitEditRequest = async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const {
      name, description, province_id, municipality_id, barangay_id,
      latitude, longitude, contact_phone, contact_email, website,
      entry_fee, category_ids, type_id,
      spot_status, is_featured,
      categories_only = false // Flag to indicate if only categories changed
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
      db.execute("SELECT id, spot_status FROM tourist_spots WHERE id = ?", [id]),
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

    // If only categories changed, apply the change directly without approval
    if (categories_only) {
      // Start transaction
      conn = await db.getConnection();
      await conn.beginTransaction();

      // Update categories directly
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

      // Update the tourist spot's updated_at timestamp
      await conn.execute(
        "UPDATE tourist_spots SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [id]
      );

      await conn.commit();

      return res.json({
        success: true,
        message: "Categories updated successfully",
      });
    }

    // Check for pending edit request for non-category-only changes
    const [pending] = await db.execute(
      "SELECT id FROM tourist_spot_edits WHERE tourist_spot_id = ? AND approval_status = 'pending'",
      [id]
    );
    if (pending.length)
      return res.status(400).json({
        success: false,
        message: "There is already a pending edit request for this tourist spot.",
      });

    // Start transaction for full edit request
    conn = await db.getConnection();
    await conn.beginTransaction();

    const currentStatus = Array.isArray(spot) && spot[0] && spot[0].spot_status ? spot[0].spot_status : null;
    const statusToSave = typeof spot_status !== 'undefined' && spot_status !== null ? spot_status : currentStatus;
    const featuredToSave = typeof is_featured !== 'undefined' && is_featured !== null ? is_featured : 0;

    // Generate UUID for the edit
    const [[{ id: editId }]] = await conn.execute("SELECT UUID() AS id");

    await conn.execute(
      `INSERT INTO tourist_spot_edits (
        id, tourist_spot_id, name, description, province_id, municipality_id, barangay_id,
        latitude, longitude, contact_phone, contact_email, website, entry_fee,
        spot_status, is_featured, type_id, approval_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        editId, id, name, description, province_id, municipality_id, barangay_id,
        latitude ?? null, longitude ?? null, contact_phone, contact_email ?? null,
        website ?? null, entry_fee ?? null,
        statusToSave, featuredToSave, type_id,
      ]
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Edit request submitted successfully and is pending admin approval",
    });
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

// (Simplified) delete temporarily removed

// Get categories and types for tourist spots
export const getCategoriesAndTypes = async (request, response) => {
  try {
    const [types] = await db.execute(
      "SELECT * FROM type ORDER BY type ASC"
    );

    // types are linked via category.type_id -> type.id
    const [categories] = await db.execute(
      `SELECT c.* FROM category c INNER JOIN type t ON c.type_id = t.id WHERE t.id = 4 ORDER BY c.category ASC`
    );

    response.json({
      success: true,
      data: {
        types,
        categories,
      },
      message: "Categories and types retrieved successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

export const getLocationData = async (request, response) => {
  try {
    // Get all provinces
    const [provinces] = await db.execute(
      "SELECT * FROM province ORDER BY province ASC"
    );

    // Get all municipalities
    const [municipalities] = await db.execute(
      "SELECT * FROM municipality ORDER BY municipality ASC"
    );

    // Get all barangays
    const [barangays] = await db.execute(
      "SELECT * FROM barangay ORDER BY barangay ASC"
    );

    response.json({
      success: true,
      data: {
        provinces,
        municipalities,
        barangays,
      },
      message: "Location data retrieved successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Get municipalities by province
export const getMunicipalitiesByProvince = async (request, response) => {
  try {
    const { province_id } = request.params;

    const [municipalities] = await db.execute(
      "SELECT * FROM municipality WHERE province_id = ? ORDER BY municipality ASC",
      [province_id]
    );

    response.json({
      success: true,
      data: municipalities,
      message: "Municipalities retrieved successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Get barangays by municipality
export const getBarangaysByMunicipality = async (request, response) => {
  try {
    const { municipality_id } = request.params;

    const [barangays] = await db.execute(
      "SELECT * FROM barangay WHERE municipality_id = ? ORDER BY barangay ASC",
      [municipality_id]
    );

    response.json({
      success: true,
      data: barangays,
      message: "Barangays retrieved successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// ===== TOURIST SPOT IMAGE MANAGEMENT =====

// Get all images for a tourist spot
export const getTouristSpotImages = async (request, response) => {
  try {
    const { tourist_spot_id } = request.params;

    // Verify tourist spot exists
    const [spotCheck] = await db.execute(
      "SELECT id FROM tourist_spots WHERE id = ?",
      [tourist_spot_id]
    );

    if (spotCheck.length === 0) {
      return response.status(404).json({
        success: false,
        message: "Tourist spot not found",
      });
    }

    const [images] = await db.execute(
      `SELECT 
        id, tourist_spot_id, file_url, file_format, file_size, 
        is_primary, alt_text, uploaded_at, updated_at
      FROM tourist_spot_images 
      WHERE tourist_spot_id = ? 
      ORDER BY is_primary DESC, uploaded_at ASC`,
      [tourist_spot_id]
    );

    response.json({
      success: true,
      data: images,
      message: "Tourist spot images retrieved successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Add a new image to a tourist spot
export const addTouristSpotImage = async (request, response) => {
  try {
    const { tourist_spot_id } = request.params;
    const { file_url, file_format, file_size, is_primary, alt_text } = request.body;

    if (!file_url || !file_format) {
      return response.status(400).json({
        success: false,
        message: "file_url and file_format are required",
      });
    }

    // Verify tourist spot exists
    const [spotCheck] = await db.execute(
      "SELECT id FROM tourist_spots WHERE id = ?",
      [tourist_spot_id]
    );

    if (spotCheck.length === 0) {
      return response.status(404).json({
        success: false,
        message: "Tourist spot not found",
      });
    }

    // If this is set as primary, unset other primary images for this spot
    if (is_primary) {
      await db.execute(
        "UPDATE tourist_spot_images SET is_primary = false WHERE tourist_spot_id = ?",
        [tourist_spot_id]
      );
    }

    // Generate UUID for the image
    const [[{ id: imageId }]] = await db.execute("SELECT UUID() AS id");

    await db.execute(
      `INSERT INTO tourist_spot_images 
      (id, tourist_spot_id, file_url, file_format, file_size, is_primary, alt_text)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        imageId,
        tourist_spot_id,
        file_url,
        file_format,
        file_size || null,
        is_primary || false,
        alt_text || null,
      ]
    );

    // Retrieve the created image
    const [newImage] = await db.execute(
      "SELECT * FROM tourist_spot_images WHERE id = ?",
      [imageId]
    );

    response.status(201).json({
      success: true,
      data: newImage[0],
      message: "Tourist spot image added successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Update an existing image (mainly for setting primary, alt text)
export const updateTouristSpotImage = async (request, response) => {
  try {
    const { tourist_spot_id, image_id } = request.params;
    const { is_primary, alt_text } = request.body;

    // Verify image exists and belongs to the tourist spot
    const [imageCheck] = await db.execute(
      "SELECT id FROM tourist_spot_images WHERE id = ? AND tourist_spot_id = ?",
      [image_id, tourist_spot_id]
    );

    if (imageCheck.length === 0) {
      return response.status(404).json({
        success: false,
        message: "Tourist spot image not found",
      });
    }

    // If this is set as primary, unset other primary images for this spot
    if (is_primary) {
      await db.execute(
        "UPDATE tourist_spot_images SET is_primary = false WHERE tourist_spot_id = ?",
        [tourist_spot_id]
      );
    }

    // Update the image
    const updateFields = [];
    const updateValues = [];

    if (is_primary !== undefined) {
      updateFields.push("is_primary = ?");
      updateValues.push(is_primary);
    }

    if (alt_text !== undefined) {
      updateFields.push("alt_text = ?");
      updateValues.push(alt_text);
    }

    if (updateFields.length === 0) {
      return response.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    updateValues.push(image_id);

    await db.execute(
      `UPDATE tourist_spot_images SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    // Retrieve the updated image
    const [updatedImage] = await db.execute(
      "SELECT * FROM tourist_spot_images WHERE id = ?",
      [image_id]
    );

    response.json({
      success: true,
      data: updatedImage[0],
      message: "Tourist spot image updated successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Delete an image
export const deleteTouristSpotImage = async (request, response) => {
  try {
    const { tourist_spot_id, image_id } = request.params;

    // Verify image exists and belongs to the tourist spot
    const [imageCheck] = await db.execute(
      "SELECT id FROM tourist_spot_images WHERE id = ? AND tourist_spot_id = ?",
      [image_id, tourist_spot_id]
    );

    if (imageCheck.length === 0) {
      return response.status(404).json({
        success: false,
        message: "Tourist spot image not found",
      });
    }

    await db.execute("DELETE FROM tourist_spot_images WHERE id = ?", [image_id]);

    response.json({
      success: true,
      message: "Tourist spot image deleted successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Set primary image for a tourist spot
export const setPrimaryTouristSpotImage = async (request, response) => {
  try {
    const { tourist_spot_id, image_id } = request.params;

    // Verify image exists and belongs to the tourist spot
    const [imageCheck] = await db.execute(
      "SELECT id FROM tourist_spot_images WHERE id = ? AND tourist_spot_id = ?",
      [image_id, tourist_spot_id]
    );

    if (imageCheck.length === 0) {
      return response.status(404).json({
        success: false,
        message: "Tourist spot image not found",
      });
    }

    // First, unset all primary images for this spot
    await db.execute(
      "UPDATE tourist_spot_images SET is_primary = false WHERE tourist_spot_id = ?",
      [tourist_spot_id]
    );

    // Then set the specified image as primary
    await db.execute(
      "UPDATE tourist_spot_images SET is_primary = true WHERE id = ?",
      [image_id]
    );

    response.json({
      success: true,
      message: "Primary image set successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};
