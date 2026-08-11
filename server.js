const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// CORS - Allow all origins (for development)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

// ============ MONGOOSE SCHEMAS ============

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  dept: { type: String },
  status: { type: String, default: 'offline' },
  tasks: { type: Number, default: 0 },
  done: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String },
  type: { type: String, default: 'أخرى' },
  priority: { type: String, default: 'normal' },
  assignee: { type: String, default: 'all' },
  date: { type: String },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  size: { type: String },
  date: { type: String },
  owner: { type: String, default: 'all' },
  content: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  time: { type: String },
  date: { type: String },
  parts: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);
const File = mongoose.model('File', fileSchema);
const Meeting = mongoose.model('Meeting', meetingSchema);

// ============ AUTH MIDDLEWARE ============
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

// ============ AUTH ROUTES ============

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Wrong password' });

    const token = jwt.sign(
      { id: user._id, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        username: user.username,
        name: user.name,
        role: user.role,
        isAdmin: user.isAdmin,
        dept: user.dept
      }
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.post('/api/auth/register', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: 'Admin only' });
    const { username, password, name, role, dept } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed, name, role, dept });
    await user.save();
    res.json({ msg: 'User created', user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ============ EMPLOYEES ============
app.get('/api/employees', auth, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

app.post('/api/employees', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: 'Admin only' });
    const { username, password, name, role, dept } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed, name, role, dept });
    await user.save();
    res.json(user);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

app.delete('/api/employees/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: 'Admin only' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// ============ TASKS ============
app.get('/api/tasks', auth, async (req, res) => {
  try { res.json(await Task.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ msg: err.message }); }
});

app.post('/api/tasks', auth, async (req, res) => {
  try { const task = new Task(req.body); await task.save(); res.json(task); }
  catch (err) { res.status(500).json({ msg: err.message }); }
});

app.put('/api/tasks/:id', auth, async (req, res) => {
  try { res.json(await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ msg: err.message }); }
});

app.delete('/api/tasks/:id', auth, async (req, res) => {
  try { await Task.findByIdAndDelete(req.params.id); res.json({ msg: 'Deleted' }); }
  catch (err) { res.status(500).json({ msg: err.message }); }
});

// ============ FILES ============
app.get('/api/files', auth, async (req, res) => {
  try { res.json(await File.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ msg: err.message }); }
});

app.post('/api/files', auth, async (req, res) => {
  try { const file = new File(req.body); await file.save(); res.json(file); }
  catch (err) { res.status(500).json({ msg: err.message }); }
});

app.delete('/api/files/:id', auth, async (req, res) => {
  try { await File.findByIdAndDelete(req.params.id); res.json({ msg: 'Deleted' }); }
  catch (err) { res.status(500).json({ msg: err.message }); }
});

// ============ MEETINGS ============
app.get('/api/meetings', auth, async (req, res) => {
  try { res.json(await Meeting.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ msg: err.message }); }
});

app.post('/api/meetings', auth, async (req, res) => {
  try { const meeting = new Meeting(req.body); await meeting.save(); res.json(meeting); }
  catch (err) { res.status(500).json({ msg: err.message }); }
});

app.delete('/api/meetings/:id', auth, async (req, res) => {
  try { await Meeting.findByIdAndDelete(req.params.id); res.json({ msg: 'Deleted' }); }
  catch (err) { res.status(500).json({ msg: err.message }); }
});

// ============ EXPORT/IMPORT ============
app.get('/api/export', auth, async (req, res) => {
  try {
    res.json({
      employees: await User.find({}, '-password'),
      tasks: await Task.find(),
      files: await File.find(),
      meetings: await Meeting.find(),
      exportDate: new Date().toISOString()
    });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

app.post('/api/import', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ msg: 'Admin only' });
    const { employees, tasks, files, meetings } = req.body;
    if (employees?.length) await User.insertMany(employees.map(e => ({...e, _id: undefined})));
    if (tasks?.length) await Task.insertMany(tasks.map(t => ({...t, _id: undefined})));
    if (files?.length) await File.insertMany(files.map(f => ({...f, _id: undefined})));
    if (meetings?.length) await Meeting.insertMany(meetings.map(m => ({...m, _id: undefined})));
    res.json({ msg: 'Imported' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============ CONNECT & START ============
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
  });

// Seed default admin
mongoose.connection.once('open', async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashed = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashed,
        name: 'M. Sherif A Elradi',
        role: 'مدير النظام',
        isAdmin: true,
        dept: 'الإدارة'
      });
      console.log('✅ Default admin created: admin / admin123');
    }
  } catch (e) { console.error('Seed error:', e); }
});
