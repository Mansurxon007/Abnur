// script.js - Modified for Backend API

// State management
let courses = [
    {
        id: 1,
        title: "Bolalar uchun nutq terapiyasi",
        description: "3-7 yoshdagi bolalar uchun maxsus ishlab chiqilgan dastur.",
        duration: "3 oy",
        students: "500+",
        badge: "Mashhur",
        image: "assets/course1.jpg"
    },
    {
        id: 2,
        title: "Kattalar uchun logopedik yordam",
        description: "Duduqlanish va boshqa nutq nuqsonlarini bartaraf etish.",
        duration: "4 oy",
        students: "300+",
        badge: "Yangi",
        image: "assets/course2.jpg"
    },
    {
        id: 3,
        title: "Onlayn konsultatsiya",
        description: "Mutaxassis bilan yuzma-yuz onlayn muloqot.",
        duration: "1 soat",
        students: "1000+",
        badge: "Tezkor",
        image: "assets/course3.jpg"
    }
];

let currentUser = null;
let isLoggedIn = false;
let currentEnrollment = {
    courseId: null,
    teacherId: null,
    date: null,
    time: null
};

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const coursesGrid = document.getElementById('coursesGrid');
const freeLessonsGrid = document.getElementById('freeLessonsGrid');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Modals
const modalOverlays = document.querySelectorAll('.modal-overlay');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const profileModal = document.getElementById('profileModal');
const enrollModal = document.getElementById('enrollModal');
const videoModal = document.getElementById('videoModal');

// Profile Elements
const profileUserEmail = document.getElementById('profileUserEmail');
const profileLessons = document.getElementById('profileLessons');
const profileHomework = document.getElementById('profileHomework');

// Enroll Steps Elements
const enrollSteps = document.querySelectorAll('.enroll-step');
const enrollStepPills = document.querySelectorAll('.step-pill');
const enrollTeachersGrid = document.getElementById('enrollTeachers');
const bookingForm = document.getElementById('bookingForm');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    renderCourses();
    renderFreeLessons();
    setupEventListeners();
});

function setupEventListeners() {
    // Nav buttons
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    if (loginBtn) loginBtn.addEventListener('click', () => openModal('login'));
    if (registerBtn) registerBtn.addEventListener('click', () => openModal('register'));

    // Forms
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (bookingForm) bookingForm.addEventListener('submit', handleBookingSubmit);

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Close on overlay click
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                const modal = overlay.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    });

    // Enrollment steps navigation
    const step1NextBtn = document.getElementById('step1NextBtn');
    const step2NextBtn = document.getElementById('step2NextBtn');
    const backToStep1 = document.getElementById('backToStep1');
    const backToStep2 = document.getElementById('backToStep2');

    if (step1NextBtn) step1NextBtn.addEventListener('click', () => showEnrollStep(2));
    if (step2NextBtn) step2NextBtn.addEventListener('click', () => showEnrollStep(3));
    if (backToStep1) backToStep1.addEventListener('click', () => showEnrollStep(1));
    if (backToStep2) backToStep2.addEventListener('click', () => showEnrollStep(2));

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenuBtn && navbar) {
        mobileMenuBtn.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
    }

    // Close mobile menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbar) navbar.classList.remove('active');
        });
    });
}

