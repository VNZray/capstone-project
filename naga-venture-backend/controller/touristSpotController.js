import { response } from "express";
import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// Get all tourist spots
export const getAllTouristSpots = async (request, response) => {
  try {
    const [data] = await db.execute(`
      SELECT 
        ts.*, 
        c.category AS category,
        t.type AS type,
        p.province AS province,
        m.municipality AS municipality,
        b.barangay AS barangay
      FROM tourist_spots ts
      LEFT JOIN category c ON ts.category_id = c.id
      LEFT JOIN type t ON ts.type_id = t.id
      LEFT JOIN province p ON ts.province_id = p.id
      LEFT JOIN municipality m ON ts.municipality_id = m.id
      LEFT JOIN barangay b ON ts.barangay_id = b.id
      WHERE ts.spot_status IN ('active','inactive')
      ORDER BY ts.name ASC
    `);

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
        c.category AS category,
        t.type AS type,
        p.province AS province,
        m.municipality AS municipality,
        b.barangay AS barangay
      FROM tourist_spots ts
      LEFT JOIN category c ON ts.category_id = c.id
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

    response.json({
      success: true,
      data: data[0],
      message: "Tourist spot retrieved successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

export const createTouristSpot = async (request, response) => {
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
      category_id,
      type_id,
    } = request.body;

    if (
      !name ||
      !description ||
      !province_id ||
      !municipality_id ||
      !barangay_id ||
      !contact_phone ||
      !category_id ||
      !type_id
    ) {
      return response.status(400).json({
        success: false,
        message:
          "Name, description, province_id, municipality_id, barangay_id, contact_phone, category_id, and type_id are requestuired",
      });
    }
    const [
      [categoryCheck],
      [typeCheck],
      [provinceCheck],
      [municipalityCheck],
      [barangayCheck],
    ] = await Promise.all([
      db.execute("SELECT id FROM category WHERE id = ?", [category_id]),
      // Verify that the provided type_id corresponds to the category via category.type_id
      db.execute(
        `SELECT id FROM category WHERE id = ? AND type_id = ?`,
        [category_id, type_id]
      ),
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

    if (categoryCheck.length === 0) {
      return response
        .status(400)
        .json({ success: false, message: "Invalid category_id" });
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

    await db.execute(
      `
      INSERT INTO tourist_spots (
        name, description, province_id, municipality_id, barangay_id,
        latitude, longitude, contact_phone, contact_email, website, entry_fee, 
        category_id, type_id, spot_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
      [
        name,
        description,
        province_id,
        municipality_id,
        barangay_id,
        latitude ?? null,
        longitude ?? null,
        contact_phone,
        contact_email ?? null,
        website ?? null,
        entry_fee ?? null,
        category_id,
        type_id,
      ]
    );

    response.status(201).json({
      success: true,
      message: "Tourist spot created successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

export const updateTouristSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, province_id, municipality_id, barangay_id,
      latitude, longitude, contact_phone, contact_email, website,
      entry_fee, category_id, type_id,
    } = req.body;

    if (
      !name || !description || !province_id || !municipality_id ||
      !barangay_id || !contact_phone || !category_id || !type_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check existence and validity in parallel
    const [
      [spot], [cat], [type], [prov], [mun], [bar]
    ] = await Promise.all([
      db.execute("SELECT id FROM tourist_spots WHERE id = ?", [id]),
      db.execute("SELECT id FROM category WHERE id = ?", [category_id]),
  db.execute(`SELECT id FROM category WHERE id = ? AND type_id = ?`, [category_id, type_id]),
      db.execute("SELECT id FROM province WHERE id = ?", [province_id]),
      db.execute("SELECT id FROM municipality WHERE id = ? AND province_id = ?", [municipality_id, province_id]),
      db.execute("SELECT id FROM barangay WHERE id = ? AND municipality_id = ?", [barangay_id, municipality_id]),
    ]);

    if (!spot.length) return res.status(404).json({ success: false, message: "Tourist spot not found" });
    if (!cat.length) return res.status(400).json({ success: false, message: "Invalid category_id" });
    if (!type.length) return res.status(400).json({ success: false, message: "Invalid type_id" });
    if (!prov.length) return res.status(400).json({ success: false, message: "Invalid province_id" });
    if (!mun.length) return res.status(400).json({ success: false, message: "Invalid municipality_id for the selected province" });
    if (!bar.length) return res.status(400).json({ success: false, message: "Invalid barangay_id for the selected municipality" });

    await db.execute(
      `UPDATE tourist_spots SET
        name=?, description=?, province_id=?, municipality_id=?, barangay_id=?,
        latitude=?, longitude=?, contact_phone=?, contact_email=?, website=?,
        entry_fee=?, category_id=?, type_id=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?`,
      [
        name, description, province_id, municipality_id, barangay_id,
        latitude ?? null, longitude ?? null, contact_phone, contact_email ?? null,
        website ?? null, entry_fee ?? null, category_id, type_id, id,
      ]
    );

    res.json({ success: true, message: "Tourist spot updated successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
};

export const submitEditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, province_id, municipality_id, barangay_id,
      latitude, longitude, contact_phone, contact_email, website,
      entry_fee, category_id, type_id,
    } = req.body;

    if (
      !name || !description || !province_id || !municipality_id ||
      !barangay_id || !contact_phone || !category_id || !type_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check existence and validity in parallel
    const [
      [spot], [cat], [type], [prov], [mun], [bar]
    ] = await Promise.all([
      db.execute("SELECT id FROM tourist_spots WHERE id = ?", [id]),
      db.execute("SELECT id FROM category WHERE id = ?", [category_id]),
  db.execute(`SELECT id FROM category WHERE id = ? AND type_id = ?`, [category_id, type_id]),
      db.execute("SELECT id FROM province WHERE id = ?", [province_id]),
      db.execute("SELECT id FROM municipality WHERE id = ? AND province_id = ?", [municipality_id, province_id]),
      db.execute("SELECT id FROM barangay WHERE id = ? AND municipality_id = ?", [barangay_id, municipality_id]),
    ]);

    if (!spot.length) return res.status(404).json({ success: false, message: "Tourist spot not found" });
    if (!cat.length) return res.status(400).json({ success: false, message: "Invalid category_id" });
    if (!type.length) return res.status(400).json({ success: false, message: "Invalid type_id" });
    if (!prov.length) return res.status(400).json({ success: false, message: "Invalid province_id" });
    if (!mun.length) return res.status(400).json({ success: false, message: "Invalid municipality_id for the selected province" });
    if (!bar.length) return res.status(400).json({ success: false, message: "Invalid barangay_id for the selected municipality" });

    // Check for pending edit request
    const [pending] = await db.execute(
      "SELECT id FROM tourist_spot_edits WHERE tourist_spot_id = ? AND approval_status = 'pending'",
      [id]
    );
    if (pending.length)
      return res.status(400).json({
        success: false,
        message: "There is already a pending edit request for this tourist spot.",
      });

    await db.execute(
      `INSERT INTO tourist_spot_edits (
        tourist_spot_id, name, description, province_id, municipality_id, barangay_id,
        latitude, longitude, contact_phone, contact_email, website, entry_fee,
        spot_status, is_featured, category_id, type_id, approval_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, ?, ?, 'pending')`,
      [
        id, name, description, province_id, municipality_id, barangay_id,
        latitude ?? null, longitude ?? null, contact_phone, contact_email ?? null,
        website ?? null, entry_fee ?? null, category_id, type_id,
      ]
    );

    res.json({
      success: true,
      message: "Edit request submitted successfully and is pending admin approval",
    });
  } catch (error) {
    return handleDbError(error, res);
  }
};

// (Simplified) delete temporarily removed

// Get categories and types for tourist spots
export const getCategoriesAndTypes = async (request, response) => {
  try {
    const [types] = await db.execute(
      "SELECT * FROM type ORDER BY type ASC"
    );

    // types are linked via category.type_id -> type.id (schema swapped)
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
