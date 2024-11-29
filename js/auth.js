// Authentication and User Management

class Auth {
    constructor() {
        this.users = this.loadUsers();
    }

    // Load users from localStorage
    loadUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : this.getDefaultUsers();
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // Get default users for initial setup
    getDefaultUsers() {
        return {
            admin: {
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                name: 'System Administrator'
            },
            teacher1: {
                username: 'teacher1',
                password: 'teacher123',
                role: 'teacher',
                name: 'John Doe',
                department: 'Computer Science'
            },
            student1: {
                username: 'student1',
                password: 'student123',
                role: 'student',
                name: 'Jane Smith',
                studentId: 'CS2024001'
            }
        };
    }

    // Validate user credentials
    validateCredentials(username, password) {
        const user = Object.values(this.users).find(u => 
            u.username === username && u.password === password
        );
        return user || null;
    }

    // Add new user
    addUser(userData) {
        if (this.users[userData.username]) {
            throw new Error('Username already exists');
        }
        this.users[userData.username] = userData;
        this.saveUsers();
    }

    // Update user
    updateUser(username, userData) {
        if (!this.users[username]) {
            throw new Error('User not found');
        }
        this.users[username] = { ...this.users[username], ...userData };
        this.saveUsers();
    }

    // Delete user
    deleteUser(username) {
        if (!this.users[username]) {
            throw new Error('User not found');
        }
        delete this.users[username];
        this.saveUsers();
    }

    // Get user by username
    getUser(username) {
        return this.users[username] || null;
    }

    // Get all users
    getAllUsers() {
        return Object.values(this.users);
    }

    // Get users by role
    getUsersByRole(role) {
        return Object.values(this.users).filter(user => user.role === role);
    }
}

// Initialize Auth System
const authSystem = new Auth();

// Export for use in other files
window.authSystem = authSystem;
