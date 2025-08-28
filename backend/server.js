require('dotenv').config();
const express = require('express');
const path = require('path');
const supabase = require('./lib/supabase');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use(cors({
    origin: 'https://epass-rff5.onrender.com', // Allow only your frontend origin
    credentials: true // Allow cookies/credentials
}));
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

// Test Supabase connection
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase.from('student').select('count').limit(1);
        if (error) throw error;
        console.log('Supabase connected successfully');
    } catch (err) {
        console.error('Supabase connection failed:', err);
    }
}
testSupabaseConnection();

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
    res.json({ 
        message: 'EPASS Backend API is running!', 
        status: 'healthy',
        endpoints: {
            signup: 'POST /api/signup',
            signin: 'POST /api/signin',
            events: 'GET /api/events',
            students: 'GET /api/students'
        }
    });
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

        const { data: existingUser, error: checkError } = await supabase
            .from('student')
            .select('usn')
            .or(`usn.eq.${usn},emailid.eq.${email}`)
            .limit(1);
        
        if (checkError) {
            console.error('Error checking existing user:', checkError);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (existingUser && existingUser.length > 0) {
            return res.status(400).json({ error: 'Student with this USN or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const { data, error } = await supabase
            .from('student')
            .insert([{
                usn: usn,
                sname: name,
                sem: sem,
                mobno: mobno,
                emailid: email,
                password: hashedPassword
            }])
            .select();
        
        if (error) {
            console.error('Error inserting student:', error);
            return res.status(500).json({ error: `Error registering student: ${error.message}` });
        }
        
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
        
        const { data: rows, error } = await supabase
            .from('student')
            .select('usn, sname, emailid, password')
            .eq('usn', usn)
            .limit(1);
        
        if (error) {
            console.error('Error fetching student:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!rows || rows.length === 0) {
            return res.status(401).json({ error: 'Invalid USN or password' });
        }
        
        const student = rows[0];
        
        const validPassword = await bcrypt.compare(password, student.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid USN or password' });
        }
        
        req.session.userUSN = student.usn;
        req.session.userName = student.sname;
        req.session.userEmail = student.emailid;
        
        res.json({ 
            success: true, 
            message: 'Signed in successfully',
            userUSN: student.usn,
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
        const { data: rows, error } = await supabase
            .from('student')
            .select('usn, sname, sem, mobno, emailid')
            .eq('usn', req.session.userUSN)
            .limit(1);
        
        if (error) {
            console.error('Error fetching user info:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const student = rows[0];
        res.json({
            userUSN: student.usn,
            userName: student.sname,
            semester: student.sem,
            mobile: student.mobno,
            email: student.emailid
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
        
        const { data: rows, error } = await supabase
            .from('event')
            .select(`
                eid, ename, eventdesc, eventdate, eventtime, eventloc, maxpart, maxvoln, regfee,
                club:orgcid(cname),
                student:orgusn(sname)
            `);
        
        if (error) {
            console.error('Error fetching events:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        const events = {
            ongoing: [],
            completed: [],
            upcoming: []
        };

        (rows || []).forEach(event => {
            // Transform the data to match the expected format
            const transformedEvent = {
                ...event,
                eventDate: event.eventdate,
                eventTime: event.eventtime,
                eventLoc: event.eventloc,
                maxPart: event.maxpart,
                maxVoln: event.maxvoln,
                regFee: event.regfee,
                clubName: event.club?.cname,
                organizerName: event.student?.sname
            };
            
            const eventDate = new Date(event.eventdate).toISOString().split('T')[0];
            if (eventDate === currentDate) events.ongoing.push(event);
            else if (eventDate < currentDate) events.completed.push(event);
            else events.upcoming.push(transformedEvent);
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
        const { data: rows, error } = await supabase
            .from('student')
            .select('usn, sname, sem, mobno, emailid');
        
        if (error) {
            console.error('Error fetching students:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
            students: rows || [],
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
        const { data: rows, error } = await supabase
            .from('memberof')
            .select(`
                club:clubid (
                    cid,
                    cname,
                    clubdesc,
                    maxmembers
                )
            `)
            .eq('studentusn', req.session.userUSN);
        
        if (error) {
            console.error('Error fetching user clubs:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Transform the data to match expected format
        const clubs = (rows || []).map(row => row.club).filter(club => club);
        
        res.json({
            clubs: clubs,
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
        // Get participant events
        const { data: participantEvents, error: participantError } = await supabase
            .from('participant')
            .select(`
                partstatus, partusn,
                event:parteid (
                    eid, ename, eventdesc, eventdate, eventtime, eventloc
                )
            `)
            .eq('partusn', req.session.userUSN);
        
        if (participantError) {
            console.error('Error fetching participant events:', participantError);
        }
        
        // Get volunteer events
        const { data: volunteerEvents, error: volunteerError } = await supabase
            .from('volunteer')
            .select(`
                volnstatus,
                event:volneid (
                    eid, ename, eventdesc, eventdate, eventtime, eventloc
                )
            `)
            .eq('volnusn', req.session.userUSN);
        
        if (volunteerError) {
            console.error('Error fetching volunteer events:', volunteerError);
        }
        
        // Get organizer events
        const { data: organizerEvents, error: organizerError } = await supabase
            .from('event')
            .select(`
                eid, ename, eventdesc, eventdate, eventtime, eventloc, maxpart, maxvoln, regfee,
                club:orgcid(cname)
            `)
            .eq('orgusn', req.session.userUSN);
        
        if (organizerError) {
            console.error('Error fetching organizer events:', organizerError);
        }
        
        // Transform participant events
        const transformedParticipantEvents = (participantEvents || []).map(p => ({
            ...p.event,
            eventDate: p.event?.eventdate,
            eventTime: p.event?.eventtime,
            eventLoc: p.event?.eventloc,
            PartStatus: p.partstatus,
            PartUSN: p.partusn,
            role: 'participant'
        })).filter(e => e.eid);
        
        // Transform volunteer events
        const transformedVolunteerEvents = (volunteerEvents || []).map(v => ({
            ...v.event,
            eventDate: v.event?.eventdate,
            eventTime: v.event?.eventtime,
            eventLoc: v.event?.eventloc,
            VolnStatus: v.volnstatus,
            role: 'volunteer'
        })).filter(e => e.eid);
        
        // Transform organizer events
        const transformedOrganizerEvents = (organizerEvents || []).map(e => ({
            ...e,
            eventDate: e.eventdate,
            eventTime: e.eventtime,
            eventLoc: e.eventloc,
            maxPart: e.maxpart,
            maxVoln: e.maxvoln,
            regFee: e.regfee,
            clubName: e.club?.cname,
            role: 'organizer'
        }));
        
        res.json({
            participantEvents: transformedParticipantEvents,
            volunteerEvents: transformedVolunteerEvents,
            organizerEvents: transformedOrganizerEvents,
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
        const { data: participantEvents, error } = await supabase
            .from('participant')
            .select(`
                partstatus, partusn,
                event:parteid (
                    eid, ename, eventdesc, eventdate, eventtime, eventloc, maxpart, maxvoln, regfee,
                    club:orgcid(cname)
                )
            `)
            .eq('partusn', req.session.userUSN);
        
        if (error) {
            console.error('Error fetching participant events:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Transform the data to match expected format
        const transformedEvents = (participantEvents || []).map(p => ({
            ...p.event,
            eventDate: p.event?.eventdate,
            eventTime: p.event?.eventtime,
            eventLoc: p.event?.eventloc,
            maxPart: p.event?.maxpart,
            maxVoln: p.event?.maxvoln,
            regFee: p.event?.regfee,
            clubName: p.event?.club?.cname,
            PartStatus: p.partstatus,
            PartUSN: p.partusn,
            role: 'participant'
        })).filter(e => e.eid);
        
        res.json({
            participantEvents: transformedEvents,
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
        const { data: volunteerEvents, error } = await supabase
            .from('volunteer')
            .select(`
                volnstatus,
                event:volneid (
                    eid, ename, eventdesc, eventdate, eventtime, eventloc, maxpart, maxvoln, regfee,
                    club:orgcid(cname)
                )
            `)
            .eq('volnusn', req.session.userUSN);
        
        if (error) {
            console.error('Error fetching volunteer events:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Transform the data to match expected format
        const transformedEvents = (volunteerEvents || []).map(v => ({
            ...v.event,
            eventDate: v.event?.eventdate,
            eventTime: v.event?.eventtime,
            eventLoc: v.event?.eventloc,
            maxPart: v.event?.maxpart,
            maxVoln: v.event?.maxvoln,
            regFee: v.event?.regfee,
            clubName: v.event?.club?.cname,
            VolnStatus: v.volnstatus,
            role: 'volunteer'
        })).filter(e => e.eid);
        
        res.json({
            volunteerEvents: transformedEvents,
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
        const { data: organizerEvents, error } = await supabase
            .from('event')
            .select(`
                eid, ename, eventdesc, eventdate, eventtime, eventloc, maxpart, maxvoln, regfee,
                club:orgcid(cname)
            `)
            .eq('orgusn', req.session.userUSN);
        
        if (error) {
            console.error('Error fetching organized events:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Transform the data to match expected format
        const transformedEvents = (organizerEvents || []).map(e => ({
            ...e,
            eventDate: e.eventdate,
            eventTime: e.eventtime,
            eventLoc: e.eventloc,
            maxPart: e.maxpart,
            maxVoln: e.maxvoln,
            regFee: e.regfee,
            clubName: e.club?.cname,
            role: 'organizer'
        }));
        
        res.json({
            organizerEvents: transformedEvents,
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
            const { data: clubMembership, error: membershipError } = await supabase
                .from('memberof')
                .select('*')
                .eq('studentusn', req.session.userUSN)
                .eq('clubid', organizedClubId)
                .limit(1);
            
            if (membershipError) {
                console.error('Error checking club membership:', membershipError);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!clubMembership || clubMembership.length === 0) {
                return res.status(403).json({ error: 'You must be a member of the club to organize events for it' });
            }
        }
        
        const { data, error } = await supabase
            .from('event')
            .insert([{
                ename: eventName,
                eventdesc: eventDescription,
                eventdate: eventDate,
                eventtime: eventTime,
                eventloc: eventLocation,
                maxpart: maxParticipants || null,
                maxvoln: maxVolunteers || null,
                regfee: registrationFee || 0,
                orgusn: req.session.userUSN,
                orgcid: organizedClubId || null
            }])
            .select('eid');
        
        if (error) {
            console.error('Error creating event:', error);
            return res.status(500).json({ error: `Error creating event: ${error.message}` });
        }
        
        res.status(201).json({ 
            success: true,
            message: 'Event created successfully!', 
            eventId: data[0]?.eid,
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
        const { data: rows, error } = await supabase
            .from('club')
            .select('cid, cname, clubdesc');
        
        if (error) {
            console.error('Error fetching clubs:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
            clubs: rows || [],
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
        
        const { data: existing, error: existingError } = await supabase
            .from('participant')
            .select('*')
            .eq('partusn', userUSN)
            .eq('parteid', eventId)
            .limit(1);
        
        if (existingError) {
            console.error('Error checking existing participation:', existingError);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (existing && existing.length > 0) {
            return res.status(400).json({ error: 'Already joined this event' });
        }
        
        // Check if participant slots are available
        const { data: event, error: eventError } = await supabase
            .from('event')
            .select('maxpart')
            .eq('eid', eventId)
            .limit(1);
        
        if (eventError) {
            console.error('Error fetching event:', eventError);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!event || event.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const maxPart = event[0].maxpart || 0;
        if (maxPart > 0) {
            const { count, error: countError } = await supabase
                .from('participant')
                .select('*', { count: 'exact', head: true })
                .eq('parteid', eventId);

            if (countError) {
                console.error('Error counting participants:', countError);
                return res.status(500).json({ error: 'Database error' });
            }

            if (count >= maxPart) {
                return res.status(400).json({ error: 'No more participant slots available' });
            }
        }
        
        const { error: insertError } = await supabase
            .from('participant')
            .insert([{
                partusn: userUSN,
                parteid: eventId,
                partstatus: false
            }]);
        
        if (insertError) {
            console.error('Error joining event:', insertError);
            return res.status(500).json({ error: 'Database error' });
        }
        
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
        
        const { data: existing, error: existingError } = await supabase
            .from('volunteer')
            .select('*')
            .eq('volnusn', userUSN)
            .eq('volneid', eventId)
            .limit(1);
        
        if (existingError) {
            console.error('Error checking existing volunteer:', existingError);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (existing && existing.length > 0) {
            return res.status(400).json({ error: 'Already volunteered for this event' });
        }
        
        // Check if volunteer slots are available
        const { data: event, error: eventError } = await supabase
            .from('event')
            .select('maxvoln')
            .eq('eid', eventId)
            .limit(1);
        
        if (eventError) {
            console.error('Error fetching event:', eventError);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!event || event.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const maxVoln = event[0].maxvoln || 0;
        if (maxVoln > 0) {
            const { count, error: countError } = await supabase
                .from('volunteer')
                .select('*', { count: 'exact', head: true })
                .eq('volneid', eventId);

            if (countError) {
                console.error('Error counting volunteers:', countError);
                return res.status(500).json({ error: 'Database error' });
            }

            if (count >= maxVoln) {
                return res.status(400).json({ error: 'No more volunteer slots available' });
            }
        }
        
        const { error: insertError } = await supabase
            .from('volunteer')
            .insert([{
                volnusn: userUSN,
                volneid: eventId,
                volnstatus: false
            }]);
        
        if (insertError) {
            console.error('Error volunteering for event:', insertError);
            return res.status(500).json({ error: 'Database error' });
        }
        
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
        
        const { count, error } = await supabase
            .from('volunteer')
            .select('*', { count: 'exact', head: true })
            .eq('volneid', eventId);
        
        if (error) {
            console.error('Error fetching volunteer count:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ count: count || 0 });
    } catch (err) {
        console.error('Error fetching volunteer count:', err);
        res.status(500).json({ error: 'Error fetching volunteer count' });
    }
});

// Get participant count for an event
app.get('/api/events/:eventId/participant-count', requireAuth, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        
        const { count, error } = await supabase
            .from('participant')
            .select('*', { count: 'exact', head: true })
            .eq('parteid', eventId);
        
        if (error) {
            console.error('Error fetching participant count:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ count: count || 0 });
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

        const { data: existing, error: existingError } = await supabase
            .from('participant')
            .select('*')
            .eq('partusn', usn)
            .eq('parteid', eid)
            .limit(1);

        if (existingError) {
            console.error('Error checking participant:', existingError);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!existing || existing.length === 0) {
            return res.status(404).json({ error: 'Participant not found for this event' });
        }

        if (existing[0].partstatus === true) {
            return res.status(400).json({ error: 'Participant already checked in' });
        }

        const { error: updateError } = await supabase
            .from('participant')
            .update({ partstatus: true })
            .eq('partusn', usn)
            .eq('parteid', eid);
        
        if (updateError) {
            console.error('Error updating participant status:', updateError);
            return res.status(500).json({ error: 'Database error' });
        }

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

        const { data: rows, error } = await supabase
            .from('event')
            .select(`
                eid, ename, eventdesc, eventdate, eventtime, eventloc, maxpart, maxvoln, regfee, orgusn,
                club:orgcid(cname),
                student:orgusn(sname)
            `)
            .eq('eid', eventId)
            .limit(1);

        if (error) {
            console.error('Error fetching event details:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const event = rows[0];
        
        // Transform the data to match expected format
        const transformedEvent = {
            ...event,
            eventDate: event.eventdate,
            eventTime: event.eventtime,
            eventLoc: event.eventloc,
            maxPart: event.maxpart,
            maxVoln: event.maxvoln,
            regFee: event.regfee,
            clubName: event.club?.cname,
            organizerName: event.student?.sname,
            OrgUsn: event.orgusn
        };

        const { data: participantCheck, error: participantError } = await supabase
            .from('participant')
            .select('partstatus')
            .eq('partusn', req.session.userUSN)
            .eq('parteid', eventId)
            .limit(1);

        const { data: volunteerCheck, error: volunteerError } = await supabase
            .from('volunteer')
            .select('volnstatus')
            .eq('volnusn', req.session.userUSN)
            .eq('volneid', eventId)
            .limit(1);

        transformedEvent.isRegistered = participantCheck && participantCheck.length > 0;
        transformedEvent.isVolunteer = volunteerCheck && volunteerCheck.length > 0;
        transformedEvent.isOrganizer = event.orgusn === req.session.userUSN;

        res.json(transformedEvent);
    } catch (err) {
        console.error('Error fetching event details:', err);
        res.status(500).json({ error: 'Error fetching event details: ' + err.message });
    }
});

// Legacy endpoints for backward compatibility
app.get('/students', requireAuth, async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('student')
            .select('usn, sname, sem, mobno, emailid');
        
        if (error) {
            console.error('Error fetching students:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Transform to match legacy format
        const transformedRows = (rows || []).map(row => ({
            USN: row.usn,
            sname: row.sname,
            sem: row.sem,
            mobno: row.mobno,
            emailID: row.emailid
        }));
        
        res.json(transformedRows);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ error: 'Error fetching students: ' + err.message });
    }
});

app.get('/events', requireAuth, async (req, res) => {
    try {
        const currentDate = new Date().toISOString().split('T')[0];
        
        const { data: rows, error } = await supabase
            .from('event')
            .select('eid, ename, eventdesc, eventdate, eventtime, eventloc');
        
        if (error) {
            console.error('Error fetching events:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        const events = {
            ongoing: [],
            completed: [],
            upcoming: []
        };

        (rows || []).forEach(event => {
            // Transform to match legacy format
            const transformedEvent = {
                eid: event.eid,
                ename: event.ename,
                eventdesc: event.eventdesc,
                eventDate: event.eventdate,
                eventTime: event.eventtime,
                eventLoc: event.eventloc
            };
            
            const eventDate = new Date(event.eventdate).toISOString().split('T')[0];
            if (eventDate === currentDate) events.ongoing.push(event);
            else if (eventDate < currentDate) events.completed.push(event);
            else events.upcoming.push(transformedEvent);
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
