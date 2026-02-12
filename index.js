const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data storage
const teachers = new Map();
const sessions = new Map();

// Teacher status options
const STATUS_OPTIONS = {
  AVAILABLE: 'Available',
  ABSENT: 'Absent',
  IN_CLASS: 'In Class',
  IN_MEETING: 'In Meeting'
};

// Mock authentication
const authenticateTeacher = (email, password) => {
  // Simple mock authentication - any email/password combination works for demo
  if (email && password && email.includes('@')) {
    return true;
  }
  return false;
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Send all current teachers data to newly connected client
  const teachersArray = Array.from(teachers.values());
  socket.emit('teacher-list', teachersArray);

  // Handle teacher login
  socket.on('teacher-login', (data, callback) => {
    const { email, password, displayName } = data;

    if (!authenticateTeacher(email, password)) {
      return callback({ success: false, message: 'Invalid credentials' });
    }

    const teacherId = email;
    const sessionId = socket.id;

    // Create or update teacher
    teachers.set(teacherId, {
      id: teacherId,
      email: email,
      displayName: displayName || email.split('@')[0],
      status: STATUS_OPTIONS.AVAILABLE,
      lastUpdated: new Date().toISOString()
    });

    // Store session
    sessions.set(sessionId, {
      teacherId: teacherId,
      email: email
    });

    // Broadcast updated teacher list to all clients
    const teachersArray = Array.from(teachers.values());
    io.emit('teacher-list', teachersArray);

    callback({
      success: true,
      message: 'Logged in successfully',
      teacherId: teacherId
    });

    console.log(`Teacher logged in: ${email}`);
  });

  // Handle status update
  socket.on('update-status', (data, callback) => {
    const { status } = data;
    const session = sessions.get(socket.id);

    if (!session || !teachers.has(session.teacherId)) {
      return callback({ success: false, message: 'Not authenticated' });
    }

    const teacher = teachers.get(session.teacherId);
    teacher.status = status;
    teacher.lastUpdated = new Date().toISOString();

    // Broadcast updated teacher list to all clients
    const teachersArray = Array.from(teachers.values());
    io.emit('teacher-list', teachersArray);

    callback({ success: true, message: 'Status updated' });
    console.log(`${session.email} status updated to: ${status}`);
  });

  // Handle display name update
  socket.on('update-display-name', (data, callback) => {
    const { displayName } = data;
    const session = sessions.get(socket.id);

    if (!session || !teachers.has(session.teacherId)) {
      return callback({ success: false, message: 'Not authenticated' });
    }

    const teacher = teachers.get(session.teacherId);
    teacher.displayName = displayName;
    teacher.lastUpdated = new Date().toISOString();

    // Broadcast updated teacher list to all clients
    const teachersArray = Array.from(teachers.values());
    io.emit('teacher-list', teachersArray);

    callback({ success: true, message: 'Display name updated' });
    console.log(`${session.email} display name updated to: ${displayName}`);
  });

  // Handle logout
  socket.on('teacher-logout', () => {
    const session = sessions.get(socket.id);
    if (session) {
      const teacherId = session.teacherId;
      console.log(`Teacher logged out: ${session.email}`);
      
      // Remove teacher from the list
      teachers.delete(teacherId);
      sessions.delete(socket.id);

      // Broadcast updated teacher list to all clients
      const teachersArray = Array.from(teachers.values());
      io.emit('teacher-list', teachersArray);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const session = sessions.get(socket.id);
    if (session) {
      const teacherId = session.teacherId;
      teachers.delete(teacherId);
      sessions.delete(socket.id);

      // Broadcast updated teacher list to all clients
      const teachersArray = Array.from(teachers.values());
      io.emit('teacher-list', teachersArray);

      console.log(`Teacher disconnected: ${session.email}`);
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Public dashboard: http://localhost:${PORT}/`);
  console.log(`Teacher login: http://localhost:${PORT}/login`);
});
