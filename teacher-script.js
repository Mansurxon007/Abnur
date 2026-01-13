// ===================================
// Teacher Panel Script
// ===================================
let isTeacherLoggedIn = false;
let currentTeacher = null;

// DOM Elements
const teacherLoginContainer = document.getElementById('teacherLoginContainer');
const teacherDashboard = document.getElementById('teacherDashboard');
const teacherLoginForm = document.getElementById('teacherLoginForm');
const teacherLogoutBtn = document.getElementById('teacherLogoutBtn');
const timeSlotsGrid = document.getElementById('timeSlotsGrid');
const saveScheduleBtn = document.getElementById('saveScheduleBtn');
const appointmentsTableBody = document.getElementById('appointmentsTableBody');
const teacherToast = document.getElementById('teacherToast');
const teacherToastMessage = document.getElementById('teacherToastMessage');

// Navigation
const navItems = document.querySelectorAll('.admin-nav-item');
const scheduleSection = document.getElementById('scheduleSection');
const appointmentsSection = document.getElementById('appointmentsSection');
const lessonScheduleSection = document.getElementById('lessonScheduleSection');
const lessonScheduleTableBody = document.getElementById('lessonScheduleTableBody');
const studentsSection = document.getElementById('studentsSection');
const tasksSection = document.getElementById('tasksSection');
const passedLessonsSection = document.getElementById('passedLessonsSection');
const statsToday = document.getElementById('statsToday');
const statsWeek = document.getElementById('statsWeek');
const statsMonth = document.getElementById('statsMonth');
const statsYear = document.getElementById('statsYear');
const passedLessonsTableBody = document.getElementById('passedLessonsTableBody');
const taskStudentSelect = document.getElementById('taskStudentSelect');
const studentTaskDisplay = document.getElementById('studentTaskDisplay');
const sectionTitle = document.getElementById('sectionTitle');
const sectionSubtitle = document.getElementById('sectionSubtitle');
const studentsTableBody = document.getElementById('studentsTableBody');

// Student Modal Elements
const addStudentModal = document.getElementById('addStudentModal');
const openAddStudentModal = document.getElementById('openAddStudentModal');
const closeStudentModal = document.getElementById('closeStudentModal');
const addStudentForm = document.getElementById('addStudentForm');

const manageStudentModal = document.getElementById('manageStudentModal');
const closeManageModal = document.getElementById('closeManageModal');
const manageStudentForm = document.getElementById('manageStudentForm');
const manageModalTitle = document.getElementById('manageModalTitle');

// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    checkTeacherLoginStatus();
    initializeTeacherEvents();
});

function initializeTeacherEvents() {
    teacherLoginForm.addEventListener('submit', handleTeacherLogin);
    teacherLogoutBtn.addEventListener('click', handleLogout);
    saveScheduleBtn.addEventListener('click', saveSchedule);

    // Student Management Events
    if (openAddStudentModal) openAddStudentModal.addEventListener('click', () => addStudentModal.style.display = 'flex');
    if (closeStudentModal) closeStudentModal.addEventListener('click', () => addStudentModal.style.display = 'none');
    if (addStudentForm) addStudentForm.addEventListener('submit', handleAddStudent);
    if (closeManageModal) closeManageModal.addEventListener('click', () => manageStudentModal.style.display = 'none');
    if (manageStudentForm) manageStudentForm.addEventListener('submit', handleSaveStudentDetails);

    // Navigation
    // Mobile toggle
    const mobileToggle = document.getElementById('mobileToggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            document.querySelector('.admin-sidebar').classList.toggle('open');
        });
    }

    // Close on outside click for mobile
    document.addEventListener('click', (e) => {
        const sidebar = document.querySelector('.admin-sidebar');
        if (window.innerWidth <= 768 &&
            !sidebar.contains(e.target) &&
            !mobileToggle.contains(e.target) &&
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);

            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                document.querySelector('.admin-sidebar').classList.remove('open');
            }
        });
    });

    taskStudentSelect.addEventListener('change', (e) => {
        loadStudentTasks(e.target.value);
    });

    // Load initial data
    const loggedIn = localStorage.getItem('teacherLoggedIn');
}

