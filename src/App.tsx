/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
    if (password === 'usthad@admin') {
      onAuthenticated();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-in">
      <div className="glass-card p-10 rounded-[2.5rem] max-w-md w-full space-y-8 border-primary/20 bg-white/60">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center shadow-2xl bg-primary text-white shadow-emerald-500/40">
            <Lock className="w-10 h-10" />
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
  const [activePortal, setActivePortal] = useState<Portal>('student');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUsthadAuthenticated, setIsUsthadAuthenticated] = useState(false);

  return (
    <DataProvider>
      <div className="min-h-screen flex transition-colors duration-300 bg-mesh-light text-slate-900">
        
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
              <div className="bg-primary p-3 rounded-[1.25rem] shadow-xl shadow-emerald-500/40">
                <BookOpenCheck className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl heading-black leading-tight">
                ALBAYAN KITHAB PORTAL
                <span className="text-primary block text-sm mt-1">2026-27</span>
              </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 px-4">
                Main Menu
              </p>
              
              <button
                onClick={() => { setActivePortal('student'); setIsSidebarOpen(false); }}
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
              </button>

              <button
                onClick={() => { setActivePortal('usthad'); setIsSidebarOpen(false); }}
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
              </button>
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
          <header className="lg:hidden h-20 flex items-center justify-between px-8 glass-sidebar sticky top-0 z-30 shadow-lg shadow-slate-200/40">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                <BookOpenCheck className="w-6 h-6 text-white" />
              </div>
              <span className="heading-black text-lg">ALBAYAN KITHAB PORTAL</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 rounded-2xl bg-white/80 shadow-xl shadow-slate-200/60 border border-white"
            >
              <Menu className="w-7 h-7 text-slate-800" />
            </button>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto no-scrollbar">
            <div className="max-w-7xl mx-auto">
              {activePortal === 'student' ? (
                <StudentPortal />
              ) : isUsthadAuthenticated ? (
                <UsthadPortal />
              ) : (
                <PasswordPrompt onAuthenticated={() => setIsUsthadAuthenticated(true)} />
              )}
            </div>
          </main>
        </div>
      </div>
    </DataProvider>
  );
}




