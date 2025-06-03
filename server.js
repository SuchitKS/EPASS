require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Session configuration
app.use(session({
    secret: 'your-event-management-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Database connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'suchit', // You may need to update this
    database: 'eventmngsys',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(conn => {
        console.log('Database connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err);
    });

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
    if (req.session.userUSN) {
        next();
    } else {
        res.status(401).json({ error: 'Please sign in first' });
    }
}

// Serve login page as default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Sign up endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const { name, usn, sem, mobno, email, password } = req.body;
        
        if (!usn || !name || !email || !sem || !mobno || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!/^1BM\d{2}[A-Z]{2}\d{3}$/.test(usn)) {
            return res.status(400).json({ error: 'Invalid USN format' });
        }

        const [existingUser] = await pool.execute(
            'SELECT USN FROM Student WHERE USN = ? OR emailID = ?', 
            [usn, email]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Student with this USN or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const insertQuery = `
            INSERT INTO Student (USN, sname, sem, mobno, emailID, Password) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await pool.execute(insertQuery, [usn, name, sem, mobno, email, hashedPassword]);
        
        req.session.userUSN = usn;
        req.session.userName = name;
        req.session.userEmail = email;
        
        res.status(201).json({ 
            success: true,
            message: 'Student registered successfully!', 
            userUSN: usn,
            userName: name
        });
    } catch (err) {
        console.error('Error registering student:', err);
        res.status(500).json({ error: `Error registering student: ${err.message}` });
    }
});

// Sign in endpoint
app.post('/api/signin', async (req, res) => {
    try {
        const { usn, password } = req.body;
        
        if (!usn || !password) {
            return res.status(400).json({ error: 'USN and password are required' });
        }
        
        const [rows] = await pool.execute(
            'SELECT USN, sname, emailID, Password FROM Student WHERE USN = ?', 
            [usn]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid USN or password' });
        }
        
        const student = rows[0];
        
        const validPassword = await bcrypt.compare(password, student.Password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid USN or password' });
        }
        
        req.session.userUSN = student.USN;
        req.session.userName = student.sname;
        req.session.userEmail = student.emailID;
        
        res.json({ 
            success: true, 
            message: 'Signed in successfully',
            userUSN: student.USN,
            userName: student.sname
        });
    } catch (err) {
        console.error('Error signing in:', err);
        res.status(500).json({ error: `Error signing in: ${err.message}` });
    }
});

// Get current user info
app.get('/api/me', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT USN, sname, sem, mobno, emailID FROM Student WHERE USN = ?', 
            [req.session.userUSN]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const student = rows[0];
        res.json({
            userUSN: student.USN,
            userName: student.sname,
            semester: student.sem,
            mobile: student.mobno,
            email: student.emailID
        });
    } catch (err) {
        console.error('Error fetching user info:', err);
        res.status(500).json({ error: 'Error fetching user info' });
    }
});

// Sign out endpoint
app.post('/api/signout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not sign out' });
        }
        res.json({ success: true, message: 'Signed out successfully' });
    });
});

// Get all events
app.get('/api/events', requireAuth, async (req, res) => {
    try {
        const currentDate = new Date().toISOString().split('T')[0];
        const [rows] = await pool.execute(
            `SELECT e.eid, e.ename, e.eventdesc, e.eventDate, e.eventTime, e.eventLoc, e.maxPart, e.maxVoln, 
                    e.regFee, c.cname as clubName, s.sname as organizerName
             FROM Event e 
             LEFT JOIN Club c ON e.OrgCid = c.cid 
             LEFT JOIN Student s ON e.OrgUsn = s.USN`
        );

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

        res.json({
            events,
            currentUser: req.session.userUSN
        });
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ error: 'Error fetching events: ' + err.message });
    }
});

// Get all students
app.get('/api/students', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT USN, sname, sem, mobno, emailID FROM Student');
        res.json({
            students: rows,
            currentUser: req.session.userUSN
        });
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ error: 'Error fetching students: ' + err.message });
    }
});

// Get user's clubs
app.get('/api/my-clubs', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT c.cid, c.cname, c.clubdesc, c.maxMembers 
             FROM Club c 
             JOIN memberOf m ON c.cid = m.ClubID 
             WHERE m.studentUSN = ?`,
            [req.session.userUSN]
        );
        
        res.json({
            clubs: rows,
            userUSN: req.session.userUSN
        });
    } catch (err) {
        console.error('Error fetching user clubs:', err);
        res.status(500).json({ error: 'Error fetching clubs' });
    }
});

