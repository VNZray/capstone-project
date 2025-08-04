import db from '../db.js';

// Get all listed businesse
export function getAllBusiness(req, res) {
    db.query('SELECT * FROM business', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
}

// get business by owner ID
export function getBusinessByOwnerId(req, res) {
    const { id } = req.params;
    db.query('SELECT * FROM business WHERE owner_id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Business not found' });
        res.json(results[0]);
    });
}

