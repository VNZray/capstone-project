import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

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
      ORDER BY ts.name ASC
    `);

    res.json({
      success: true,
      data: rows,
      message: 'Tourist spots retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching tourist spots:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get tourist spot by ID
export const getTouristSpotById = async (req, res) => {
  try {
    const { id } = req.params;
    
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
      WHERE ts.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tourist spot not found'
      });
    }

    res.json({
      success: true,
      data: rows[0],
      message: 'Tourist spot retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching tourist spot:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
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
      type_id 
    } = req.body;

    // Validate required fields
    if (!name || !description || !province_id || !municipality_id || !barangay_id || 
        !latitude || !longitude || !contact_phone || !contact_email || !category_id || !type_id) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, province_id, municipality_id, barangay_id, latitude, longitude, contact_phone, contact_email, category_id, and type_id are required'
      });
    }

    // Validate category_id exists
    const [categoryCheck] = await db.execute('SELECT id FROM category WHERE id = ?', [category_id]);
    if (categoryCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category_id'
      });
    }

    // Validate type_id exists
    const [typeCheck] = await db.execute('SELECT id FROM type WHERE id = ?', [type_id]);
    if (typeCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type_id'
      });
    }

    // Validate location hierarchy
    const [provinceCheck] = await db.execute('SELECT id FROM province WHERE id = ?', [province_id]);
    if (provinceCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid province_id'
      });
    }

    const [municipalityCheck] = await db.execute('SELECT id FROM municipality WHERE id = ? AND province_id = ?', [municipality_id, province_id]);
    if (municipalityCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid municipality_id for the selected province'
      });
    }

    const [barangayCheck] = await db.execute('SELECT id FROM barangay WHERE id = ? AND municipality_id = ?', [barangay_id, municipality_id]);
    if (barangayCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid barangay_id for the selected municipality'
      });
    }

    // Generate UUID for the new tourist spot
    const id = uuidv4();

    await db.execute(`
      INSERT INTO tourist_spots (
        id, name, description, province_id, municipality_id, barangay_id,
        latitude, longitude, contact_phone, contact_email, website, entry_fee, 
        category_id, type_id, spot_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      id, name, description, province_id, municipality_id, barangay_id,
      latitude, longitude, contact_phone, contact_email, website || null, entry_fee || null,
      category_id, type_id
    ]);

    const [newSpot] = await db.execute(`
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
    `, [id]);

    res.status(201).json({
      success: true,
      data: newSpot[0],
      message: 'Tourist spot created successfully'
    });
  } catch (error) {
    console.error('Error creating tourist spot:', error, req.body);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update tourist spot
export const updateTouristSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, description, province_id, municipality_id, barangay_id, latitude, longitude, 
      contact_phone, contact_email, website, entry_fee, 
      spot_status, is_featured, category_id, type_id 
    } = req.body;

    // Check if tourist spot exists
    const [existingSpot] = await db.execute('SELECT id FROM tourist_spots WHERE id = ?', [id]);
    if (existingSpot.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tourist spot not found'
      });
    }

    // Validate category_id if provided
    if (category_id) {
      const [categoryCheck] = await db.execute('SELECT id FROM category WHERE id = ?', [category_id]);
      if (categoryCheck.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category_id'
        });
      }
    }

    // Validate type_id if provided
    if (type_id) {
      const [typeCheck] = await db.execute('SELECT id FROM type WHERE id = ?', [type_id]);
      if (typeCheck.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid type_id'
        });
      }
    }

    // Validate location hierarchy if provided
    if (province_id) {
      const [provinceCheck] = await db.execute('SELECT id FROM province WHERE id = ?', [province_id]);
      if (provinceCheck.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid province_id'
        });
      }
    }

    if (municipality_id && province_id) {
      const [municipalityCheck] = await db.execute('SELECT id FROM municipality WHERE id = ? AND province_id = ?', [municipality_id, province_id]);
      if (municipalityCheck.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid municipality_id for the selected province'
        });
      }
    }

    if (barangay_id && municipality_id) {
      const [barangayCheck] = await db.execute('SELECT id FROM barangay WHERE id = ? AND municipality_id = ?', [barangay_id, municipality_id]);
      if (barangayCheck.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid barangay_id for the selected municipality'
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (province_id !== undefined) {
      updateFields.push('province_id = ?');
      updateValues.push(province_id);
    }
    if (municipality_id !== undefined) {
      updateFields.push('municipality_id = ?');
      updateValues.push(municipality_id);
    }
    if (barangay_id !== undefined) {
      updateFields.push('barangay_id = ?');
      updateValues.push(barangay_id);
    }
    if (latitude !== undefined) {
      updateFields.push('latitude = ?');
      updateValues.push(latitude);
    }
    if (longitude !== undefined) {
      updateFields.push('longitude = ?');
      updateValues.push(longitude);
    }
    if (contact_phone !== undefined) {
      updateFields.push('contact_phone = ?');
      updateValues.push(contact_phone);
    }
    if (contact_email !== undefined) {
      updateFields.push('contact_email = ?');
      updateValues.push(contact_email);
    }
    if (website !== undefined) {
      updateFields.push('website = ?');
      updateValues.push(website);
    }
    if (entry_fee !== undefined) {
      updateFields.push('entry_fee = ?');
      updateValues.push(entry_fee);
    }
    if (spot_status !== undefined) {
      updateFields.push('spot_status = ?');
      updateValues.push(spot_status);
    }
    if (is_featured !== undefined) {
      updateFields.push('is_featured = ?');
      updateValues.push(is_featured);
    }
    if (category_id !== undefined) {
      updateFields.push('category_id = ?');
      updateValues.push(category_id);
    }
    if (type_id !== undefined) {
      updateFields.push('type_id = ?');
      updateValues.push(type_id);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id);

    await db.execute(`
      UPDATE tourist_spots 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    // Get updated tourist spot
    const [updatedSpot] = await db.execute(`
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
    `, [id]);

    res.json({
      success: true,
      data: updatedSpot[0],
      message: 'Tourist spot updated successfully'
    });
  } catch (error) {
    console.error('Error updating tourist spot:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete tourist spot
export const deleteTouristSpot = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tourist spot exists
    const [existingSpot] = await db.execute('SELECT id FROM tourist_spots WHERE id = ?', [id]);
    if (existingSpot.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tourist spot not found'
      });
    }

    await db.execute('DELETE FROM tourist_spots WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Tourist spot deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tourist spot:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get categories and types for tourist spots
export const getCategoriesAndTypes = async (req, res) => {
  try {
    // Get all categories (shop, accommodation, tourist spot, events)
    const [categories] = await db.execute('SELECT * FROM category ORDER BY category ASC');
    
    // Get types specifically for tourist spots (category_id = 3 for Tourist Spot)
    // These are the sub-categories that will be used in the category filters
    const [types] = await db.execute('SELECT * FROM type WHERE category_id = 3 ORDER BY type ASC');

    res.json({
      success: true,
      data: {
        categories,
        types
      },
      message: 'Categories and types retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching categories and types:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get location data for tourist spots
export const getLocationData = async (req, res) => {
  try {
    // Get all provinces
    const [provinces] = await db.execute('SELECT * FROM province ORDER BY province ASC');
    
    // Get all municipalities
    const [municipalities] = await db.execute('SELECT * FROM municipality ORDER BY municipality ASC');
    
    // Get all barangays
    const [barangays] = await db.execute('SELECT * FROM barangay ORDER BY barangay ASC');

    res.json({
      success: true,
      data: {
        provinces,
        municipalities,
        barangays
      },
      message: 'Location data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching location data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get municipalities by province
export const getMunicipalitiesByProvince = async (req, res) => {
  try {
    const { province_id } = req.params;
    
    const [municipalities] = await db.execute(
      'SELECT * FROM municipality WHERE province_id = ? ORDER BY municipality ASC',
      [province_id]
    );

    res.json({
      success: true,
      data: municipalities,
      message: 'Municipalities retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get barangays by municipality
export const getBarangaysByMunicipality = async (req, res) => {
  try {
    const { municipality_id } = req.params;
    
    const [barangays] = await db.execute(
      'SELECT * FROM barangay WHERE municipality_id = ? ORDER BY barangay ASC',
      [municipality_id]
    );

    res.json({
      success: true,
      data: barangays,
      message: 'Barangays retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching barangays:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
