
import React, { useState } from 'react';

interface NavbarProps {
  userName: string;
  userRole?: string;
  onLogout: () => void;
  activeTab: 'inventory' | 'reports' | 'users';
  setActiveTab: (tab: 'inventory' | 'reports' | 'users') => void;
}

const Navbar: React.FC<NavbarProps> = ({ userName, userRole, onLogout, activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white mr-3">
                <i className="fas fa-boxes-stacked"></i>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:block">
                OmniStock
              </span>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition ${
                  activeTab === 'inventory' 
                  ? 'border-indigo-500 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                Inventory
              </button>
              {(userRole === 'admin' || userRole === 'manager') && (
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition ${
                    activeTab === 'reports' 
                    ? 'border-indigo-500 text-slate-900' 
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  Reports
                </button>
              )}
              {(userRole === 'admin' || userRole === 'manager') && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition ${
                    activeTab === 'users' 
                    ? 'border-indigo-500 text-slate-900' 
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  Users
                </button>
              )}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 mr-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live Sync</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 leading-tight">{userName}</span>
                {userRole && (
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider leading-tight">
                    {userRole}
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="p-2 text-slate-400 hover:text-indigo-600 transition"
              title="Refresh Application"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition"
              title="Logout"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 outline-none"
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-slate-100">
          <div className="pt-2 pb-3 space-y-1">
            <button
              onClick={() => { setActiveTab('inventory'); setIsMenuOpen(false); }}
              className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                activeTab === 'inventory' 
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              Inventory
            </button>
            {(userRole === 'admin' || userRole === 'manager') && (
              <button
                onClick={() => { setActiveTab('reports'); setIsMenuOpen(false); }}
                className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  activeTab === 'reports' 
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                Reports
              </button>
            )}
            {(userRole === 'admin' || userRole === 'manager') && (
              <button
                onClick={() => { setActiveTab('users'); setIsMenuOpen(false); }}
                className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  activeTab === 'users' 
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                Users
              </button>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-100">
            <div className="flex items-center px-4 justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-slate-800">{userName}</div>
                  {userRole && (
                    <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                      {userRole}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider">Live</span>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Refresh App
              </button>
              <button
                onClick={onLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
