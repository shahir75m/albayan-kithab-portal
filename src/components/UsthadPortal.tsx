import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Student, Book, ClassData, Order } from '../types';
import { 
  Users, BookOpen, TrendingUp, ShieldCheck, Search, 
  ChevronRight, FileText, CheckCircle2, Plus, Trash2, 
  Upload, Settings, X, Save, Edit3, LayoutDashboard, User, ArrowLeft,
  Check, Clock
} from 'lucide-react';


export default function UsthadPortal() {
  const { 
    classes, students, addStudent, deleteStudent, 
    addStudentsFromCSV, addBook, addBooksFromCSV, deleteBook, updateBookPrice,
    orders, loading, orderDeadline, updateOrderDeadline
  } = useData();

  const [view, setView] = useState<'orders' | 'manage'>('orders');
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Management States
  const [newStudentName, setNewStudentName] = useState('');
  const [newBookName, setNewBookName] = useState('');
  const [newBookPrice, setNewBookPrice] = useState('');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bookFileInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = useMemo(() => {
    return selectedClass ? students.filter((s: Student) => s.classId === selectedClass) : [];
  }, [selectedClass, students]);

  const classBooks = useMemo(() => {
    if (!selectedClass) return [];
    return classes.find((c: ClassData) => c.id === selectedClass)?.books || [];
  }, [selectedClass, classes]);

  const totalOrdersCount = useMemo(() => {
    return orders.length;
  }, [orders]);

  const ordersMap = useMemo(() => {
    const map = new Map<string, any>();
    orders.forEach(o => map.set(o.studentId, o));
    return map;
  }, [orders]);

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

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        try {
          await addStudentsFromCSV(text);
          alert('Students added successfully from CSV!');
        } catch (err) {
          alert('Failed to add students. Please check the CSV format.');
        }
        // Reset file input so the same file can be re-uploaded if needed
        e.target.value = '';
      };
      reader.readAsText(file);
    }
  };

  const handleBookCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        try {
          await addBooksFromCSV(text);
          alert('Books added successfully from CSV!');
        } catch (err: any) {
          alert(`Import Failed: ${err.message}`);
        }
        e.target.value = '';
      };
      reader.readAsText(file);
    }
  };

  const handleAddStudent = () => {
    if (newStudentName && selectedClass) {
      addStudent(newStudentName, selectedClass);
      setNewStudentName('');
    }
  };

  const handleAddBook = () => {
    if (newBookName && newBookPrice && selectedClass) {
      addBook(selectedClass, newBookName, parseFloat(newBookPrice));
      setNewBookName('');
      setNewBookPrice('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-6 lg:p-10">
      <header className="sticky top-0 z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white/60 backdrop-blur-2xl border-b border-white/40 p-6 rounded-b-[2.5rem] shadow-sm -mt-6 lg:-mt-10 -mx-6 px-6 lg:-mx-10 lg:px-10">
        <div className="space-y-4">
          <h2 className="text-5xl heading-black">Usthad Panel</h2>
          <div className="flex p-1.5 bg-white/40 backdrop-blur-xl rounded-[1.5rem] w-fit border border-white/60 shadow-lg shadow-slate-200/40">
            <button 
              onClick={() => { setView('orders'); setSelectedClass(null); setSelectedStudent(null); }}
              className={`flex items-center gap-2 text-sm font-black px-8 py-3 rounded-[1.25rem] transition-all ${
                view === 'orders' 
                  ? 'bg-primary text-white shadow-xl shadow-emerald-500/30' 
                  : 'text-slate-500 hover:text-primary'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              View Orders
            </button>
            <button 
              onClick={() => { setView('manage'); setSelectedClass(null); setSelectedStudent(null); }}
              className={`flex items-center gap-2 text-sm font-black px-8 py-3 rounded-[1.25rem] transition-all ${
                view === 'manage' 
                  ? 'bg-primary text-white shadow-xl shadow-emerald-500/30' 
                  : 'text-slate-500 hover:text-primary'
              }`}
            >
              <Settings className="w-4 h-4" />
              Manage Data
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-emerald-500/10 text-primary border border-primary/30 px-6 py-3.5 rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/5 backdrop-blur-xl">
          <ShieldCheck className="w-6 h-6" />
          Authorized Access
        </div>
      </header>

      {view === 'orders' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-10 rounded-[2.5rem] flex items-center gap-8 group hover:border-primary/50 transition-all hover:scale-[1.02]">
              <div className="p-5 bg-blue-500/10 rounded-3xl text-blue-500 shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                <Users className="w-10 h-10" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Total Students</p>
                <p className="text-4xl font-black text-slate-800">{students.length}</p>
              </div>
            </div>
            <div className="glass-card p-10 rounded-[2.5rem] flex items-center gap-8 group hover:border-primary/50 transition-all hover:scale-[1.02]">
              <div className="p-5 bg-purple-500/10 rounded-3xl text-purple-500 shadow-inner group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
                <BookOpen className="w-10 h-10" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Active Classes</p>
                <p className="text-4xl font-black text-slate-800">{classes.length}</p>
              </div>
            </div>
            <div className="glass-card p-10 rounded-[2.5rem] flex items-center gap-8 group hover:border-primary/50 transition-all hover:scale-[1.02]">
              <div className="p-5 bg-amber-500/10 rounded-3xl text-amber-500 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                <TrendingUp className="w-10 h-10" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Total Orders</p>
                <p className="text-4xl font-black text-slate-800">{totalOrdersCount}</p>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {!selectedClass ? (
              <section className="space-y-6">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-2xl">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  Select Class to View Orders
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClass(cls.id)}
                      className={`flex items-center justify-between py-8 px-8 rounded-[2rem] font-black text-xl transition-all border-2 group bg-white/40 text-slate-600 border-white/60 hover:border-primary/40 backdrop-blur-md shadow-lg shadow-slate-200/40 hover:bg-white/60 hover:-translate-y-1`}
                    >
                      <span className="flex items-center gap-4">
                        <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-primary/10 text-primary">
                          {cls.id}
                        </span>
                        Class {cls.id}
                      </span>
                      <ChevronRight className="w-6 h-6 transition-transform opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <section className="space-y-8 animate-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedClass(null)}
                      className="p-3 bg-white/60 hover:bg-white rounded-2xl shadow-sm transition-all hover:scale-105"
                    >
                      <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <h3 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                      Class {selectedClass} Order Overview
                    </h3>
                  </div>
                  <div className="px-6 py-3 bg-primary/10 text-primary rounded-2xl font-black border border-primary/20">
                    {filteredStudents.length} Students
                  </div>
                </div>

                <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/40 shadow-2xl">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-50/50 backdrop-blur-md border-b border-white/40">
                          <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest sticky left-0 bg-slate-50/50 z-10 w-16">#</th>
                          <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest sticky left-16 bg-slate-50/50 z-10 min-w-[200px]">Student Name</th>
                          {classBooks.map(book => (
                            <th key={book.id} className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center min-w-[150px]">
                              <div className="space-y-1">
                                <div className="text-slate-800 text-[11px] truncate">{book.name}</div>
                                <div className="text-primary font-black">₹{book.price}</div>
                              </div>
                            </th>
                          ))}
                          <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right min-w-[120px]">Total Pay</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/20">
                        {filteredStudents.map((student: Student, idx: number) => {
                          const order = ordersMap.get(student.id);
                          return (
                            <tr key={student.id} className="hover:bg-primary/5 transition-colors group">
                              <td className="p-6 font-bold text-slate-400 text-sm sticky left-0 bg-white/40 backdrop-blur-sm group-hover:bg-primary/5">{idx + 1}</td>
                              <td className="p-6 font-black text-slate-700 sticky left-16 bg-white/40 backdrop-blur-sm group-hover:bg-primary/5">{student.name}</td>
                              {classBooks.map((book: Book) => {
                                const isOrdered = order?.bookIds.includes(book.id);
                                return (
                                  <td key={book.id} className="p-6 text-center">
                                    {isOrdered ? (
                                      <div className="flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                                          <Check className="w-5 h-5 stroke-[3px]" />
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-slate-300 font-bold">-</span>
                                    )}
                                  </td>
                                );
                              })}
                              <td className="p-6 text-right">
                                <span className="font-black text-primary text-lg">₹{order?.totalPrice || 0}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-50/80 backdrop-blur-xl border-t-2 border-primary/10">
                        <tr>
                          <td colSpan={2} className="p-6 font-black text-slate-800 text-sm uppercase tracking-widest text-right pr-10">Total Orders Quantity</td>
                          {classBooks.map((book: Book) => {
                            const count = filteredStudents.filter((s: Student) => ordersMap.get(s.id)?.bookIds.includes(book.id)).length;
                            return (
                              <td key={book.id} className="p-6 text-center">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white border-2 border-primary/20 font-black text-primary shadow-sm">
                                  {count}
                                </div>
                              </td>
                            );
                          })}
                          <td className="p-6 text-right">
                            <div className="font-black text-slate-800 text-sm uppercase">Orders</div>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2} className="p-6 font-black text-slate-800 text-sm uppercase tracking-widest text-right pr-10">Total Price Sum</td>
                          {classBooks.map((book: Book) => {
                            const count = filteredStudents.filter((s: Student) => ordersMap.get(s.id)?.bookIds.includes(book.id)).length;
                            return (
                              <td key={book.id} className="p-6 text-center">
                                <div className="font-black text-primary text-lg">₹{count * book.price}</div>
                              </td>
                            );
                          })}
                          <td className="p-6 text-right">
                            <div className="font-black text-emerald-600 text-xl">
                              ₹{filteredStudents.reduce((sum: number, s: Student) => sum + (ordersMap.get(s.id)?.totalPrice || 0), 0)}
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </section>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-10 animate-in">
          {!selectedClass ? (
            <section className="space-y-6">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-2xl">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                Step 1: Select Class to Manage
              </h3>

              {/* Order Deadline Control */}
              <div className="glass-card p-10 rounded-[2.5rem] space-y-8 border-primary/10 transition-all hover:border-primary/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                      <Clock className="w-8 h-8 text-primary" />
                      Order Entry Control
                    </h3>
                    <p className="text-slate-500 font-bold max-w-md">
                      Set a deadline. After this time, the Student Panel will lock and no new orders can be placed.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <input 
                      type="datetime-local" 
                      value={orderDeadline || ''}
                      onChange={(e) => updateOrderDeadline(e.target.value)}
                      className="bg-white/60 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-black text-slate-700 outline-none focus:border-primary transition-all shadow-inner"
                    />
                    {orderDeadline && (
                      <button 
                        onClick={() => { if(confirm('Are you sure you want to clear the deadline and open orders?')) updateOrderDeadline(''); }}
                        className="bg-red-500/10 text-red-500 px-8 py-4 rounded-2xl font-black hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-lg shadow-red-500/5"
                      >
                        Open Orders
                      </button>
                    )}
                  </div>
                </div>
                {orderDeadline && (
                  <div className={`p-6 rounded-3xl border-2 flex items-center gap-4 ${
                    new Date() > new Date(orderDeadline) 
                      ? 'bg-red-50 border-red-100 text-red-600' 
                      : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  }`}>
                    <div className={`p-2 rounded-xl ${new Date() > new Date(orderDeadline) ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="font-black">
                      {new Date() > new Date(orderDeadline) 
                        ? `Orders are currently LOCKED (Expired on ${new Date(orderDeadline).toLocaleString()})` 
                        : `Orders are OPEN until ${new Date(orderDeadline).toLocaleString()}`
                      }
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.id)}
                    className="flex items-center justify-between py-8 px-8 rounded-[2rem] font-black text-xl transition-all border-2 group bg-white/40 text-slate-600 border-white/60 hover:border-primary/40 backdrop-blur-md shadow-lg shadow-slate-200/40 hover:bg-white/60 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <span className="flex items-center gap-4">
                      <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-primary/10 text-primary">
                        {cls.id}
                      </span>
                      Class {cls.id}
                    </span>
                    <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-2" />
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <div className="space-y-10 animate-in">
              <div className="flex items-center gap-4 mb-2">
                <button 
                  onClick={() => setSelectedClass(null)}
                  className="p-3 bg-white/60 hover:bg-white rounded-2xl shadow-sm transition-all hover:scale-105"
                >
                  <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h3 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                  Managing Class {selectedClass}
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Student Management */}
                <section className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      Manage Students
                    </h3>
                    <div className="flex gap-2">
                      <input 
                        type="file" 
                        accept=".csv" 
                        ref={fileInputRef} 
                        onChange={handleCSVUpload} 
                        className="hidden" 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 text-sm font-black text-primary bg-primary/10 px-4 py-2.5 rounded-2xl hover:bg-primary/20 transition-all border border-primary/20"
                      >
                        <Upload className="w-4 h-4" />
                        CSV
                      </button>
                    </div>
                  </div>

                  <div className="glass-card p-8 rounded-3xl space-y-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input 
                        type="text" 
                        placeholder="New Student Name" 
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        className="flex-1 bg-white/50 border border-white/20 rounded-2xl px-6 py-3 text-sm font-bold text-slate-700 backdrop-blur-sm focus:ring-2 ring-primary/50 outline-none"
                      />
                      <button 
                        onClick={handleAddStudent}
                        disabled={!newStudentName}
                        className="bg-primary text-white px-6 py-3 rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 no-scrollbar">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                          <div key={student.id} className="flex items-center justify-between p-5 bg-white/30 rounded-2xl border border-white/10 group hover:bg-white/50 transition-all">
                            <div>
                              <p className="font-black text-slate-700">{student.name}</p>
                            </div>
                            <button 
                              onClick={() => deleteStudent(student.id)}
                              className="text-slate-300 hover:text-red-500 transition-colors p-3 bg-white/50 rounded-xl border border-white/20"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-slate-400 font-bold bg-white/30 rounded-2xl border-2 border-dashed border-white/50">
                          No students in this class.
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Book Management */}
                <section className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        Manage Books & Prices
                      </h3>
                      <div className="flex gap-2">
                        <input 
                          type="file" 
                          accept=".csv" 
                          ref={bookFileInputRef} 
                          onChange={handleBookCSVUpload} 
                          className="hidden" 
                        />
                        <button 
                          onClick={() => bookFileInputRef.current?.click()}
                          className="flex items-center gap-2 text-sm font-black text-primary bg-primary/10 px-4 py-2.5 rounded-2xl hover:bg-primary/20 transition-all border border-primary/20"
                        >
                          <Upload className="w-4 h-4" />
                          CSV
                        </button>
                      </div>
                    </div>

                  <div className="glass-card p-8 rounded-3xl space-y-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input 
                        type="text" 
                        placeholder="Book Name" 
                        value={newBookName}
                        onChange={(e) => setNewBookName(e.target.value)}
                        className="flex-1 bg-white/50 border border-white/20 rounded-2xl px-6 py-3 text-sm font-bold text-slate-700 backdrop-blur-sm focus:ring-2 ring-primary/50 outline-none"
                      />
                      <input 
                        type="number" 
                        placeholder="₹ Price" 
                        value={newBookPrice}
                        onChange={(e) => setNewBookPrice(e.target.value)}
                        className="w-24 bg-white/50 border border-white/20 rounded-2xl px-4 py-3 text-sm font-black text-primary backdrop-blur-sm focus:ring-2 ring-primary/50 outline-none"
                      />
                      <button 
                        onClick={handleAddBook}
                        disabled={!newBookName || !newBookPrice}
                        className="bg-primary text-white p-3 rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2 no-scrollbar">
                      {classes.find(c => c.id === selectedClass)?.books.length ? (
                        classes.find(c => c.id === selectedClass)?.books.map(book => (
                          <div key={book.id} className="flex items-center justify-between p-6 bg-white/30 rounded-2xl border border-white/10 group hover:bg-white/50 transition-all">
                            <div className="flex-1">
                              <p className="font-black text-slate-700 text-lg">{book.name}</p>
                              {editingBookId === book.id ? (
                                <div className="flex items-center gap-3 mt-3">
                                  <input 
                                    type="number" 
                                    value={editPriceValue}
                                    onChange={(e) => setEditPriceValue(e.target.value)}
                                    className="w-24 bg-white border-2 border-primary rounded-xl px-3 py-1.5 text-sm font-black text-primary shadow-lg shadow-emerald-500/10"
                                    autoFocus
                                  />
                                  <button 
                                    onClick={() => {
                                      updateBookPrice(selectedClass, book.id, parseFloat(editPriceValue));
                                      setEditingBookId(null);
                                    }}
                                    className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 transition-all"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => setEditingBookId(null)}
                                    className="bg-slate-200 text-slate-500 p-2 rounded-xl hover:bg-slate-300 transition-all"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <p className="text-primary font-black text-xl mt-1">₹{book.price}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setEditingBookId(book.id);
                                  setEditPriceValue(book.price.toString());
                                }}
                                className="text-slate-400 hover:text-primary transition-colors p-3 bg-white/50 rounded-xl border border-white/20"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => deleteBook(selectedClass, book.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors p-3 bg-white/50 rounded-xl border border-white/20"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-slate-400 font-bold bg-white/30 rounded-2xl border-2 border-dashed border-white/50">
                          No books assigned to this class.
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
