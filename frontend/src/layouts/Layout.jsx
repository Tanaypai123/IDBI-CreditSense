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
  LogOut
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

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
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 font-outfit text-[11px]">
            {user.name.charAt(0)}
          </div>
          <div className="hidden md:flex flex-col items-start text-left">
            <span className="text-xs font-bold text-slate-700 font-outfit leading-none">{user.name}</span>
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
            <h4 className="font-bold text-slate-800 font-outfit border-b border-slate-50 pb-2 flex justify-between items-center">
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
      <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
        {/* Horizontal Navigation: IDBI CreditSense styling, px-12 padding */}
        <header className="h-16 bg-white border-b border-slate-200/60 flex items-center justify-between px-12 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold font-outfit text-sm">
                IC
              </div>
              <span className="text-xs font-extrabold text-slate-800 tracking-tight font-outfit uppercase">
                IDBI CreditSense
              </span>
            </Link>
          </div>

          {/* Vercel active underline links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-500 font-outfit h-full">
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
                className="relative h-full flex items-center text-slate-500 hover:text-slate-800 transition-colors"
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="activeUnderline" 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" 
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {renderNotifMenu()}
            {renderUserMenu()}
            <Link 
              to="/assess"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs font-outfit tracking-wide uppercase px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Start Assessment
            </Link>
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-screen z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold font-outfit text-sm">
              IC
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-800 font-outfit leading-none">
                IDBI CreditSense
              </h2>
              <span className="text-[10px] text-slate-400 font-medium font-inter">
                Credit Console 2026
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold font-outfit tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50/70 text-blue-600 border-l-4 border-blue-600 rounded-l-none'
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

      <div className="flex-1 pl-64 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200/60 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-inter text-slate-400">
            <span className="font-semibold">{breadcrumbs[0]}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600 font-bold font-outfit">{breadcrumbs[1]}</span>
          </div>

          <div className="flex items-center space-x-6 relative">
            {renderNotifMenu()}
            {renderUserMenu()}
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
