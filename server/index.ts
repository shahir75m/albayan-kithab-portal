import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables based on environment
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in environment variables");
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected.');
    initDb();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// --- SCHEMAS & MODELS ---

const BookSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number
}, { _id: false });

const ClassSchema = new mongoose.Schema({
  id: Number,
  books: [BookSchema]
}, { versionKey: false });
const ClassModel = mongoose.model('Class', ClassSchema);

const StudentSchema = new mongoose.Schema({
  id: String,
  name: String,
  classId: Number
}, { versionKey: false });
const StudentModel = mongoose.model('Student', StudentSchema);

const OrderSchema = new mongoose.Schema({
  id: String,
  studentId: String,
  bookIds: [String],
  totalPrice: Number,
  date: String
}, { versionKey: false });
const OrderModel = mongoose.model('Order', OrderSchema);

const SettingsSchema = new mongoose.Schema({
  orderDeadline: String
}, { versionKey: false });
const SettingsModel = mongoose.model('Settings', SettingsSchema);


// --- INIT DB ---

async function initDb() {
  try {
    const classCount = await ClassModel.countDocuments();
    if (classCount === 0) {
      const INITIAL_DATA = {
        classes: [
          { id: 1, books: [{ id: '1-1', name: 'Thafseer', price: 45 }, { id: '1-2', name: 'Fiqh', price: 35 }, { id: '1-3', name: 'Akhlaq', price: 30 }, { id: '1-4', name: 'Lisan', price: 40 }] },
          { id: 3, books: [{ id: '3-1', name: 'Thafseer', price: 55 }, { id: '3-2', name: 'Fiqh', price: 45 }, { id: '3-3', name: 'Akhlaq', price: 40 }, { id: '3-4', name: 'Thareeq', price: 50 }, { id: '3-5', name: 'Lisan', price: 45 }] },
          { id: 4, books: [{ id: '4-1', name: 'Thafseer', price: 60 }, { id: '4-2', name: 'Fiqh', price: 50 }, { id: '4-3', name: 'Akhlaq', price: 45 }, { id: '4-4', name: 'Thareeq', price: 55 }, { id: '4-5', name: 'Lisan', price: 50 }] },
          { id: 5, books: [{ id: '5-1', name: 'Thafseer', price: 65 }, { id: '5-2', name: 'Fiqh', price: 55 }, { id: '5-3', name: 'Akhlaq', price: 50 }, { id: '5-4', name: 'Thareeq', price: 60 }, { id: '5-5', name: 'Lisan', price: 55 }] },
          { id: 6, books: [{ id: '6-1', name: 'Thafseer', price: 70 }, { id: '6-2', name: 'Fiqh', price: 60 }, { id: '6-3', name: 'Akhlaq', price: 55 }, { id: '6-4', name: 'Thareeq', price: 65 }, { id: '6-5', name: 'Lisan', price: 60 }] },
          { id: 7, books: [{ id: '7-1', name: 'Thafseer', price: 75 }, { id: '7-2', name: 'Fiqh', price: 65 }, { id: '7-3', name: 'Akhlaq', price: 60 }, { id: '7-4', name: 'Thareeq', price: 70 }, { id: '7-5', name: 'Lisan', price: 65 }] },
        ],
        students: [
          { id: 's1', name: 'Ahmed', classId: 1 }, { id: 's2', name: 'Fathima', classId: 1 }, { id: 's3', name: 'Zainab', classId: 3 }, { id: 's4', name: 'Ibrahim', classId: 3 },
          { id: 's5', name: 'Aisha', classId: 4 }, { id: 's6', name: 'Yusuf', classId: 4 }, { id: 's7', name: 'Maryam', classId: 5 }, { id: 's8', name: 'Omar', classId: 5 },
          { id: 's9', name: 'Khadija', classId: 6 }, { id: 's10', name: 'Ali', classId: 6 }, { id: 's11', name: 'Hassan', classId: 7 }, { id: 's12', name: 'Hussein', classId: 7 },
        ]
      };
      await ClassModel.insertMany(INITIAL_DATA.classes);
      await StudentModel.insertMany(INITIAL_DATA.students);
      console.log('Database initialized with default data.');
    }
    const settingsCount = await SettingsModel.countDocuments();
    if (settingsCount === 0) {
      await SettingsModel.create({ orderDeadline: '' });
    }
  } catch (error) {
    console.error('Failed to initialize db:', error);
  }
}