// ===================================
// Authentication
// ===================================
function handleTeacherLogin(e) {
    e.preventDefault();

    const username = document.getElementById('teacherUser').value.trim();
    const password = document.getElementById('teacherPass').value.trim();

    const teachers = JSON.parse(localStorage.getItem('logopedTeachers') || '[]');
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
}

function loginTeacher(teacher) {
    isTeacherLoggedIn = true;
    currentTeacher = teacher;
    localStorage.setItem('teacherLoggedIn', JSON.stringify(teacher));

    updateDashboardUI();
    loadSchedule();
    loadAppointments();
    loadOverallSchedule();
    loadStudents();

    teacherLoginContainer.style.display = 'none';
    teacherDashboard.style.display = 'flex';
    teacherLoginForm.reset();

    showToast(`Xush kelibsiz, ${teacher.name}!`);
}

function checkTeacherLoginStatus() {
    const savedTeacher = localStorage.getItem('teacherLoggedIn');
    if (savedTeacher) {
        const teacher = JSON.parse(savedTeacher);
        // Refresh teacher data from main storage to get latest updates
        const allTeachers = JSON.parse(localStorage.getItem('logopedTeachers') || '[]');
        const updatedTeacher = allTeachers.find(t => t.id === teacher.id);

        if (updatedTeacher) {
            loginTeacher(updatedTeacher);
        } else {
            handleLogout(); // Teacher deleted
        }
    } else {
        teacherLoginContainer.style.display = 'flex';
        teacherDashboard.style.display = 'none';
    }
}

function handleLogout() {
    isTeacherLoggedIn = false;
    currentTeacher = null;
    localStorage.removeItem('teacherLoggedIn');

    teacherLoginContainer.style.display = 'flex';
    teacherDashboard.style.display = 'none';
    showToast('Tizimdan chiqdingiz!');
}

function updateDashboardUI() {
    if (currentTeacher) {
        document.getElementById('sidebarTeacherName').textContent = currentTeacher.name;
        document.getElementById('sidebarTeacherSpecialty').textContent = currentTeacher.specialty;
    }
}

// ===================================
// Schedule Management
// ===================================
function loadSchedule() {
    const startHour = 8;
    const endHour = 18;
    const savedSchedule = currentTeacher.schedule || []; // Array of time strings like "10:00"

    timeSlotsGrid.innerHTML = '';

    for (let i = startHour; i < endHour; i++) {
        const time = `${i < 10 ? '0' + i : i}:00`;
        const div = document.createElement('div');
        div.className = 'time-slot';
        div.textContent = time;

        if (savedSchedule.includes(time)) {
            div.classList.add('selected');
        }

        div.addEventListener('click', () => {
            div.classList.toggle('selected');
        });

        timeSlotsGrid.appendChild(div);

        // Add half-hour slot
        const halfTime = `${i < 10 ? '0' + i : i}:30`;
        const halfDiv = document.createElement('div');
        halfDiv.className = 'time-slot';
        halfDiv.textContent = halfTime;

        if (savedSchedule.includes(halfTime)) {
            halfDiv.classList.add('selected');
        }

        halfDiv.addEventListener('click', () => {
            halfDiv.classList.toggle('selected');
        });

        timeSlotsGrid.appendChild(halfDiv);
    }
}

function saveSchedule() {
    if (!currentTeacher) return;

    const selectedSlots = Array.from(document.querySelectorAll('.time-slot.selected'))
        .map(slot => slot.textContent);

    // Update teacher object in local storage
    const allTeachers = JSON.parse(localStorage.getItem('logopedTeachers') || '[]');
    const index = allTeachers.findIndex(t => t.id === currentTeacher.id);

    if (index !== -1) {
        allTeachers[index].schedule = selectedSlots;
        localStorage.setItem('logopedTeachers', JSON.stringify(allTeachers));
        currentTeacher.schedule = selectedSlots;
        localStorage.setItem('teacherLoggedIn', JSON.stringify(currentTeacher));
        showToast('Jadval muvaffaqiyatli saqlandi!');
    }
}

