/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import StudentPortal from './components/StudentPortal';
import UsthadPortal from './components/UsthadPortal';
import { 
  GraduationCap, UserCircle, BookOpenCheck, 
  Sun, Moon, LayoutDashboard, Settings, 
  LogOut, Menu, X, ChevronRight, Lock
} from 'lucide-react';
import { DataProvider } from './context/DataContext';

type Portal = 'student' | 'usthad';

const PasswordPrompt = ({ onAuthenticated }: { onAuthenticated: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'usthad@ADMIN') {
      onAuthenticated();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-in">
      <div className="glass-card p-10 rounded-[2.5rem] max-w-md w-full space-y-8 border-primary/20 bg-white/60">
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-xl bg-white p-2 border border-slate-100 mb-6">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <h2 className="text-3xl heading-black text-slate-800">Usthad Login</h2>
          <p className="text-slate-500 font-bold">Please enter the password to access the portal.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter password"
              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all font-bold text-lg bg-white/80"
            />
            {error && <p className="text-red-500 text-sm font-bold mt-2 px-2">{error}</p>}
          </div>
          <button type="submit" className="w-full btn-primary py-4 text-lg">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUsthadAuthenticated, setIsUsthadAuthenticated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const activePortal = location.pathname.startsWith('/usthad') ? 'usthad' : 'student';

  useEffect(() => {
    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center animate-in fade-in duration-500 z-[100] fixed inset-0">
        <div className="w-40 h-40 mb-8 transform hover:scale-105 transition-transform duration-700 ease-out">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-2xl" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-black text-slate-800 tracking-wider">
            ALBAYAN KITHAB
          </h1>
          <p className="text-primary font-bold tracking-widest uppercase text-sm mt-2">
            PANEL 2026-27
          </p>
        </div>
      </div>
    );
  }

  return (
    <DataProvider>
      <div className="min-h-screen flex transition-colors duration-300 bg-mesh-light text-slate-900 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 glass-sidebar transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="h-full flex flex-col p-6">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-14">
              <div className="w-14 h-14 bg-white rounded-[1.25rem] shadow-xl shadow-slate-200/50 p-1.5 flex items-center justify-center border border-slate-100 flex-shrink-0">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-lg heading-black leading-tight">
                ALBAYAN KITHAB
                <span className="text-primary block text-sm mt-1">PANEL 2026-27</span>
              </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 px-4">
                Main Menu
              </p>
              
              <Link
                to="/student"
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center justify-between p-4 rounded-[1.25rem] transition-all group ${
                  activePortal === 'student'
                    ? 'bg-primary text-white shadow-2xl shadow-emerald-500/30 scale-[1.02]'
                    : 'text-slate-500 hover:bg-white/60 hover:shadow-lg hover:shadow-slate-200/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <GraduationCap className={`w-6 h-6 ${activePortal === 'student' ? 'text-white' : 'text-primary'}`} />
                  <span className="font-black text-sm">Student Portal</span>
                </div>
                {activePortal === 'student' && <ChevronRight className="w-5 h-5" />}
              </Link>

              <Link
                to="/usthad"
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center justify-between p-4 rounded-[1.25rem] transition-all group ${
                  activePortal === 'usthad'
                    ? 'bg-primary text-white shadow-2xl shadow-emerald-500/30 scale-[1.02]'
                    : 'text-slate-500 hover:bg-white/60 hover:shadow-lg hover:shadow-slate-200/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <UserCircle className={`w-6 h-6 ${activePortal === 'usthad' ? 'text-white' : 'text-primary'}`} />
                  <span className="font-black text-sm">Usthad Portal</span>
                </div>
                {activePortal === 'usthad' && <ChevronRight className="w-5 h-5" />}
              </Link>
            </nav>

            {/* Bottom Actions */}
            <div className="pt-8 border-t border-slate-200/60 space-y-3">
              <button className="w-full flex items-center gap-4 p-4 rounded-[1.25rem] text-red-500 hover:bg-red-50/80 transition-all font-black text-sm">
                <LogOut className="w-6 h-6" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header (Mobile Only) */}
          <header className="lg:hidden h-20 flex items-center justify-between px-6 glass-sidebar sticky top-0 z-30 shadow-lg shadow-slate-200/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-lg shadow-slate-200/50 p-1 flex items-center justify-center flex-shrink-0 border border-slate-100">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="heading-black text-lg">ALBAYAN PANEL</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 rounded-2xl bg-white/80 shadow-xl shadow-slate-200/60 border border-white"
            >
              <Menu className="w-6 h-6 text-slate-800" />
            </button>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto no-scrollbar">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/student" element={<StudentPortal />} />
                <Route path="/student/:studentId" element={<StudentPortal />} />
                <Route path="/usthad" element={isUsthadAuthenticated ? <UsthadPortal /> : <PasswordPrompt onAuthenticated={() => setIsUsthadAuthenticated(true)} />} />
                <Route path="/usthad/orders" element={isUsthadAuthenticated ? <UsthadPortal /> : <PasswordPrompt onAuthenticated={() => setIsUsthadAuthenticated(true)} />} />
                <Route path="/usthad/orders/:classId" element={isUsthadAuthenticated ? <UsthadPortal /> : <PasswordPrompt onAuthenticated={() => setIsUsthadAuthenticated(true)} />} />
                <Route path="/usthad/summary" element={isUsthadAuthenticated ? <UsthadPortal /> : <PasswordPrompt onAuthenticated={() => setIsUsthadAuthenticated(true)} />} />
                <Route path="/usthad/manage" element={isUsthadAuthenticated ? <UsthadPortal /> : <PasswordPrompt onAuthenticated={() => setIsUsthadAuthenticated(true)} />} />
                <Route path="/usthad/manage/:classId" element={isUsthadAuthenticated ? <UsthadPortal /> : <PasswordPrompt onAuthenticated={() => setIsUsthadAuthenticated(true)} />} />
                <Route path="/" element={<Navigate to="/student" replace />} />
                <Route path="*" element={<Navigate to="/student" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </DataProvider>
  );
}
