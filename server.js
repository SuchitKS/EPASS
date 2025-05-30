require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Database connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'suchit', // Your MySQL password
  database: 'eventmngsys',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Serve organizer interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'organisers.html'));
});

// Students endpoints
app.get('/students', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM Student');
    res.json(rows);
  } catch (err) {
    res.status(500).send('Error fetching students: ' + err.message);
  }
});

app.post('/students', async (req, res) => {
  try {
    const { usn, name, sem, mobno, email, password } = req.body;
    if (!usn || !name || !email || !sem || !mobno || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const insertQuery = "INSERT INTO Student (USN, sname, sem, mobno, emailID, Password) VALUES (?, ?, ?, ?, ?, ?)";
    await pool.execute(insertQuery, [usn, name, sem, mobno, email, password]);
    res.status(201).json({ message: 'Student added successfully!', usn });
  } catch (err) {
    res.status(500).send('Error inserting student: ' + err.message);
  }
});

// Events endpoint
app.get('/events', async (req, res) => {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute('SELECT eid, ename, eventdesc, eventDate, eventTime, eventLoc FROM event');

    const events = {
      ongoing: [],
      completed: [],
      upcoming: []
    };

    rows.forEach(event => {
      const eventDate = new Date(event.eventDate).toISOString().split('T')[0];
      if (eventDate === currentDate) events.ongoing.push(event);
      else if (eventDate < currentDate) events.completed.push(event);
      else events.upcoming.push(event);
    });

    res.json(events);
  } catch (err) {
    res.status(500).send('Error fetching events: ' + err.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});