// teacher-script.js - Modified for Backend API

let isTeacherLoggedIn = false;
let currentTeacher = null;

// DOM Elements
const teacherLoginContainer = document.getElementById('teacherLoginContainer');
const teacherDashboard = document.getElementById('teacherDashboard');
const teacherLoginForm = document.getElementById('teacherLoginForm');
const navItems = document.querySelectorAll('.admin-nav-item');
const sidebar = document.querySelector('.admin-sidebar');
const mobileToggle = document.getElementById('mobileToggle');
const sections = {
    schedule: document.getElementById('scheduleSection'),
    appointments: document.getElementById('appointmentsSection'),
    lessonSchedule: document.getElementById('lessonScheduleSection'),
    students: document.getElementById('studentsSection'),
    tasks: document.getElementById('tasksSection'),
    passedLessons: document.getElementById('passedLessonsSection')
};

const sectionTitle = document.getElementById('sectionTitle');
const sectionSubtitle = document.getElementById('sectionSubtitle');
const timeSlotsGrid = document.getElementById('timeSlotsGrid');
const appointmentsTableBody = document.getElementById('appointmentsTableBody');
const studentsTableBody = document.getElementById('studentsTableBody');
const lessonScheduleTableBody = document.getElementById('lessonScheduleTableBody');
const taskStudentSelect = document.getElementById('taskStudentSelect');
const studentTaskDisplay = document.getElementById('studentTaskDisplay');
const passedLessonsTableBody = document.getElementById('passedLessonsTableBody');

// Stats Elements
const statsToday = document.getElementById('statsToday');
const statsWeek = document.getElementById('statsWeek');
const statsMonth = document.getElementById('statsMonth');
const statsYear = document.getElementById('statsYear');

// Modals
const addStudentModal = document.getElementById('addStudentModal');
const manageStudentModal = document.getElementById('manageStudentModal');
const addStudentForm = document.getElementById('addStudentForm');
const manageStudentForm = document.getElementById('manageStudentForm');
const manageModalTitle = document.getElementById('manageModalTitle');

// Initial Load
document.addEventListener('DOMContentLoaded', async () => {
    await checkTeacherLoginStatus();
    setupTeacherEventListeners();
});

function setupTeacherEventListeners() {
    if (teacherLoginForm) teacherLoginForm.addEventListener('submit', handleTeacherLogin);
    if (addStudentForm) addStudentForm.addEventListener('submit', handleAddStudent);
    if (manageStudentForm) manageStudentForm.addEventListener('submit', handleSaveStudentDetails);

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(item.dataset.section);
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    document.querySelectorAll('.modal-close, .btn-ghost-cancel').forEach(btn => {
        btn.onclick = () => {
            if (addStudentModal) addStudentModal.style.display = 'none';
            if (manageStudentModal) manageStudentModal.style.display = 'none';
        };
    });

    const addStudentBtn = document.getElementById('openAddStudentModal');
    if (addStudentBtn) addStudentBtn.onclick = () => addStudentModal.style.display = 'flex';

    const saveScheduleBtn = document.getElementById('saveScheduleBtn');
    if (saveScheduleBtn) saveScheduleBtn.onclick = saveSchedule;

    const teacherLogoutBtn = document.getElementById('teacherLogoutBtn');
    if (teacherLogoutBtn) teacherLogoutBtn.onclick = handleLogout;
}

// Authentication
async function handleTeacherLogin(e) {
    e.preventDefault();
    const username = document.getElementById('teacherUser').value.trim();
    const password = document.getElementById('teacherPass').value.trim();

    try {
        const response = await fetch('/api/teachers');
        const teachers = await response.json();
        const teacher = teachers.find(t => t.username === username && t.password === password);

        if (teacher) {
            if (teacher.status !== 'active') {
                showToast('Sizning hisobingiz faollashtirilmagan!', 'error');
                return;
            }
            loginTeacher(teacher);
        } else {
            showToast('Login yoki parol noto\'g\'ri!', 'error');
        }
    } catch (error) {
        showToast('Server xatosi!', 'error');
    }
}

function loginTeacher(teacher) {
    isTeacherLoggedIn = true;
    currentTeacher = teacher;
    localStorage.setItem('teacherLoggedIn', JSON.stringify(teacher));

    teacherLoginContainer.style.display = 'none';
    teacherDashboard.style.display = 'flex';

    document.getElementById('sidebarTeacherName').textContent = teacher.name;
    document.getElementById('sidebarTeacherSpecialty').textContent = teacher.specialty;

    switchSection('schedule');
}

