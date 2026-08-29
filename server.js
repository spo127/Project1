const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'lifelink_secret_key';

app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Sp_12_Dec', // <--- Put your actual MySQL password here
  database: 'lifelink_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test Connection
db.getConnection()
  .then(conn => {
    console.log('Connected to MySQL Database!');
    conn.release();
  })
  .catch(err => console.error('Database connection error:', err.message));

// 1. REGISTER API
app.post('/api/donors', async (req, res) => {
  const { name, bloodGroup, contact, location, password, availability } = req.body;

  try {
    const [existing] = await db.query('SELECT id FROM donors WHERE contact = ?', [contact]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Donor with this contact number already exists.' });
    }

    const id = Date.now().toString();
    const query = `
      INSERT INTO donors (id, name, bloodGroup, contact, location, password, availability)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.query(query, [
      id, name, bloodGroup, contact, location, password, 
      availability || 'Available'
    ]);

    res.status(201).json({ message: 'Donor registered successfully!', donorId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// 2. LOGIN API
app.post('/api/login', async (req, res) => {
  const { contact, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM donors WHERE contact = ? AND password = ?', [contact, password]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid contact number or password.' });
    }

    const donor = rows[0];
    const token = jwt.sign({ id: donor.id, contact: donor.contact }, SECRET_KEY, { expiresIn: '1h' });
    const { password: _, ...donorData } = donor;

    res.json({ message: 'Login successful', token, donor: donorData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// 3. GET ALL DONORS API
app.get('/api/donors', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, bloodGroup, contact, location, availability FROM donors');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching donors.' });
  }
});

// 4. DELETE DONOR CARD
app.delete('/api/donors/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized. Token missing.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const donorIdToDelete = req.params.id;

    if (decoded.id !== donorIdToDelete) {
      return res.status(403).json({ message: 'Forbidden. You can only delete your own profile.' });
    }

    const [result] = await db.query('DELETE FROM donors WHERE id = ?', [donorIdToDelete]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Donor profile not found.' });
    }

    res.json({ message: 'Donor profile deleted successfully.' });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
});
// 5. UPDATE DONOR AVAILABILITY STATUS
app.patch('/api/donors/:id/status', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized. Token missing.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const donorIdToUpdate = req.params.id;

    // Verify user owns the profile
    if (decoded.id !== donorIdToUpdate) {
      return res.status(403).json({ message: 'Forbidden. You can only update your own status.' });
    }

    const { availability } = req.body;
    if (!availability) {
      return res.status(400).json({ message: 'Availability status is required.' });
    }

    const [result] = await db.query(
      'UPDATE donors SET availability = ? WHERE id = ?',
      [availability, donorIdToUpdate]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Donor profile not found.' });
    }

    res.json({ message: 'Availability status updated successfully.' });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
});
// POST: Save a new review
app.post('/api/reviews', async (req, res) => {
  const { name, email, rating, tags, comments } = req.body;

  if (!name || !email || !rating || !comments) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const tagsString = Array.isArray(tags) ? tags.join(',') : tags;
    const query = 'INSERT INTO reviews (name, email, rating, tags, comments) VALUES (?, ?, ?, ?, ?)';
    await db.query(query, [name, email, rating, tagsString, comments]);

    res.status(201).json({ message: 'Review saved successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Database error saving review.' });
  }
});

// GET: Retrieve all reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const [reviews] = await db.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Database error fetching reviews.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});