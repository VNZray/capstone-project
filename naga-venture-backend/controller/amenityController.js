import db from '../db.js';

export function getAmenities(req, res) {
    db.query('SELECT * FROM amenities', (err, results) => {
        if (err) {
            console.error('Error fetching amenities:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
}

