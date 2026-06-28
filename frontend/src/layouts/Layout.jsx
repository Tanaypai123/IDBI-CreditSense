import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  UserCheck, 
  Layers, 
  BarChart3, 
  Settings, 
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import IDBILogo from '../components/IDBILogo';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isHome = location.pathname === '/';

  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/assess', label: 'Underwrite Wizard', icon: UserCheck },
    { path: '/batch', label: 'Batch Processor', icon: Layers },
    { path: '/analytics', label: 'Ensembles Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const notifications = [
    { id: 1, text: "Ensemble models loaded successfully (LightGBM + XGBoost).", time: "Just now" },
    { id: 2, text: "Minimum underwriting risk threshold synchronized.", time: "10 mins ago" },
    { id: 3, text: "System sync complete. SQLite databases operational.", time: "1 hour ago" }
  ];

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/assess') return ['Console', 'Underwrite Wizard'];
    if (path === '/batch') return ['Console', 'Batch Processor'];
    if (path === '/analytics') return ['Console', 'Ensembles Analytics'];
    if (path === '/settings') return ['Console', 'System Settings'];
    return ['Console', 'App'];
  };

  const breadcrumbs = getBreadcrumbs();

  const renderUserMenu = () => {
    if (!user) return null;
    return (
      <div className="relative">
        <button
          onClick={() => {
            setShowAvatarMenu(!showAvatarMenu);
            setShowNotifMenu(false);
          }}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 font-poppins text-[11px]">
            {user.name.charAt(0)}
          </div>
          <div className="hidden md:flex flex-col items-start text-left">
            <span className="text-xs font-bold text-slate-700 font-poppins leading-none">{user.name}</span>
            <span className="text-[9px] text-slate-400 font-medium mt-0.5">{user.role}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {showAvatarMenu && (
          <div className="absolute right-0 mt-2.5 w-48 bg-white border border-slate-200 rounded-xl shadow-premium-hover py-2 z-50 text-xs font-inter animate-fade-in">
            <div className="px-4 py-2 border-b border-slate-50 space-y-0.5">
              <span className="font-bold text-slate-700 block truncate">{user.name}</span>
              <span className="text-[10px] text-slate-400 block">{user.role}</span>
            </div>
            
            <button
              onClick={() => {
                logout();
                setShowAvatarMenu(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center space-x-2 transition-colors"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderNotifMenu = () => {
    return (
      <div className="relative">
        <button 
          onClick={() => {
            setShowNotifMenu(!showNotifMenu);
            setShowAvatarMenu(false);
          }}
          className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>

        {showNotifMenu && (
          <div className="absolute right-0 mt-2.5 w-72 bg-white border border-slate-200 rounded-xl shadow-premium-hover p-4 space-y-3 z-50 text-xs font-inter animate-fade-in">
            <h4 className="font-bold text-slate-800 font-poppins border-b border-slate-50 pb-2 flex justify-between items-center">
              <span>Notifications</span>
              <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">New</span>
            </h4>
            <ul className="space-y-2.5">
              {notifications.map((notif) => (
                <li key={notif.id} className="space-y-0.5 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <p className="text-slate-600 leading-normal">{notif.text}</p>
                  <span className="text-[9px] text-slate-400 font-semibold">{notif.time}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (isHome) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] font-sans flex flex-col">
        {/* Horizontal Navigation: IDBI Bank Portal styling */}
        <header className="h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 md:px-12 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3">
              <IDBILogo size={30} />
              <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block" />
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-sm font-black text-[#00796B] font-poppins tracking-tight">IDBI CreditSense</span>
                <span className="text-[9px] text-[#F26C21] font-bold tracking-wider uppercase font-inter">AI Powered MSME Credit Intelligence Platform</span>
              </div>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-500 font-poppins h-full">
            {[
              { path: '/', label: 'Home' },
              { path: '/assess', label: 'Assessment' },
              { path: '/batch', label: 'Batch Processing' },
              { path: '/analytics', label: 'Analytics' },
              { path: '/settings', label: 'Settings' }
            ].map((item) => (
              <NavLink 
                key={item.path}
                to={item.path} 
                className="relative h-full flex items-center text-slate-500 hover:text-[#00796B] transition-colors"
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? "text-[#00796B] font-bold" : ""}>{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="activeUnderline" 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00796B]" 
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-2 md:space-x-4">
            {renderNotifMenu()}
            {renderUserMenu()}
            <Link 
              to="/assess"
              className="hidden sm:inline-flex bg-[#00796B] hover:bg-[#00695C] text-white font-bold text-xs font-poppins tracking-wide uppercase px-4 py-2.5 rounded-lg transition-all hover:scale-[1.02] shadow-sm"
            >
              Start Assessment
            </Link>
          </div>
        </header>

        <div className="flex-1 flex flex-col">
          {children}
        </div>

        {/* Official IDBI Portal Footer */}
        <footer className="bg-white border-t border-slate-200/80 py-8 px-12 mt-auto">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-3">
                <IDBILogo size={32} />
              </div>
              <div className="text-center md:text-right space-y-1">
                <span className="text-[11px] font-bold text-slate-600 font-poppins block">© IDBI Bank Ltd. Powered by IDBI CreditSense</span>
                <span className="text-[9px] font-semibold text-slate-400 block tracking-wider uppercase">Secure • RBI Ready • Explainable AI</span>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-6 text-center text-[12px] text-slate-500 font-inter font-medium leading-relaxed">
              Demo Training Module • Developed for IDBI Innovate 2026 Hackathon • Not an official IDBI Bank production system.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F7FA] font-sans">
      {/* Mobile Sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Mobile Navigation Drawer Sidebar */}
      <aside 
        className={`lg:hidden fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200/80 flex flex-col z-50 shadow-2xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/80 bg-slate-50/30">
          <Link to="/" className="flex items-center space-x-2" onClick={() => setIsSidebarOpen(false)}>
            <IDBILogo size={30} />
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold font-poppins tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50/80 text-blue-700 border-l-4 border-blue-600 rounded-l-none'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Desktop Navigation Static Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 flex-col fixed h-screen z-30">
        <div className="h-20 flex items-center px-6 border-b border-slate-200/80 bg-slate-50/30">
          <Link to="/" className="flex items-center space-x-2">
            <IDBILogo size={30} />
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold font-poppins tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50/80 text-blue-700 border-l-4 border-blue-600 rounded-l-none'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/50 rounded-lg p-3 flex items-center space-x-2.5 shadow-premium">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-[10px] font-medium text-slate-500 leading-none">
              Models Sync: <b className="text-slate-700">Online</b>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 pl-0 lg:pl-64 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-xs font-inter text-slate-400">
              <span className="font-semibold hidden sm:inline">{breadcrumbs[0]}</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-slate-600 font-bold font-poppins">{breadcrumbs[1]}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 md:space-x-6 relative">
            {renderNotifMenu()}
            {renderUserMenu()}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1400px] w-full mx-auto flex flex-col justify-between min-w-0">
          <div className="flex-grow">
            {children}
          </div>
          <div className="border-t border-slate-200/60 mt-12 pt-6 text-center text-[12px] text-slate-500 font-inter font-medium leading-relaxed">
            Demo Training Module • Developed for IDBI Innovate 2026 Hackathon • Not an official IDBI Bank production system.
          </div>
        </main>
      </div>
    </div>
  );
}
