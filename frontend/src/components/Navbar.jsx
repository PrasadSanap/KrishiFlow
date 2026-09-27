import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, Sprout, X, Globe, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../utils/constants';
import notificationService from '../services/notificationService';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const { lang, changeLang, t } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    notificationService.getAll().then((res) => setUnread(res.unreadCount || 0)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => setUnread((u) => u + 1);
    socket.on('notificationCreated', handler);
    return () => socket.off('notificationCreated', handler);
  }, [socket]);

  const dashboardLink =
    user?.role === 'admin' ? '/admin' : user?.role === 'centre' ? '/centre' : '/dashboard';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? dashboardLink : '/'} className="flex items-center gap-2 font-bold text-lg text-primary-700">
            <Sprout className="text-primary-600" />
            KrishiFlow
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {user && (
              <>
                <Link to={dashboardLink} className="text-sm font-medium text-gray-600 hover:text-primary-700">
                  {t('nav_dashboard')}
                </Link>
                {user.role === 'farmer' && (
                  <>
                    <Link to="/book-slot" className="text-sm font-medium text-gray-600 hover:text-primary-700">
                      {t('nav_bookSlot')}
                    </Link>
                    <Link to="/bookings" className="text-sm font-medium text-gray-600 hover:text-primary-700">
                      Bookings
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setLangOpen((o) => !o)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-700 px-2 py-1.5 rounded-lg hover:bg-gray-50"
              >
                <Globe size={16} />
                {lang.toUpperCase()}
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-xl border border-gray-100 py-1">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        changeLang(l.code);
                        setLangOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-primary-50 ${
                        lang === l.code ? 'text-primary-700 font-semibold' : 'text-gray-600'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user && (
              <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-gray-50">
                <Bell size={20} className="text-gray-500" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/profile" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-700 px-2">
                  <User size={16} /> {user.fullName?.split(' ')[0]}
                </Link>
                <button onClick={handleLogout} className="btn-outline !px-3 !py-1.5 text-sm">
                  <LogOut size={16} /> {t('nav_logout')}
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-outline !px-3 !py-1.5 text-sm">
                  {t('nav_login')}
                </Link>
                <Link to="/register" className="btn-primary !px-3 !py-1.5 text-sm">
                  {t('nav_register')}
                </Link>
              </div>
            )}

            <button className="md:hidden p-2" onClick={() => setMenuOpen((o) => !o)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2">
            {user ? (
              <>
                <Link to={dashboardLink} onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium">
                  {t('nav_dashboard')}
                </Link>
                {user.role === 'farmer' && (
                  <>
                    <Link to="/book-slot" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium">
                      {t('nav_bookSlot')}
                    </Link>
                    <Link to="/bookings" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium">
                      Bookings
                    </Link>
                  </>
                )}
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium">
                  {t('nav_profile')}
                </Link>
                <button onClick={handleLogout} className="py-2 text-sm font-medium text-left text-red-600">
                  {t('nav_logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium">
                  {t('nav_login')}
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium">
                  {t('nav_register')}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
