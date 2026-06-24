const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8085;

const GUESTS_FILE = path.join(__dirname, 'guests.json');
const RSVP_FILE = path.join(__dirname, 'rsvps.json');
const SONGS_FILE = path.join(__dirname, 'songs.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Ensure files exist on startup
function ensureFileExists(filePath, defaultValue = '[]') {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultValue, 'utf8');
  }
}

ensureFileExists(GUESTS_FILE, '[]');
ensureFileExists(RSVP_FILE, '[]');
ensureFileExists(SONGS_FILE, '[]');

// Search guest list by name
app.get('/api/guests/search', (req, res) => {
  try {
    const query = (req.query.name || '').trim().toLowerCase();
    if (!query) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const guests = JSON.parse(fs.readFileSync(GUESTS_FILE, 'utf8') || '[]');
    
    // Perform case-insensitive substring match
    const matches = guests.filter(guest => 
      guest.name.toLowerCase().includes(query)
    );

    return res.json(matches);
  } catch (error) {
    console.error('Error searching guests:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Confirm attendance for a specific guest
app.post('/api/guests/confirm', (req, res) => {
  try {
    const { guestId, status, confirmedGuests, email, dietary, message } = req.body;

    if (!guestId || !status) {
      return res.status(400).json({ error: 'Guest ID and RSVP status are required.' });
    }

    const guests = JSON.parse(fs.readFileSync(GUESTS_FILE, 'utf8') || '[]');
    const guestIndex = guests.findIndex(g => g.id === guestId);

    if (guestIndex === -1) {
      return res.status(404).json({ error: 'Guest not found in invitation list.' });
    }

    const currentGuest = guests[guestIndex];
    const confirmedCount = parseInt(confirmedGuests) || 0;

    // Validate party limit
    if (status === 'confirmed' && confirmedCount > currentGuest.maxGuests) {
      return res.status(400).json({ error: `Cannot confirm more than ${currentGuest.maxGuests} guests.` });
    }

    // Update guest record
    const updatedGuest = {
      ...currentGuest,
      status: status === 'confirmed' ? 'confirmed' : 'declined',
      confirmedGuests: status === 'confirmed' ? confirmedCount : 0,
      email: email || currentGuest.email || '',
      dietary: dietary || currentGuest.dietary || '',
      message: message || currentGuest.message || '',
      updatedAt: new Date().toISOString()
    };

    guests[guestIndex] = updatedGuest;
    fs.writeFileSync(GUESTS_FILE, JSON.stringify(guests, null, 2), 'utf8');

    // Save to RSVP log file for easy viewing
    const rsvps = JSON.parse(fs.readFileSync(RSVP_FILE, 'utf8') || '[]');
    const logEntry = {
      id: Date.now().toString(),
      guestId,
      name: currentGuest.name,
      status: updatedGuest.status,
      confirmedGuests: updatedGuest.confirmedGuests,
      maxGuests: currentGuest.maxGuests,
      email: updatedGuest.email,
      dietary: updatedGuest.dietary,
      message: updatedGuest.message,
      submittedAt: updatedGuest.updatedAt
    };
    rsvps.push(logEntry);
    fs.writeFileSync(RSVP_FILE, JSON.stringify(rsvps, null, 2), 'utf8');

    console.log(`RSVP Updated: ${currentGuest.name} - Status: ${updatedGuest.status} (${updatedGuest.confirmedGuests}/${currentGuest.maxGuests} seats)`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'RSVP updated successfully.', 
      guest: updatedGuest 
    });
  } catch (error) {
    console.error('Error confirming RSVP:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit Song Recommendation
app.post('/api/song', (req, res) => {
  try {
    const { name, title, artist } = req.body;

    if (!name || !title) {
      return res.status(400).json({ error: 'Name and song title are required.' });
    }

    const songs = JSON.parse(fs.readFileSync(SONGS_FILE, 'utf8') || '[]');

    const newSong = {
      id: Date.now().toString(),
      name,
      title,
      artist: artist || 'Unknown Artist',
      submittedAt: new Date().toISOString()
    };

    songs.push(newSong);
    fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2), 'utf8');

    console.log(`New Song suggestion: "${title}" by ${artist} from ${name}`);
    return res.status(201).json({ success: true, message: 'Song suggestion saved successfully.' });
  } catch (error) {
    console.error('Error handling song suggestion:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Route to view all RSVP confirmations
app.get('/api/admin/rsvps', (req, res) => {
  try {
    const guests = JSON.parse(fs.readFileSync(GUESTS_FILE, 'utf8') || '[]');
    const confirmedList = guests.filter(g => g.status !== 'pending');
    
    const summary = guests.reduce((acc, g) => {
      acc.totalGuests += g.maxGuests;
      if (g.status === 'confirmed') {
        acc.confirmedAttending += g.confirmedGuests;
        acc.repliedCount += 1;
      } else if (g.status === 'declined') {
        acc.declinedCount += 1;
        acc.repliedCount += 1;
      }
      return acc;
    }, { totalGuests: 0, confirmedAttending: 0, repliedCount: 0, declinedCount: 0 });

    summary.totalInvitations = guests.length;

    return res.json({ summary, guests: confirmedList });
  } catch (error) {
    console.error('Error in admin summary:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Invitation 2.0 server running at http://localhost:${PORT}`);
});
