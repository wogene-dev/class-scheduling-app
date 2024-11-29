// Schedule Management System

class ScheduleManager {
    constructor() {
        this.schedules = this.loadSchedules();
        this.initializeEventListeners();
    }

    // Load schedules from localStorage
    loadSchedules() {
        const schedules = localStorage.getItem('schedules');
        return schedules ? JSON.parse(schedules) : [];
    }

    // Save schedules to localStorage
    saveSchedules() {
        localStorage.setItem('schedules', JSON.stringify(this.schedules));
    }

    // Initialize event listeners
    initializeEventListeners() {
        const addScheduleBtn = document.getElementById('addScheduleBtn');
        if (addScheduleBtn) {
            addScheduleBtn.addEventListener('click', () => this.showAddScheduleModal());
        }

        const scheduleForm = document.getElementById('scheduleForm');
        if (scheduleForm) {
            scheduleForm.addEventListener('submit', (e) => this.handleScheduleSubmit(e));
        }
    }

    // Create new schedule
    createSchedule(scheduleData) {
        const newSchedule = {
            id: Date.now().toString(),
            ...scheduleData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.schedules.push(newSchedule);
        this.saveSchedules();
        this.renderSchedules();
        return newSchedule;
    }

    // Update existing schedule
    updateSchedule(scheduleId, updateData) {
        const index = this.schedules.findIndex(s => s.id === scheduleId);
        if (index !== -1) {
            this.schedules[index] = {
                ...this.schedules[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            this.saveSchedules();
            this.renderSchedules();
        }
    }

    // Delete schedule
    deleteSchedule(scheduleId) {
        this.schedules = this.schedules.filter(s => s.id !== scheduleId);
        this.saveSchedules();
        this.renderSchedules();
    }

    // Handle schedule form submission
    handleScheduleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const scheduleData = {
            course: formData.get('course'),
            teacher: formData.get('teacher'),
            classroom: formData.get('classroom'),
            dayOfWeek: formData.get('dayOfWeek'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            type: formData.get('type') // 'regular' or 'exam'
        };

        if (formData.get('scheduleId')) {
            this.updateSchedule(formData.get('scheduleId'), scheduleData);
        } else {
            this.createSchedule(scheduleData);
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('scheduleModal'));
        modal.hide();
    }

    // Show add schedule modal
    showAddScheduleModal() {
        const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
        document.getElementById('scheduleForm').reset();
        document.getElementById('modalTitle').textContent = 'Add New Schedule';
        modal.show();
    }

    // Show edit schedule modal
    showEditScheduleModal(scheduleId) {
        const schedule = this.schedules.find(s => s.id === scheduleId);
        if (!schedule) return;

        const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
        const form = document.getElementById('scheduleForm');
        
        // Fill form with schedule data
        form.elements['scheduleId'].value = schedule.id;
        form.elements['course'].value = schedule.course;
        form.elements['teacher'].value = schedule.teacher;
        form.elements['classroom'].value = schedule.classroom;
        form.elements['dayOfWeek'].value = schedule.dayOfWeek;
        form.elements['startTime'].value = schedule.startTime;
        form.elements['endTime'].value = schedule.endTime;
        form.elements['type'].value = schedule.type;

        document.getElementById('modalTitle').textContent = 'Edit Schedule';
        modal.show();
    }

    // Render schedules in the UI
    renderSchedules() {
        const container = document.getElementById('scheduleContainer');
        if (!container) return;

        const currentUser = getCurrentUser();
        const schedules = this.filterSchedulesByRole(currentUser);

        container.innerHTML = schedules.length ? this.generateScheduleHTML(schedules) : 
            '<div class="text-center p-4">No schedules found</div>';

        // Add event listeners to action buttons
        this.addScheduleEventListeners();
    }

    // Filter schedules based on user role
    filterSchedulesByRole(user) {
        if (!user) return [];
        
        switch (user.role) {
            case 'admin':
                return this.schedules;
            case 'teacher':
                return this.schedules.filter(s => s.teacher === user.username);
            case 'student':
                // For students, show all regular schedules and their exam schedules
                return this.schedules.filter(s => s.type === 'regular' || 
                    (s.type === 'exam' && s.students?.includes(user.username)));
            default:
                return [];
        }
    }

    // Generate HTML for schedules
    generateScheduleHTML(schedules) {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const timeSlots = this.generateTimeSlots();
        
        let html = '<div class="table-responsive"><table class="table table-bordered schedule-table">';
        
        // Header
        html += '<thead><tr><th>Time</th>';
        daysOfWeek.forEach(day => {
            html += `<th>${day}</th>`;
        });
        html += '</tr></thead><tbody>';

        // Time slots
        timeSlots.forEach(time => {
            html += `<tr><td>${time}</td>`;
            daysOfWeek.forEach(day => {
                const schedule = this.findScheduleForTimeSlot(time, day);
                html += this.generateScheduleCell(schedule);
            });
            html += '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }

    // Generate time slots
    generateTimeSlots() {
        const slots = [];
        for (let hour = 8; hour <= 17; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        return slots;
    }

    // Find schedule for a specific time slot
    findScheduleForTimeSlot(time, day) {
        return this.schedules.find(s => 
            s.dayOfWeek === day && 
            s.startTime <= time && 
            s.endTime > time
        );
    }

    // Generate HTML for a schedule cell
    generateScheduleCell(schedule) {
        if (!schedule) {
            return '<td></td>';
        }

        const currentUser = getCurrentUser();
        const canEdit = currentUser?.role === 'admin';

        return `
            <td class="schedule-cell ${schedule.type === 'exam' ? 'exam-schedule' : ''}">
                <div class="schedule-content">
                    <strong>${schedule.course}</strong><br>
                    Teacher: ${schedule.teacher}<br>
                    Room: ${schedule.classroom}
                    ${canEdit ? `
                        <div class="schedule-actions">
                            <button class="btn btn-sm btn-primary edit-schedule" data-id="${schedule.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-schedule" data-id="${schedule.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </td>
        `;
    }

    // Add event listeners to schedule actions
    addScheduleEventListeners() {
        document.querySelectorAll('.edit-schedule').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scheduleId = e.currentTarget.dataset.id;
                this.showEditScheduleModal(scheduleId);
            });
        });

        document.querySelectorAll('.delete-schedule').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scheduleId = e.currentTarget.dataset.id;
                if (confirm('Are you sure you want to delete this schedule?')) {
                    this.deleteSchedule(scheduleId);
                }
            });
        });
    }
}

// Initialize Schedule Manager
const scheduleManager = new ScheduleManager();

// Export for use in other files
window.scheduleManager = scheduleManager;
