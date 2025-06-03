// Get individual event details (protected route)
app.get('/api/events/:eventId', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    // Validate event ID
    if (!eventId || isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const [rows] = await pool.execute(
      `SELECT e.eid, e.ename, e.eventdesc, e.eventDate, e.eventTime, e.eventLoc, 
              e.maxPart, e.maxVoln, e.regFee, c.cname as clubName, s.sname as organizerName
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
    
    // Check if current user is already registered as participant
    const [participantCheck] = await pool.execute(
      'SELECT PartStatus FROM Participant WHERE PartUSN = ? AND PartEID = ?',
      [req.session.userUSN, eventId]
    );
    
    // Check if current user is already registered as volunteer
    const [volunteerCheck] = await pool.execute(
      'SELECT VolnStatus FROM Volunteer WHERE VolnUSN = ? AND VolnEID = ?',
      [req.session.userUSN, eventId]
    );
    
    // Add registration status to response
    event.isRegistered = participantCheck.length > 0;
    event.isVolunteer = volunteerCheck.length > 0;
    event.isOrganizer = event.OrgUsn === req.session.userUSN;
    
    res.json(event);
    
  } catch (err) {
    console.error('Error fetching event details:', err);
    res.status(500).json({ error: 'Error fetching event details: ' + err.message });
  }
});