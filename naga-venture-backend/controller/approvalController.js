import db from "../db.js";

// Generic function to get pending items for any content type
const getPendingItems = async (contentType, statusField = 'status') => {
  const tableMap = {
    'tourist_spots': {
      table: 'tourist_spots',
      statusField: 'spot_status',
      joins: `
        JOIN category c ON ts.category_id = c.id
        JOIN type t ON ts.type_id = t.id
        JOIN province p ON ts.province_id = p.id
        JOIN municipality m ON ts.municipality_id = m.id
        JOIN barangay b ON ts.barangay_id = b.id
      `,
      fields: `
        ts.id, ts.name, ts.description, ts.province_id, ts.municipality_id, ts.barangay_id,
        ts.latitude, ts.longitude, ts.contact_phone, ts.contact_email, ts.website, ts.entry_fee,
        ts.spot_status, ts.is_featured, c.category, t.type, ts.category_id, ts.type_id,
        ts.created_at, ts.updated_at, p.province, m.municipality, b.barangay
      `
    },
    'business': {
      table: 'business',
      statusField: 'business_status',
      joins: `
        JOIN category c ON b.category_id = c.id
        JOIN type t ON b.type_id = t.id
        JOIN province p ON b.province_id = p.id
        JOIN municipality m ON b.municipality_id = m.id
        JOIN barangay br ON b.barangay_id = br.id
      `,
      fields: `
        b.id, b.name, b.description, b.province_id, b.municipality_id, b.barangay_id,
        b.latitude, b.longitude, b.contact_phone, b.contact_email, b.website,
        b.business_status, b.is_featured, c.category, t.type, b.category_id, b.type_id,
        b.created_at, b.updated_at, p.province, m.municipality, br.barangay
      `
    },
    'events': {
      table: 'event',
      statusField: 'event_status',
      joins: `
        JOIN category c ON e.category_id = c.id
        JOIN type t ON e.type_id = t.id
        JOIN province p ON e.province_id = p.id
        JOIN municipality m ON e.municipality_id = m.id
        JOIN barangay br ON e.barangay_id = br.id
      `,
      fields: `
        e.id, e.name, e.description, e.province_id, e.municipality_id, e.barangay_id,
        e.latitude, e.longitude, e.contact_phone, e.contact_email, e.website,
        e.event_status, e.is_featured, c.category, t.type, e.category_id, e.type_id,
        e.created_at, e.updated_at, p.province, m.municipality, br.barangay
      `
    },
    'accommodations': {
      table: 'accommodation',
      statusField: 'accommodation_status',
      joins: `
        JOIN category c ON a.category_id = c.id
        JOIN type t ON a.type_id = t.id
        JOIN province p ON a.province_id = p.id
        JOIN municipality m ON a.municipality_id = m.id
        JOIN barangay br ON a.barangay_id = br.id
      `,
      fields: `
        a.id, a.name, a.description, a.province_id, a.municipality_id, a.barangay_id,
        a.latitude, a.longitude, a.contact_phone, a.contact_email, a.website,
        a.accommodation_status, a.is_featured, c.category, t.type, a.category_id, a.type_id,
        a.created_at, a.updated_at, p.province, m.municipality, br.barangay
      `
    }
  };

  const config = tableMap[contentType];
  if (!config) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  const alias = config.table.charAt(0);
  const query = `
    SELECT ${config.fields}
    FROM ${config.table} ${alias}
    ${config.joins}
    WHERE ${alias}.${config.statusField} = 'pending'
    ORDER BY ${alias}.created_at DESC
  `;

  return await db.execute(query);
};

