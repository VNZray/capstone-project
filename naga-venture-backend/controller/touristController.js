import db from '../db.js';

// Get all tourists
export function getAllTourists(req, res) {
    db.query('SELECT * FROM tourist', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
}

// Get tourist by ID
export function getTouristById(req, res) {
    const { id } = req.params;
    db.query('SELECT * FROM tourist WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Tourist not found' });
        res.json(results[0]);
    });
}

// Create a new tourist
export function createTourist(req, res) {
    const { first_name, middle_name, last_name, ethnicity, birthday, age, gender, nationality, category, contact_number, email, province_id, municipality_id, barangay_id } = req.body
    const sql = `INSERT INTO tourist (first_name, middle_name, last_name, ethnicity, birthday, age, gender, nationality, category, contact_number, email, province_id, municipality_id, barangay_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [first_name, middle_name, last_name, ethnicity, birthday, age, gender, nationality, category, contact_number, email, province_id, municipality_id, barangay_id];
    db.query(sql, values, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: results.insertId, ...req.body });
    });
}