// ===================================
// Admin Configuration
// ===================================
// Max 2 admins allowed as per requirements
const ADMIN_ACCOUNTS = [
    { username: 'admin1', password: 'abnur_admin' },
    { username: 'admin2', password: 'abnur_admin' }
];

// ===================================
// Application State
// ===================================
let isAdminLoggedIn = false;
let currentAdminUser = null;
let teachers = [];
let currentEditingTeacherId = null;
let currentDeleteTeacherId = null;

// Free Lessons State
let freeLessons = [];
let currentEditingLessonId = null;
let currentDeleteLessonId = null;

// ===================================
// DOM Elements
// ===================================
const adminLoginContainer = document.getElementById('adminLoginContainer');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

// Teacher Management
const addTeacherBtn = document.getElementById('addTeacherBtn');
const teacherModal = document.getElementById('teacherModal');
const teacherModalOverlay = document.getElementById('teacherModalOverlay');
const teacherModalClose = document.getElementById('teacherModalClose');
const teacherForm = document.getElementById('teacherForm');
const cancelTeacherBtn = document.getElementById('cancelTeacherBtn');
const teachersTableBody = document.getElementById('teachersTableBody');
const searchTeacherInput = document.getElementById('searchTeacher');

// Delete Modal
const deleteModal = document.getElementById('deleteModal');
const deleteModalOverlay = document.getElementById('deleteModalOverlay');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Stats
const totalTeachersEl = document.getElementById('totalTeachers');
const activeTeachersEl = document.getElementById('activeTeachers');
const newTeachersEl = document.getElementById('newTeachers');

// Toast
const adminToast = document.getElementById('adminToast');
const adminToastMessage = document.getElementById('adminToastMessage');

// Navigation
const navItems = document.querySelectorAll('.admin-nav-item');
const teachersSection = document.getElementById('teachersSection');
const statisticsSection = document.getElementById('statisticsSection');
const freeLessonsSection = document.getElementById('freeLessonsSection');
const sectionTitle = document.getElementById('sectionTitle');
const sectionSubtitle = document.getElementById('sectionSubtitle');

// Lesson Management Elements
const addLessonBtn = document.getElementById('addLessonBtn');
const lessonModal = document.getElementById('lessonModal');
const lessonModalOverlay = document.getElementById('lessonModalOverlay');
const lessonModalClose = document.getElementById('lessonModalClose');
const lessonForm = document.getElementById('lessonForm');
const cancelLessonBtn = document.getElementById('cancelLessonBtn');
const freeLessonsTableBody = document.getElementById('freeLessonsTableBody');
const totalFreeLessonsEl = document.getElementById('totalFreeLessons');

// Delete Lesson Modal Elements
const deleteLessonModal = document.getElementById('deleteLessonModal');
const deleteLessonModalOverlay = document.getElementById('deleteLessonModalOverlay');
const cancelDeleteLessonBtn = document.getElementById('cancelDeleteLessonBtn');
const confirmDeleteLessonBtn = document.getElementById('confirmDeleteLessonBtn');
const deleteLessonModalClose = document.getElementById('deleteLessonModalClose');

// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initializeAdmin();
    checkAdminLoginStatus();
});

