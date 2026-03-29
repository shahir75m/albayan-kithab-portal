import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'db.json');

// Interface to type our JSON structure
interface DBType {
  classes: any[];
  students: any[];
  orders: any[];
}

// Ensure DB file exists
async function initDb() {
  try {
    await fs.access(DB_PATH);
  } catch (err) {
    const INITIAL_DATA = {
      classes: [
        {
          id: 1,
          books: [
            { id: '1-1', name: 'Thafseer', price: 45 },
            { id: '1-2', name: 'Fiqh', price: 35 },
            { id: '1-3', name: 'Akhlaq', price: 30 },
            { id: '1-4', name: 'Lisan', price: 40 },
          ],
        },
        {
          id: 3,
          books: [
            { id: '3-1', name: 'Thafseer', price: 55 },
            { id: '3-2', name: 'Fiqh', price: 45 },
            { id: '3-3', name: 'Akhlaq', price: 40 },
            { id: '3-4', name: 'Thareeq', price: 50 },
            { id: '3-5', name: 'Lisan', price: 45 },
          ],
        },
        {
          id: 4,
          books: [
            { id: '4-1', name: 'Thafseer', price: 60 },
            { id: '4-2', name: 'Fiqh', price: 50 },
            { id: '4-3', name: 'Akhlaq', price: 45 },
            { id: '4-4', name: 'Thareeq', price: 55 },
            { id: '4-5', name: 'Lisan', price: 50 },
          ],
        },
        {
          id: 5,
          books: [
            { id: '5-1', name: 'Thafseer', price: 65 },
            { id: '5-2', name: 'Fiqh', price: 55 },
            { id: '5-3', name: 'Akhlaq', price: 50 },
            { id: '5-4', name: 'Thareeq', price: 60 },
            { id: '5-5', name: 'Lisan', price: 55 },
          ],
        },
        {
          id: 6,
          books: [
            { id: '6-1', name: 'Thafseer', price: 70 },
            { id: '6-2', name: 'Fiqh', price: 60 },
            { id: '6-3', name: 'Akhlaq', price: 55 },
            { id: '6-4', name: 'Thareeq', price: 65 },
            { id: '6-5', name: 'Lisan', price: 60 },
          ],
        },
        {
          id: 7,
          books: [
            { id: '7-1', name: 'Thafseer', price: 75 },
            { id: '7-2', name: 'Fiqh', price: 65 },
            { id: '7-3', name: 'Akhlaq', price: 60 },
            { id: '7-4', name: 'Thareeq', price: 70 },
            { id: '7-5', name: 'Lisan', price: 65 },
          ],
        },
      ],
      students: [
        { id: 's1', name: 'Ahmed', classId: 1 },
        { id: 's2', name: 'Fathima', classId: 1 },
        { id: 's3', name: 'Zainab', classId: 3 },
        { id: 's4', name: 'Ibrahim', classId: 3 },
        { id: 's5', name: 'Aisha', classId: 4 },
        { id: 's6', name: 'Yusuf', classId: 4 },
        { id: 's7', name: 'Maryam', classId: 5 },
        { id: 's8', name: 'Omar', classId: 5 },
        { id: 's9', name: 'Khadija', classId: 6 },
        { id: 's10', name: 'Ali', classId: 6 },
        { id: 's11', name: 'Hassan', classId: 7 },
        { id: 's12', name: 'Hussein', classId: 7 },
      ],
      orders: [],
    };
    await fs.writeFile(DB_PATH, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
    console.log('Database initialized.');
  }
}

async function readDb(): Promise<DBType> {
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

async function writeDb(data: DBType) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

initDb();

// --- ROUTES ---

app.get('/api/classes', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.classes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read classes' });
  }
});

app.post('/api/classes/:classId/books', async (req, res) => {
  const classId = parseInt(req.params.classId);
  const { name, price } = req.body;
  try {
    const db = await readDb();
    const cls = db.classes.find(c => c.id === classId);
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    
    const newBook = { id: `${classId}-${Date.now()}`, name, price };
    cls.books.push(newBook);
    
    await writeDb(db);
    res.json(newBook);
  } catch (error) {
    res.status(500).json({ error: 'Added failed' });
  }
});

app.delete('/api/classes/:classId/books/:bookId', async (req, res) => {
  const classId = parseInt(req.params.classId);
  const { bookId } = req.params;
  try {
    const db = await readDb();
    const cls = db.classes.find(c => c.id === classId);
    if (cls) {
      cls.books = cls.books.filter((b: any) => b.id !== bookId);
      await writeDb(db);
    }
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
    const db = await readDb();
    const cls = db.classes.find(c => c.id === classId);
    if (cls) {
      const book = cls.books.find((b: any) => b.id === bookId);
      if (book) book.price = price;
      await writeDb(db);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read students' });
  }
});

app.post('/api/students', async (req, res) => {
  const { name, classId } = req.body;
  try {
    const db = await readDb();
    const newStudent = {
      id: `s${Date.now()}`,
      name,
      classId
    };
    db.students.push(newStudent);
    await writeDb(db);
    res.json(newStudent);
  } catch (error) {
    res.status(500).json({ error: 'Added failed' });
  }
});

app.post('/api/students/bulk', async (req, res) => {
  const { students } = req.body;
  try {
    const db = await readDb();
    const studentsWithId = students.map((s: any) => ({ ...s, id: `s${Math.random().toString(36).substr(2, 9)}` }));
    db.students.push(...studentsWithId);
    await writeDb(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Bulk add failed' });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const db = await readDb();
    db.students = db.students.filter(s => s.id !== req.params.id);
    await writeDb(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { studentId, bookIds, totalPrice } = req.body;
  try {
    const db = await readDb();
    const newOrder = {
      id: `o${Date.now()}`,
      studentId,
      bookIds,
      totalPrice,
      date: new Date().toISOString()
    };
    // remove existing order if exists for that student
    db.orders = db.orders.filter(o => o.studentId !== studentId);
    db.orders.push(newOrder);
    await writeDb(db);
    res.json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Order failed' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
