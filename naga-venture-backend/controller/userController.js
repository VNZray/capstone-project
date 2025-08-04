import db from '../db.js';
import bcrypt from 'bcrypt';

// Get all user
export function getAllUsers(req, res) {
  db.query('SELECT * FROM user', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
}

// Get a single user by ID
export function getTourismId(req, res) {
  const { id } = req.params;
  db.query('SELECT * FROM user WHERE tourism_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
}

// Get a single user by ID
export function getTouristId(req, res) {
  const { id } = req.params;
  db.query('SELECT * FROM user WHERE tourist_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
}

// Get a single user by ID
export function getOwnerId(req, res) {
  const { id } = req.params;
  db.query('SELECT * FROM user WHERE owner_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
}

// Create a new user
export async function createUser(req, res) {
  const { role, email, phone_number, password, tourist_id, owner_id, tourism_id } = req.body;

  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = `
      INSERT INTO user (role, email, phone_number, password, tourist_id, owner_id, tourism_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [role, email, phone_number, hashedPassword, tourist_id, owner_id, tourism_id];

    db.query(sql, values, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
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
    });
  } catch (err) {
    res.status(500).json({ error: 'Password hashing failed' });
  }
}

// Update user by ID
export function updateTourist(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  db.query('UPDATE user SET name = ? WHERE tourist_id = ?', [name, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User updated successfully' });
  });
}

// Update user by ID
export function updateOwner(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  db.query('UPDATE user SET name = ? WHERE owner_id = ?', [name, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User updated successfully' });
  });
}

// Update user by ID
export function updateTourism(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  db.query('UPDATE user SET name = ? WHERE tourism_id = ?', [name, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User updated successfully' });
  });
}
// Delete user by ID
export function deleteUser(req, res) {
  const { id } = req.params;
  db.query('DELETE FROM user WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted successfully' });
  });
}
