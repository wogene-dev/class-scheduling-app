// Course Management System

class CourseManager {
    constructor() {
        this.courses = JSON.parse(localStorage.getItem('courses')) || [];
        this.courseModal = new bootstrap.Modal(document.getElementById('courseModal'));
        this.initializeEventListeners();
        this.loadCourses();
    }

    initializeEventListeners() {
        // Add course button
        document.getElementById('addCourseBtn').addEventListener('click', () => this.showCourseModal());

        // Course form submission
        document.getElementById('courseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCourseSubmit(e.target);
        });

        // Course search
        document.getElementById('courseFilter').addEventListener('input', (e) => {
            this.filterCourses(e.target.value);
        });
    }

    showCourseModal(courseId = null) {
        const form = document.getElementById('courseForm');
        const modalTitle = document.getElementById('modalTitle');
        
        form.reset();
        if (courseId) {
            const course = this.courses.find(c => c.id === courseId);
            if (course) {
                modalTitle.textContent = 'Edit Course';
                this.populateForm(form, course);
            }
        } else {
            modalTitle.textContent = 'Add New Course';
            form.courseId.value = '';
        }
        
        this.updatePrerequisiteOptions();
        this.updateTeacherOptions();
        this.courseModal.show();
    }

    populateForm(form, course) {
        form.courseId.value = course.id;
        form.code.value = course.code;
        form.name.value = course.name;
        form.credits.value = course.credits;
        form.department.value = course.department;
        form.description.value = course.description;
        form.semester.value = course.semester;
        form.capacity.value = course.capacity;

        // Handle multiple selects
        Array.from(form.prerequisites.options).forEach(option => {
            option.selected = course.prerequisites.includes(option.value);
        });
        Array.from(form.teachers.options).forEach(option => {
            option.selected = course.teachers.includes(option.value);
        });
    }

    updatePrerequisiteOptions() {
        const select = document.querySelector('select[name="prerequisites"]');
        select.innerHTML = '';
        
        this.courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.code;
            option.textContent = `${course.code} - ${course.name}`;
            select.appendChild(option);
        });
    }

    updateTeacherOptions() {
        const select = document.querySelector('select[name="teachers"]');
        select.innerHTML = '';
        
        const teachers = JSON.parse(localStorage.getItem('users')) || [];
        teachers.filter(user => user.role === 'teacher').forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.username;
            option.textContent = teacher.username;
            select.appendChild(option);
        });
    }

    handleCourseSubmit(form) {
        const courseData = {
            id: form.courseId.value || Date.now().toString(),
            code: form.code.value,
            name: form.name.value,
            credits: parseInt(form.credits.value),
            department: form.department.value,
            description: form.description.value,
            prerequisites: Array.from(form.prerequisites.selectedOptions).map(option => option.value),
            teachers: Array.from(form.teachers.selectedOptions).map(option => option.value),
            semester: parseInt(form.semester.value),
            capacity: parseInt(form.capacity.value)
        };

        if (form.courseId.value) {
            const index = this.courses.findIndex(c => c.id === form.courseId.value);
            if (index !== -1) {
                this.courses[index] = courseData;
            }
        } else {
            this.courses.push(courseData);
        }

        this.saveCourses();
        this.loadCourses();
        this.courseModal.hide();
        showToast('Course saved successfully!', 'success');
    }

    deleteCourse(courseId) {
        if (confirm('Are you sure you want to delete this course?')) {
            this.courses = this.courses.filter(course => course.id !== courseId);
            this.saveCourses();
            this.loadCourses();
            showToast('Course deleted successfully!', 'success');
        }
    }

    saveCourses() {
        localStorage.setItem('courses', JSON.stringify(this.courses));
    }

    loadCourses() {
        const container = document.getElementById('coursesContainer');
        container.innerHTML = '';

        if (this.courses.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted my-5">
                    <i class="fas fa-book-open fa-3x mb-3"></i>
                    <p>No courses available. Click "Add Course" to create one.</p>
                </div>
            `;
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const row = document.createElement('div');
        row.className = 'row g-4';

        this.courses.forEach(course => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            col.innerHTML = this.createCourseCard(course, currentUser);
            row.appendChild(col);
        });

        container.appendChild(row);
    }

    createCourseCard(course, currentUser) {
        const prerequisites = course.prerequisites
            .map(code => {
                const prereq = this.courses.find(c => c.code === code);
                return prereq ? `${prereq.code} - ${prereq.name}` : code;
            })
            .join(', ');

        const canEdit = currentUser.role === 'admin';
        const actionButtons = canEdit ? `
            <button class="btn btn-sm btn-primary" onclick="courseManager.showCourseModal('${course.id}')">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="courseManager.deleteCourse('${course.id}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        ` : '';

        return `
            <div class="card course-card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">${course.code}</h5>
                </div>
                <div class="card-body">
                    <h6 class="card-subtitle mb-2">${course.name}</h6>
                    <p class="card-text">${course.description}</p>
                    <ul class="list-unstyled">
                        <li><i class="fas fa-graduation-cap"></i> Credits: ${course.credits}</li>
                        <li><i class="fas fa-building"></i> Department: ${course.department}</li>
                        <li><i class="fas fa-calendar"></i> Semester: ${course.semester}</li>
                        <li><i class="fas fa-users"></i> Capacity: ${course.capacity}</li>
                        <li>
                            <i class="fas fa-chalkboard-teacher"></i> Teachers:
                            <div class="mt-1">
                                ${course.teachers.map(teacher => `
                                    <span class="badge bg-secondary">${teacher}</span>
                                `).join(' ')}
                            </div>
                        </li>
                        ${prerequisites ? `
                            <li class="mt-2">
                                <i class="fas fa-list"></i> Prerequisites:
                                <div class="mt-1">
                                    ${prerequisites.split(', ').map(prereq => `
                                        <span class="badge bg-info">${prereq}</span>
                                    `).join(' ')}
                                </div>
                            </li>
                        ` : ''}
                    </ul>
                </div>
                ${actionButtons ? `
                    <div class="card-footer">
                        <div class="course-actions">
                            ${actionButtons}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    filterCourses(query) {
        const container = document.getElementById('coursesContainer');
        const cards = container.getElementsByClassName('col-md-6');
        
        query = query.toLowerCase();
        Array.from(cards).forEach(card => {
            const courseContent = card.textContent.toLowerCase();
            card.style.display = courseContent.includes(query) ? '' : 'none';
        });
    }
}

// Initialize course manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.courseManager = new CourseManager();
});