function initializeAdmin() {
    // Login form
    if (adminLoginForm) adminLoginForm.addEventListener('submit', handleAdminLogin);

    // Logout
    if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', handleAdminLogout);

    // Teacher modal
    if (addTeacherBtn) addTeacherBtn.addEventListener('click', () => {
        console.log('Opening teacher modal');
        openTeacherModal();
    });
    if (teacherModalOverlay) teacherModalOverlay.addEventListener('click', closeTeacherModal);
    if (teacherModalClose) teacherModalClose.addEventListener('click', closeTeacherModal);
    if (cancelTeacherBtn) cancelTeacherBtn.addEventListener('click', closeTeacherModal);
    if (teacherForm) teacherForm.addEventListener('submit', handleTeacherFormSubmit);

    // Delete modal
    if (deleteModalOverlay) deleteModalOverlay.addEventListener('click', closeDeleteModal);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', handleDeleteTeacher);

    // Search
    if (searchTeacherInput) searchTeacherInput.addEventListener('input', handleSearch);

    // Mobile toggle
    const mobileToggle = document.getElementById('mobileToggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.admin-sidebar');
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        const sidebar = document.querySelector('.admin-sidebar');
        const mobileToggle = document.getElementById('mobileToggle');
        if (sidebar && mobileToggle && window.innerWidth <= 768 &&
            !sidebar.contains(e.target) &&
            !mobileToggle.contains(e.target) &&
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // Close sidebar when clicking nav items on mobile
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);

            const sidebar = document.querySelector('.admin-sidebar');
            if (sidebar && window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Lesson Modal
    if (addLessonBtn) {
        addLessonBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Add Lesson Clicked');
            openLessonModal();
        });
    }
    if (lessonModalOverlay) lessonModalOverlay.addEventListener('click', closeLessonModal);
    if (lessonModalClose) lessonModalClose.addEventListener('click', closeLessonModal);
    if (cancelLessonBtn) cancelLessonBtn.addEventListener('click', closeLessonModal);
    if (lessonForm) lessonForm.addEventListener('submit', handleLessonFormSubmit);

    // Delete Lesson Modal
    if (deleteLessonModalOverlay) deleteLessonModalOverlay.addEventListener('click', closeDeleteLessonModal);
    if (cancelDeleteLessonBtn) cancelDeleteLessonBtn.addEventListener('click', closeDeleteLessonModal);
    if (confirmDeleteLessonBtn) confirmDeleteLessonBtn.addEventListener('click', handleDeleteLesson);
    if (deleteLessonModalClose) deleteLessonModalClose.addEventListener('click', closeDeleteLessonModal);

    // Load data
    loadTeachers();
    loadFreeLessons();
}

// ===================================
// Authentication
// ===================================
function handleAdminLogin(e) {
    e.preventDefault();

    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    const adminUser = ADMIN_ACCOUNTS.find(account => account.username === username && account.password === password);

    if (adminUser) {
        isAdminLoggedIn = true;
        currentAdminUser = adminUser.username;
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('currentAdminUser', currentAdminUser);

        showAdminDashboard();
        showAdminToast(`Xush kelibsiz, ${adminUser.username.charAt(0).toUpperCase() + adminUser.username.slice(1)}!`);
        adminLoginForm.reset();
    } else {
        showAdminToast('Foydalanuvchi nomi yoki parol noto\'g\'ri!', 'error');
    }
}

function handleAdminLogout() {
    isAdminLoggedIn = false;
    currentAdminUser = null;
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('currentAdminUser');
    showAdminLogin();
    showAdminToast('Tizimdan chiqdingiz!');
}

function checkAdminLoginStatus() {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    const savedAdmin = localStorage.getItem('currentAdminUser');

    if (loggedIn === 'true') {
        isAdminLoggedIn = true;
        currentAdminUser = savedAdmin;
        showAdminDashboard();
    } else {
        showAdminLogin();
    }
}

function showAdminDashboard() {
    adminLoginContainer.style.display = 'none';
    adminDashboard.style.display = 'flex';
    renderTeachers();
    updateStats();
}

function showAdminLogin() {
    adminLoginContainer.style.display = 'flex';
    adminDashboard.style.display = 'none';
}

// ===================================
// Teacher Management
// ===================================
// ===================================
// Teacher Management
// ===================================
async function loadTeachers() {
    try {
        const response = await fetch('/api/teachers');
        teachers = await response.json();
        renderTeachers();
    } catch (error) {
        console.error('Error loading teachers:', error);
        showAdminToast('O\'qituvchilarni yuklashda xatolik!', 'error');
    }
}