// Get user's events (as participant, volunteer, or organizer)
app.get('/api/my-events', requireAuth, async (req, res) => {
    try {
        const [participantEvents] = await pool.execute(
            `SELECT e.eid, e.ename, e.eventdesc, e.eventDate, e.eventTime, e.eventLoc, 
                    p.PartStatus, p.PartUSN, 'participant' as role
             FROM Event e 
             JOIN Participant p ON e.eid = p.PartEID 
             WHERE p.PartUSN = ?`,
            [req.session.userUSN]
        );
        
        const [volunteerEvents] = await pool.execute(
            `SELECT e.eid, e.ename, e.eventdesc, e.eventDate, e.eventTime, e.eventLoc, 
                    v.VolnStatus, 'volunteer' as role
             FROM Event e 
             JOIN Volunteer v ON e.eid = v.VolnEID 
             WHERE v.VolnUSN = ?`,
            [req.session.userUSN]
        );
        
        const [organizerEvents] = await pool.execute(
            `SELECT e.eid, e.ename, e.eventdesc, e.eventDate, e.eventTime, e.eventLoc, 
                    e.maxPart, e.maxVoln, e.regFee, c.cname as clubName, 'organizer' as role
             FROM Event e 
             LEFT JOIN Club c ON e.OrgCid = c.cid 
             WHERE e.OrgUsn = ?`,
            [req.session.userUSN]
        );
        
        res.json({
            participantEvents,
            volunteerEvents,
            organizerEvents,
            userUSN: req.session.userUSN
        });
    } catch (err) {
        console.error('Error fetching user events:', err);
        res.status(500).json({ error: 'Error fetching user events' });
    }
});

// Get user's participant events only
app.get('/api/my-participant-events', requireAuth, async (req, res) => {
    try {
        const [participantEvents] = await pool.execute(
            `SELECT e.eid, e.ename, e.eventdesc, e.eventDate, e.eventTime, e.eventLoc, 
                    e.maxPart, e.maxVoln, e.regFee, c.cname as clubName, 
                    p.PartStatus, p.PartUSN, 'participant' as role
             FROM Event e 
             LEFT JOIN Club c ON e.OrgCid = c.cid 
             JOIN Participant p ON e.eid = p.PartEID 
             WHERE p.PartUSN = ?`,
            [req.session.userUSN]
        );
        
        res.json({
            participantEvents,
            userUSN: req.session.userUSN
        });
    } catch (err) {
        console.error('Error fetching participant events:', err);
        res.status(500).json({ error: 'Error fetching participant events' });
    }
});

// Get user's volunteer events only
app.get('/api/my-volunteer-events', requireAuth, async (req, res) => {
    try {
        const [volunteerEvents] = await pool.execute(
            `SELECT e.eid, e.ename, e.eventdesc, e.eventDate, e.eventTime, e.eventLoc, 
                    e.maxPart, e.maxVoln, e.regFee, c.cname as clubName, 
                    v.VolnStatus, 'volunteer' as role
             FROM Event e 
             LEFT JOIN Club c ON e.OrgCid = c.cid 
             JOIN Volunteer v ON e.eid = v.VolnEID 
             WHERE v.VolnUSN = ?`,
            [req.session.userUSN]
        );
        
        res.json({
            volunteerEvents,
            userUSN: req.session.userUSN
        });
    } catch (err) {
        console.error('Error fetching volunteer events:', err);
        res.status(500).json({ error: 'Error fetching volunteer events' });
    }
});

// Get user's organized events only
app.get('/api/my-organized-events', requireAuth, async (req, res) => {
    try {
        const [organizerEvents] = await pool.execute(
            `SELECT e.eid, e.ename, e.eventdesc, e.eventDate, e.eventTime, e.eventLoc, 
                    e.maxPart, e.maxVoln, e.regFee, c.cname as clubName, 'organizer' as role
             FROM Event e 
             LEFT JOIN Club c ON e.OrgCid = c.cid 
             WHERE e.OrgUsn = ?`,
            [req.session.userUSN]
        );
        
        res.json({
            organizerEvents,
            userUSN: req.session.userUSN
        });
    } catch (err) {
        console.error('Error fetching organized events:', err);
        res.status(500).json({ error: 'Error fetching organized events' });
    }
});