// ===================================
// Modal Helpers
// ===================================
function openModal(type) {
    if (type === 'login') loginModal.classList.add('active');
    if (type === 'register') registerModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(type) {
    if (type === 'login') loginModal.classList.remove('active');
    if (type === 'register') registerModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===================================
// Enrollment (Yozilish) Logic
// ===================================
async function openEnrollModal(courseId) {
    currentEnrollment.courseId = courseId;
    showEnrollStep(1);
    await loadEnrollmentTeachers();
    enrollModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeEnrollModal() {
    enrollModal.classList.remove('active');
    document.body.style.overflow = '';
    // Reset steps
    currentEnrollment = { courseId: null, teacherId: null, date: null, time: null };
}

function showEnrollStep(stepNum) {
    enrollSteps.forEach((step, index) => {
        step.style.display = (index + 1 === stepNum) ? 'block' : 'none';

        const pill = enrollStepPills[index];
        if (pill) {
            if (index + 1 === stepNum) pill.classList.add('active');
            else if (index + 1 < stepNum) pill.classList.add('completed');
            else {
                pill.classList.remove('active');
                pill.classList.remove('completed');
            }
        }
    });
}

async function loadEnrollmentTeachers() {
    try {
        const response = await fetch('/api/teachers');
        const teachers = await response.json();
        const activeTeachers = teachers.filter(t => t.status === 'active');

        if (activeTeachers.length === 0) {
            enrollTeachersGrid.innerHTML = `
                <div style="text-align: center; color: #6b7280; padding: 2rem;">
                    Hozircha o'qituvchilar mavjud emas
                </div>
            `;
            return;
        }

        enrollTeachersGrid.innerHTML = activeTeachers.map(teacher => `
            <div class="teacher-select-card" onclick="selectTeacher(${teacher.id})">
                <div class="teacher-avatar">
                    ${teacher.name.charAt(0)}
                </div>
                <div class="teacher-info">
                    <div class="teacher-name">${teacher.name}</div>
                    <div class="teacher-spec">${teacher.specialty}</div>
                </div>
                <div style="color: #667eea;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading teachers:', error);
    }
}

async function selectTeacher(teacherId) {
    currentEnrollment.teacherId = teacherId;

    try {
        const response = await fetch('/api/teachers');
        const teachers = await response.json();
        const teacher = teachers.find(t => t.id === teacherId);

        document.getElementById('selectedTeacherPreview').innerHTML = `
            <div class="teacher-select-card" style="margin-bottom: 1.5rem; border-color: #667eea; background: #fcfdfe; cursor: default;">
                <div class="teacher-avatar">
                    ${teacher.name.charAt(0)}
                </div>
                <div class="teacher-info">
                    <div class="teacher-name">${teacher.name}</div>
                    <div class="teacher-spec">${teacher.specialty}</div>
                </div>
            </div>
        `;

        renderDatePills();
        const firstDate = new Date().toISOString().split('T')[0];
        await renderTimeSlots(teacherId, firstDate);
        showEnrollStep(2);
    } catch (error) {
        console.error('Error selecting teacher:', error);
    }
}

function renderDatePills() {
    const datesList = document.getElementById('enrollDates');
    datesList.innerHTML = '';

    const days = ['Yak', 'Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha'];
    const months = ['Yan', 'Feb', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayStr = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;

        const dayName = i === 0 ? 'Bugun' : (i === 1 ? 'Ertaga' : days[date.getDay()]);
        const dayDate = `${date.getDate()} ${months[date.getMonth()]}`;

        const btn = document.createElement('button');
        btn.className = `date-pill ${i === 0 ? 'active' : ''}`;
        btn.dataset.date = dateStr;
        btn.innerHTML = `
            <span style="font-size: 0.8rem; opacity: 0.8;">${dayName}</span>
            <span style="font-weight: 600;">${dayDate}</span>
        `;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.date-pill').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            renderTimeSlots(currentEnrollment.teacherId, dateStr);
        });

        datesList.appendChild(btn);
    }
}

async function renderTimeSlots(teacherId, dateStr) {
    try {
        const tResponse = await fetch('/api/teachers');
        const teachers = await tResponse.json();
        const teacher = teachers.find(t => t.id === teacherId);

        const timeSlotsContainer = document.getElementById('enrollTimeSlots');
        timeSlotsContainer.innerHTML = '';

        if (!teacher || !teacher.schedule || teacher.schedule.length === 0) {
            timeSlotsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #6b7280;">Vaqtlar belgilanmagan</div>';
            return;
        }

        const aResponse = await fetch('/api/appointments');
        const appointments = await aResponse.json();
        const bookedTimes = appointments
            .filter(app => app.teacherId === teacherId && app.date === dateStr)
            .map(app => app.time);

        const now = new Date();
        const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        teacher.schedule.forEach(time => {
            const isBooked = bookedTimes.includes(time);
            let isPast = false;

            if (dateStr === localDateStr) {
                const [h, m] = time.split(':').map(Number);
                const slotDate = new Date();
                slotDate.setHours(h, m, 0, 0);
                if (slotDate <= now) isPast = true;
            }

            const slot = document.createElement('div');
            slot.className = 'enroll-time-slot';
            if (isBooked || isPast) slot.classList.add('disabled');
            slot.textContent = time;

            if (!isBooked && !isPast) {
                slot.addEventListener('click', () => {
                    document.querySelectorAll('.enroll-time-slot').forEach(s => s.classList.remove('selected'));
                    slot.classList.add('selected');
                    currentEnrollment.time = time;
                    currentEnrollment.date = dateStr;
                    document.getElementById('step2NextBtn').disabled = false;
                });
            }

            timeSlotsContainer.appendChild(slot);
        });
    } catch (error) {
        console.error('Error rendering slots:', error);
    }
}

async function handleBookingSubmit(e) {
    e.preventDefault();
    if (!currentUser) return;

    const phone = document.getElementById('bookingPhone').value;
    const note = document.getElementById('bookingNote').value;

    try {
        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...currentEnrollment,
                studentName: currentUser.name,
                studentEmail: currentUser.email,
                studentPhone: phone,
                note: note
            })
        });

        if (response.ok) {
            showToast('Muvaffaqiyatli darsga yozildingiz!');
            closeEnrollModal();
            bookingForm.reset();
        } else {
            showToast('Xatolik yuz berdi!', 'error');
        }
    } catch (error) {
        console.error('Booking error:', error);
    }
}

// ===================================
// Authentication
// ===================================
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();

        if (response.ok && result.success) {
            currentUser = result.user;
            isLoggedIn = true;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showToast(`Xush kelibsiz, ${currentUser.name}!`);
            closeModal('login');
            updateUIForLoggedInUser();
            loginForm.reset();
        } else {
            showToast(result.error || 'Email yoki parol xato!', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const result = await response.json();

        if (response.ok && result.success) {
            currentUser = result.user;
            isLoggedIn = true;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showToast('Ro\'yxatdan o\'tdingiz!');
            closeModal('register');
            updateUIForLoggedInUser();
            registerForm.reset();
        } else {
            showToast(result.error || 'Xatolik yuz berdi!', 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
    }
}

function checkLoginStatus() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        currentUser = JSON.parse(saved);
        isLoggedIn = true;
        updateUIForLoggedInUser();
    }
}

function updateUIForLoggedInUser() {
    if (isLoggedIn && currentUser) {
        const navButtons = document.querySelector('.nav-buttons');
        navButtons.innerHTML = `
            <button class="btn btn-ghost" id="vazifalarBtn">Vazifalar</button>
            <button class="btn btn-ghost" id="profilBtn">Profil</button>
            <button class="btn btn-primary" id="logoutBtn">Chiqish</button>
        `;
        document.getElementById('vazifalarBtn').onclick = () => openProfileModal(true);
        document.getElementById('profilBtn').onclick = () => openProfileModal(false);
        document.getElementById('logoutBtn').onclick = handleLogout;
    }
}

function handleLogout() {
    currentUser = null;
    isLoggedIn = false;
    localStorage.removeItem('currentUser');
    window.location.reload();
}

// ===================================
// Profile & Homework
// ===================================
async function openProfileModal(scrollToHomework = false) {
    if (!currentUser) return;
    try {
        const response = await fetch(`/api/users/${currentUser.email}`);
        const user = await response.json();

        profileUserEmail.textContent = user.email;
        profileHomework.innerHTML = user.homework
            ? `<div style="font-size: 0.8rem; color: #9ca3af; margin-bottom: 0.5rem;">Sana: ${user.homeworkDate || ''}</div><div style="white-space: pre-wrap;">${user.homework}</div>`
            : "Hozircha vazifalar yo'q.";

        if (user.lessons && user.lessons.length > 0) {
            profileLessons.innerHTML = user.lessons.map(l => `
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 1rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; color: white;">
                    <div><div style="font-weight: 600;">${l.day}</div><div style="font-size: 0.85rem; color: #10b981;">• Haftalik dars</div></div>
                    <div style="background: var(--gradient-primary); padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 700;">${l.time}</div>
                </div>
            `).join('');
        } else {
            profileLessons.innerHTML = "Darslar belgilanmagan.";
        }

        profileModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Add logout listener if button exists
        const profileLogoutBtn = document.getElementById('profileLogoutBtn');
        if (profileLogoutBtn) {
            profileLogoutBtn.onclick = handleLogout;
        }

        if (scrollToHomework) {
            setTimeout(() => profileHomework.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
        }
    } catch (error) {
        console.error('Profile error:', error);
    }
}

// ===================================
// UI Rendering (Courses & Lessons)
// ===================================
function renderCourses() {
    coursesGrid.innerHTML = courses.map(course => `
        <div class="course-card" onclick="${isLoggedIn ? `openEnrollModal(${course.id})` : `showToast('Kursga yozilish uchun tizimga kiring!', 'error'); openModal('login');`}">
            <div class="course-image" style="background: var(--gradient-primary); height: 200px; display: flex; align-items: center; justify-content: center; font-size: 4rem;">📚</div>
            <div class="course-content">
                <span class="course-badge">${course.badge}</span>
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${course.description}</p>
                <div class="course-meta">
                    <span>${course.duration}</span>
                    <span>${course.students} o'quvchi</span>
                </div>
                <button class="btn btn-primary btn-full" style="margin-top: 1rem;">Yozilish</button>
            </div>
        </div>
    `).join('');
}

async function renderFreeLessons() {
    try {
        const response = await fetch('/api/lessons');
        const lessons = await response.json();

        if (!freeLessonsGrid) return;

        freeLessonsGrid.innerHTML = lessons.map(lesson => `
            <div class="lesson-card" onclick="openVideoModal('${lesson.videoUrl}')">
                <div class="lesson-thumbnail" style="background: var(--gradient-primary); height: 180px; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white; position: relative;">
                    ▶️
                    <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem;">Video</div>
                </div>
                <div class="lesson-info">
                    <div class="lesson-tag">Bepul dars</div>
                    <h3 class="lesson-title">${lesson.title}</h3>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Lessons error:', error);
    }
}

function openVideoModal(url) {
    const frame = document.getElementById('videoFrame');
    frame.src = url.includes('youtube.com') || url.includes('embed') ? url : url;
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast ${type === 'error' ? 'error' : ''} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}