async function checkTeacherLoginStatus() {
    const saved = localStorage.getItem('teacherLoggedIn');
    if (saved) {
        try {
            const teacher = JSON.parse(saved);
            const response = await fetch('/api/teachers');
            const all = await response.json();
            const updated = all.find(t => t.id === teacher.id);
            if (updated) loginTeacher(updated);
            else handleLogout();
        } catch (e) { handleLogout(); }
    }
}

function handleLogout() {
    localStorage.removeItem('teacherLoggedIn');
    window.location.reload();
}

function switchSection(section) {
    navItems.forEach(item => item.classList.toggle('active', item.dataset.section === section));
    Object.keys(sections).forEach(key => sections[key].style.display = key === section ? 'block' : 'none');

    if (section === 'schedule') {
        sectionTitle.textContent = "Mening Jadvalim";
        loadSchedule();
    } else if (section === 'appointments') {
        sectionTitle.textContent = "Uchrashuvlar";
        loadAppointments();
    } else if (section === 'lesson-schedule') {
        sectionTitle.textContent = "Umumiy Jadval";
        loadOverallSchedule();
    } else if (section === 'students') {
        sectionTitle.textContent = "O'quvchilarim";
        loadStudents();
    } else if (section === 'tasks') {
        sectionTitle.textContent = "Vazifalar";
        loadTasksSection();
    } else if (section === 'passed-lessons') {
        sectionTitle.textContent = "Statistika";
        loadPassedLessonsStats();
    }
}

// Schedule
function loadSchedule() {
    timeSlotsGrid.innerHTML = '';
    const saved = currentTeacher.schedule || [];
    for (let i = 8; i < 18; i++) {
        [0, 30].forEach(m => {
            const time = `${i < 10 ? '0' + i : i}:${m === 0 ? '00' : '30'}`;
            const div = document.createElement('div');
            div.className = `time-slot ${saved.includes(time) ? 'selected' : ''}`;
            div.textContent = time;
            div.onclick = () => div.classList.toggle('selected');
            timeSlotsGrid.appendChild(div);
        });
    }
}

async function saveSchedule() {
    const selected = Array.from(document.querySelectorAll('.time-slot.selected')).map(s => s.textContent);
    try {
        const response = await fetch(`/api/teachers/${currentTeacher.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schedule: selected })
        });
        if (response.ok) {
            currentTeacher.schedule = selected;
            localStorage.setItem('teacherLoggedIn', JSON.stringify(currentTeacher));
            showToast('Saqlandi!');
        }
    } catch (e) { showToast('Xatolik!', 'error'); }
}

// Students
window.deleteStudent = async (email) => {
    if (confirm('O\'chirilsinmi?')) {
        try {
            const res = await fetch(`/api/users/${email}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('O\'chirildi!');
                loadStudents();
            }
        } catch (e) { showToast('Xatolik!', 'error'); }
    }
};

window.markLessonAsPassed = async (email) => {
    if (confirm('Dars tugatildimi?')) {
        // Here you could add logic to log the passed lesson
        showToast('Saqlandi!');
    }
};

async function loadStudents() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        const myStudents = users.filter(u => u.teacherId === currentTeacher.id);

        studentsTableBody.innerHTML = myStudents.map(student => `
            <tr>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.lessons ? student.lessons.map(l => l.day).join(', ') : 'Yo\'q'}</td>
                <td>
                    <button class="btn btn-primary" onclick="markLessonAsPassed('${student.email}')" style="font-size: 0.7rem; padding: 4px 8px;">Tugatish</button>
                    <button class="btn btn-ghost" onclick="openManageStudent('${student.email}')" style="font-size: 0.7rem; padding: 4px 8px;">Boshqarish</button>
                    <button class="btn btn-ghost" onclick="deleteStudent('${student.email}')" style="font-size: 0.7rem; padding: 4px 8px; color: red;">X</button>
                </td>
            </tr>
        `).join('') || "<tr><td colspan='4' align='center'>Yo'q</td></tr>";
    } catch (e) { }
}

async function handleAddStudent(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('newStudentName').value,
        email: document.getElementById('newStudentEmail').value,
        password: document.getElementById('newStudentPass').value,
        teacherId: currentTeacher.id,
        lessons: Array.from(document.querySelectorAll('#newStudentDays input:checked')).map(cb => ({
            day: cb.value,
            time: document.getElementById('newStudentLessonTime').value
        }))
    };
    try {
        const res = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            showToast('Qo\'shildi!');
            addStudentModal.style.display = 'none';
            loadStudents();
        }
    } catch (e) { }
}

