import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// ==================== SERVICE INQUIRIES ====================

// Get all service inquiries (admin)
export async function getAllServiceInquiries(req, res) {
  try {
    const [data] = await db.query("CALL GetAllServiceInquiries()");
    res.json(data[0] || []);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get service inquiries by business
export async function getServiceInquiriesByBusiness(req, res) {
  const { businessId } = req.params;
  
  try {
    const [data] = await db.query("CALL GetServiceInquiriesByBusiness(?)", [businessId]);
    res.json(data[0] || []);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get service inquiries by service
export async function getServiceInquiriesByService(req, res) {
  const { serviceId } = req.params;
  
  try {
    const [data] = await db.query("CALL GetServiceInquiriesByService(?)", [serviceId]);
    res.json(data[0] || []);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get service inquiries by user/tourist
export async function getServiceInquiriesByUser(req, res) {
  const { userId, guestId } = req.query;
  
  try {
    const [data] = await db.query(
      "CALL GetServiceInquiriesByUser(?, ?)", 
      [userId || null, guestId || null]
    );
    res.json(data[0] || []);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get single inquiry by ID
export async function getServiceInquiryById(req, res) {
  const { id } = req.params;
  
  try {
    const [data] = await db.query("CALL GetServiceInquiryById(?)", [id]);
    
    if (!data || data[0].length === 0) {
      return res.status(404).json({ error: "Service inquiry not found" });
    }
    
    res.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Create new inquiry
export async function createServiceInquiry(req, res) {
  try {
    const {
      service_id,
      business_id,
      user_id,
      guest_id,
      message,
      number_of_people = 1,
      preferred_date,
      contact_method
    } = req.body;

    // Validate: must have either user_id or guest_id
    if (!user_id && !guest_id) {
      return res.status(400).json({ 
        error: "Either user_id or guest_id is required" 
      });
    }

    // Generate inquiry number
    const inquiry_number = `INQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const [data] = await db.query(
      "CALL InsertServiceInquiry(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        service_id,
        business_id,
        user_id || null,
        guest_id || null,
        inquiry_number,
        message || null,
        number_of_people,
        preferred_date || null,
        contact_method || null
      ]
    );

    res.status(201).json({
      message: "Service inquiry created successfully",
      inquiry_number,
      inquiry_id: data[0][0]?.inquiry_id
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update inquiry status
export async function updateServiceInquiryStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ["new", "contacted", "converted", "archived"];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
    });
  }
  
  try {
    const [data] = await db.query(
      "CALL UpdateServiceInquiryStatus(?, ?)", 
      [id, status]
    );
    
    res.json({
      message: "Inquiry status updated successfully",
      data: data[0][0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Mark inquiry as viewed by merchant
export async function markServiceInquiryViewed(req, res) {
  const { id } = req.params;
  
  try {
    const [data] = await db.query("CALL MarkServiceInquiryViewed(?)", [id]);
    
    res.json({
      message: "Inquiry marked as viewed",
      data: data[0][0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update merchant notes
export async function updateServiceInquiryNotes(req, res) {
  const { id } = req.params;
  const { notes } = req.body;
  
  try {
    const [data] = await db.query(
      "CALL UpdateServiceInquiryNotes(?, ?)", 
      [id, notes || null]
    );
    
    res.json({
      message: "Inquiry notes updated successfully",
      data: data[0][0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get inquiry statistics for a business
export async function getServiceInquiryStats(req, res) {
  const { businessId } = req.params;
  
  try {
    const [data] = await db.query(
      "CALL GetServiceInquiryStatsByBusiness(?)", 
      [businessId]
    );
    
    res.json(data[0][0] || {
      total_inquiries: 0,
      new_inquiries: 0,
      contacted_inquiries: 0,
      converted_inquiries: 0,
      unviewed_inquiries: 0,
      today_inquiries: 0,
      this_week_inquiries: 0,
      this_month_inquiries: 0
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get popular services by inquiry count
export async function getPopularServicesByInquiries(req, res) {
  const { businessId } = req.params;
  
  try {
    const [data] = await db.query(
      "CALL GetPopularServicesByInquiries(?)", 
      [businessId]
    );
    
    res.json(data[0] || []);
  } catch (error) {
    return handleDbError(error, res);
  }
}