function renderTeachers(filteredTeachers = null) {
    const teachersToRender = filteredTeachers || teachers;

    if (teachersToRender.length === 0) {
        teachersTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem;">
                    <div class="empty-state">
                        <svg class="empty-state-icon" viewBox="0 0 80 80" fill="none">
                            <circle cx="40" cy="30" r="12" stroke="currentColor" stroke-width="2"/>
                            <path d="M20 60C20 50 28 44 40 44C52 44 60 50 60 60" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <div class="empty-state-title">O'qituvchilar topilmadi</div>
                        <div class="empty-state-text">Hozircha hech qanday o'qituvchi qo'shilmagan</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    teachersTableBody.innerHTML = teachersToRender.map(teacher => `
        <tr>
            <td><span class="teacher-name">${teacher.name}</span></td>
            <td>${teacher.specialty}</td>
            <td>${teacher.phone}</td>
            <td>${teacher.email}</td>
            <td>${teacher.experience} yil</td>
            <td>
                <span class="teacher-status ${teacher.status}">
                    <span class="teacher-status-dot"></span>
                    ${teacher.status === 'active' ? 'Faol' : 'Faol emas'}
                </span>
            </td>
            <td>
                <div class="teacher-actions">
                    <button class="action-btn edit" onclick="editTeacher(${teacher.id})" title="Tahrirlash">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M14 3L17 6L7 16H4V13L14 3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="confirmDeleteTeacher(${teacher.id})" title="O'chirish">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M3 5H17M8 9V15M12 9V15M4 5L5 17C5 17.5 5.5 18 6 18H14C14.5 18 15 17.5 15 17L16 5M7 5V3C7 2.5 7.5 2 8 2H12C12.5 2 13 2.5 13 3V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    updateStats();
}

function updateStats() {
    const total = teachers.length;
    const active = teachers.filter(t => t.status === 'active').length;
    const newTeachers = teachers.filter(t => {
        const daysSinceCreated = (Date.now() - t.createdAt) / (1000 * 60 * 60 * 24);
        return daysSinceCreated <= 30;
    }).length;

    totalTeachersEl.textContent = total;
    activeTeachersEl.textContent = active;
    newTeachersEl.textContent = newTeachers;
}

function openTeacherModal(teacherId = null) {
    currentEditingTeacherId = teacherId;
    const usernameField = document.getElementById('teacherUsername');
    const passwordField = document.getElementById('teacherPassword');
    const generateBtn = document.getElementById('generatePasswordBtn');
    const divider = document.querySelector('.form-divider');

    if (teacherId) {
        // Edit mode
        const teacher = teachers.find(t => t.id === teacherId);
        if (teacher) {
            document.getElementById('teacherModalTitle').textContent = 'O\'qituvchini tahrirlash';
            document.getElementById('teacherId').value = teacher.id;
            document.getElementById('teacherName').value = teacher.name;
            document.getElementById('teacherSpecialty').value = teacher.specialty;
            document.getElementById('teacherPhone').value = teacher.phone;
            document.getElementById('teacherEmail').value = teacher.email;
            document.getElementById('teacherExperience').value = teacher.experience;
            document.getElementById('teacherStatus').value = teacher.status;
            document.getElementById('teacherBio').value = teacher.bio || '';

            // Show credentials but make them read-only
            usernameField.closest('.form-group').style.display = 'block';
            passwordField.closest('.form-group').style.display = 'block';
            divider.style.display = 'flex';

            // Handle historical data if username/password are missing
            const teacherUsername = teacher.username || generateUsername(teacher.name);
            const teacherPassword = teacher.password || 'password123';

            usernameField.value = teacherUsername;
            passwordField.value = teacherPassword;

            // If they were missing, update the teacher object to prevent future issues
            if (!teacher.username || !teacher.password) {
                teacher.username = teacherUsername;
                teacher.password = teacherPassword;
                saveTeachers();
            }

            usernameField.readOnly = true;
            passwordField.readOnly = true;
            generateBtn.style.display = 'none';
        }
    } else {
        // Add mode
        document.getElementById('teacherModalTitle').textContent = 'Yangi o\'qituvchi qo\'shish';
        teacherForm.reset();
        document.getElementById('teacherId').value = '';

        // Show credentials fields and make them editable (password only, login is auto)
        usernameField.closest('.form-group').style.display = 'block';
        passwordField.closest('.form-group').style.display = 'block';
        divider.style.display = 'flex';

        usernameField.readOnly = true; // Always auto-generated
        passwordField.readOnly = false;
        generateBtn.style.display = 'flex';

        // Generate initial credentials
        usernameField.value = '';
        passwordField.value = generatePassword();
    }

    teacherModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeTeacherModal() {
    teacherModal.classList.remove('active');
    document.body.style.overflow = '';
    teacherForm.reset();
    currentEditingTeacherId = null;
}

async function handleTeacherFormSubmit(e) {
    e.preventDefault();

    const teacherId = document.getElementById('teacherId').value;
    const teacherData = {
        name: document.getElementById('teacherName').value,
        specialty: document.getElementById('teacherSpecialty').value,
        phone: document.getElementById('teacherPhone').value,
        email: document.getElementById('teacherEmail').value,
        experience: parseInt(document.getElementById('teacherExperience').value),
        status: document.getElementById('teacherStatus').value,
        bio: document.getElementById('teacherBio').value
    };

    try {
        if (teacherId) {
            // Update existing teacher
            const response = await fetch(`/api/teachers/${teacherId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teacherData)
            });

            if (response.ok) {
                showAdminToast('O\'qituvchi muvaffaqiyatli yangilandi!');
                closeTeacherModal();
            }
        } else {
            // Add new teacher
            const username = document.getElementById('teacherUsername').value || generateUsername(teacherData.name);
            const password = document.getElementById('teacherPassword').value;

            const newTeacherData = {
                ...teacherData,
                username,
                password
            };

            const response = await fetch('/api/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTeacherData)
            });

            if (response.ok) {
                const result = await response.json();
                showAdminToast('Yangi o\'qituvchi muvaffaqiyatli qo\'shildi!');
                closeTeacherModal();
                showCredentialsModal(username, password);
            }
        }
        await loadTeachers();
    } catch (error) {
        console.error('Error saving teacher:', error);
        showAdminToast('Saqlashda xatolik yuz berdi!', 'error');
    }
}

