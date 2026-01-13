// ===================================
// Application State
// ===================================
let currentUser = null;
let isLoggedIn = false;

// Enrollment State
let currentEnrollment = {
    courseId: null,
    teacherId: null,
    date: null,
    time: null
};

// Course Data
const courses = [
    {
        id: 1,
        title: "Bolalar uchun nutq rivojlantirish",
        description: "3-6 yoshli bolalar uchun kompleks dastur. Nutq va til ko'nikmalarini rivojlantirish.",
        badge: "Mashhur",
        duration: "12 hafta",
        students: "150+",
        image: "course1.jpg"
    },
    {
        id: 2,
        title: "Tovush talaffuzi to'g'rilash",
        description: "Tovushlarni to'g'ri talaffuz qilishni o'rgatish. Individual yondashuv.",
        badge: "Yangi",
        duration: "8 hafta",
        students: "120+",
        image: "course2.jpg"
    },
    {
        id: 3,
        title: "Leksik-grammatik tuzilma",
        description: "So'z boyligi va grammatikani rivojlantirish uchun maxsus mashqlar.",
        badge: "Professional",
        duration: "10 hafta",
        students: "200+",
        image: "course3.jpg"
    },
    {
        id: 4,
        title: "O'qish va yozishga tayyorgarlik",
        description: "Maktabga tayyorgarlik. Fonemik eshitish va yozuv ko'nikmalarini rivojlantirish.",
        badge: "Tavsiya etiladi",
        duration: "14 hafta",
        students: "180+",
        image: "course4.jpg"
    },
    {
        id: 5,
        title: "Duduqlanishni bartaraf etish",
        description: "Duduqlanish muammosini hal qilish uchun samarali metodlar va mashqlar.",
        badge: "Mutaxassis",
        duration: "12 hafta",
        students: "90+",
        image: "course5.jpg"
    },
    {
        id: 6,
        title: "Detskiy massaj",
        description: "Faqat yosh bolalar uchun maxsus massaj. Nutq a'zolarini rivojlantirish va tonusni normallashtirish.",
        badge: "Bolalar uchun",
        duration: "Individual",
        students: "50+",
        image: "course6.jpg"
    }
];

// ===================================
// DOM Elements
// ===================================
const navbar = document.getElementById('navbar');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const heroStartBtn = document.getElementById('heroStartBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginOverlay = document.getElementById('loginOverlay');
const registerOverlay = document.getElementById('registerOverlay');
const loginClose = document.getElementById('loginClose');
const registerClose = document.getElementById('registerClose');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const coursesGrid = document.getElementById('coursesGrid');
const freeLessonsGrid = document.getElementById('freeLessonsGrid');

// Video Modal Elements
const videoModal = document.getElementById('videoModal');
const videoOverlay = document.getElementById('videoOverlay');
const videoClose = document.getElementById('videoClose');
const introVideo = document.getElementById('introVideo');

// Contact Form Element
const contactForm = document.getElementById('contactForm');

// Enrollment Elements
const enrollModal = document.getElementById('enrollModal');
const enrollOverlay = document.getElementById('enrollOverlay');
const enrollClose = document.getElementById('enrollClose');
const enrollTeachersGrid = document.getElementById('enrollTeachersGrid');
const enrollTimeSlots = document.getElementById('enrollTimeSlots');
const bookingForm = document.getElementById('bookingForm');
const backToStep1 = document.getElementById('backToStep1');
const backToStep2 = document.getElementById('backToStep2');

// Profile Elements
const profileModal = document.getElementById('profileModal');
const profileOverlay = document.getElementById('profileOverlay');
const profileClose = document.getElementById('profileClose');
const profileUserEmail = document.getElementById('profileUserEmail');
const profileHomework = document.getElementById('profileHomework');
const profileLessons = document.getElementById('profileLessons');

const datePills = document.querySelectorAll('.date-pill');

// Mobile Menu Elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');
const mobileLoginBtn = document.getElementById('mobileLoginBtn');
const mobileRegisterBtn = document.getElementById('mobileRegisterBtn');

// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    renderCourses();
    renderFreeLessons();
    checkLoginStatus();
});

