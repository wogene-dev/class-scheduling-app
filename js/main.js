// Main JavaScript file for the Scheduling System

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
const loginForm = document.getElementById('loginForm');
const sections = document.querySelectorAll('section');

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
loginBtn.addEventListener('click', () => loginModal.show());
loginForm.addEventListener('submit', handleLogin);

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        showSection(targetId);
    });
});

// Initialize Application
function initializeApp() {
    // Check if user is logged in
    const user = getCurrentUser();
    if (user) {
        updateUIForUser(user);
    }
    
    // Show home section by default
    showSection('home');
}

// Show/Hide Sections
function showSection(sectionId) {
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.remove('d-none');
        } else {
            section.classList.add('d-none');
        }
    });
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;

    try {
        // Simulate API call
        const user = await authenticateUser(username, password, userType);
        if (user) {
            loginModal.hide();
            updateUIForUser(user);
            showToast('Success', 'Login successful!', 'success');
        }
    } catch (error) {
        showToast('Error', error.message, 'danger');
    }
}

// Update UI based on user role
function updateUIForUser(user) {
    loginBtn.textContent = user.username;
    loginBtn.classList.remove('btn-light');
    loginBtn.classList.add('btn-outline-light');
    
    // Show/hide elements based on user role
    switch (user.role) {
        case 'admin':
            enableAdminFeatures();
            break;
        case 'teacher':
            enableTeacherFeatures();
            break;
        case 'student':
            enableStudentFeatures();
            break;
    }
}

// Role-specific UI updates
function enableAdminFeatures() {
    // Add admin-specific UI elements
}

function enableTeacherFeatures() {
    // Add teacher-specific UI elements
}

function enableStudentFeatures() {
    // Add student-specific UI elements
}

// Toast Notifications
function showToast(title, message, type = 'info') {
    const toastHTML = `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-${type} text-white">
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">${message}</div>
        </div>
    `;
    
    const toastContainer = document.createElement('div');
    toastContainer.innerHTML = toastHTML;
    document.body.appendChild(toastContainer);
    
    const toast = new bootstrap.Toast(toastContainer.querySelector('.toast'));
    toast.show();
    
    // Remove toast after it's hidden
    toastContainer.querySelector('.toast').addEventListener('hidden.bs.toast', () => {
        toastContainer.remove();
    });
}

// Local Storage Functions
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Mock Authentication (Replace with actual API calls)
async function authenticateUser(username, password, userType) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (username && password) {
        const user = {
            username,
            role: userType,
            id: Math.random().toString(36).substr(2, 9)
        };
        setCurrentUser(user);
        return user;
    }
    throw new Error('Invalid credentials');
}

// Schedule Management
class Schedule {
    constructor() {
        this.events = [];
    }

    addEvent(event) {
        this.events.push(event);
        this.saveEvents();
    }

    removeEvent(eventId) {
        this.events = this.events.filter(event => event.id !== eventId);
        this.saveEvents();
    }

    getEvents() {
        return this.events;
    }

    saveEvents() {
        localStorage.setItem('scheduleEvents', JSON.stringify(this.events));
    }

    loadEvents() {
        const events = localStorage.getItem('scheduleEvents');
        this.events = events ? JSON.parse(events) : [];
    }
}

// Initialize Schedule
const schedule = new Schedule();
schedule.loadEvents();
