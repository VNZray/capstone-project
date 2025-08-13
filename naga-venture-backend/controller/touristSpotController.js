import db from "../db.js";

// Get all tourist spots
export const getAllTouristSpots = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        ts.id,
        ts.name,
        ts.description,
        ts.province_id,
        ts.municipality_id,
        ts.barangay_id,
        ts.latitude,
        ts.longitude,
        ts.contact_phone,
        ts.contact_email,
        ts.website,
        ts.entry_fee,
        ts.spot_status,
        ts.is_featured,
        c.category,
        t.type,
        ts.category_id,
        ts.type_id,
        ts.created_at,
        ts.updated_at,
        p.province,
        m.municipality,
        b.barangay
      FROM tourist_spots ts
      JOIN category c ON ts.category_id = c.id
      JOIN type t ON ts.type_id = t.id
      JOIN province p ON ts.province_id = p.id
      JOIN municipality m ON ts.municipality_id = m.id
      JOIN barangay b ON ts.barangay_id = b.id
      WHERE ts.spot_status IN ('active', 'inactive')
      ORDER BY ts.name ASC
    `);

    res.json({
      success: true,
      data: rows,
      message: "Tourist spots retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching tourist spots:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get tourist spot by ID
export const getTouristSpotById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `
      SELECT 
        ts.id,
        ts.name,
        ts.description,
        ts.province_id,
        ts.municipality_id,
        ts.barangay_id,
        ts.latitude,
        ts.longitude,
        ts.contact_phone,
        ts.contact_email,
        ts.website,
        ts.entry_fee,
        ts.spot_status,
        ts.is_featured,
        c.category,
        t.type,
        ts.category_id,
        ts.type_id,
        ts.created_at,
        ts.updated_at,
        p.province,
        m.municipality,
        b.barangay
      FROM tourist_spots ts
      JOIN category c ON ts.category_id = c.id
      JOIN type t ON ts.type_id = t.id
      JOIN province p ON ts.province_id = p.id
      JOIN municipality m ON ts.municipality_id = m.id
      JOIN barangay b ON ts.barangay_id = b.id
      WHERE ts.id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tourist spot not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
      message: "Tourist spot retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching tourist spot:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Create new tourist spot
export const createTouristSpot = async (req, res) => {
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
    } = req.body;

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
      return res.status(400).json({
        success: false,
        message:
          "Name, description, province_id, municipality_id, barangay_id, contact_phone, category_id, and type_id are required",
      });
    }

    // Validate category_id exists
    const [categoryCheck] = await db.execute(
      "SELECT id FROM category WHERE id = ?",
      [category_id]
    );
    if (categoryCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category_id",
      });
    }

    // Validate type_id exists
    const [typeCheck] = await db.execute("SELECT id FROM type WHERE id = ?", [
      type_id,
    ]);
    if (typeCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid type_id",
      });
    }

    // Validate location hierarchy
    const [provinceCheck] = await db.execute(
      "SELECT id FROM province WHERE id = ?",
      [province_id]
    );
    if (provinceCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid province_id",
      });
    }

    const [municipalityCheck] = await db.execute(
      "SELECT id FROM municipality WHERE id = ? AND province_id = ?",
      [municipality_id, province_id]
    );
    if (municipalityCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid municipality_id for the selected province",
      });
    }

    const [barangayCheck] = await db.execute(
      "SELECT id FROM barangay WHERE id = ? AND municipality_id = ?",
      [barangay_id, municipality_id]
    );
    if (barangayCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid barangay_id for the selected municipality",
      });
    }

    // Insert into DB (let DB handle the id)
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
        latitude || null,
        longitude || null,
        contact_phone,
        contact_email || null,
        website || null,
        entry_fee || null,
        category_id,
        type_id,
      ]
    );

    // Just return success, no need to return the inserted row
    res.status(201).json({
      success: true,
      message: "Tourist spot created successfully"
    });

  } catch (error) {
    console.error("Error creating tourist spot:", error);
    res.status(500).json({
      success: false,
      message: "Error creating tourist spot",
      error: error.message
    });
  }
};