function initializeApp() {
    // Reset overflow in case it was stuck
    document.body.style.overflow = '';

    // Navbar scroll effect
    window.addEventListener('scroll', handleScroll);

    // Modal event listeners
    loginBtn.addEventListener('click', () => openModal('login'));
    registerBtn.addEventListener('click', () => openModal('register'));
    heroStartBtn.addEventListener('click', () => openModal('register'));

    loginOverlay.addEventListener('click', () => closeModal('login'));
    registerOverlay.addEventListener('click', () => closeModal('register'));
    loginClose.addEventListener('click', () => closeModal('login'));
    registerClose.addEventListener('click', () => closeModal('register'));

    // Profile modal
    if (profileOverlay) profileOverlay.addEventListener('click', closeProfileModal);
    if (profileClose) profileClose.addEventListener('click', closeProfileModal);

    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal('login');
            setTimeout(() => openModal('register'), 300);
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal('register');
            setTimeout(() => openModal('login'), 300);
        });
    }

    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    // Video modal listeners
    const videoBtn = document.querySelector('.hero-buttons .btn-ghost');
    if (videoBtn) {
        videoBtn.addEventListener('click', openVideoModal);
    }
    videoOverlay.addEventListener('click', closeVideoModal);
    videoClose.addEventListener('click', closeVideoModal);

    // Contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Enrollment Event Listeners
    initializeEnrollmentEvents();

    // Smooth scroll for nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}


// Mobile Menu Events
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navbar.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// Close mobile menu when clicking links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navbar.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    });
});


// ... existing code ...

function renderCourses() {
    coursesGrid.innerHTML = courses.map(course => `
        <div class="course-card" data-course-id="${course.id}">
            <img src="${course.image}" alt="${course.title}" class="course-image" id="course-${course.id}">
            <div class="course-content">
                <span class="course-badge">${course.badge}</span>
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${course.description}</p>
                <div class="course-meta">
                    <div class="course-duration">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M8 5V8L10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        <span>${course.duration}</span>
                    </div>
                    <div class="course-students">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="6" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M3 13C3 10.79 5.24 9 8 9C10.76 9 13 10.79 13 13" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                        <span>${course.students}</span>
                    </div>
                </div>
                <button class="btn btn-primary btn-full enroll-btn" style="margin-top: 1rem; position: relative; z-index: 2;">Yozilish</button>
            </div>
        </div>
    `).join('');

    // Generate course images
    courses.forEach(course => {
        generateCourseImage(course.id, course.title);
    });

    // Add click handlers
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // If clicked on button (bubbled), ignore here if we handle button separately
            // But to be safe, let's keep card click valid for non-button areas
            if (e.target.closest('.enroll-btn')) return;

            const courseId = card.dataset.courseId;
            handleEnrollClick(courseId);
        });
    });

    // Add specific button handlers
    document.querySelectorAll('.enroll-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click
            const card = btn.closest('.course-card');
            const courseId = card.dataset.courseId;
            handleEnrollClick(courseId);
        });
    });
}

function handleEnrollClick(courseId) {
    if (isLoggedIn) {
        openEnrollModal(courseId);
    } else {
        showToast('Kursga yozilish uchun tizimga kiring!', 'error');
        setTimeout(() => openModal('login'), 1000);
    }
}

function initializeEnrollmentEvents() {
    // Enrollment Modal
    enrollOverlay.addEventListener('click', closeEnrollModal);
    enrollClose.addEventListener('click', closeEnrollModal);

    // Navigation
    if (backToStep1) backToStep1.addEventListener('click', () => showEnrollStep(1));
    if (backToStep2) backToStep2.addEventListener('click', () => showEnrollStep(2));

    const step2NextBtn = document.getElementById('step2NextBtn');
    if (step2NextBtn) {
        step2NextBtn.addEventListener('click', () => {
            if (currentEnrollment.time && currentEnrollment.date) {
                // Update Step 3 Summary
                const course = courses.find(c => c.id === currentEnrollment.courseId);
                const teachers = JSON.parse(localStorage.getItem('logopedTeachers') || '[]');
                const teacher = teachers.find(t => t.id === currentEnrollment.teacherId);

                document.getElementById('summaryCourse').textContent = course.title;
                document.getElementById('summaryTeacher').textContent = teacher.name;
                document.getElementById('summaryTime').textContent = `${currentEnrollment.date}, ${currentEnrollment.time}`;

                showEnrollStep(3);
            }
        });
    }

    // Form Submission
    if (bookingForm) bookingForm.addEventListener('submit', handleBookingSubmit);
}