// Generic function to approve items for any content type
const approveItem = async (contentType, id) => {
  const tableMap = {
    'tourist_spots': {
      table: 'tourist_spots',
      statusField: 'spot_status',
      alias: 'ts'
    },
    'business': {
      table: 'business',
      statusField: 'business_status',
      alias: 'b'
    },
    'events': {
      table: 'event',
      statusField: 'event_status',
      alias: 'e'
    },
    'accommodations': {
      table: 'accommodation',
      statusField: 'accommodation_status',
      alias: 'a'
    }
  };

  const config = tableMap[contentType];
  if (!config) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  // Check if item exists and is pending
  const [existingItem] = await db.execute(
    `SELECT id, ${config.statusField} FROM ${config.table} WHERE id = ?`,
    [id]
  );

  if (existingItem.length === 0) {
    throw new Error(`${contentType} not found`);
  }

  if (existingItem[0][config.statusField] !== 'pending') {
    throw new Error(`${contentType} is not pending approval`);
  }

  // Update status to active
  await db.execute(
    `UPDATE ${config.table} SET ${config.statusField} = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [id]
  );
};

// Get all pending items for a specific content type
export const getPendingItemsByType = async (req, res) => {
  try {
    const { contentType } = req.params;
    
    const [rows] = await getPendingItems(contentType);
    
    res.json({
      success: true,
      data: rows,
      message: `Pending ${contentType} retrieved successfully`,
    });
  } catch (error) {
    console.error(`Error fetching pending ${req.params.contentType}:`, error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all pending tourist spots (new submissions) - keeping for backward compatibility
export const getPendingTouristSpots = async (req, res) => {
  try {
    // Explicitly fetch only pending tourist spots with required joins
    const [rows] = await db.execute(`
      SELECT 
        ts.id, ts.name, ts.description, ts.province_id, ts.municipality_id, ts.barangay_id,
        ts.latitude, ts.longitude, ts.contact_phone, ts.contact_email, ts.website, ts.entry_fee,
        ts.spot_status, ts.is_featured, c.category, t.type, ts.category_id, ts.type_id,
        ts.created_at, ts.updated_at, p.province, m.municipality, b.barangay
      FROM tourist_spots ts
      JOIN category c ON ts.category_id = c.id
      JOIN type t ON ts.type_id = t.id
      JOIN province p ON ts.province_id = p.id
      JOIN municipality m ON ts.municipality_id = m.id
      JOIN barangay b ON ts.barangay_id = b.id
      WHERE ts.spot_status = 'pending'
      ORDER BY ts.created_at DESC
    `);

    res.json({
      success: true,
      data: rows,
      message: "Pending tourist spots retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching pending tourist spots:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all pending edit requests for tourist spots
export const getPendingEditRequests = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        tse.id,
        tse.tourist_spot_id,
        tse.name,
        tse.description,
        tse.province_id,
        tse.municipality_id,
        tse.barangay_id,
        tse.latitude,
        tse.longitude,
        tse.contact_phone,
        tse.contact_email,
        tse.website,
        tse.entry_fee,
        tse.spot_status,
        tse.is_featured,
        tse.category_id,
        tse.type_id,
        tse.approval_status,
        tse.submitted_at,
        tse.reviewed_at,
        c.category,
        t.type,
        p.province,
        m.municipality,
        b.barangay,
        ts.name as original_name,
        ts.spot_status as original_status
      FROM tourist_spot_edits tse
      JOIN category c ON tse.category_id = c.id
      JOIN type t ON tse.type_id = t.id
      JOIN province p ON tse.province_id = p.id
      JOIN municipality m ON tse.municipality_id = m.id
      JOIN barangay b ON tse.barangay_id = b.id
      JOIN tourist_spots ts ON tse.tourist_spot_id = ts.id
      WHERE tse.approval_status = 'pending'
      ORDER BY tse.submitted_at DESC
    `);

    res.json({
      success: true,
      data: rows,
      message: "Pending edit requests retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching pending edit requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Generic approve function for any content type
export const approveItemByType = async (req, res) => {
  try {
    const { contentType, id } = req.params;
    
    await approveItem(contentType, id);
    
    res.json({
      success: true,
      message: `${contentType} approved successfully`,
    });
  } catch (error) {
    console.error(`Error approving ${req.params.contentType}:`, error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve a tourist spot (change status from pending to active) - keeping for backward compatibility
export const approveTouristSpot = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if spot exists and is pending
    const [existingSpot] = await db.execute(
      "SELECT id, spot_status FROM tourist_spots WHERE id = ?",
      [id]
    );

    if (existingSpot.length === 0) {
      return res.status(404).json({
        success: false,
        message: "tourist_spots not found",
      });
    }

    if (existingSpot[0].spot_status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "tourist_spots is not pending approval",
      });
    }

    // Update status to active
    await db.execute(
      "UPDATE tourist_spots SET spot_status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Tourist spot approved successfully",
    });
  } catch (error) {
    console.error("Error approving tourist spot:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve an edit request for tourist spots
export const approveEditRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the edit request
    const [editRequest] = await db.execute(
      "SELECT * FROM tourist_spot_edits WHERE id = ? AND approval_status = 'pending'",
      [id]
    );

    if (editRequest.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Edit request not found or already processed",
      });
    }

    const edit = editRequest[0];

    // Update the main tourist_spots table with the edited data
    await db.execute(
      `
      UPDATE tourist_spots SET
        name = ?, description = ?, province_id = ?, municipality_id = ?, barangay_id = ?,
        latitude = ?, longitude = ?, contact_phone = ?, contact_email = ?, website = ?, 
        entry_fee = ?, spot_status = ?, is_featured = ?, category_id = ?, type_id = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        edit.name,
        edit.description,
        edit.province_id,
        edit.municipality_id,
        edit.barangay_id,
        edit.latitude,
        edit.longitude,
        edit.contact_phone,
        edit.contact_email,
        edit.website,
        edit.entry_fee,
        edit.spot_status,
        edit.is_featured,
        edit.category_id,
        edit.type_id,
        edit.tourist_spot_id,
      ]
    );

    // Mark the edit request as approved
    await db.execute(
      "UPDATE tourist_spot_edits SET approval_status = 'approved', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Edit request approved and applied successfully",
    });
  } catch (error) {
    console.error("Error approving edit request:", error);
    res.status(500).json({
      success: false,
      message: "Error approving edit request",
      error: error.message,
    });
  }
};

// Reject an edit request for tourist spots
export const rejectEditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if edit request exists and is pending
    const [editRequest] = await db.execute(
      "SELECT id FROM tourist_spot_edits WHERE id = ? AND approval_status = 'pending'",
      [id]
    );

    if (editRequest.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Edit request not found or already processed",
      });
    }

    // Mark the edit request as rejected
    await db.execute(
      "UPDATE tourist_spot_edits SET approval_status = 'rejected', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Edit request rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting edit request:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting edit request",
      error: error.message,
    });
  }
};

// Get approval statistics for all content types
export const getApprovalStats = async (req, res) => {
  try {
    // Get counts for each content type
    const [pendingSpots] = await db.execute(
      "SELECT COUNT(*) as count FROM tourist_spots WHERE spot_status = 'pending'"
    );

    const [pendingBusinesses] = await db.execute(
      "SELECT COUNT(*) as count FROM business WHERE business_status = 'pending'"
    );

    const [pendingEvents] = await db.execute(
      "SELECT COUNT(*) as count FROM event WHERE event_status = 'pending'"
    );

    const [pendingAccommodations] = await db.execute(
      "SELECT COUNT(*) as count FROM accommodation WHERE accommodation_status = 'pending'"
    );

    const [pendingEdits] = await db.execute(
      "SELECT COUNT(*) as count FROM tourist_spot_edits WHERE approval_status = 'pending'"
    );

    const [approvedEdits] = await db.execute(
      "SELECT COUNT(*) as count FROM tourist_spot_edits WHERE approval_status = 'approved'"
    );

    const [rejectedEdits] = await db.execute(
      "SELECT COUNT(*) as count FROM tourist_spot_edits WHERE approval_status = 'rejected'"
    );

    res.json({
      success: true,
      data: {
        pendingSpots: pendingSpots[0].count,
        pendingBusinesses: pendingBusinesses[0].count,
        pendingEvents: pendingEvents[0].count,
        pendingAccommodations: pendingAccommodations[0].count,
        pendingEdits: pendingEdits[0].count,
        approvedEdits: approvedEdits[0].count,
        rejectedEdits: rejectedEdits[0].count,
      },
      message: "Approval statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching approval statistics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
