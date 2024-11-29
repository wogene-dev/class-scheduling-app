class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.initializeEventListeners();
        this.checkAdminAccess();
    }

    initializeEventListeners() {
        // Manage Users button
        document.getElementById('manageUsersBtn')?.addEventListener('click', () => {
            this.navigateToSection('users');
        });

        // Manage Courses button
        document.getElementById('manageCoursesBtn')?.addEventListener('click', () => {
            this.navigateToSection('courses');
        });

        // Manage Schedules button
        document.getElementById('manageSchedulesBtn')?.addEventListener('click', () => {
            this.navigateToSection('schedules');
        });

        // Manage Exams button
        document.getElementById('manageExamsBtn')?.addEventListener('click', () => {
            this.navigateToSection('exams');
        });

        // Listen for authentication events
        window.addEventListener('userLoggedIn', (event) => {
            this.handleUserLogin(event.detail);
        });

        window.addEventListener('userLoggedOut', () => {
            this.handleUserLogout();
        });
    }

    checkAdminAccess() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            this.handleUserLogin(currentUser);
        }
    }

    handleUserLogin(user) {
        this.currentUser = user;
        if (user.role === 'admin') {
            this.showAdminDashboard();
        } else {
            this.hideAdminDashboard();
        }
    }

    handleUserLogout() {
        this.currentUser = null;
        this.hideAdminDashboard();
    }

    showAdminDashboard() {
        const adminDashboard = document.getElementById('adminDashboard');
        if (adminDashboard) {
            adminDashboard.classList.remove('d-none');
            // Add admin-specific nav item
            this.addAdminNavItem();
        }
    }

    hideAdminDashboard() {
        const adminDashboard = document.getElementById('adminDashboard');
        if (adminDashboard) {
            adminDashboard.classList.add('d-none');
            // Remove admin-specific nav item
            this.removeAdminNavItem();
        }
    }

    addAdminNavItem() {
        const navbarNav = document.querySelector('#navbarNav .navbar-nav');
        if (!navbarNav || document.querySelector('#adminNavItem')) return;

        const adminNavItem = document.createElement('li');
        adminNavItem.className = 'nav-item';
        adminNavItem.id = 'adminNavItem';
        adminNavItem.innerHTML = `
            <a class="nav-link" href="#adminDashboard">
                <i class="fas fa-cogs"></i> Admin
            </a>
        `;
        
        // Insert before the login button
        const loginBtn = document.querySelector('#loginBtn')?.parentElement;
        if (loginBtn) {
            navbarNav.insertBefore(adminNavItem, loginBtn);
        } else {
            navbarNav.appendChild(adminNavItem);
        }

        // Add click event
        adminNavItem.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateToSection('adminDashboard');
        });
    }

    removeAdminNavItem() {
        const adminNavItem = document.querySelector('#adminNavItem');
        if (adminNavItem) {
            adminNavItem.remove();
        }
    }

    navigateToSection(sectionId) {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            console.warn('Access denied: Admin privileges required');
            return;
        }

        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('d-none');
        });

        // Show the selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('d-none');
        }
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});