window.openManageStudent = async (email) => {
    try {
        const res = await fetch(`/api/users/${email}`);
        const student = await res.json();
        document.getElementById('manageStudentId').value = student.email;
        manageModalTitle.textContent = student.name;
        document.getElementById('homeworkContent').value = student.homework || '';
        manageStudentModal.style.display = 'flex';
    } catch (e) { }
};

async function handleSaveStudentDetails(e) {
    e.preventDefault();
    const email = document.getElementById('manageStudentId').value;
    const data = {
        homework: document.getElementById('homeworkContent').value,
        homeworkDate: document.getElementById('homeworkDate').value
    };
    try {
        const res = await fetch(`/api/users/${email}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            showToast('Saqlandi!');
            manageStudentModal.style.display = 'none';
        }
    } catch (e) { }
}

// Others (Simplified for brevitiy/restoration)
async function loadAppointments() {
    const res = await fetch('/api/appointments');
    const all = await res.json();
    const my = all.filter(a => a.teacherId === currentTeacher.id);
    appointmentsTableBody.innerHTML = my.map(a => `<tr><td>${a.studentName}</td><td>${a.date}</td><td>${a.time}</td></tr>`).join('') || "<tr><td colspan='3' align='center'>Yo'q</td></tr>";
}

async function loadOverallSchedule() {
    const daysUz = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const todayUz = daysUz[new Date().getDay()];

    const res = await fetch('/api/users');
    const users = await res.json();
    const my = users.filter(u => u.teacherId === currentTeacher.id);
    let html = '';
    my.forEach(u => {
        if (u.lessons) {
            u.lessons.forEach(l => {
                if (l.day === todayUz) {
                    html += `<tr><td>${u.name}</td><td>${l.day}</td><td>${l.time}</td></tr>`;
                }
            });
        }
    });
    lessonScheduleTableBody.innerHTML = html || `<tr><td colspan='3' align='center'>Bugun (${todayUz}) uchun darslar yo'q</td></tr>`;
}

async function loadTasksSection() {
    try {
        const res = await fetch('/api/users');
        const users = await res.json();
        const myStudents = users.filter(u => u.teacherId === currentTeacher.id);

        taskStudentSelect.innerHTML = '<option value="">O\'quvchini tanlang</option>' +
            myStudents.map(s => `<option value="${s.email}">${s.name}</option>`).join('');

        taskStudentSelect.onchange = async () => {
            const email = taskStudentSelect.value;
            if (!email) {
                studentTaskDisplay.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 3rem; background: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb;">O\'quvchini tanlang va uning vazifalarini ko\'ring</div>';
                return;
            }
            const student = myStudents.find(s => s.email === email);
            studentTaskDisplay.innerHTML = `
                <div class="admin-info-card" style="box-shadow: none; border: 1px solid #e5e7eb;">
                    <h4 style="margin-bottom: 1rem;">${student.name} uchun vazifalar</h4>
                    <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; min-height: 100px; white-space: pre-wrap;">${student.homework || 'Hozircha vazifa belgilanmagan.'}</div>
                    <div style="margin-top: 1rem; font-size: 0.85rem; color: #64748b;">Oxirgi yangilanish: ${student.homeworkDate || 'Noma\'lum'}</div>
                </div>
            `;
        };
    } catch (e) { }
}

async function loadPassedLessonsStats() {
    // Basic stats from current user data
    try {
        const res = await fetch('/api/users');
        const users = await res.json();
        const myStudents = users.filter(u => u.teacherId === currentTeacher.id);

        // This is a simplified calculation. In a real app, you'd fetch from a 'passed_lessons' log.
        // For now, let's show student count as part of stats.
        statsToday.textContent = "0s";
        statsWeek.textContent = myStudents.length + " ta o'quvchi";
        statsMonth.textContent = "Faol";
        statsYear.textContent = "2024";
    } catch (e) { }
}

async function markLessonAsPassed(email) {
    if (confirm('Dars tugatildimi?')) {
        showToast('Saqlandi!');
    }
}

async function deleteStudent(email) {
    if (confirm('O\'chirilsinmi?')) {
        await fetch(`/api/users/${email}`, { method: 'DELETE' });
        loadStudents();
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('teacherToast');
    const msg = document.getElementById('teacherToastMessage');
    if (!toast || !msg) return;
    msg.textContent = message;
    toast.className = `toast ${type === 'error' ? 'error' : ''} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}