// Credentials Helpers
function generateUsername(name) {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${cleanName}${randomSuffix}`;
}

function generatePassword() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function showCredentialsModal(username, password) {
    document.getElementById('newTeacherUsername').textContent = username;
    document.getElementById('newTeacherPassword').textContent = password;

    const modal = document.getElementById('credentialsModal');
    modal.classList.add('active');
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        showAdminToast('Nusxa olindi!');
    });
}

// Event Listeners for new elements
document.getElementById('teacherName').addEventListener('input', (e) => {
    if (!currentEditingTeacherId) {
        const username = generateUsername(e.target.value);
        document.getElementById('teacherUsername').value = username;
    }
});

document.getElementById('generatePasswordBtn').addEventListener('click', () => {
    document.getElementById('teacherPassword').value = generatePassword();
});

document.getElementById('closeCredentialsBtn').addEventListener('click', () => {
    document.getElementById('credentialsModal').classList.remove('active');
});

document.getElementById('credentialsModalOverlay').addEventListener('click', () => {
    document.getElementById('credentialsModal').classList.remove('active');
});

function editTeacher(teacherId) {
    openTeacherModal(teacherId);
}

function confirmDeleteTeacher(teacherId) {
    currentDeleteTeacherId = teacherId;
    deleteModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    deleteModal.classList.remove('active');
    document.body.style.overflow = '';
    currentDeleteTeacherId = null;
}

async function handleDeleteTeacher() {
    if (currentDeleteTeacherId) {
        try {
            const response = await fetch(`/api/teachers/${currentDeleteTeacherId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showAdminToast('O\'qituvchi muvaffaqiyatli o\'chirildi!');
                closeDeleteModal();
                await loadTeachers();
            }
        } catch (error) {
            console.error('Error deleting teacher:', error);
            showAdminToast('O\'chirishda xatolik yuz berdi!', 'error');
        }
    }
}

