// teacher-script.js - Modified for Backend API

let isTeacherLoggedIn = false;
let currentTeacher = null;

// DOM Elements
const teacherLoginContainer = document.getElementById('teacherLoginContainer');
const teacherDashboard = document.getElementById('teacherDashboard');
const teacherLoginForm = document.getElementById('teacherLoginForm');
const navItems = document.querySelectorAll('.nav-item');
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
        item.addEventListener('click', () => switchSection(item.dataset.section));
    });

    document.querySelectorAll('.modal-close, .btn-ghost-cancel').forEach(btn => {
        btn.onclick = () => {
            if (addStudentModal) addStudentModal.style.display = 'none';
            if (manageStudentModal) manageStudentModal.style.display = 'none';
        };
    });

    const addStudentBtn = document.getElementById('addStudentBtn');
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
    const res = await fetch('/api/users');
    const users = await res.json();
    const my = users.filter(u => u.teacherId === currentTeacher.id);
    let html = '';
    my.forEach(u => {
        if (u.lessons) u.lessons.forEach(l => {
            html += `<tr><td>${u.name}</td><td>${l.day}</td><td>${l.time}</td></tr>`;
        });
    });
    lessonScheduleTableBody.innerHTML = html || "<tr><td colspan='3' align='center'>Darslar yo'q</td></tr>";
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
