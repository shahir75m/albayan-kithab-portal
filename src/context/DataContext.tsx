import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ClassData, Student, Book, Order } from '../types';

interface DataContextType {
  classes: ClassData[];
  students: Student[];
  orders: Order[];
  loading: boolean;
  addStudent: (name: string, classId: number) => void;
  deleteStudent: (id: string) => void;
  addStudentsFromCSV: (csvData: string) => void;
  addBook: (classId: number, name: string, price: number) => void;
  addBooksFromCSV: (csvData: string) => void;
  deleteBook: (classId: number, bookId: string) => void;
  updateBookPrice: (classId: number, bookId: string, newPrice: number) => void;
  placeOrder: (studentId: string, bookIds: string[], totalPrice: number) => Promise<void>;
  orderDeadline: string | null;
  updateOrderDeadline: (date: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderDeadline, setOrderDeadline] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async (isInitial = false) => {
    try {
      const [classesRes, studentsRes, ordersRes, settingsRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/students'),
        fetch('/api/orders'),
        fetch('/api/settings')
      ]);
      if (classesRes.ok) setClasses(await classesRes.json());
      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setOrderDeadline(settings.orderDeadline);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const addStudent = async (name: string, classId: number) => {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, classId })
    });
    if (res.ok) {
      const newStudent = await res.json();
      setStudents(prev => [...prev, newStudent]);
    }
  };

  const deleteStudent = async (id: string) => {
    await fetch(`/api/students/${id}`, { method: 'DELETE' });
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const addStudentsFromCSV = async (csvData: string) => {
    // Normalize line endings (handle Windows \r\n and Mac \r)
    const normalized = csvData.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');
    const newStudents: Omit<Student, 'id'>[] = [];
    lines.forEach(line => {
      const [name, classIdStr] = line.split(',').map(s => s.trim());
      if (name && classIdStr) {
        const classId = parseInt(classIdStr);
        if (!isNaN(classId)) {
          newStudents.push({ name, classId });
        }
      }
    });

    if (newStudents.length === 0) {
      throw new Error('No valid students found in CSV. Format: Name,ClassId');
    }

    const res = await fetch('/api/students/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: newStudents })
    });
    if (res.ok) {
      const updated = await fetch('/api/students');
      if (updated.ok) setStudents(await updated.json());
    } else {
      throw new Error('API call failed');
    }
  };

  const addBook = async (classId: number, name: string, price: number) => {
    const res = await fetch(`/api/classes/${classId}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price })
    });
    if (res.ok) {
      const newBook = await res.json();
      setClasses(prev => prev.map(cls => cls.id === classId ? { ...cls, books: [...cls.books, newBook] } : cls));
    }
  };

  const addBooksFromCSV = async (csvData: string) => {
    const normalized = csvData.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');
    const newBooks: { name: string, classId: number, price: number }[] = [];
    
    // Auto-detect separator
    const firstLine = lines[0] || '';
    let separator = ',';
    if (firstLine.includes(';')) separator = ';';
    else if (firstLine.includes('\t')) separator = '\t';

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      const parts = trimmedLine.split(separator).map(s => s.replace(/^["']|["']$/g, '').trim());
      if (parts.length >= 3) {
        const [name, classIdStr, priceStr] = parts;
        const classId = parseInt(classIdStr);
        const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        
        if (!isNaN(classId) && !isNaN(price) && name) {
          newBooks.push({ name, classId, price });
        } else {
          console.warn(`Row ${index + 1} skipped (invalid data):`, line);
        }
      }
    });

    if (newBooks.length === 0) {
      throw new Error(`Format error or empty file. Expected: Name${separator}Class${separator}Price`);
    }

    const res = await fetch('/api/classes/bulk-books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ books: newBooks })
    });

    if (res.ok) {
      const updated = await fetch('/api/classes');
      if (updated.ok) setClasses(await updated.json());
    } else {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Server error during bulk import');
    }
  };

  const deleteBook = async (classId: number, bookId: string) => {
    await fetch(`/api/classes/${classId}/books/${bookId}`, { method: 'DELETE' });
    setClasses(prev => prev.map(cls => cls.id === classId ? { ...cls, books: cls.books.filter(b => b.id !== bookId) } : cls));
  };

  const updateBookPrice = async (classId: number, bookId: string, newPrice: number) => {
    await fetch(`/api/classes/${classId}/books/${bookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: newPrice })
    });
    setClasses(prev => prev.map(cls => cls.id === classId ? { ...cls, books: cls.books.map(b => b.id === bookId ? { ...b, price: newPrice } : b) } : cls));
  };

  const placeOrder = async (studentId: string, bookIds: string[], totalPrice: number) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, bookIds, totalPrice })
    });
    if (res.ok) {
      const newOrder = await res.json();
      setOrders(prev => {
        const filtered = prev.filter(o => o.studentId !== studentId);
        return [...filtered, newOrder];
      });
    } else {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Order failed');
    }
  };

  const updateOrderDeadline = async (date: string) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderDeadline: date })
    });
    if (res.ok) {
      setOrderDeadline(date);
    }
  };

  return (
    <DataContext.Provider value={{ 
      classes, 
      students, 
      orders,
      loading,
      addStudent, 
      deleteStudent, 
      addStudentsFromCSV,
      addBook,
      addBooksFromCSV,
      deleteBook,
      updateBookPrice,
      placeOrder,
      orderDeadline,
      updateOrderDeadline
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
