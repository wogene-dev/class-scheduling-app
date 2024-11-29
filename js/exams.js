class ExamManager {
    constructor() {
        this.exams = JSON.parse(localStorage.getItem('exams')) || [];
        this.examModal = new bootstrap.Modal(document.getElementById('examModal'));
        this.initializeEventListeners();
        this.loadExams();
    }

    initializeEventListeners() {
        // Add exam button
        document.getElementById('addExamBtn').addEventListener('click', () => this.showExamModal());

        // Exam form submission
        document.getElementById('examForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleExamSubmit(e.target);
        });
    }

    showExamModal(examId = null) {
        const form = document.getElementById('examForm');
        const modalTitle = document.getElementById('examModalTitle');
        
        form.reset();
        if (examId) {
            const exam = this.exams.find(e => e.id === examId);
            if (exam) {
                modalTitle.textContent = 'Edit Exam';
                this.populateForm(form, exam);
            }
        } else {
            modalTitle.textContent = 'Add New Exam';
            form.examId.value = '';
        }
        
        this.updateCourseOptions();
        this.examModal.show();
    }

    populateForm(form, exam) {
        form.examId.value = exam.id;
        form.course.value = exam.course;
        form.date.value = exam.date;
        form.time.value = exam.time;
        form.duration.value = exam.duration;
        form.location.value = exam.location;
    }

    updateCourseOptions() {
        const select = document.querySelector('select[name="course"]');
        select.innerHTML = '';
        
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.code;
            option.textContent = `${course.code} - ${course.name}`;
            select.appendChild(option);
        });
    }

    handleExamSubmit(form) {
        const examData = {
            id: form.examId.value || Date.now().toString(),
            course: form.course.value,
            date: form.date.value,
            time: form.time.value,
            duration: parseInt(form.duration.value),
            location: form.location.value
        };

        if (form.examId.value) {
            const index = this.exams.findIndex(e => e.id === form.examId.value);
            if (index !== -1) {
                this.exams[index] = examData;
            }
        } else {
            this.exams.push(examData);
        }

        this.saveExams();
        this.loadExams();
        this.examModal.hide();
        showToast('Exam saved successfully!', 'success');
    }

    deleteExam(examId) {
        if (confirm('Are you sure you want to delete this exam?')) {
            this.exams = this.exams.filter(exam => exam.id !== examId);
            this.saveExams();
            this.loadExams();
            showToast('Exam deleted successfully!', 'success');
        }
    }

    saveExams() {
        localStorage.setItem('exams', JSON.stringify(this.exams));
    }

    loadExams() {
        const container = document.getElementById('examsContainer');
        container.innerHTML = '';

        if (this.exams.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted my-5">
                    <i class="fas fa-calendar-alt fa-3x mb-3"></i>
                    <p>No exams scheduled. Click "Add Exam" to create one.</p>
                </div>
            `;
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const row = document.createElement('div');
        row.className = 'row g-4';

        this.exams.forEach(exam => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            col.innerHTML = this.createExamCard(exam, currentUser);
            row.appendChild(col);
        });

        container.appendChild(row);
    }

    createExamCard(exam, currentUser) {
        const canEdit = currentUser.role === 'admin';
        const actionButtons = canEdit ? `
            <button class="btn btn-sm btn-primary" onclick="examManager.showExamModal('${exam.id}')">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="examManager.deleteExam('${exam.id}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        ` : '';

        return `
            <div class="card exam-card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">${exam.course}</h5>
                </div>
                <div class="card-body">
                    <h6 class="card-subtitle mb-2">Date: ${exam.date}</h6>
                    <p class="card-text">Time: ${exam.time}</p>
                    <p class="card-text">Duration: ${exam.duration} hours</p>
                    <p class="card-text">Location: ${exam.location}</p>
                </div>
                ${actionButtons ? `
                    <div class="card-footer">
                        <div class="exam-actions">
                            ${actionButtons}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

// Initialize exam manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.examManager = new ExamManager();
});
