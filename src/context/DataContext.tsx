import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ClassData, Student, Book, Order } from '../types';

interface DataContextType {
  classes: ClassData[];
  students: Student[];
  orders: Order[];
  addStudent: (name: string, classId: number) => void;
  deleteStudent: (id: string) => void;
  addStudentsFromCSV: (csvData: string) => void;
  addBook: (classId: number, name: string, price: number) => void;
  deleteBook: (classId: number, bookId: string) => void;
  updateBookPrice: (classId: number, bookId: string, newPrice: number) => void;
  placeOrder: (studentId: string, bookIds: string[], totalPrice: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch('/api/classes').then(res => res.json()).then(setClasses);
    fetch('/api/students').then(res => res.json()).then(setStudents);
    fetch('/api/orders').then(res => res.json()).then(setOrders);
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
    const lines = csvData.split('\n');
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

    const res = await fetch('/api/students/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: newStudents })
    });
    if (res.ok) {
      fetch('/api/students').then(r => r.json()).then(setStudents);
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
      addStudent, 
      deleteStudent, 
      addStudentsFromCSV,
      addBook,
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
