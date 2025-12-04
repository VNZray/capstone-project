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

    const businessResult = result[0][0];

    // If category_ids provided, add them via entity_categories
    if (req.body.category_ids && Array.isArray(req.body.category_ids)) {
      for (const categoryId of req.body.category_ids) {
        await db.query(
          "CALL AddEntityCategory(?, ?, ?, ?, ?)",
          [id, 'business', categoryId, 1, categoryId === req.body.primary_category_id]
        );
      }
    }

    res.status(201).json({
      message: "Business created successfully",
      ...businessResult,
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

    // If category_ids provided, update entity_categories
    if (req.body.category_ids && Array.isArray(req.body.category_ids)) {
      // Remove existing categories for this business
      await db.query(
        "DELETE FROM entity_categories WHERE entity_id = ? AND entity_type = 'business'",
        [id]
      );

      // Add new categories
      for (const categoryId of req.body.category_ids) {
        await db.query(
          "CALL AddEntityCategory(?, ?, ?, ?, ?)",
          [id, 'business', categoryId, 1, categoryId === req.body.primary_category_id]
        );
      }
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
    // Return empty array if no data found, instead of 404
    const result = data?.[0] || [];
    res.json(result);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get business hours by business ID
export async function getBusinessHoursByBusinessId(req, res) {
  const { businessId } = req.params;

  if (!businessId) {
    return res.status(400).json({ message: "Business ID is required" });
  }

  try {
    const [data] = await db.query("CALL GetBusinessHoursByBusinessId(?)", [businessId]);
    const result = data?.[0] || [];

    // Return empty array if no hours found (valid state - business has no hours configured)
    res.json(result);
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

    // If status is being updated to "Approved", send email notification
    if (req.body.status === "Approved" && req.body.business_id) {
      try {
        // Get business details
        const [businessData] = await db.query("CALL GetBusinessById(?)", [req.body.business_id]);
        const business = businessData[0]?.[0];

        if (business && business.owner_id) {
          // Get owner details
          const [ownerData] = await db.query("CALL GetOwnerById(?)", [business.owner_id]);
          const owner = ownerData[0]?.[0];

          if (owner && owner.user_id) {
            // Get user details (for email)
            const [userData] = await db.query("CALL GetUserById(?)", [owner.user_id]);
            const user = userData[0]?.[0];

            if (user && user.email) {
              // Import and send email notification
              const { sendBusinessApprovalEmail } = await import("../utils/emailService.js");

              await sendBusinessApprovalEmail(
                user.email,
                `${owner.first_name} ${owner.last_name}`,
                business.business_name,
                user.email // Send email as username
              );

              console.log(`✅ Sent approval email to: ${user.email}`);
            }
          }
        }
      } catch (emailError) {
        // Log error but don't fail the registration update
        console.error("⚠️ Failed to send approval email:", emailError);
      }
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