// --- ROUTES ---

app.get('/api/classes', async (req, res) => {
  try {
    const classes = await ClassModel.find({}, { _id: 0 }).lean();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read classes' });
  }
});

app.post('/api/classes/:classId/books', async (req, res) => {
  const classId = parseInt(req.params.classId);
  const { name, price } = req.body;
  try {
    const newBook = { id: `${classId}-${Date.now()}`, name, price };
    const result = await ClassModel.findOneAndUpdate(
      { id: classId },
      { $push: { books: newBook } },
      { new: true }
    );
    if (!result) return res.status(404).json({ error: 'Class not found' });
    res.json(newBook);
  } catch (error) {
    res.status(500).json({ error: 'Added failed' });
  }
});

app.delete('/api/classes/:classId/books/:bookId', async (req, res) => {
  const classId = parseInt(req.params.classId);
  const { bookId } = req.params;
  try {
    await ClassModel.findOneAndUpdate(
      { id: classId },
      { $pull: { books: { id: bookId } } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.put('/api/classes/:classId/books/:bookId', async (req, res) => {
  const classId = parseInt(req.params.classId);
  const { bookId } = req.params;
  const { price } = req.body;
  try {
    await ClassModel.findOneAndUpdate(
      { id: classId, 'books.id': bookId },
      { $set: { 'books.$.price': price } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
});

app.post('/api/classes/bulk-books', async (req, res) => {
  const { books } = req.body;
  try {
    const classGroups: Record<number, any[]> = {};
    books.forEach((book: any) => {
      const { name, price, classId } = book;
      if (!name || isNaN(price) || isNaN(classId)) return;
      if (!classGroups[classId]) classGroups[classId] = [];
      classGroups[classId].push({
        id: `${classId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name,
        price
      });
    });

    const updates = Object.keys(classGroups).map(async (classIdStr) => {
      const classId = parseInt(classIdStr);
      return ClassModel.findOneAndUpdate(
        { id: classId },
        { $push: { books: { $each: classGroups[classId] } } }
      );
    });
    
    await Promise.all(updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Bulk book add failed' });
  }
});


app.get('/api/students', async (req, res) => {
  try {
    const students = await StudentModel.find({}, { _id: 0 }).lean();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read students' });
  }
});

app.post('/api/students', async (req, res) => {
  const { name, classId } = req.body;
  try {
    const newStudent = {
      id: `s${Date.now()}`,
      name,
      classId
    };
    await StudentModel.create(newStudent);
    res.json(newStudent);
  } catch (error) {
    res.status(500).json({ error: 'Added failed' });
  }
});

app.post('/api/students/bulk', async (req, res) => {
  const { students } = req.body;
  try {
    const studentsWithId = students.map((s: any) => ({ ...s, id: `s${Math.random().toString(36).substr(2, 9)}` }));
    await StudentModel.insertMany(studentsWithId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Bulk add failed' });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    await StudentModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await OrderModel.find({}, { _id: 0 }).lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read orders' });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await SettingsModel.findOne({}, { _id: 0 }).lean();
    res.json(settings || { orderDeadline: '' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

app.post('/api/settings', async (req, res) => {
  const { orderDeadline } = req.body;
  try {
    await SettingsModel.findOneAndUpdate({}, { orderDeadline }, { upsert: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { studentId, bookIds, totalPrice } = req.body;
  try {
    // Check deadline
    const settings = await SettingsModel.findOne();
    if (settings?.orderDeadline) {
      const deadline = new Date(settings.orderDeadline);
      if (new Date() > deadline) {
        return res.status(403).json({ error: 'Order period has expired' });
      }
    }

    // remove existing order if exists for that student
    await OrderModel.deleteMany({ studentId });
    
    const newOrder = {
      id: `o${Date.now()}`,
      studentId,
      bookIds,
      totalPrice,
      date: new Date().toISOString()
    };
    await OrderModel.create(newOrder);
    res.json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Order failed' });
  }
});

// Serve React frontend in production
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
