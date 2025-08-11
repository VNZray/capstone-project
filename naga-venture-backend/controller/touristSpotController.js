import db from '../db.js';

// Get all tourist spots
export const getAllTouristSpots = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        ts.id,
        ts.name,
        ts.description,
        ts.opening_hour,
        ts.closing_hour,
        c.category,
        t.type,
        ts.category_id,
        ts.type_id
      FROM tourist_spots ts
      JOIN category c ON ts.category_id = c.id
      JOIN type t ON ts.type_id = t.id
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
        ts.opening_hour,
        ts.closing_hour,
        c.category,
        t.type,
        ts.category_id,
        ts.type_id
      FROM tourist_spots ts
      JOIN category c ON ts.category_id = c.id
      JOIN type t ON ts.type_id = t.id
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
    const { name, description, opening_hour, closing_hour, category_id, type_id } = req.body;

    // Validate required fields
    if (!name || !description || !opening_hour || !closing_hour || !category_id || !type_id) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
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

    const [result] = await db.execute(`
      INSERT INTO tourist_spots (name, description, opening_hour, closing_hour, category_id, type_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, description, opening_hour, closing_hour, category_id, type_id]);

    const [newSpot] = await db.execute(`
      SELECT 
        ts.id,
        ts.name,
        ts.description,
        ts.opening_hour,
        ts.closing_hour,
        c.category,
        t.type,
        ts.category_id,
        ts.type_id
      FROM tourist_spots ts
      JOIN category c ON ts.category_id = c.id
      JOIN type t ON ts.type_id = t.id
      WHERE ts.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      data: newSpot[0],
      message: 'Tourist spot created successfully'
    });
  } catch (error) {
    console.error('Error creating tourist spot:', error);
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
    const { name, description, opening_hour, closing_hour, category_id, type_id } = req.body;

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
    if (opening_hour !== undefined) {
      updateFields.push('opening_hour = ?');
      updateValues.push(opening_hour);
    }
    if (closing_hour !== undefined) {
      updateFields.push('closing_hour = ?');
      updateValues.push(closing_hour);
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
        ts.opening_hour,
        ts.closing_hour,
        c.category,
        t.type,
        ts.category_id,
        ts.type_id
      FROM tourist_spots ts
      JOIN category c ON ts.category_id = c.id
      JOIN type t ON ts.type_id = t.id
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
    // Get categories
    const [categories] = await db.execute('SELECT * FROM category ORDER BY category ASC');
    
    // Get types for tourist spots (category_id = 3 for Tourist Spot)
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
