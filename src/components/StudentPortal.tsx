import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Book, Student, ClassData, Order } from '../types';
import { Check, ShoppingCart, User, BookOpen, Calculator, ChevronRight, Clock, ArrowLeft } from 'lucide-react';

export default function StudentPortal() {
  const { classes, students, orders, placeOrder, loading, orderDeadline } = useData();
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());

  const isExpired = useMemo(() => {
    if (!orderDeadline) return false;
    return new Date() > new Date(orderDeadline);
  }, [orderDeadline]);


  const filteredStudents = useMemo<Student[]>(() => {
    return selectedClass ? students.filter((s: Student) => s.classId === selectedClass) : [];
  }, [selectedClass, students]);

  const classBooks = useMemo<Book[]>(() => {
    const classData = classes.find((c: ClassData) => c.id === selectedClass);
    return classData ? classData.books : [];
  }, [selectedClass, classes]);

  const studentOrder = useMemo<Order | null>(() => {
    if (!selectedStudent) return null;
    return orders.find((o: Order) => o.studentId === selectedStudent.id) || null;
  }, [selectedStudent, orders]);

  const selectedSum = useMemo(() => {
    return classBooks
      .filter(b => selectedBooks.has(b.id))
      .reduce((sum, b) => sum + b.price, 0);
  }, [classBooks, selectedBooks]);

  const fullSetSum = useMemo(() => {
    return classBooks.reduce((sum, b) => sum + b.price, 0);
  }, [classBooks]);

  const toggleBook = (bookId: string) => {
    const newSelected = new Set(selectedBooks);
    if (newSelected.has(bookId)) {
      newSelected.delete(bookId);
    } else {
      newSelected.add(bookId);
    }
    setSelectedBooks(newSelected);
  };

  const handleClassSelect = (id: number) => {
    setSelectedClass(id);
    setSelectedStudent(null);
    setSelectedBooks(new Set());
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setSelectedBooks(new Set());
  };

  const handlePlaceOrder = () => {
    if (selectedStudent && selectedBooks.size > 0) {
      placeOrder(selectedStudent.id, Array.from(selectedBooks), selectedSum);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800">Loading data...</h2>
          <p className="text-slate-500 font-bold mt-2">This might take up to 60 seconds on the free tier.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 relative p-6 lg:p-10">
      <header className="text-center space-y-4 sticky top-0 z-20 bg-white/60 backdrop-blur-2xl py-6 -mt-6 lg:-mt-10 -mx-6 px-6 lg:-mx-10 lg:px-10 border-b border-white/40 shadow-sm rounded-b-[2rem]">
        <h2 className="text-5xl heading-black">Student Panel</h2>
        <p className="text-slate-500 font-bold text-lg">
          {!selectedClass ? 'Step 1: Select your class' : !selectedStudent ? 'Step 2: Select your name' : 'Step 3: Order books'}
        </p>
      </header>

      {/* Class Selection */}
      {!selectedClass && (
      <section className="space-y-6 animate-in slide-in-from-left-4 duration-300">
        <h3 className="text-2xl font-black flex items-center gap-3 text-slate-800">
          <div className="p-2.5 bg-primary/10 rounded-2xl">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          Select Class
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 3, 4, 5, 6, 7].map((id) => (
            <button
              key={id}
              onClick={() => handleClassSelect(id)}
              className={`flex items-center justify-between py-5 px-8 rounded-3xl font-black text-lg transition-all border-2 group ${
                selectedClass === id
                  ? 'bg-primary text-white border-primary shadow-2xl shadow-emerald-500/30 scale-[1.02]'
                  : 'bg-white/40 text-slate-600 border-white/60 hover:border-primary/40 backdrop-blur-md shadow-lg shadow-slate-200/50 hover:bg-white/60'
              }`}
            >
              <span className="flex items-center gap-4">
                <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm ${
                  selectedClass === id ? 'bg-white/20' : 'bg-primary/10 text-primary'
                }`}>
                  {id}
                </span>
                Class {id}
              </span>
              <ChevronRight className={`w-5 h-5 transition-transform ${selectedClass === id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
            </button>
          ))}
        </div>
      </section>
      )}

      {/* Student Selection */}
      {selectedClass && !selectedStudent && (
        <section className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-4 mb-2">
            <button 
              onClick={() => setSelectedClass(null)}
              className="p-3 bg-white/60 hover:bg-white rounded-2xl shadow-sm transition-all hover:scale-105"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <h3 className="text-2xl font-black flex items-center gap-3 text-slate-800">
              <div className="p-2.5 bg-primary/10 rounded-2xl">
                <User className="w-6 h-6 text-primary" />
              </div>
              Select Student
            </h3>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
            {filteredStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => handleStudentSelect(student)}
                className={`w-full flex items-center justify-between py-5 px-8 rounded-3xl font-black transition-all border-2 text-left group ${
                  selectedStudent?.id === student.id
                    ? 'bg-primary text-white border-primary shadow-2xl shadow-emerald-500/30 scale-[1.01]'
                    : 'bg-white/40 text-slate-600 border-white/60 hover:border-primary/40 backdrop-blur-md shadow-lg shadow-slate-200/50 hover:bg-white/60'
                }`}
              >
                <span className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    selectedStudent?.id === student.id ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  {student.name}
                </span>
                <ChevronRight className={`w-5 h-5 transition-transform ${selectedStudent?.id === student.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Book Selection or Order Status */}
      {selectedStudent && (
        <section className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-4 mb-2">
            <button 
              onClick={() => setSelectedStudent(null)}
              className="p-3 bg-white/60 hover:bg-white rounded-2xl shadow-sm transition-all hover:scale-105"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <h3 className="text-xl font-black text-slate-500">Back to Students</h3>
          </div>

          {isExpired && (
            <div className="p-8 rounded-[2rem] bg-red-50 border-2 border-red-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left animate-in zoom-in-95">
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/30 shrink-0">
                <Clock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-black text-red-600">Order Period Expired</p>
                <p className="text-red-500/80 font-bold">The deadline for placing or modification of orders has passed ({new Date(orderDeadline!).toLocaleString()}). Please contact the Usthad for any urgent changes.</p>
              </div>
            </div>
          )}

          {studentOrder ? (
            <div className="glass-card rounded-[2.5rem] p-12 text-center space-y-8 border-primary/20 bg-white/60">
              <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center shadow-2xl bg-emerald-500 text-white shadow-emerald-500/40">
                <Check className="w-12 h-12 stroke-[3px]" />
              </div>
              <div className="space-y-3">
                <h3 className="text-4xl heading-black text-slate-800">
                  Order Placed!
                </h3>
                <p className="text-slate-500 font-bold text-xl">
                  Your order has been successfully placed.
                </p>
              </div>
              <div className="inline-block bg-white px-10 py-5 rounded-3xl font-black text-3xl text-primary border-2 border-primary/20 shadow-xl shadow-emerald-500/10">
                Total: ₹{studentOrder.totalPrice}
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <h3 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                  <div className="p-2.5 bg-primary/10 rounded-2xl">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  Order Books for {selectedStudent.name}
                </h3>
                <button 
                  onClick={() => setSelectedBooks(new Set(classBooks.map(b => b.id)))}
                  className="text-sm text-primary hover:text-emerald-600 font-black uppercase tracking-widest bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20 transition-all hover:bg-primary/20"
                >
                  Select Full Set
                </button>
              </div>

              <div className="glass-card rounded-[2rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/30 border-b border-white/40">
                      <th className="p-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Select</th>
                      <th className="p-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Book Name</th>
                      <th className="p-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {classBooks.map((book) => (
                      <tr 
                        key={book.id} 
                        className={`cursor-pointer hover:bg-primary/5 transition-colors group ${
                          selectedBooks.has(book.id) ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => toggleBook(book.id)}
                      >
                        <td className="p-8">
                          <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                            selectedBooks.has(book.id) 
                              ? 'bg-primary border-primary shadow-lg shadow-emerald-500/40' 
                              : 'bg-white border-slate-200 group-hover:border-primary/50'
                          }`}>
                            {selectedBooks.has(book.id) && <Check className="w-5 h-5 text-white stroke-[4px]" />}
                          </div>
                        </td>
                        <td className="p-8 font-black text-slate-700 text-lg">{book.name}</td>
                        <td className="p-8 text-right font-black text-2xl text-primary">₹{book.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Card */}
              <div className="glass-card rounded-[2.5rem] p-10 space-y-10 border-primary/30 bg-emerald-500/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-emerald-500/40">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-3xl heading-black">Order Summary</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3 p-8 rounded-3xl bg-white/40 border border-white/60 shadow-xl shadow-slate-200/30">
                    <p className="text-slate-400 text-[10px] uppercase tracking-[0.3em] font-black">Selected Sum</p>
                    <p className="text-5xl font-black text-primary">₹{selectedSum}</p>
                  </div>
                  <div className="space-y-3 p-8 rounded-3xl bg-white/40 border border-white/60 shadow-xl shadow-slate-200/30">
                    <p className="text-slate-400 text-[10px] uppercase tracking-[0.3em] font-black">Full Set Sum</p>
                    <p className="text-5xl font-black text-slate-900">₹{fullSetSum}</p>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={selectedBooks.size === 0 || isExpired}
                    className="btn-primary w-full py-6 text-2xl disabled:opacity-30 disabled:cursor-not-allowed disabled:grayscale"
                  >
                    <ShoppingCart className="w-7 h-7" />
                    {isExpired ? 'Ordering Locked' : 'Place Order Now'}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
