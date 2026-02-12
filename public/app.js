// Public Dashboard - Teacher List Display
const socket = io();
const teacherList = document.getElementById('teacher-list');

// Status color mapping
const statusConfig = {
    'Available': { class: 'available', color: '#10b981' },
    'Absent': { class: 'absent', color: '#3b82f6' },
    'In Class': { class: 'in-class', color: '#ef4444' },
    'In Meeting': { class: 'in-meeting', color: '#f59e0b' }
};

// Socket connection events
socket.on('connect', () => {
    console.log('Connected to server');
    teacherList.innerHTML = '<div class="loading">Waiting for teachers...</div>';
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

// Receive and display teacher list
socket.on('teacher-list', (teachers) => {
    displayTeachers(teachers);
});

// Display teachers in the list
function displayTeachers(teachers) {
    if (!teachers || teachers.length === 0) {
        teacherList.innerHTML = '<div class="empty-state">No teachers available right now</div>';
        return;
    }

    teacherList.innerHTML = teachers
        .map(teacher => createTeacherCard(teacher))
        .join('');
}

// Create teacher card HTML
function createTeacherCard(teacher) {
    const statusInfo = statusConfig[teacher.status] || statusConfig['Available'];
    const lastUpdated = formatTime(teacher.lastUpdated);

    return `
        <div class="teacher-card ${statusInfo.class}">
            <div class="display-name">${escapeHtml(teacher.displayName)}</div>
            <div class="status">
                <span class="status-indicator ${statusInfo.class}"></span>
                <span>${teacher.status}</span>
            </div>
            <div class="updated">Last updated: ${lastUpdated}</div>
        </div>
    `;
}

// Format timestamp
function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    // Fallback to time format
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}
