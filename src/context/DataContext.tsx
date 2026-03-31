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
  placeOrder: (studentId: string, bookIds: string[], totalPrice: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [classesRes, studentsRes, ordersRes] = await Promise.all([
          fetch('/api/classes'),
          fetch('/api/students'),
          fetch('/api/orders')
        ]);
        if (classesRes.ok) setClasses(await classesRes.json());
        if (studentsRes.ok) setStudents(await studentsRes.json());
        if (ordersRes.ok) setOrders(await ordersRes.json());
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
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
    
    lines.forEach(line => {
      const [name, classIdStr, priceStr] = line.split(',').map(s => s.trim());
      if (name && classIdStr && priceStr) {
        const classId = parseInt(classIdStr);
        const price = parseFloat(priceStr);
        if (!isNaN(classId) && !isNaN(price)) {
          newBooks.push({ name, classId, price });
        }
      }
    });

    if (newBooks.length === 0) {
      throw new Error('No valid books found in CSV. Format: BookName,ClassId,Price');
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
      throw new Error('API call failed');
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
      placeOrder
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
