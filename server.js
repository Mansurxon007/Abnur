const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MongoDB Connection
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI topilmadi! .env faylini tekshiring.');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB-ga ulanish muvaffaqiyatli!'))
    .catch(err => console.error('❌ MongoDB-ga ulanishda xatolik:', err));

// ===================================
// MongoDB Schemas
// ===================================

const userSchema = new mongoose.Schema({
    id: { type: Number, default: Date.now },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Number, default: Date.now },
    homework: { type: String, default: null },
    homeworkDate: { type: String, default: null },
    lessons: { type: Array, default: [] },
    teacherId: { type: Number, default: null }
});

const teacherSchema = new mongoose.Schema({
    id: { type: Number, default: Date.now },
    name: { type: String, required: true },
    specialty: { type: String },
    phone: { type: String },
    email: { type: String },
    experience: { type: Number },
    status: { type: String, default: 'active' },
    bio: { type: String },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    schedule: { type: Array, default: [] },
    createdAt: { type: Number, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
    id: { type: Number, default: Date.now },
    courseId: { type: Number },
    teacherId: { type: Number },
    date: { type: String },
    time: { type: String },
    studentName: { type: String },
    studentEmail: { type: String },
    studentPhone: { type: String },
    note: { type: String },
    status: { type: String, default: 'confirmed' },
    createdAt: { type: Number, default: Date.now }
});

const lessonSchema = new mongoose.Schema({
    id: { type: Number, default: Date.now },
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    createdAt: { type: Number, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Lesson = mongoose.model('Lesson', lessonSchema);

// ===================================
// API Routes - Users
// ===================================

// Register user
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, password, teacherId, lessons } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan!' });
        }

        const newUser = new User({
            name,
            email,
            password, // In production, hash this!
            teacherId,
            lessons
        });

        await newUser.save();

        res.json({
            success: true,
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Login user
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });

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
        const users = await User.find({}, { password: 0 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Get single user by email
app.get('/api/users/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email }, { password: 0 });
        if (!user) return res.status(404).json({ error: 'Topilmadi' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Update user (homework, lessons, etc.)
app.put('/api/users/:email', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { email: req.params.email },
            { $set: req.body },
            { new: true, projection: { password: 0 } }
        );

        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Delete user
app.delete('/api/users/:email', async (req, res) => {
    try {
        await User.findOneAndDelete({ email: req.params.email });
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
        const teachers = await Teacher.find({});
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Get active teachers
app.get('/api/teachers/active', async (req, res) => {
    try {
        const activeTeachers = await Teacher.find({ status: 'active' });
        res.json(activeTeachers);
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Add teacher (admin only)
app.post('/api/teachers', async (req, res) => {
    try {
        const newTeacher = new Teacher(req.body);
        await newTeacher.save();
        res.json({ success: true, teacher: newTeacher });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Update teacher
app.put('/api/teachers/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            { $set: req.body },
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ error: 'O\'qituvchi topilmadi' });
        }

        res.json({ success: true, teacher });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Delete teacher
app.delete('/api/teachers/:id', async (req, res) => {
    try {
        await Teacher.findOneAndDelete({ id: parseInt(req.params.id) });
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
        const appointments = await Appointment.find({});
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Create appointment
app.post('/api/appointments', async (req, res) => {
    try {
        const newAppointment = new Appointment(req.body);
        await newAppointment.save();
        res.json({ success: true, appointment: newAppointment });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Update appointment
app.put('/api/appointments/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            { $set: req.body },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ error: 'Uchrashuv topilmadi' });
        }

        res.json({ success: true, appointment });
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
        const lessons = await Lesson.find({});
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Add lesson
app.post('/api/lessons', async (req, res) => {
    try {
        const newLesson = new Lesson(req.body);
        await newLesson.save();
        res.json({ success: true, lesson: newLesson });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Update lesson
app.put('/api/lessons/:id', async (req, res) => {
    try {
        const lesson = await Lesson.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            { $set: req.body },
            { new: true }
        );

        if (!lesson) {
            return res.status(404).json({ error: 'Dars topilmadi' });
        }

        res.json({ success: true, lesson });
    } catch (error) {
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Delete lesson
app.delete('/api/lessons/:id', async (req, res) => {
    try {
        await Lesson.findOneAndDelete({ id: parseInt(req.params.id) });
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

// Fallback for SPA (optional)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
});
