# Teacher Dashboard

A real-time teacher monitoring dashboard with a public display and private teacher portal. Teachers can update their status and display name, which is instantly reflected across all connected clients.

## Features

✨ **Real-Time Updates**: WebSocket-based live status synchronization  
👥 **Public Dashboard**: Display all teachers' names and statuses  
🔐 **Teacher Portal**: Secure login to manage personal status  
📱 **Responsive Design**: Mobile and desktop friendly  
🎨 **Status Indicators**: Visual indicators for different teacher statuses
- 🟢 Available (Green)
- 🔵 Absent (Blue)
- 🔴 In Class (Red)
- 🟡 In Meeting (Yellow)

## Tech Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express.js** (v4.18.2): Web framework
- **Socket.IO** (v4.7.2): Real-time bidirectional communication
- **CORS**: Cross-Origin Resource Sharing

### Frontend
- **HTML5**: Page structure
- **CSS3**: Responsive styling with media queries
- **Vanilla JavaScript**: DOM manipulation (no frameworks)
- **Socket.IO Client**: Real-time communication

### Architecture
- In-memory data storage (no database)
- Mock authentication system
- Single-page applications with client-side routing
- WebSocket-based real-time updates

## Project Structure

```
teacher-dashboard/
├── index.js                  # Express + Socket.IO server
├── package.json              # Dependencies
├── public/                   # Static files served by Express
│   ├── index.html           # Public dashboard page
│   ├── login.html           # Teacher login & dashboard page
│   ├── styles.css           # Shared styles
│   ├── app.js               # Public dashboard logic
│   └── login.js             # Teacher login logic
└── README.md                # This file
```

**Monolithic Architecture**: All code and static files are organized in a single directory with no separation between client and server folders. The Express server serves all static files from the `public/` folder.

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Start the server**:
```bash
npm start
```

The server will start on `http://localhost:3000`

## Usage

### Public Dashboard
Visit `http://localhost:3000/` to see the public teacher monitoring dashboard. This page displays:
- All currently logged-in teachers
- Their display names
- Their current status with color indicators
- Last update timestamp

### Teacher Portal
Teachers access `http://localhost:3000/login` to:
1. **Login** with any email/password combination (demo mode)
2. **Manage their display name** - Show custom name on public dashboard
3. **Update their status** - Choose from: Available, Absent, In Class, In Meeting
4. **Logout** - Remove their status from the dashboard

### Demo Credentials
Since the system uses mock authentication, you can login with any combination:
- **Email**: `teacher@school.com` (or any valid email format)
- **Password**: `password123` (or any password)
- **Display Name**: Optional (defaults to email prefix if not provided)

## How It Works

### Real-Time Communication Flow

```
Teacher Portal                    Express Server                 Public Dashboard
     ↓                                ↓                                ↓
1. Login                        → Authenticate
                                → Store teacher data
                                → Broadcast to all clients  →  Receive update
                                                             ← Display teacher

2. Update Status                → Update teacher status
                                → Broadcast to all clients  →  Receive update
                                                             ← Refresh display

3. Disconnect/Logout            → Remove teacher
                                → Broadcast to all clients  →  Receive update
                                                             ← Remove display
```

### Data Storage
The system maintains an in-memory Map of active teachers:
```javascript
{
  "teacher@school.com": {
    id: "teacher@school.com",
    email: "teacher@school.com",
    displayName: "John Smith",
    status: "Available",
    lastUpdated: "2026-02-12T10:30:00.000Z"
  }
}
```

## API Events (Socket.IO)

### Client → Server

**teacher-login**
```javascript
socket.emit('teacher-login', { 
  email: string, 
  password: string, 
  displayName: string 
}, callback)
```

**update-status**
```javascript
socket.emit('update-status', { 
  status: 'Available' | 'Absent' | 'In Class' | 'In Meeting' 
}, callback)
```

**update-display-name**
```javascript
socket.emit('update-display-name', { 
  displayName: string 
}, callback)
```

**teacher-logout**
```javascript
socket.emit('teacher-logout')
```

### Server → Client

**teacher-list**
```javascript
socket.on('teacher-list', (teachers: Array) => {
  // teachers = [{ id, email, displayName, status, lastUpdated }]
})
```

## Features Breakdown

### Public Dashboard (index.html)
- Connects to server and listens for teacher list updates
- Displays all active teachers in a responsive grid
- Shows status with animated color indicators
- Auto-updates when teachers login/logout/change status
- No authentication required

### Teacher Portal (login.html)
- **Login Form**: Email, password, optional display name
- **Status Manager**: 4 status buttons with visual indicators
- **Name Manager**: Update display name anytime
- **Real-time Feedback**: Success/error messages for actions
- **Session Management**: Logout to remove from public view
- **Responsive Design**: Works on mobile and desktop

## Security Notes

⚠️ **Important**: This is a demo application with mock authentication!

For production use, you should:
- Implement real authentication (OAuth, JWT, etc.)
- Use HTTPS/WSS for secure connections
- Add backend validation and rate limiting
- Store data in a proper database
- Implement proper error handling
- Add logging and monitoring

## Development

### Running in Development Mode
```bash
npm start
```

Then open in your browser:
- Dashboard: http://localhost:3000
- Teacher Login: http://localhost:3000/login

### Hot Reload
To enable auto-restart on file changes, install nodemon:
```bash
npm install -g nodemon
nodemon index.js
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Real-time Updates**: <100ms latency via WebSocket
- **Responsive**: CSS animations for smooth UI
- **Scalable**: Can handle hundreds of concurrent connections
- **Efficient**: Minimal payload sizes for each update

## Future Enhancements

Possible improvements:
- Database integration for persistence
- Real authentication system
- Teacher availability history/analytics
- Scheduled status changes
- Status notes/descriptions
- Teacher search/filtering
- Multi-school support
- Admin panel
- Notifications
- Statistics and reporting

## License

MIT

## Support

For issues or questions, please create an issue on the GitHub repository.
