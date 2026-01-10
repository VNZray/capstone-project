/**
 * Emergency Facility Controller
 * Handles CRUD operations for emergency facilities (police, hospitals, fire stations, evacuation centers)
 */

import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

// Get all emergency facilities
export async function getAllEmergencyFacilities(req, res) {
  try {
    const [data] = await db.query("CALL GetAllEmergencyFacilities()");
    res.json(data[0] || []);
  } catch (error) {
    console.error("Error fetching emergency facilities:", error);
    return handleDbError(error, res);
  }
}

// Get all active emergency facilities (for public/mobile display)
export async function getActiveEmergencyFacilities(req, res) {
  try {
    const [data] = await db.query("CALL GetActiveEmergencyFacilities()");
    res.json(data[0] || []);
  } catch (error) {
    console.error("Error fetching active emergency facilities:", error);
    return handleDbError(error, res);
  }
}

// Get emergency facility by ID
export async function getEmergencyFacilityById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetEmergencyFacilityById(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "Emergency facility not found" });
    }
    res.json(data[0][0]);
  } catch (error) {
    console.error("Error fetching emergency facility by ID:", error);
    return handleDbError(error, res);
  }
}

// Get emergency facilities by type
export async function getEmergencyFacilitiesByType(req, res) {
  const { type } = req.params;
  const validTypes = ['police_station', 'hospital', 'fire_station', 'evacuation_center'];

  if (!validTypes.includes(type)) {
    return res.status(400).json({
      message: "Invalid facility type",
      validTypes
    });
  }

  try {
    const [data] = await db.query("CALL GetEmergencyFacilitiesByType(?)", [type]);
    res.json(data[0] || []);
  } catch (error) {
    console.error("Error fetching emergency facilities by type:", error);
    return handleDbError(error, res);
  }
}

// Get emergency facilities by barangay
export async function getEmergencyFacilitiesByBarangay(req, res) {
  const { barangayId } = req.params;
  try {
    const [data] = await db.query("CALL GetEmergencyFacilitiesByBarangay(?)", [barangayId]);
    res.json(data[0] || []);
  } catch (error) {
    console.error("Error fetching emergency facilities by barangay:", error);
    return handleDbError(error, res);
  }
}

// Create emergency facility
export async function createEmergencyFacility(req, res) {
  try {
    const {
      name,
      description,
      facility_type,
      barangay_id,
      address,
      latitude,
      longitude,
      contact_phone,
      contact_email,
      emergency_hotline,
      operating_hours,
      facility_image,
      status = 'active',
      capacity,
      services_offered
    } = req.body;

    // Validation
    if (!name || !facility_type || !barangay_id) {
      return res.status(400).json({
        message: "Name, facility_type, and barangay_id are required"
      });
    }

    const validTypes = ['police_station', 'hospital', 'fire_station', 'evacuation_center'];
    if (!validTypes.includes(facility_type)) {
      return res.status(400).json({
        message: "Invalid facility type",
        validTypes
      });
    }

    const id = uuidv4();

    const [data] = await db.query(
      "CALL InsertEmergencyFacility(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        name,
        description || null,
        facility_type,
        barangay_id,
        address || null,
        latitude || null,
        longitude || null,
        contact_phone || null,
        contact_email || null,
        emergency_hotline || null,
        operating_hours || null,
        facility_image || null,
        status,
        capacity || null,
        services_offered || null
      ]
    );

    res.status(201).json({
      message: "Emergency facility created successfully",
      data: data[0][0]
    });
  } catch (error) {
    console.error("Error creating emergency facility:", error);
    return handleDbError(error, res);
  }
}

// Update emergency facility
export async function updateEmergencyFacility(req, res) {
  const { id } = req.params;
  try {
    const {
      name,
      description,
      facility_type,
      barangay_id,
      address,
      latitude,
      longitude,
      contact_phone,
      contact_email,
      emergency_hotline,
      operating_hours,
      facility_image,
      status,
      capacity,
      services_offered
    } = req.body;

    if (facility_type) {
      const validTypes = ['police_station', 'hospital', 'fire_station', 'evacuation_center'];
      if (!validTypes.includes(facility_type)) {
        return res.status(400).json({
          message: "Invalid facility type",
          validTypes
        });
      }
    }

    const [data] = await db.query(
      "CALL UpdateEmergencyFacility(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        name || null,
        description || null,
        facility_type || null,
        barangay_id || null,
        address || null,
        latitude || null,
        longitude || null,
        contact_phone || null,
        contact_email || null,
        emergency_hotline || null,
        operating_hours || null,
        facility_image || null,
        status || null,
        capacity || null,
        services_offered || null
      ]
    );

    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "Emergency facility not found" });
    }

    res.json({
      message: "Emergency facility updated successfully",
      data: data[0][0]
    });
  } catch (error) {
    console.error("Error updating emergency facility:", error);
    return handleDbError(error, res);
  }
}

// Delete emergency facility
export async function deleteEmergencyFacility(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL DeleteEmergencyFacility(?)", [id]);

    if (data[0][0].affected_rows === 0) {
      return res.status(404).json({ message: "Emergency facility not found" });
    }

    res.json({ message: "Emergency facility deleted successfully" });
  } catch (error) {
    console.error("Error deleting emergency facility:", error);
    return handleDbError(error, res);
  }
}

// Update emergency facility status
export async function updateEmergencyFacilityStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['active', 'inactive', 'under_maintenance'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status",
      validStatuses
    });
  }

  try {
    const [data] = await db.query("CALL UpdateEmergencyFacilityStatus(?, ?)", [id, status]);

    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "Emergency facility not found" });
    }

    res.json({
      message: "Emergency facility status updated successfully",
      data: data[0][0]
    });
  } catch (error) {
    console.error("Error updating emergency facility status:", error);
    return handleDbError(error, res);
  }
}

// Get nearby emergency facilities
export async function getNearbyEmergencyFacilities(req, res) {
  const { latitude, longitude, radius = 10, type } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      message: "Latitude and longitude are required"
    });
  }

  try {
    const [data] = await db.query(
      "CALL GetNearbyEmergencyFacilities(?, ?, ?, ?)",
      [
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius),
        type || null
      ]
    );
    res.json(data[0] || []);
  } catch (error) {
    console.error("Error fetching nearby emergency facilities:", error);
    return handleDbError(error, res);
  }
}
