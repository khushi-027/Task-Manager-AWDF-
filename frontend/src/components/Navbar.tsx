import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, BarChart3, Shield, Mail, LogOut, Menu, X, User } from 'lucide-react';

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate }) => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Tasks', icon: CheckSquare },
    { id: 'projects', label: 'Projects', icon: BarChart3 },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E9D5EF] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo Zone */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7041A5] to-[#B34D91] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
                <CheckSquare className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-[#38234C]">
                  Task Manager
                </span>
                <span className="text-[10px] text-[#987BAA] font-medium leading-none">
                  MERN Workspace
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#F0E5F8] text-[#7041A5] shadow-xs'
                      : 'text-[#463353] hover:text-[#7041A5] hover:bg-[#FFF2F8]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#7041A5]' : 'text-[#987BAA]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action / User Zone */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2.5 pl-3 border-l border-[#E9D5EF]">
                <div className="w-8 h-8 rounded-full bg-[#FFF2F8] border border-[#E9D5EF] flex items-center justify-center text-[#7041A5]">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#38234C] truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-[#B34D91] font-semibold uppercase tracking-wider">
                    {user.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="ml-2 p-2 rounded-lg text-[#987BAA] hover:text-[#B34D91] hover:bg-[#FFF2F8] transition-colors focus:outline-hidden"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#463353] hover:bg-[#F0E5F8] focus:outline-hidden"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E9D5EF] bg-white px-4 pt-3 pb-4 space-y-1 shadow-lg">
          {user && (
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E9D5EF] px-2">
              <div>
                <p className="text-sm font-bold text-[#38234C]">{user.name}</p>
                <p className="text-xs text-[#987BAA]">{user.email}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FFF2F8] text-[#B34D91] border border-[#E9D5EF]">
                {user.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#F0E5F8] text-[#7041A5]'
                    : 'text-[#463353] hover:bg-[#FFF2F8]'
                }`}
              >
                <Icon className="w-4 h-4 text-[#7041A5]" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors mt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
