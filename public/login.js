// Teacher Login and Status Manager
const socket = io();

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const updateNameBtn = document.getElementById('update-name-btn');
const newDisplayNameInput = document.getElementById('new-display-name');
const nameMessage = document.getElementById('name-message');
const statusMessage = document.getElementById('status-message');
const statusButtons = document.querySelectorAll('.status-btn');

// State
let currentTeacherId = null;
let currentEmail = null;
let currentDisplayName = null;
let currentStatus = 'Available';

// Helper function to escape HTML
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

// Helper function to show message
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message show ${type}`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        element.classList.remove('show');
    }, 3000);
}

// Socket connection events
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    if (currentTeacherId) {
        logoutTeacher();
    }
});

// Login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const displayName = document.getElementById('displayName').value.trim() || email.split('@')[0];

    if (!email || !password) {
        showLoginError('Please enter both email and password');
        return;
    }

    // Disable submit button
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    socket.emit('teacher-login', { email, password, displayName }, (response) => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';

        if (response.success) {
            currentTeacherId = response.teacherId;
            currentEmail = email;
            currentDisplayName = displayName;
            currentStatus = 'Available';
            showDashboard();
            loginForm.reset();
            loginError.classList.remove('show');
        } else {
            showLoginError(response.message || 'Login failed');
        }
    });
});

// Show login error
function showLoginError(message) {
    loginError.textContent = message;
    loginError.classList.add('show');
}

// Show dashboard after login
function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    
    // Update teacher info
    document.getElementById('current-email').textContent = escapeHtml(currentEmail);
    document.getElementById('current-display-name').textContent = escapeHtml(currentDisplayName);
    
    // Update status display
    updateStatusDisplay();
}

// Hide dashboard (logout)
function hideDashboard() {
    dashboardSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    
    // Clear messages
    nameMessage.classList.remove('show');
    statusMessage.classList.remove('show');
    
    // Reset status buttons
    statusButtons.forEach(btn => btn.classList.remove('active'));
}

// Update display name
updateNameBtn.addEventListener('click', () => {
    const newName = newDisplayNameInput.value.trim();
    
    if (!newName) {
        showMessage('name-message', 'Please enter a display name', 'error');
        return;
    }

    if (newName === currentDisplayName) {
        showMessage('name-message', 'Please enter a different name', 'error');
        return;
    }

    updateNameBtn.disabled = true;
    updateNameBtn.textContent = 'Updating...';

    socket.emit('update-display-name', { displayName: newName }, (response) => {
        updateNameBtn.disabled = false;
        updateNameBtn.textContent = 'Update Name';

        if (response.success) {
            currentDisplayName = newName;
            document.getElementById('current-display-name').textContent = escapeHtml(newName);
            newDisplayNameInput.value = '';
            showMessage('name-message', 'Display name updated successfully', 'success');
        } else {
            showMessage('name-message', response.message || 'Failed to update name', 'error');
        }
    });
});

// Status button click handler
statusButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const status = btn.dataset.status;
        updateStatus(status);
    });
});

// Update status
function updateStatus(status) {
    if (status === currentStatus) {
        showMessage('status-message', `Already set to "${status}"`, 'error');
        return;
    }

    socket.emit('update-status', { status }, (response) => {
        if (response.success) {
            currentStatus = status;
            updateStatusDisplay();
            showMessage('status-message', `Status updated to "${status}"`, 'success');
        } else {
            showMessage('status-message', response.message || 'Failed to update status', 'error');
        }
    });
}

// Update status display UI
function updateStatusDisplay() {
    // Update button styles
    statusButtons.forEach(btn => {
        if (btn.dataset.status === currentStatus) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update status text
    const currentStatusP = document.getElementById('current-status');
    const statusIndicator = getStatusIndicator(currentStatus);
    currentStatusP.innerHTML = `Current Status: <strong>${currentStatus}</strong> ${statusIndicator}`;
}

// Get status indicator HTML
function getStatusIndicator(status) {
    const indicators = {
        'Available': '<span class="status-indicator available" style="display: inline-block;"></span>',
        'Absent': '<span class="status-indicator absent" style="display: inline-block;"></span>',
        'In Class': '<span class="status-indicator in-class" style="display: inline-block;"></span>',
        'In Meeting': '<span class="status-indicator in-meeting" style="display: inline-block;"></span>'
    };
    return indicators[status] || '';
}

// Logout handler
logoutBtn.addEventListener('click', () => {
    logoutBtn.disabled = true;
    logoutBtn.textContent = 'Logging out...';

    socket.emit('teacher-logout', () => {
        logoutTeacher();
    });
});

// Logout teacher
function logoutTeacher() {
    currentTeacherId = null;
    currentEmail = null;
    currentDisplayName = null;
    currentStatus = 'Available';

    hideDashboard();

    logoutBtn.disabled = false;
    logoutBtn.textContent = 'Logout';
}

// Initialize
console.log('Teacher Login & Status Manager loaded');
