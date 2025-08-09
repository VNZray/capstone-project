import db from '../db.js';

// Get all businesses
export async function getAllBusiness(req, res) {
  try {
    const [results] = await db.query('SELECT * FROM business');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get business by owner ID
export async function getBusinessByOwnerId(req, res) {
  const { id } = req.params;
  try {
    const [results] = await db.query(
      'SELECT * FROM business WHERE owner_id = ?',
      [id]
    );
    if (results.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