// Update existing tourist spot
export const updateTouristSpot = async (req, res) => {
  try {
    const { id } = req.params;
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
    } = req.body;

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
      return res.status(400).json({
        success: false,
        message:
          "Name, description, province_id, municipality_id, barangay_id, contact_phone, category_id, and type_id are required",
      });
    }

    // Check if tourist spot exists
    const [existingSpot] = await db.execute(
      "SELECT id FROM tourist_spots WHERE id = ?",
      [id]
    );
    if (existingSpot.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tourist spot not found",
      });
    }

    // Validate category_id exists
    const [categoryCheck] = await db.execute(
      "SELECT id FROM category WHERE id = ?",
      [category_id]
    );
    if (categoryCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category_id",
      });
    }

    // Validate type_id exists
    const [typeCheck] = await db.execute("SELECT id FROM type WHERE id = ?", [
      type_id,
    ]);
    if (typeCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid type_id",
      });
    }

    // Validate location hierarchy
    const [provinceCheck] = await db.execute(
      "SELECT id FROM province WHERE id = ?",
      [province_id]
    );
    if (provinceCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid province_id",
      });
    }

    const [municipalityCheck] = await db.execute(
      "SELECT id FROM municipality WHERE id = ? AND province_id = ?",
      [municipality_id, province_id]
    );
    if (municipalityCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid municipality_id for the selected province",
      });
    }

    const [barangayCheck] = await db.execute(
      "SELECT id FROM barangay WHERE id = ? AND municipality_id = ?",
      [barangay_id, municipality_id]
    );
    if (barangayCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid barangay_id for the selected municipality",
      });
    }

    // Update the tourist spot
    await db.execute(
      `
      UPDATE tourist_spots SET
        name = ?, description = ?, province_id = ?, municipality_id = ?, barangay_id = ?,
        latitude = ?, longitude = ?, contact_phone = ?, contact_email = ?, website = ?, 
        entry_fee = ?, category_id = ?, type_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        name,
        description,
        province_id,
        municipality_id,
        barangay_id,
        latitude || null,
        longitude || null,
        contact_phone,
        contact_email || null,
        website || null,
        entry_fee || null,
        category_id,
        type_id,
        id,
      ]
    );

    res.json({
      success: true,
      message: "Tourist spot updated successfully"
    });

  } catch (error) {
    console.error("Error updating tourist spot:", error);
    res.status(500).json({
      success: false,
      message: "Error updating tourist spot",
      error: error.message
    });
  }
};

// Submit an edit request for a tourist spot
export const submitEditRequest = async (req, res) => {
  try {
    const { id } = req.params;
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
    } = req.body;

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
      return res.status(400).json({
        success: false,
        message:
          "Name, description, province_id, municipality_id, barangay_id, contact_phone, category_id, and type_id are required",
      });
    }

    // Check if tourist spot exists
    const [existingSpot] = await db.execute(
      "SELECT id FROM tourist_spots WHERE id = ?",
      [id]
    );
    if (existingSpot.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tourist spot not found",
      });
    }

    // Validate category_id exists
    const [categoryCheck] = await db.execute(
      "SELECT id FROM category WHERE id = ?",
      [category_id]
    );
    if (categoryCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category_id",
      });
    }

    // Validate type_id exists
    const [typeCheck] = await db.execute("SELECT id FROM type WHERE id = ?", [
      type_id,
    ]);
    if (typeCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid type_id",
      });
    }

    // Validate location hierarchy
    const [provinceCheck] = await db.execute(
      "SELECT id FROM province WHERE id = ?",
      [province_id]
    );
    if (provinceCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid province_id",
      });
    }

    const [municipalityCheck] = await db.execute(
      "SELECT id FROM municipality WHERE id = ? AND province_id = ?",
      [municipality_id, province_id]
    );
    if (municipalityCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid municipality_id for the selected province",
      });
    }

    const [barangayCheck] = await db.execute(
      "SELECT id FROM barangay WHERE id = ? AND municipality_id = ?",
      [barangay_id, municipality_id]
    );
    if (barangayCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid barangay_id for the selected municipality",
      });
    }

    // Check if there's already a pending edit request for this spot
    const [existingEdit] = await db.execute(
      "SELECT id FROM tourist_spot_edits WHERE tourist_spot_id = ? AND approval_status = 'pending'",
      [id]
    );

    if (existingEdit.length > 0) {
      return res.status(400).json({
        success: false,
        message: "There is already a pending edit request for this tourist spot. Please wait for the current request to be processed.",
      });
    }

    // Insert the edit request into tourist_spot_edits table
    await db.execute(
      `
      INSERT INTO tourist_spot_edits (
        tourist_spot_id, name, description, province_id, municipality_id, barangay_id,
        latitude, longitude, contact_phone, contact_email, website, entry_fee, 
        spot_status, is_featured, category_id, type_id, approval_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, ?, ?, 'pending')
    `,
      [
        id,
        name,
        description,
        province_id,
        municipality_id,
        barangay_id,
        latitude || null,
        longitude || null,
        contact_phone,
        contact_email || null,
        website || null,
        entry_fee || null,
        category_id,
        type_id,
      ]
    );

    res.json({
      success: true,
      message: "Edit request submitted successfully and is pending admin approval"
    });

  } catch (error) {
    console.error("Error submitting edit request:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting edit request",
      error: error.message
    });
  }
};

// (Simplified) delete temporarily removed

// Get categories and types for tourist spots
export const getCategoriesAndTypes = async (req, res) => {
  try {
    // Get all categories (shop, accommodation, tourist spot, events)
    const [categories] = await db.execute(
      "SELECT * FROM category ORDER BY category ASC"
    );

    const [types] = await db.execute(
      "SELECT * FROM type WHERE category_id = 3 ORDER BY type ASC"
    );

    res.json({
      success: true,
      data: {
        categories,
        types,
      },
      message: "Categories and types retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching categories and types:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getLocationData = async (req, res) => {
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

    res.json({
      success: true,
      data: {
        provinces,
        municipalities,
        barangays,
      },
      message: "Location data retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching location data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get municipalities by province
export const getMunicipalitiesByProvince = async (req, res) => {
  try {
    const { province_id } = req.params;

    const [municipalities] = await db.execute(
      "SELECT * FROM municipality WHERE province_id = ? ORDER BY municipality ASC",
      [province_id]
    );

    res.json({
      success: true,
      data: municipalities,
      message: "Municipalities retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching municipalities:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get barangays by municipality
export const getBarangaysByMunicipality = async (req, res) => {
  try {
    const { municipality_id } = req.params;

    const [barangays] = await db.execute(
      "SELECT * FROM barangay WHERE municipality_id = ? ORDER BY barangay ASC",
      [municipality_id]
    );

    res.json({
      success: true,
      data: barangays,
      message: "Barangays retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching barangays:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
