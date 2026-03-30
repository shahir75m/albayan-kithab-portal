import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Student, Book } from '../types';
import { 
  Users, BookOpen, TrendingUp, ShieldCheck, Search, 
  ChevronRight, FileText, CheckCircle2, Plus, Trash2, 
  Upload, Settings, X, Save, Edit3, LayoutDashboard, User
} from 'lucide-react';

export default function UsthadPortal() {
  const { 
    classes, students, addStudent, deleteStudent, 
    addStudentsFromCSV, addBook, deleteBook, updateBookPrice,
    orders, loading
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

  const filteredStudents = useMemo(() => {
    return selectedClass ? students.filter(s => s.classId === selectedClass) : [];
  }, [selectedClass, students]);

  const studentOrder = useMemo(() => {
    if (!selectedStudent) return null;
    return orders.find(o => o.studentId === selectedStudent.id) || null;
  }, [selectedStudent, orders]);

  const studentBooks = useMemo(() => {
    if (!selectedStudent) return [];
    const classData = classes.find(c => c.id === selectedStudent.classId);
    return classData ? classData.books : [];
  }, [selectedStudent, classes]);

  const totalOrdersCount = useMemo(() => {
    return orders.length;
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
          <h2 className="text-5xl heading-black">Usthad Dashboard</h2>
          <div className="flex p-1.5 bg-white/40 backdrop-blur-xl rounded-[1.5rem] w-fit border border-white/60 shadow-lg shadow-slate-200/40">
            <button 
              onClick={() => setView('orders')}
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
              onClick={() => setView('manage')}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Class & Student Selection */}
            <div className="lg:col-span-1 space-y-10">
              <section className="space-y-6">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-2xl">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  Select Class
                </h3>
                <div className="space-y-3">
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => {
                        setSelectedClass(cls.id);
                        setSelectedStudent(null);
                      }}
                      className={`w-full flex items-center justify-between py-5 px-8 rounded-[1.5rem] font-black text-lg transition-all border-2 group ${
                        selectedClass === cls.id
                          ? 'bg-primary text-white border-primary shadow-2xl shadow-emerald-500/30 scale-[1.02]'
                          : 'bg-white/40 text-slate-600 border-white/60 hover:border-primary/40 backdrop-blur-md shadow-lg shadow-slate-200/40 hover:bg-white/60'
                      }`}
                    >
                      <span className="flex items-center gap-4">
                        <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm ${
                          selectedClass === cls.id ? 'bg-white/20' : 'bg-primary/10 text-primary'
                        }`}>
                          {cls.id}
                        </span>
                        Class {cls.id}
                      </span>
                      <ChevronRight className={`w-5 h-5 transition-transform ${selectedClass === cls.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                    </button>
                  ))}
                </div>
              </section>

              {selectedClass && (
                <section className="space-y-6 animate-in">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-2xl">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    Students in Class {selectedClass}
                  </h3>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-3 no-scrollbar">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => {
                        const hasOrder = orders.some(o => o.studentId === student.id);
                        return (
                          <button
                            key={student.id}
                            onClick={() => setSelectedStudent(student)}
                            className={`w-full flex items-center justify-between py-5 px-8 rounded-[1.5rem] font-black transition-all border-2 text-left group ${
                              selectedStudent?.id === student.id
                                ? 'bg-primary text-white border-primary shadow-2xl shadow-emerald-500/30 scale-[1.01]'
                                : 'bg-white/40 text-slate-600 border-white/60 hover:border-primary/40 backdrop-blur-md shadow-lg shadow-slate-200/40 hover:bg-white/60'
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
                            <div className="flex items-center gap-3">
                              {hasOrder && (
                                <span className={`w-2 h-2 rounded-full ${selectedStudent?.id === student.id ? 'bg-white' : 'bg-emerald-500'}`} />
                              )}
                              <ChevronRight className={`w-5 h-5 transition-transform ${selectedStudent?.id === student.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-16 text-center text-slate-400 font-black bg-white/30 rounded-[2rem] border-2 border-dashed border-slate-200">
                        No students found
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Order Details */}
            <div className="lg:col-span-2 space-y-8">
              <section className="h-full">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  Order Details
                </h3>
                
                {selectedStudent ? (
                  <div className="glass-card rounded-3xl p-8 space-y-8 animate-in">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-8">
                      <div>
                        <h4 className="text-3xl font-black text-slate-800">{selectedStudent.name}</h4>
                        <p className="text-slate-500 font-bold mt-1">Class {selectedStudent.classId} • Student ID: {selectedStudent.id}</p>
                      </div>
                      {studentOrder ? (
                        <div className="px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          Order Placed
                        </div>
                      ) : (
                        <div className="bg-slate-500/10 text-slate-500 px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-slate-500/20">
                          No Order
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <h5 className="font-black text-slate-800 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        Book Checklist
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {studentBooks.map((book) => (
                          <div key={book.id} className="flex items-center justify-between p-5 bg-white/50 rounded-2xl border border-white/20 backdrop-blur-sm">
                            <span className="font-bold text-slate-700">{book.name}</span>
                            <span className="text-primary font-black">₹{book.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="text-center md:text-left">
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Full Set Total</p>
                        <p className="text-4xl font-black text-primary">₹{studentBooks.reduce((s, b) => s + b.price, 0)}</p>
                      </div>
                      {studentOrder && (
                        <div className="flex items-center gap-2 text-emerald-600 font-black text-lg bg-emerald-500/10 px-8 py-4 rounded-2xl border border-emerald-500/20">
                          <CheckCircle2 className="w-6 h-6" />
                          Order Placed
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="glass-card rounded-3xl h-[500px] flex flex-col items-center justify-center text-slate-400 space-y-4 border-dashed border-2">
                    <div className="p-6 bg-slate-100 rounded-full">
                      <Search className="w-16 h-16 opacity-20" />
                    </div>
                    <p className="font-black text-xl">Select a student to view their order</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in">
          {/* Student Management */}
          <section className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Users className="w-6 h-6 text-primary" />
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
                  Upload CSV
                </button>
              </div>
            </div>

            <div className="glass-card p-8 rounded-3xl space-y-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <select 
                  value={selectedClass || ''} 
                  onChange={(e) => setSelectedClass(parseInt(e.target.value))}
                  className="bg-white/50 border border-white/20 rounded-2xl px-4 py-3 text-sm font-black text-slate-700 backdrop-blur-sm focus:ring-2 ring-primary/50 outline-none"
                >
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>Class {c.id}</option>)}
                </select>
                <input 
                  type="text" 
                  placeholder="Student Name" 
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="flex-1 bg-white/50 border border-white/20 rounded-2xl px-6 py-3 text-sm font-bold text-slate-700 backdrop-blur-sm focus:ring-2 ring-primary/50 outline-none"
                />
                <button 
                  onClick={handleAddStudent}
                  className="bg-primary text-white p-3 rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2 no-scrollbar">
                {students.filter(s => !selectedClass || s.classId === selectedClass).map(student => (
                  <div key={student.id} className="flex items-center justify-between p-5 bg-white/30 rounded-2xl border border-white/10 group hover:bg-white/50 transition-all">
                    <div>
                      <p className="font-black text-slate-700">{student.name}</p>
                      <p className="text-xs text-slate-400 font-bold">Class {student.classId}</p>
                    </div>
                    <button 
                      onClick={() => deleteStudent(student.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-3 bg-white/50 rounded-xl border border-white/20"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Book Management */}
          <section className="space-y-8">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              Manage Books & Prices
            </h3>

            <div className="glass-card p-8 rounded-3xl space-y-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <select 
                  value={selectedClass || ''} 
                  onChange={(e) => setSelectedClass(parseInt(e.target.value))}
                  className="bg-white/50 border border-white/20 rounded-2xl px-4 py-3 text-sm font-black text-slate-700 backdrop-blur-sm focus:ring-2 ring-primary/50 outline-none"
                >
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>Class {c.id}</option>)}
                </select>
                <input 
                  type="text" 
                  placeholder="Book Name" 
                  value={newBookName}
                  onChange={(e) => setNewBookName(e.target.value)}
                  className="flex-1 bg-white/50 border border-white/20 rounded-2xl px-6 py-3 text-sm font-bold text-slate-700 backdrop-blur-sm focus:ring-2 ring-primary/50 outline-none"
                />
                <input 
                  type="number" 
                  placeholder="Price" 
                  value={newBookPrice}
                  onChange={(e) => setNewBookPrice(e.target.value)}
                  className="w-24 bg-white/50 border border-white/20 rounded-2xl px-4 py-3 text-sm font-black text-primary backdrop-blur-sm focus:ring-2 ring-primary/50 outline-none"
                />
                <button 
                  onClick={handleAddBook}
                  className="bg-primary text-white p-3 rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2 no-scrollbar">
                {selectedClass ? (
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
                  <div className="py-16 text-center text-slate-400 font-black text-lg">
                    Select a class to manage its books
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}


