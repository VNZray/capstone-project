import db from '../db.js';

// get all provinces
export const getAllProvinces = async (req, res) => {
    db.query('SELECT * FROM province', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
}

// get all municipalities
export const getAllMunicipalities = async (req, res) => {
    db.query('SELECT * FROM municipality', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
}

// get all municipalities by province ID
export const getMunicipalitiesByProvinceId = async (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM municipality WHERE province_id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Municipalities not found' });
        res.json(results);
    });
}

// get all barangays
export const getAllBarangays = async (req, res) => {
    db.query('SELECT * FROM barangay', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
}
// get all barangays by municipality ID
export const getBarangaysByMunicipalityId = async (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM barangay WHERE municipality_id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Barangays not found' });
        res.json(results);
    });
}