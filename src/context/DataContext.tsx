import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ClassData, Student, Book, Order } from '../types';
import { CLASSES as INITIAL_CLASSES, STUDENTS as INITIAL_STUDENTS } from '../data';

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
  const [classes, setClasses] = useState<ClassData[]>(INITIAL_CLASSES);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [orders, setOrders] = useState<Order[]>([]);

  const addStudent = (name: string, classId: number) => {
    const newStudent: Student = {
      id: `s${Date.now()}`,
      name,
      classId,
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const addStudentsFromCSV = (csvData: string) => {
    const lines = csvData.split('\n');
    const newStudents: Student[] = [];
    lines.forEach(line => {
      const [name, classIdStr] = line.split(',').map(s => s.trim());
      if (name && classIdStr) {
        const classId = parseInt(classIdStr);
        if (!isNaN(classId)) {
          newStudents.push({
            id: `s${Math.random().toString(36).substr(2, 9)}`,
            name,
            classId,
          });
        }
      }
    });
    setStudents(prev => [...prev, ...newStudents]);
  };

  const addBook = (classId: number, name: string, price: number) => {
    setClasses(prev => prev.map(cls => {
      if (cls.id === classId) {
        return {
          ...cls,
          books: [...cls.books, { id: `${classId}-${Date.now()}`, name, price }]
        };
      }
      return cls;
    }));
  };

  const deleteBook = (classId: number, bookId: string) => {
    setClasses(prev => prev.map(cls => {
      if (cls.id === classId) {
        return {
          ...cls,
          books: cls.books.filter(b => b.id !== bookId)
        };
      }
      return cls;
    }));
  };

  const updateBookPrice = (classId: number, bookId: string, newPrice: number) => {
    setClasses(prev => prev.map(cls => {
      if (cls.id === classId) {
        return {
          ...cls,
          books: cls.books.map(b => b.id === bookId ? { ...b, price: newPrice } : b)
        };
      }
      return cls;
    }));
  };

  const placeOrder = (studentId: string, bookIds: string[], totalPrice: number) => {
    const newOrder: Order = {
      id: `o${Date.now()}`,
      studentId,
      bookIds,
      totalPrice,
      date: new Date().toISOString()
    };
    setOrders(prev => {
      const filteredOrders = prev.filter(order => order.studentId !== studentId);
      return [...filteredOrders, newOrder];
    });
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