// ===================================
// Navbar Scroll Effect
// ===================================
function handleScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// ===================================
// Modal Management
// ===================================
function openModal(type) {
    const modal = type === 'login' ? loginModal : registerModal;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(type) {
    const modal = type === 'login' ? loginModal : registerModal;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===================================
// Video Modal Management
// ===================================
function openVideoModal(videoSrc = null) {
    if (videoSrc) {
        introVideo.src = videoSrc;
    }
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (introVideo) {
        introVideo.play();
    }
}

function closeVideoModal() {
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    if (introVideo) {
        introVideo.pause();
    }
}

// ===================================
// Enrollment System
// ===================================
function openEnrollModal(courseId) {
    const course = courses.find(c => c.id === parseInt(courseId));
    if (!course) return;

    currentEnrollment = {
        courseId: course.id,
        teacherId: null,
        date: 'today',
        time: null
    };

    document.getElementById('enrollCourseTitle').textContent = course.title;

    enrollModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Start at Step 1
    showEnrollStep(1);
    loadEnrollmentTeachers();
}

function closeEnrollModal() {
    enrollModal.classList.remove('active');
    document.body.style.overflow = '';
}

function showEnrollStep(step) {
    // Hide all steps
    document.querySelectorAll('.enroll-step').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));

    // Show current step
    document.getElementById(`step${step}`).classList.add('active');

    // Update indicators
    for (let i = 1; i <= step; i++) {
        document.querySelector(`.step[data-step="${i}"]`).classList.add('active');
    }
}

function loadEnrollmentTeachers() {
    const teachers = JSON.parse(localStorage.getItem('logopedTeachers') || '[]');
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
}

function selectTeacher(teacherId) {
    currentEnrollment.teacherId = teacherId;

    // Show selected teacher preview
    const teachers = JSON.parse(localStorage.getItem('logopedTeachers') || '[]');
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

    // Generate dates for next 7 days
    renderDatePills();

    // Select first day by default
    const firstDate = new Date().toISOString().split('T')[0];
    renderTimeSlots(teacherId, firstDate);

    showEnrollStep(2);
}

// ... (renderDatePills logic with local date fixes) ...
function renderDatePills() {
    const datesList = document.getElementById('enrollDatesList');
    datesList.innerHTML = '';

    const today = new Date();
    const days = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'];
    const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);

        // Use local date string component construction
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

function renderTimeSlots(teacherId, dateStr) {
    const teachers = JSON.parse(localStorage.getItem('logopedTeachers') || '[]');
    const teacher = teachers.find(t => t.id === teacherId);
    const timeSlotsContainer = document.getElementById('enrollTimeSlots');

    if (!teacher || !teacher.schedule || teacher.schedule.length === 0) {
        timeSlotsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #6b7280;">
                Bo'sh vaqtlar topilmadi
            </div>
        `;
        return;
    }

    // Filter booked slots
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const bookedTimes = appointments
        .filter(app => app.teacherId === teacherId && app.date === dateStr)
        .map(app => app.time);

    timeSlotsContainer.innerHTML = ''; // Selectively Clear innerHTML

    const availableSlots = teacher.schedule.filter(time => {
        if (bookedTimes.includes(time)) return false;

        // Check if time is in past for today
        const now = new Date();
        const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        if (dateStr === localDateStr) {
            const [hours, minutes] = time.split(':').map(Number);
            const slotDate = new Date();
            slotDate.setHours(hours, minutes, 0, 0);
            return slotDate > now;
        }
        return true;
    });

    if (availableSlots.length === 0) {
        timeSlotsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #6b7280;">
                Bo'sh vaqtlar yo'q
            </div>
        `;
        return;
    }

    availableSlots.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'enroll-time-slot';
        slot.textContent = time;

        slot.addEventListener('click', () => {
            // Visual feedback
            document.querySelectorAll('.enroll-time-slot').forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');

            // Update state
            currentEnrollment.time = time;
            currentEnrollment.date = dateStr;

            // Enable Next Button
            const nextBtn = document.getElementById('step2NextBtn');
            if (nextBtn) {
                nextBtn.disabled = false;
                nextBtn.style.opacity = '1';
                nextBtn.style.cursor = 'pointer';
            }
        });

        timeSlotsContainer.appendChild(slot);
    });
}

function handleBookingSubmit(e) {
    e.preventDefault();

    if (!currentUser) return;

    const phone = document.getElementById('bookingPhone').value;
    const note = document.getElementById('bookingNote').value;
    const teachers = JSON.parse(localStorage.getItem('logopedTeachers') || '[]');
    const teacher = teachers.find(t => t.id === currentEnrollment.teacherId);

    const newAppointment = {
        id: Date.now(),
        courseId: currentEnrollment.courseId,
        teacherId: currentEnrollment.teacherId,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        studentPhone: phone,
        date: currentEnrollment.date,
        time: currentEnrollment.time,
        note: note,
        status: 'confirmed',
        createdAt: Date.now()
    };

    // Save appointment
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.push(newAppointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));

    showToast(`Muvaffaqiyatli yozildingiz! O'qituvchi: ${teacher.name}`);
    closeEnrollModal();
    bookingForm.reset();
}