// Create/Organize a new event
app.post('/api/events/create', requireAuth, async (req, res) => {
    try {
        const { 
            eventName, 
            eventDescription, 
            eventDate, 
            eventTime, 
            eventLocation, 
            maxParticipants, 
            maxVolunteers, 
            registrationFee,
            clubId,
            OrgCid 
        } = req.body;
        
        // Use clubId or OrgCid (for backward compatibility)
        const organizedClubId = clubId || OrgCid;
        
        if (!eventName || !eventDescription || !eventDate || !eventTime || !eventLocation) {
            return res.status(400).json({ error: 'Event name, description, date, time, and location are required' });
        }
        
        const eventDateObj = new Date(eventDate);
        const currentDate = new Date();
        if (eventDateObj <= currentDate) {
            return res.status(400).json({ error: 'Event date must be in the future' });
        }
        
        if (organizedClubId) {
            const [clubMembership] = await pool.execute(
                'SELECT * FROM memberOf WHERE studentUSN = ? AND ClubID = ?',
                [req.session.userUSN, organizedClubId]
            );
            
            if (clubMembership.length === 0) {
                return res.status(403).json({ error: 'You must be a member of the club to organize events for it' });
            }
        }
        
        const insertQuery = `
            INSERT INTO Event (ename, eventdesc, eventDate, eventTime, eventLoc, maxPart, maxVoln, regFee, OrgUsn, OrgCid) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.execute(insertQuery, [
            eventName,
            eventDescription,
            eventDate,
            eventTime,
            eventLocation,
            maxParticipants || null,
            maxVolunteers || null,
            registrationFee || 0,
            req.session.userUSN,
            organizedClubId || null
        ]);
        
        res.status(201).json({ 
            success: true,
            message: 'Event created successfully!', 
            eventId: result.insertId,
            organizerUSN: req.session.userUSN
        });
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).json({ error: `Error creating event: ${err.message}` });
    }
});

// Get all clubs
app.get('/api/clubs', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT cid, cname, clubdesc FROM Club');
        res.json({
            clubs: rows,
            userUSN: req.session.userUSN
        });
    } catch (err) {
        console.error('Error fetching clubs:', err);
        res.status(500).json({ error: 'Error fetching clubs' });
    }
});

// Join event as participant
app.post('/api/events/:eventId/join', requireAuth, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userUSN = req.session.userUSN;
        
        const [existing] = await pool.execute(
            'SELECT * FROM Participant WHERE PartUSN = ? AND PartEID = ?',
            [userUSN, eventId]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Already joined this event' });
        }
        
        // Check if participant slots are available
        const [event] = await pool.execute(
            'SELECT maxPart FROM Event WHERE eid = ?',
            [eventId]
        );
        
        if (event.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const maxPart = event[0].maxPart || 0;
        if (maxPart > 0) {
            const [participantCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM Participant WHERE PartEID = ?',
                [eventId]
            );

            if (participantCount[0].count >= maxPart) {
                return res.status(400).json({ error: 'No more participant slots available' });
            }
        }
        
        await pool.execute(
            'INSERT INTO Participant (PartUSN, PartEID, PartStatus) VALUES (?, ?, 0)',
            [userUSN, eventId]
        );
        
        res.json({ success: true, message: 'Successfully joined event!' });
    } catch (err) {
        console.error('Error joining event:', err);
        res.status(500).json({ error: 'Error joining event' });
    }
});

// Volunteer for event
app.post('/api/events/:eventId/volunteer', requireAuth, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userUSN = req.session.userUSN;
        
        const [existing] = await pool.execute(
            'SELECT * FROM Volunteer WHERE VolnUSN = ? AND VolnEID = ?',
            [userUSN, eventId]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Already volunteered for this event' });
        }
        
        // Check if volunteer slots are available
        const [event] = await pool.execute(
            'SELECT maxVoln FROM Event WHERE eid = ?',
            [eventId]
        );
        
        if (event.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const maxVoln = event[0].maxVoln || 0;
        if (maxVoln > 0) {
            const [volunteerCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM Volunteer WHERE VolnEID = ?',
                [eventId]
            );

            if (volunteerCount[0].count >= maxVoln) {
                return res.status(400).json({ error: 'No more volunteer slots available' });
            }
        }
        
        await pool.execute(
            'INSERT INTO Volunteer (VolnUSN, VolnEID, VolnStatus) VALUES (?, ?, 0)',
            [userUSN, eventId]
        );
        
        res.json({ success: true, message: 'Successfully volunteered for event!' });
    } catch (err) {
        console.error('Error volunteering for event:', err);
        res.status(500).json({ error: 'Error volunteering for event' });
    }
});

// Get volunteer count for an event
app.get('/api/events/:eventId/volunteer-count', requireAuth, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const [result] = await pool.execute(
            'SELECT COUNT(*) as count FROM Volunteer WHERE VolnEID = ?',
            [eventId]
        );
        res.json({ count: result[0].count });
    } catch (err) {
        console.error('Error fetching volunteer count:', err);
        res.status(500).json({ error: 'Error fetching volunteer count' });
    }
});

// Get participant count for an event
app.get('/api/events/:eventId/participant-count', requireAuth, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const [result] = await pool.execute(
            'SELECT COUNT(*) as count FROM Participant WHERE PartEID = ?',
            [eventId]
        );
        res.json({ count: result[0].count });
    } catch (err) {
        console.error('Error fetching participant count:', err);
        res.status(500).json({ error: 'Error fetching participant count' });
    }
});

// Scan QR code to update participant status
app.get('/api/scan-qr', async (req, res) => {
    try {
        const { usn, eid } = req.query;
        
        if (!usn || !eid) {
            return res.status(400).json({ error: 'USN and Event ID are required' });
        }

        const [existing] = await pool.execute(
            'SELECT * FROM Participant WHERE PartUSN = ? AND PartEID = ?',
            [usn, eid]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Participant not found for this event' });
        }

        if (existing[0].PartStatus === 1) {
            return res.status(400).json({ error: 'Participant already checked in' });
        }

        await pool.execute(
            'UPDATE Participant SET PartStatus = 1 WHERE PartUSN = ? AND PartEID = ?',
            [usn, eid]
        );

        res.json({ success: true, message: 'Participant status updated to checked in' });
    } catch (err) {
        console.error('Error updating participant status:', err);
        res.status(500).json({ error: 'Error updating participant status: ' + err.message });
    }
});


// Individual Event Details Route
app.get('/api/events/:eventId', requireAuth, async (req, res) => {
    try {
        const eventId = req.params.eventId;

        if (!eventId || isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }

        const [rows] = await pool.execute(
            `SELECT e.eid, e.ename, e.eventdesc, e.eventDate, e.eventTime, e.eventLoc, 
                    e.maxPart, e.maxVoln, e.regFee, c.cname as clubName, s.sname as organizerName, e.OrgUsn
             FROM Event e 
             LEFT JOIN Club c ON e.OrgCid = c.cid 
             LEFT JOIN Student s ON e.OrgUsn = s.USN 
             WHERE e.eid = ?`,
            [eventId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const event = rows[0];

        const [participantCheck] = await pool.execute(
            'SELECT PartStatus FROM Participant WHERE PartUSN = ? AND PartEID = ?',
            [req.session.userUSN, eventId]
        );

        const [volunteerCheck] = await pool.execute(
            'SELECT VolnStatus FROM Volunteer WHERE VolnUSN = ? AND VolnEID = ?',
            [req.session.userUSN, eventId]
        );

        event.isRegistered = participantCheck.length > 0;
        event.isVolunteer = volunteerCheck.length > 0;
        event.isOrganizer = event.OrgUsn === req.session.userUSN;

        res.json(event);
    } catch (err) {
        console.error('Error fetching event details:', err);
        res.status(500).json({ error: 'Error fetching event details: ' + err.message });
    }
});

// Legacy endpoints for backward compatibility
app.get('/students', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT USN, sname, sem, mobno, emailID FROM Student');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ error: 'Error fetching students: ' + err.message });
    }
});

app.get('/events', requireAuth, async (req, res) => {
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
        console.error('Error fetching events:', err);
        res.status(500).json({ error: 'Error fetching events: ' + err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});