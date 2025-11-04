import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

// ==================== BUSINESS ====================

// Get all businesses
export async function getAllBusiness(req, res) {
  try {
    const [data] = await db.query("CALL GetAllBusiness()");
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get business by owner ID
export async function getBusinessByOwnerId(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetBusinessByOwnerId(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get business by ID
export async function getBusinessId(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetBusinessById(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Insert a new business
export async function insertBusiness(req, res) {
  try {
    const id = uuidv4();

    const params = [
      id,
      req.body.business_name ?? null,
      req.body.description ?? null,
      req.body.min_price ?? null,
      req.body.max_price ?? null,
      req.body.email ?? null,
      req.body.phone_number ?? null,
      req.body.business_category_id ?? null,
      req.body.business_type_id ?? null,
      req.body.barangay_id ?? null,
      req.body.address ?? null,
      req.body.owner_id ?? null,
      req.body.status ?? null,
      req.body.business_image ?? null,
      req.body.latitude ?? null,
      req.body.longitude ?? null,
      req.body.website_url ?? null,
      req.body.facebook_url ?? null,
      req.body.instagram_url ?? null,
      req.body.hasBooking ?? null,
    ];

    // Dynamically build placeholders: "?,?,?,..."
    const placeholders = params.map(() => "?").join(",");

    const [result] = await db.query(
      `CALL InsertBusiness(${placeholders})`,
      params
    );

    res.status(201).json({
      message: "Business created successfully",
      ...result[0][0], // first row of the SELECT inside procedure
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update business
export async function updateBusiness(req, res) {
  const { id } = req.params;
  try {
    const params = [
      id,
      req.body.business_name ?? null,
      req.body.description ?? null,
      req.body.min_price ?? null,
      req.body.max_price ?? null,
      req.body.email ?? null,
      req.body.phone_number ?? null,
      req.body.business_category_id ?? null,
      req.body.business_type_id ?? null,
      req.body.barangay_id ?? null,
      req.body.address ?? null,
      req.body.owner_id ?? null,
      req.body.status ?? null,
      req.body.business_image ?? null,
      req.body.latitude ?? null,
      req.body.longitude ?? null,
      req.body.website_url ?? null,
      req.body.facebook_url ?? null,
      req.body.instagram_url ?? null,
      req.body.hasBooking ?? null,
    ];

    const placeholders = params.map(() => "?").join(",");

    const [result] = await db.query(
      `CALL UpdateBusiness(${placeholders})`,
      params
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json({
      message: "Business updated successfully",
      ...result[0][0],
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete business
export async function deleteBusiness(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL DeleteBusiness(?)", [id]);
    if (data.affectedRows === 0) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json({ message: "Business deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== BUSINESS HOURS ====================

// Insert business hours
export async function insertBusinessHours(req, res) {
  try {
    const {
      business_id,
      day_of_week,
      open_time,
      close_time,
      is_open,
    } = req.body;

    await db.query("CALL InsertBusinessHours(?,?,?,?,?)", [
      business_id,
      day_of_week,
      open_time,
      close_time,
      is_open,
    ]);

    res.status(201).json({ message: "Business hours inserted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get business hours
export async function getBusinessHours(req, res) {
  try {
    const [data] = await db.query("CALL GetAllBusinessHours()");
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update business hours
export async function updateBusinessHours(req, res) {
  try {
    const { id } = req.params;
    const { open_time, close_time, is_open } = req.body;

    await db.query("CALL UpdateBusinessHours(?,?,?,?)", [
      id,
      open_time,
      close_time,
      is_open,
    ]);

    res.json({ message: "Business hours updated successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== BUSINESS REGISTRATION ====================

// Get all business registrations
export async function getAllBusinessRegistrations(req, res) {
  try {
    const [data] = await db.query("CALL GetBusinessRegistrations()");
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Register a new business
export async function registerBusiness(req, res) {
  try {
    const params = [
      req.body.id || uuidv4(),
      req.body.message || null,
      req.body.status || "Pending",
      req.body.business_id || null,
      req.body.tourism_id || null, // Convert empty string to null
    ];

    const placeholders = params.map(() => "?").join(",");

    const [result] = await db.query(
      `CALL RegisterBusiness(${placeholders})`,
      params
    );

    res.status(201).json({
      message: "Business registration has been submitted",
      ...result[0][0], // first row of the SELECT inside procedure
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get business registration by ID
export async function getBusinessRegistrationById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetBusinessRegistrationById(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return res
        .status(404)
        .json({ message: "Business registration not found" });
    }
    res.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update business registration
export async function updateBusinessRegistration(req, res) {
  const { id } = req.params;
  try {
    const params = [
      id,
      req.body.message || null,
      req.body.status || null,
      req.body.approved_at || null,
      req.body.business_id || null,
      req.body.tourism_id || null,
    ];
    const placeholders = params.map(() => "?").join(",");
    const [result] = await db.query(
      `CALL UpdateBusinessRegistration(${placeholders})`,
      params
    );
    if (!result[0] || result[0].length === 0) {
      return res
        .status(404)
        .json({ message: "Business registration not found" });
    }
    res.json({
      message: "Business registration updated successfully",
      ...result[0][0],
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete business registration
export async function deleteBusinessRegistration(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL DeleteBusinessRegistration(?)", [id]);
    if (data.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Business registration not found" });
    }
    res.json({ message: "Business registration deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}