// ===================================
// Authentication
// ===================================
function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const captcha = document.getElementById('loginCaptcha');

    if (captcha && !captcha.checked) {
        showToast('Iltimos, robot emasligingizni tasdiqlang!', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('logopedUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = { name: user.name, email: user.email };
        isLoggedIn = true;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showToast(`Xush kelibsiz, ${user.name}!`);
        closeModal('login');
        updateUIForLoggedInUser();
        loginForm.reset();
        if (captcha) captcha.checked = false;
    } else {
        showToast('Email yoki parol noto\'g\'ri!', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
        showToast('Parollar mos kelmaydi!', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Parol kamida 6 ta belgidan iborat bo\'lishi kerak!', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('logopedUsers') || '[]');
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        showToast('Bu email allaqachon ro\'yxatdan o\'tgan!', 'error');
        return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('logopedUsers', JSON.stringify(users));

    currentUser = { name, email };
    isLoggedIn = true;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    showToast(`Ro'yxatdan o'tish muvaffaqiyatli! Xush kelibsiz, ${name}!`);
    closeModal('register');
    updateUIForLoggedInUser();
    registerForm.reset();
}

function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        updateUIForLoggedInUser();
    }
}

function updateUIForLoggedInUser() {
    if (isLoggedIn && currentUser) {
        // Clear login btn text and add two buttons
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

// ===================================
// Profile Management
// ===================================
function openProfileModal(scrollToHomework = false) {
    if (!currentUser) return;

    // Refresh user data
    const allUsers = JSON.parse(localStorage.getItem('logopedUsers') || '[]');
    const user = allUsers.find(u => u.email === currentUser.email);

    if (user) {
        profileUserEmail.textContent = user.email;
        const hwDate = user.homeworkDate ? `<div style="font-size: 0.8rem; color: #9ca3af; margin-bottom: 0.5rem;">Sana: ${user.homeworkDate}</div>` : '';
        profileHomework.innerHTML = user.homework
            ? `${hwDate}<div style="white-space: pre-wrap;">${user.homework}</div>`
            : 'Hozircha vazifalar yo\'q.';

        if (user.lessons && user.lessons.length > 0) {
            // Day ordering map
            const dayOrder = {
                'Dushanba': 1, 'Seshanba': 2, 'Chorshanba': 3, 'Payshanba': 4,
                'Juma': 5, 'Shanba': 6, 'Yakshanba': 7
            };

            // Sort lessons by day and time
            const sortedLessons = [...user.lessons].sort((a, b) => {
                if (dayOrder[a.day] !== dayOrder[b.day]) {
                    return dayOrder[a.day] - dayOrder[b.day];
                }
                return a.time.localeCompare(b.time);
            });

            profileLessons.innerHTML = sortedLessons.map(lesson => {
                return `
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 1rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; color: white;">
                        <div>
                            <div style="font-weight: 600; color: white;">${lesson.day}</div>
                            <div style="font-size: 0.85rem; color: #10b981; margin-top: 0.25rem;">• Haftalik dars</div>
                        </div>
                        <div style="background: var(--gradient-primary); padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 700; font-size: 0.9rem; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                            ${lesson.time}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            profileLessons.innerHTML = `
                <div style="text-align: center; color: #6b7280; padding: 1rem;">
                    Darslar jadvali hali belgilanmagan
                </div>
            `;
        }
    }

    profileModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (scrollToHomework) {
        setTimeout(() => {
            profileHomework.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
}

function closeProfileModal() {
    profileModal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleLogout() {
    currentUser = null;
    isLoggedIn = false;
    localStorage.removeItem('currentUser');

    const navButtons = document.querySelector('.nav-buttons');
    navButtons.innerHTML = `
        <button class="btn btn-ghost" id="loginBtn">Kirish</button>
        <button class="btn btn-primary" id="registerBtn">Ro'yxatdan o'tish</button>
    `;

    // Re-attach event listeners
    document.getElementById('loginBtn').onclick = () => openModal('login');
    document.getElementById('registerBtn').onclick = () => openModal('register');

    showToast('Tizimdan chiqdingiz!');
}

// ===================================
// Contact Form Handler
// ===================================
function handleContactForm(e) {
    e.preventDefault();

    const name = document.getElementById('contactName').value;
    const phone = document.getElementById('contactPhone').value;
    const message = document.getElementById('contactMessage').value;

    if (!name || !phone) {
        showToast('Iltimos, barcha majburiy maydonlarni to\'ldiring!', 'error');
        return;
    }

    console.log('Contact form submitted:', { name, phone, message });
    showToast(`Rahmat, ${name}! Tez orada siz bilan bog'lanamiz.`);
    contactForm.reset();
}

// ===================================
// Toast Notification
// ===================================
function showToast(message, type = 'success') {
    toastMessage.textContent = message;

    if (type === 'error') {
        toast.querySelector('.toast-icon svg circle').setAttribute('fill', '#ef4444');
    } else {
        toast.querySelector('.toast-icon svg circle').setAttribute('fill', '#10b981');
    }

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===================================
// Course Rendering
// ===================================
function renderCourses() {
    coursesGrid.innerHTML = courses.map(course => `
        <div class="course-card" data-course-id="${course.id}">
            <img src="${course.image}" alt="${course.title}" class="course-image" id="course-${course.id}">
            <div class="course-content">
                <span class="course-badge">${course.badge}</span>
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${course.description}</p>
                <div class="course-meta">
                    <div class="course-duration">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M8 5V8L10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        <span>${course.duration}</span>
                    </div>
                    <div class="course-students">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="6" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M3 13C3 10.79 5.24 9 8 9C10.76 9 13 10.79 13 13" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                        <span>${course.students}</span>
                    </div>
                </div>
                <button class="btn btn-primary btn-full enroll-btn" style="margin-top: 1rem; position: relative; z-index: 2;">Yozilish</button>
            </div>
        </div>
    `).join('');

    // Generate course images
    courses.forEach(course => {
        generateCourseImage(course.id, course.title);
    });

    // Add click handlers
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', () => {
            const courseId = card.dataset.courseId;
            if (isLoggedIn) {
                openEnrollModal(courseId);
            } else {
                showToast('Kursga yozilish uchun tizimga kiring!', 'error');
                setTimeout(() => openModal('login'), 1000);
            }
        });
    });
}

// ===================================
// Image Generation
// ===================================
async function generateCourseImage(courseId, title) {
    const courseImage = document.getElementById(`course-${courseId}`);
    if (!courseImage) return;

    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    ];

    courseImage.style.background = gradients[(courseId - 1) % gradients.length];
    courseImage.style.display = 'flex';
    courseImage.style.alignItems = 'center';
    courseImage.style.justifyContent = 'center';
    courseImage.style.fontSize = '3rem';
    courseImage.textContent = '📚';
}

// ===================================
// Hero Image Generation
// ===================================
window.addEventListener('load', () => {
    const heroImage = document.getElementById('heroImage');
    if (heroImage) {
        heroImage.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        heroImage.style.width = '100%';
        heroImage.style.height = '500px';
        heroImage.style.display = 'flex';
        heroImage.style.alignItems = 'center';
        heroImage.style.justifyContent = 'center';
        heroImage.style.fontSize = '8rem';
        heroImage.textContent = '🎓';
    }
});

// ===================================
// Keyboard Shortcuts
// ===================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal('login');
        closeModal('register');
        closeVideoModal();
        closeEnrollModal();
    }
});
// ===================================
// Free Lessons Rendering
// ===================================
function renderFreeLessons() {
    if (!freeLessonsGrid) return;

    let savedLessons = localStorage.getItem('logopedFreeLessons');
    let lessons = savedLessons ? JSON.parse(savedLessons) : [];

    // Fallback/Initial data if none exists
    if (lessons.length === 0) {
        lessons = [
            {
                id: 1,
                title: "Nutqni rivojlantirish uchun 5 ta mashq",
                videoUrl: "video_2025-12-24_22-30-26.mp4",
                createdAt: Date.now()
            },
            {
                id: 2,
                title: "Bolalar uchun artikulyatsion gimnastika",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Example Link
                createdAt: Date.now()
            }
        ];
        localStorage.setItem('logopedFreeLessons', JSON.stringify(lessons));
    }

    freeLessonsGrid.innerHTML = lessons.map((lesson, index) => {
        // Generate a random gradient for thumbnail if no image provided
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        ];
        const thumbStyle = `background: ${gradients[index % gradients.length]};`;

        return `
        <div class="lesson-card" onclick="openVideoModal('${lesson.videoUrl}')">
            <div class="lesson-thumbnail" style="${thumbStyle}">
                <div class="play-badge">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M7 6L17 12L7 18V6Z" fill="#667eea"/>
                    </svg>
                </div>
                <div style="position: absolute; bottom: 1rem; right: 1rem; background: rgba(0,0,0,0.5); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; color: white;">
                    Video
                </div>
            </div>
            <div class="lesson-info">
                <div class="lesson-tag">Bepul dars</div>
                <h3 class="lesson-title">${lesson.title}</h3>
                <div class="lesson-btn">
                    Tomosha qilish
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
        </div>
        `;
    }).join('');
}
