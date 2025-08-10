import db from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Get all users
export async function getAllUsers(req, res) {
  try {
    const [results] = await db.query('SELECT * FROM user');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get a single user by tourism_id
export async function getTourismId(req, res) {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM user WHERE tourism_id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get a single user by tourist_id
export async function getTouristId(req, res) {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM user WHERE tourist_id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get a single user by owner_id
export async function getOwnerId(req, res) {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM user WHERE owner_id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create a new user
export async function createUser(req, res) {
  const { role, email, phone_number, password, tourist_id, owner_id, tourism_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO user (role, email, phone_number, password, tourist_id, owner_id, tourism_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [role, email, phone_number, hashedPassword, tourist_id, owner_id, tourism_id];
    const [result] = await db.query(sql, values);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.insertId,
        role,
        email,
        phone_number,
        password,
        tourist_id,
        owner_id,
        tourism_id
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update tourist user
export async function updateTourist(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await db.query('UPDATE user SET name = ? WHERE tourist_id = ?', [name, id]);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update owner user
export async function updateOwner(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await db.query('UPDATE user SET name = ? WHERE owner_id = ?', [name, id]);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update tourism user
export async function updateTourism(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await db.query('UPDATE user SET name = ? WHERE tourism_id = ?', [name, id]);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete user by ID
export async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM user WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Login user
export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM user WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, tourist_id: user.tourist_id, owner_id: user.owner_id, tourism_id: user.tourism_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        phone_number: user.phone_number,
        tourist_id: user.tourist_id,
        owner_id: user.owner_id,
        tourism_id: user.tourism_id
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