// ===================================
// Appointments
// ===================================
function loadAppointments() {
    // This would normally come from a server/database
    // For now we simulate or use a shared localStorage key
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const myAppointments = allAppointments.filter(app => app.teacherId === currentTeacher.id);

    if (myAppointments.length === 0) {
        appointmentsTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">
                    Hozircha uchrashuvlar yo'q
                </td>
            </tr>
        `;
        return;
    }

    appointmentsTableBody.innerHTML = myAppointments.map(app => `
        <tr>
            <td>
                <div style="font-weight: 500; color: #111827;">${app.studentName}</div>
            </td>
            <td>${app.date}</td>
            <td>
                <span style="background: #eff6ff; color: #1e40af; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem; font-weight: 500;">
                    ${app.time}
                </span>
            </td>
            <td>${app.studentPhone}</td>
            <td>
                <span class="teacher-status active" style="font-size: 0.8rem;">Tasdiqlangan</span>
            </td>
        </tr>
    `).join('');
}

// ===================================
// Navigation
// ===================================
function switchSection(section) {
    navItems.forEach(item => {
        if (item.dataset.section === section) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    const sidebar = document.querySelector('.admin-sidebar');

    if (section === 'schedule') {
        sectionTitle.textContent = "Mening Jadvalim";
        sectionSubtitle.textContent = "Bo'sh vaqtlaringizni belgilang";
        scheduleSection.style.display = 'block';
        appointmentsSection.style.display = 'none';
        lessonScheduleSection.style.display = 'none';
        studentsSection.style.display = 'none';
        tasksSection.style.display = 'none';
        passedLessonsSection.style.display = 'none';
    } else if (section === 'appointments') {
        sectionTitle.textContent = "Rejalashtirilgan Uchrashuvlar";
        sectionSubtitle.textContent = "O'quvchilar bilan uchrashuvlar ro'yxati";
        scheduleSection.style.display = 'none';
        appointmentsSection.style.display = 'block';
        lessonScheduleSection.style.display = 'none';
        studentsSection.style.display = 'none';
        tasksSection.style.display = 'none';
        passedLessonsSection.style.display = 'none';
    } else if (section === 'lesson-schedule') {
        sectionTitle.textContent = "Umumiy Dars Jadvali";
        sectionSubtitle.textContent = "Barcha o'quvchilar bilan haftalik darslar";
        scheduleSection.style.display = 'none';
        appointmentsSection.style.display = 'none';
        lessonScheduleSection.style.display = 'block';
        studentsSection.style.display = 'none';
        tasksSection.style.display = 'none';
        passedLessonsSection.style.display = 'none';
        loadOverallSchedule();
    } else if (section === 'students') {
        sectionTitle.textContent = "Mening O'quvchilarim";
        sectionSubtitle.textContent = "O'quvchilarni boshqarish va yangi qo'shish";
        scheduleSection.style.display = 'none';
        appointmentsSection.style.display = 'none';
        lessonScheduleSection.style.display = 'none';
        studentsSection.style.display = 'block';
        tasksSection.style.display = 'none';
        passedLessonsSection.style.display = 'none';
        loadStudents();
    } else if (section === 'tasks') {
        sectionTitle.textContent = "Vazifalar";
        sectionSubtitle.textContent = "O'quvchilarga berilgan vazifalarni ko'rish";
        scheduleSection.style.display = 'none';
        appointmentsSection.style.display = 'none';
        lessonScheduleSection.style.display = 'none';
        studentsSection.style.display = 'none';
        passedLessonsSection.style.display = 'none';
        tasksSection.style.display = 'block';
        loadTasksSection();
    } else if (section === 'passed-lessons') {
        sectionTitle.textContent = "O'tilgan Darslar";
        sectionSubtitle.textContent = "Dars statistikasi va hisobotlar";
        scheduleSection.style.display = 'none';
        appointmentsSection.style.display = 'none';
        lessonScheduleSection.style.display = 'none';
        studentsSection.style.display = 'none';
        tasksSection.style.display = 'none';
        passedLessonsSection.style.display = 'block';
        loadPassedLessonsStats();
        loadPassedLessonsLog();
    }
}

window.markLessonAsPassed = function (email) {
    const allUsers = JSON.parse(localStorage.getItem('logopedUsers') || '[]');
    const student = allUsers.find(u => u.email === email);
    if (!student) return;

    // Get lesson start and end times from student data
    const startTime = student.lessonStartTime || '';
    const endTime = student.lessonEndTime || '';

    let duration = 1; // default 1 hour

    // Calculate duration if both times are provided
    if (startTime && endTime) {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        duration = (endMinutes - startMinutes) / 60; // convert to hours

        if (duration <= 0) {
            showToast('Dars tugash vaqti boshlanish vaqtidan katta bo\'lishi kerak!', 'error');
            return;
        }
    }

    if (!confirm(`${student.name} bilan dars yakunlanganini tasdiqlaysizmi? (${duration.toFixed(2)} soat hisobga olinadi)`)) return;

    const history = JSON.parse(localStorage.getItem('lessonHistory') || '[]');
    const newEntry = {
        teacherId: currentTeacher.id,
        studentName: student.name,
        studentEmail: student.email,
        date: new Date().toISOString(),
        duration: duration,
        startTime: startTime,
        endTime: endTime
    };

    history.push(newEntry);
    localStorage.setItem('lessonHistory', JSON.stringify(history));
    showToast(`${student.name} bilan o'tilgan dars saqlandi! (${duration.toFixed(2)} soat)`);
}

function loadPassedLessonsStats() {
    const history = JSON.parse(localStorage.getItem('lessonHistory') || '[]');
    const myHistory = history.filter(h => h.teacherId === currentTeacher.id);

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Simple week start calculation
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let d = 0, w = 0, m = 0, y = 0;

    myHistory.forEach(h => {
        const hDate = new Date(h.date);
        if (h.date.startsWith(today)) d += h.duration;
        if (hDate >= startOfWeek) w += h.duration;
        if (hDate >= startOfMonth) m += h.duration;
        if (hDate >= startOfYear) y += h.duration;
    });

    statsToday.textContent = d.toFixed(2) + 's';
    statsWeek.textContent = w.toFixed(2) + 's';
    statsMonth.textContent = m.toFixed(2) + 's';
    statsYear.textContent = y.toFixed(2) + 's';
}

function loadPassedLessonsLog() {
    const history = JSON.parse(localStorage.getItem('lessonHistory') || '[]');
    const myHistory = history.filter(h => h.teacherId === currentTeacher.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (myHistory.length === 0) {
        passedLessonsTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #6b7280; padding: 2rem;">Hali o\'tilgan darslar yo\'q</td></tr>';
        return;
    }

    passedLessonsTableBody.innerHTML = myHistory.slice(0, 50).map(h => {
        const dateStr = new Date(h.date).toLocaleString('uz-UZ', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const durationText = h.duration ? h.duration.toFixed(2) : '1.00';
        const timeRange = (h.startTime && h.endTime) ? `<div style="font-size: 0.75rem; color: #6b7280;">${h.startTime} - ${h.endTime}</div>` : '';
        return `
            <tr>
                <td><div style="font-weight: 500;">${h.studentName}</div>${timeRange}</td>
                <td>${dateStr}</td>
                <td><span style="background: #ecfdf5; color: #065f46; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;">${durationText} soat</span></td>
            </tr>
        `;
    }).join('');
}

function loadTasksSection() {
    const allUsers = JSON.parse(localStorage.getItem('logopedUsers') || '[]');
    const myStudents = allUsers.filter(u => u.teacherId === currentTeacher.id);

    taskStudentSelect.innerHTML = '<option value="">O\'quvchini tanlang</option>' +
        myStudents.map(s => `<option value="${s.email}">${s.name}</option>`).join('');
}

function loadStudentTasks(email) {
    if (!email) {
        studentTaskDisplay.innerHTML = `
            <div style="text-align: center; color: #6b7280; padding: 3rem; background: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb;">
                O'quvchini tanlang va uning vazifalarini ko'ring
            </div>
        `;
        return;
    }

    const allUsers = JSON.parse(localStorage.getItem('logopedUsers') || '[]');
    const student = allUsers.find(u => u.email === email);

    if (student) {
        const hwDate = student.homeworkDate ? `<div style="font-weight: 600; color: #667eea; margin-bottom: 0.5rem;">Sana: ${student.homeworkDate}</div>` : '';
        const hwContent = student.homework ? `<div style="white-space: pre-wrap; line-height: 1.6; color: #374151;">${student.homework}</div>` : '<div style="color: #9ca3af; font-style: italic;">Hozircha vazifalar belgilanmagan.</div>';

        studentTaskDisplay.innerHTML = `
            <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
                <div style="background: #f8fafc; padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; color: #111827;">${student.name} ga berilgan vazifa</h4>
                    <button class="btn btn-ghost" onclick="openManageStudent('${student.email}')" style="font-size: 0.85rem; padding: 0.4rem 0.8rem; border: 1px solid #e5e7eb;">O'zgartirish</button>
                </div>
                <div style="padding: 1.5rem;">
                    ${hwDate}
                    ${hwContent}
                </div>
            </div>
        `;
    }
}

// ===================================
// Student Management Logic
// ===================================
function loadStudents() {
    const allUsers = JSON.parse(localStorage.getItem('logopedUsers') || '[]');
    const myStudents = allUsers.filter(u => u.teacherId === currentTeacher.id);

    if (myStudents.length === 0) {
        studentsTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">
                    Sizda hozircha o'quvchilar yo'q
                </td>
            </tr>
        `;
        return;
    }

    studentsTableBody.innerHTML = myStudents.map(student => {
        let lessonDisplay = 'Belgilanmagan';
        if (student.lessons && student.lessons.length > 0) {
            const days = student.lessons.map(l => l.day.substring(0, 3)).join(', ');
            lessonDisplay = `${days} (${student.lessons[0].time})`;
        }

        const tasksCount = student.homework ? 'Faollashtirilgan' : 'Yo\'q';

        return `
            <tr>
                <td><div class="teacher-name">${student.name}</div></td>
                <td class="hide-mobile">${student.email}</td>
                <td>${lessonDisplay}</td>
                <td class="hide-mobile"><span style="color: ${student.homework ? '#10b981' : '#6b7280'}">${tasksCount}</span></td>
                <td>
                    <button class="btn btn-primary" onclick="markLessonAsPassed('${student.email}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; background: #10b981; white-space: nowrap;">Darsni yakunlash</button>
                </td>
                <td style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-ghost" onclick="openManageStudent('${student.email}')" style="padding: 0.25rem 0.75rem; font-size: 0.85rem; border: 1px solid #e5e7eb;">Boshqarish</button>
                    <button class="btn btn-ghost" onclick="deleteStudent('${student.email}')" style="padding: 0.25rem 0.75rem; font-size: 0.85rem; border: 1px solid #ef4444; color: #ef4444;">Olib Tashlash</button>
                </td>
            </tr>
        `;
    }).join('');
}

function handleAddStudent(e) {
    e.preventDefault();
    const name = document.getElementById('newStudentName').value;
    const email = document.getElementById('newStudentEmail').value;
    const password = document.getElementById('newStudentPass').value;
    const time = document.getElementById('newStudentLessonTime').value;

    const selectedDays = Array.from(document.querySelectorAll('#newStudentDays input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    if (selectedDays.length === 0) {
        showToast('Kamida bitta kunni tanlang!', 'error');
        return;
    }

    const allUsers = JSON.parse(localStorage.getItem('logopedUsers') || '[]');

    if (allUsers.some(u => u.email === email)) {
        showToast('Bu email bilan foydalanuvchi allaqachon mavjud!', 'error');
        return;
    }

    // Validation: Check for overlap for each selected day
    const teacherId = currentTeacher.id;
    const myStudents = allUsers.filter(u => u.teacherId === teacherId);

    let isOverlap = false;
    let overlapMsg = '';

    for (const day of selectedDays) {
        myStudents.forEach(student => {
            if (student.lessons) {
                student.lessons.forEach(lesson => {
                    if (lesson.day === day && lesson.time === time) {
                        isOverlap = true;
                        overlapMsg = `${day} soat ${time} da ${student.name} bilan darsingiz bor!`;
                    }
                });
            }
        });
        if (isOverlap) break;
    }

    if (isOverlap) {
        showToast(`Xatolik: ${overlapMsg}`, 'error');
        return;
    }

    const newStudent = {
        name,
        email,
        password,
        teacherId: currentTeacher.id,
        lessons: selectedDays.map(day => ({ day, time })),
        homework: ''
    };

    allUsers.push(newStudent);
    localStorage.setItem('logopedUsers', JSON.stringify(allUsers));

    showToast(`${name} muvaffaqiyatli qo'shildi!`);
    addStudentForm.reset();
    addStudentModal.style.display = 'none';
    loadStudents();
    loadOverallSchedule();
}

window.openManageStudent = function (email) {
    const allUsers = JSON.parse(localStorage.getItem('logopedUsers') || '[]');
    const student = allUsers.find(u => u.email === email);

    if (!student) return;

    document.getElementById('manageStudentId').value = student.email;
    manageModalTitle.textContent = `O'quvchi: ${student.name}`;

    // Fill existing data if any
    const lessonTime = student.lessons && student.lessons.length > 0 ? student.lessons[0].time : '';
    document.getElementById('lessonTime').value = lessonTime;

    // Set checkboxes for days
    const studentDays = student.lessons ? student.lessons.map(l => l.day) : [];
    const checkboxes = document.querySelectorAll('#manageStudentDays input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = studentDays.includes(cb.value);
    });

    document.getElementById('homeworkDate').value = student.homeworkDate || '';
    document.getElementById('homeworkContent').value = student.homework || '';
    document.getElementById('lessonStartTime').value = student.lessonStartTime || '';
    document.getElementById('lessonEndTime').value = student.lessonEndTime || '';

    manageStudentModal.style.display = 'flex';
};

function handleSaveStudentDetails(e) {
    e.preventDefault();
    const email = document.getElementById('manageStudentId').value;
    const time = document.getElementById('lessonTime').value;
    const homeworkDate = document.getElementById('homeworkDate').value;
    const homework = document.getElementById('homeworkContent').value;
    const lessonStartTime = document.getElementById('lessonStartTime').value;
    const lessonEndTime = document.getElementById('lessonEndTime').value;

    const selectedDays = Array.from(document.querySelectorAll('#manageStudentDays input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    if (selectedDays.length === 0) {
        showToast('Kamida bitta kunni tanlang!', 'error');
        return;
    }

    // Validate lesson times if both are provided
    if (lessonStartTime && lessonEndTime) {
        const [startHour, startMin] = lessonStartTime.split(':').map(Number);
        const [endHour, endMin] = lessonEndTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (endMinutes <= startMinutes) {
            showToast('Dars tugash vaqti boshlanish vaqtidan katta bo\'lishi kerak!', 'error');
            return;
        }
    }

    const allUsers = JSON.parse(localStorage.getItem('logopedUsers') || '[]');
    const teacherId = currentTeacher.id;
    const myStudents = allUsers.filter(u => u.teacherId === teacherId);

    let isOverlap = false;
    let overlapMsg = '';

    for (const day of selectedDays) {
        myStudents.forEach(student => {
            if (student.lessons) {
                student.lessons.forEach(lesson => {
                    if (student.email !== email && lesson.day === day && lesson.time === time) {
                        isOverlap = true;
                        overlapMsg = `${day} soat ${time} da ${student.name} bilan darsingiz bor!`;
                    }
                });
            }
        });
        if (isOverlap) break;
    }

    if (isOverlap) {
        showToast(`Xatolik: ${overlapMsg}`, 'error');
        return;
    }

    const index = allUsers.findIndex(u => u.email === email);
    if (index !== -1) {
        allUsers[index].lessons = selectedDays.map(day => ({ day, time }));
        allUsers[index].homeworkDate = homeworkDate;
        allUsers[index].homework = homework;
        allUsers[index].lessonStartTime = lessonStartTime;
        allUsers[index].lessonEndTime = lessonEndTime;

        localStorage.setItem('logopedUsers', JSON.stringify(allUsers));
        showToast('Ma\'lumotlar saqlandi!');
        manageStudentModal.style.display = 'none';
        loadStudents();
        loadOverallSchedule();
    }
}

function loadOverallSchedule() {
    const allUsers = JSON.parse(localStorage.getItem('logopedUsers') || '[]');
    const myStudents = allUsers.filter(u => u.teacherId === currentTeacher.id);

    let allLessons = [];
    myStudents.forEach(student => {
        if (student.lessons && student.lessons.length > 0) {
            student.lessons.forEach(lesson => {
                allLessons.push({
                    studentName: student.name,
                    day: lesson.day,
                    time: lesson.time
                });
            });
        }
    });

    // Day ordering map
    const dayOrder = {
        'Dushanba': 1, 'Seshanba': 2, 'Chorshanba': 3, 'Payshanba': 4,
        'Juma': 5, 'Shanba': 6, 'Yakshanba': 7
    };

    // Sort by day then by time
    allLessons.sort((a, b) => {
        if (dayOrder[a.day] !== dayOrder[b.day]) {
            return dayOrder[a.day] - dayOrder[b.day];
        }
        return a.time.localeCompare(b.time);
    });

    if (allLessons.length === 0) {
        lessonScheduleTableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 2rem; color: #6b7280;">
                    Darslar rejalashtirilmagan
                </td>
            </tr>
        `;
        return;
    }

    lessonScheduleTableBody.innerHTML = allLessons.map(lesson => {
        return `
            <tr>
                <td><div style="font-weight: 500; color: #111827;">${lesson.studentName}</div></td>
                <td>${lesson.day}</td>
                <td>
                    <span style="background: #eff6ff; color: #1e40af; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem; font-weight: 500;">
                        ${lesson.time}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

window.deleteStudent = function (email) {
    if (confirm('Haqiqatan ham ushbu o\'quvchini o\'chirib tashlamoqchimisiz?')) {
        const allUsers = JSON.parse(localStorage.getItem('logopedUsers') || '[]');
        const filteredUsers = allUsers.filter(u => u.email !== email);
        localStorage.setItem('logopedUsers', JSON.stringify(filteredUsers));
        showToast('O\'quvchi o\'chirildi');
        loadStudents();
    }
};

// ===================================
// Toast Notification
// ===================================
function showToast(message, type = 'success') {
    teacherToastMessage.textContent = message;

    const toastIcon = teacherToast.querySelector('.toast-icon svg circle');
    if (type === 'error') {
        toastIcon.setAttribute('fill', '#ef4444');
    } else {
        toastIcon.setAttribute('fill', '#4facfe');
    }

    teacherToast.classList.add('show');

    setTimeout(() => {
        teacherToast.classList.remove('show');
    }, 3000);
}
