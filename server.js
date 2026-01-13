const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TEACHERS_FILE = path.join(DATA_DIR, 'teachers.json');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');
const LESSONS_FILE = path.join(DATA_DIR, 'lessons.json');

// Initialize data directory and files
async function initializeData() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });

        const files = [
            { path: USERS_FILE, data: [] },
            { path: TEACHERS_FILE, data: [] },
            { path: APPOINTMENTS_FILE, data: [] },
            { path: LESSONS_FILE, data: [] }
        ];

        for (const file of files) {
            try {
                await fs.access(file.path);
            } catch {
                await fs.writeFile(file.path, JSON.stringify(file.data, null, 2));
            }
        }
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// Helper functions
async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeJSON(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// ===================================
// API Routes - Users
// ===================================

// Register user
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const users = await readJSON(USERS_FILE);

        // Check if user exists
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan!' });
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password, // In production, hash this!
            createdAt: Date.now(),
            homework: null,
            homeworkDate: null,
            lessons: []
        };

        users.push(newUser);
        await writeJSON(USERS_FILE, users);

        res.json({
            success: true,
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Login user
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = await readJSON(USERS_FILE);

        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri!' });
        }

        res.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Get all users (for admin/teacher)
app.get('/api/users', async (req, res) => {
    try {
        const users = await readJSON(USERS_FILE);
        const usersWithoutPasswords = users.map(({ password, ...u }) => u);
        res.json(usersWithoutPasswords);
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Update user (homework, lessons, etc.)
app.put('/api/users/:email', async (req, res) => {
    try {
        const users = await readJSON(USERS_FILE);
        const index = users.findIndex(u => u.email === req.params.email);

        if (index === -1) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        // Update preserving sensitive data if needed
        users[index] = { ...users[index], ...req.body };
        await writeJSON(USERS_FILE, users);

        const { password, ...userWithoutPassword } = users[index];
        res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Delete user
app.delete('/api/users/:email', async (req, res) => {
    try {
        let users = await readJSON(USERS_FILE);
        users = users.filter(u => u.email !== req.params.email);
        await writeJSON(USERS_FILE, users);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// ===================================
// API Routes - Teachers
// ===================================

// Get all teachers
app.get('/api/teachers', async (req, res) => {
    try {
        const teachers = await readJSON(TEACHERS_FILE);
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Get active teachers
app.get('/api/teachers/active', async (req, res) => {
    try {
        const teachers = await readJSON(TEACHERS_FILE);
        const activeTeachers = teachers.filter(t => t.status === 'active');
        res.json(activeTeachers);
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Add teacher (admin only)
app.post('/api/teachers', async (req, res) => {
    try {
        const teachers = await readJSON(TEACHERS_FILE);
        const newTeacher = {
            id: Date.now(),
            ...req.body,
            createdAt: Date.now()
        };

        teachers.push(newTeacher);
        await writeJSON(TEACHERS_FILE, teachers);

        res.json({ success: true, teacher: newTeacher });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Update teacher
app.put('/api/teachers/:id', async (req, res) => {
    try {
        const teachers = await readJSON(TEACHERS_FILE);
        const index = teachers.findIndex(t => t.id === parseInt(req.params.id));

        if (index === -1) {
            return res.status(404).json({ error: 'O\'qituvchi topilmadi' });
        }

        teachers[index] = { ...teachers[index], ...req.body };
        await writeJSON(TEACHERS_FILE, teachers);

        res.json({ success: true, teacher: teachers[index] });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Delete teacher
app.delete('/api/teachers/:id', async (req, res) => {
    try {
        let teachers = await readJSON(TEACHERS_FILE);
        teachers = teachers.filter(t => t.id !== parseInt(req.params.id));
        await writeJSON(TEACHERS_FILE, teachers);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// ===================================
// API Routes - Appointments
// ===================================

// Get all appointments
app.get('/api/appointments', async (req, res) => {
    try {
        const appointments = await readJSON(APPOINTMENTS_FILE);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Create appointment
app.post('/api/appointments', async (req, res) => {
    try {
        const appointments = await readJSON(APPOINTMENTS_FILE);
        const newAppointment = {
            id: Date.now(),
            ...req.body,
            status: 'confirmed',
            createdAt: Date.now()
        };

        appointments.push(newAppointment);
        await writeJSON(APPOINTMENTS_FILE, appointments);

        res.json({ success: true, appointment: newAppointment });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Update appointment
app.put('/api/appointments/:id', async (req, res) => {
    try {
        const appointments = await readJSON(APPOINTMENTS_FILE);
        const index = appointments.findIndex(a => a.id === parseInt(req.params.id));

        if (index === -1) {
            return res.status(404).json({ error: 'Uchrashuv topilmadi' });
        }

        appointments[index] = { ...appointments[index], ...req.body };
        await writeJSON(APPOINTMENTS_FILE, appointments);

        res.json({ success: true, appointment: appointments[index] });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// ===================================
// API Routes - Free Lessons
// ===================================

// Get all lessons
app.get('/api/lessons', async (req, res) => {
    try {
        const lessons = await readJSON(LESSONS_FILE);
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Add lesson
app.post('/api/lessons', async (req, res) => {
    try {
        const lessons = await readJSON(LESSONS_FILE);
        const newLesson = {
            id: Date.now(),
            ...req.body,
            createdAt: Date.now()
        };

        lessons.push(newLesson);
        await writeJSON(LESSONS_FILE, lessons);

        res.json({ success: true, lesson: newLesson });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Update lesson
app.put('/api/lessons/:id', async (req, res) => {
    try {
        const lessons = await readJSON(LESSONS_FILE);
        const index = lessons.findIndex(l => l.id === parseInt(req.params.id));

        if (index === -1) {
            return res.status(404).json({ error: 'Dars topilmadi' });
        }

        lessons[index] = { ...lessons[index], ...req.body };
        await writeJSON(LESSONS_FILE, lessons);

        res.json({ success: true, lesson: lessons[index] });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Delete lesson
app.delete('/api/lessons/:id', async (req, res) => {
    try {
        let lessons = await readJSON(LESSONS_FILE);
        lessons = lessons.filter(l => l.id !== parseInt(req.params.id));
        await writeJSON(LESSONS_FILE, lessons);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// ===================================
// Serve Frontend
// ===================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/teacher', (req, res) => {
    res.sendFile(path.join(__dirname, 'teacher.html'));
});

// ===================================
// Start Server
// ===================================
initializeData().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
    });
});