// ===================================
// Search
// ===================================
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm === '') {
        renderTeachers();
        return;
    }

    const filtered = teachers.filter(teacher => {
        return (
            teacher.name.toLowerCase().includes(searchTerm) ||
            teacher.specialty.toLowerCase().includes(searchTerm) ||
            teacher.email.toLowerCase().includes(searchTerm) ||
            teacher.phone.includes(searchTerm)
        );
    });

    renderTeachers(filtered);
}

// ===================================
// Navigation
// ===================================
function switchSection(section) {
    // Update nav items
    navItems.forEach(item => {
        if (item.dataset.section === section) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Show/hide sections and Update Header
    if (section === 'teachers') {
        teachersSection.style.display = 'block';
        statisticsSection.style.display = 'none';
        freeLessonsSection.style.display = 'none';

        if (sectionTitle) sectionTitle.textContent = "O'qituvchilar";
        if (sectionSubtitle) sectionSubtitle.textContent = "O'qituvchilarni boshqarish va qo'shish";
        if (addTeacherBtn) addTeacherBtn.style.display = 'flex';
        if (addLessonBtn) addLessonBtn.style.display = 'none';

    } else if (section === 'statistics') {
        teachersSection.style.display = 'none';
        statisticsSection.style.display = 'block';
        freeLessonsSection.style.display = 'none';

        if (sectionTitle) sectionTitle.textContent = "Statistika";
        if (sectionSubtitle) sectionSubtitle.textContent = "Platforma bo'yicha umumiy hisobotlar";
        if (addTeacherBtn) addTeacherBtn.style.display = 'none';
        if (addLessonBtn) addLessonBtn.style.display = 'none';

    } else if (section === 'free-lessons') {
        teachersSection.style.display = 'none';
        statisticsSection.style.display = 'none';
        freeLessonsSection.style.display = 'block';

        if (sectionTitle) sectionTitle.textContent = "Bepul darsliklar";
        if (sectionSubtitle) sectionSubtitle.textContent = "Video darsliklarni boshqarish";
        if (addTeacherBtn) addTeacherBtn.style.display = 'none';
        if (addLessonBtn) addLessonBtn.style.display = 'flex';

        renderFreeLessons();
    }
}

// ===================================
// Toast Notification
// ===================================
function showAdminToast(message, type = 'success') {
    adminToastMessage.textContent = message;

    const toastIcon = adminToast.querySelector('.toast-icon svg circle');
    if (type === 'error') {
        toastIcon.setAttribute('fill', '#ef4444');
    } else {
        toastIcon.setAttribute('fill', '#10b981');
    }

    adminToast.classList.add('show');

    setTimeout(() => {
        adminToast.classList.remove('show');
    }, 3000);
}

// ===================================
// Keyboard Shortcuts
// ===================================
document.addEventListener('keydown', (e) => {
    // Escape to close modals
    if (e.key === 'Escape') {
        closeTeacherModal();
        closeDeleteModal();
    }
});

// ===================================
// Free Lessons Management
// ===================================
async function loadFreeLessons() {
    try {
        const response = await fetch('/api/lessons');
        freeLessons = await response.json();
        renderFreeLessons();
    } catch (error) {
        console.error('Error loading lessons:', error);
    }
}

function renderFreeLessons() {
    if (freeLessons.length === 0) {
        freeLessonsTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 3rem;">
                    <div class="empty-state">
                        <svg class="empty-state-icon" viewBox="0 0 80 80" fill="none">
                            <rect x="25" y="25" width="30" height="30" rx="5" stroke="currentColor" stroke-width="2"/>
                            <path d="M35 32L47 40L35 48V32Z" fill="currentColor"/>
                        </svg>
                        <div class="empty-state-title">Darslar topilmadi</div>
                        <div class="empty-state-text">Hozircha hech qanday video dars qo'shilmagan</div>
                    </div>
                </td>
            </tr>
        `;
        totalFreeLessonsEl.textContent = '0';
        return;
    }

    freeLessonsTableBody.innerHTML = freeLessons.map(lesson => `
        <tr>
            <td><span class="teacher-name">${lesson.title}</span></td>
            <td><span style="font-size: 0.85rem; color: #6b7280; font-family: monospace;">${lesson.videoUrl}</span></td>
            <td>${new Date(lesson.createdAt).toLocaleDateString('uz-UZ')}</td>
            <td>
                <div class="teacher-actions">
                    <button class="action-btn edit" onclick="editLesson(${lesson.id})" title="Tahrirlash">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M14 3L17 6L7 16H4V13L14 3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="confirmDeleteLesson(${lesson.id})" title="O'chirish">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M3 5H17M8 9V15M12 9V15M4 5L5 17C5 17.5 5.5 18 6 18H14C14.5 18 15 17.5 15 17L16 5M7 5V3C7 2.5 7.5 2 8 2H12C12.5 2 13 2.5 13 3V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    totalFreeLessonsEl.textContent = freeLessons.length;
}

function openLessonModal(lessonId = null) {
    currentEditingLessonId = lessonId;
    if (lessonId) {
        const lesson = freeLessons.find(l => l.id === lessonId);
        if (lesson) {
            document.getElementById('lessonModalTitle').textContent = 'Darsni tahrirlash';
            document.getElementById('lessonTitle').value = lesson.title;
            document.getElementById('lessonVideoUrl').value = lesson.videoUrl;
        }
    } else {
        document.getElementById('lessonModalTitle').textContent = 'Yangi dars qo\'shish';
        lessonForm.reset();
    }
    lessonModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLessonModal() {
    lessonModal.classList.remove('active');
    document.body.style.overflow = '';
    lessonForm.reset();
    currentEditingLessonId = null;
}

async function handleLessonFormSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('lessonTitle').value;
    const videoUrl = document.getElementById('lessonVideoUrl').value;

    try {
        if (currentEditingLessonId) {
            const response = await fetch(`/api/lessons/${currentEditingLessonId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, videoUrl })
            });
            if (response.ok) showAdminToast('Dars muvaffaqiyatli yangilandi!');
        } else {
            const response = await fetch('/api/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, videoUrl })
            });
            if (response.ok) showAdminToast('Yangi dars muvaffaqiyatli qo\'shildi!');
        }
        await loadFreeLessons();
        closeLessonModal();
    } catch (error) {
        console.error('Error saving lesson:', error);
        showAdminToast('Xatolik yuz berdi!', 'error');
    }
}

window.editLesson = function (lessonId) {
    openLessonModal(lessonId);
};

window.confirmDeleteLesson = function (lessonId) {
    currentDeleteLessonId = lessonId;
    deleteLessonModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

function closeDeleteLessonModal() {
    deleteLessonModal.classList.remove('active');
    document.body.style.overflow = '';
    currentDeleteLessonId = null;
}

async function handleDeleteLesson() {
    if (currentDeleteLessonId) {
        try {
            await fetch(`/api/lessons/${currentDeleteLessonId}`, {
                method: 'DELETE'
            });
            showAdminToast('Dars muvaffaqiyatli o\'chirildi!');
            closeDeleteLessonModal();
            await loadFreeLessons();
        } catch (error) {
            console.error('Error deleting lesson:', error);
        }
    }
}

// Update Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeTeacherModal();
        closeDeleteModal();
        closeLessonModal();
        closeDeleteLessonModal();
    }
});
