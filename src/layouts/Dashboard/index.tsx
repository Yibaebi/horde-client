import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bell, LogOut, Menu, X, Wallet, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { useNotifications } from '@/hooks/useNotifications';

export const DashboardLayout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [scrollPosition, setScrollPosition] = useState(0);

  // Track scroll position for parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Budgets', href: '/dashboard/budgets', icon: Wallet },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 w-full">
      {/* Navbar */}
      <nav className="bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] sticky top-0 z-40 border-b border-slate-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="mr-4 p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="flex items-center">
                <span className="text-xl font-bold text-primary">HORDE</span>
                <span className="w-2 h-2 ml-2 rounded-full bg-primary" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationsDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                isLoading={isLoading}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
              />

              <button
                onClick={logout}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex relative">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-white to-gray-50 shadow-lg transform transition-transform duration-300 ease-in-out pt-16 border-r border-r-gray-200/50`}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Decorative top design */}
            <div
              className="absolute -top-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-70"
              style={{ transform: `translateY(${scrollPosition * 0.02}px)` }}
            />
            <div
              className="absolute top-40 -right-20 w-40 h-40 bg-blue-400/5 rounded-full blur-3xl opacity-70"
              style={{ transform: `translateY(${scrollPosition * -0.01}px)` }}
            />

            {/* Subtle gradient line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-blue-400/30 to-primary/5" />
          </div>

          <div className="h-full pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent relative z-10">
            {/* Profile area */}
            <div className="px-6 py-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/90 to-blue-400/90 flex items-center justify-center text-white font-medium shadow-sm">
                  {useAuth().user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {useAuth().user?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {useAuth().user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-3 mb-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                Menu
              </h3>
            </div>

            <nav className="px-2 space-y-1">
              {navigation.map(item => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary hover:shadow-sm'
                    } group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 relative overflow-hidden bg-transparent hover:bg-opacity-100`}
                  >
                    {/* Hover effect */}
                    <span
                      className={`${isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-10'} absolute inset-0 bg-primary transition-opacity duration-300 ease-in-out`}
                    ></span>

                    {/* Icon wrapper with subtle animation */}
                    <div
                      className={`${
                        isActive ? 'bg-white/20' : 'bg-primary/5 group-hover:bg-primary/10'
                      } mr-3 p-1.5 rounded-md transition-all duration-300 group-hover:scale-105`}
                    >
                      <Icon
                        className={`${
                          isActive ? 'text-white' : 'text-primary/80 group-hover:text-primary'
                        } h-4 w-4 transition-all duration-300`}
                      />
                    </div>
                    {item.name}
                    {item.name === 'Notifications' && unreadCount > 0 && (
                      <span className="ml-auto bg-white text-primary text-xs font-medium px-2 py-0.5 rounded-full shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom area */}
            <div className="mt-auto pt-4 px-3 absolute bottom-4 left-0 right-0">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 mx-2 shadow-sm border border-blue-100/50">
                <p className="text-xs text-gray-600 mb-2 font-medium">Have feedback?</p>
                <p className="text-xs text-gray-500">Help us improve Horde with your suggestions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main
          className={`${isSidebarOpen ? 'ml-64' : 'ml-0'} h-[calc(100vh - 4rem)] main-container-background bg-gradient-to-b from-gray-50 to-white flex-1 transition-all duration-300 ease-in-out overflow-y-auto`}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-purple-200/20 to-indigo-300/20 blur-3xl" />
            <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-gradient-to-tr from-blue-200/20 to-teal-300/20 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-gradient-to-tl from-amber-200/20 to-rose-300/20 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>

          {/* Top Right - Kodama forest spirits */}
          <div className="absolute bottom-10 right-10 w-64 h-64 overflow-hidden opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <g>
                {/* First Kodama */}
                <path
                  d="M50,150 C50,175 75,190 100,190 C125,190 150,175 150,150 C150,125 125,110 100,110 C75,110 50,125 50,150 Z"
                  fill="white"
                  opacity="0.8"
                />
                <path
                  d="M80,140 C80,140 85,150 100,150 C115,150 120,140 120,140"
                  stroke="black"
                  strokeWidth="2"
                  fill="none"
                />
                <circle cx="85" cy="130" r="5" fill="black" />
                <circle cx="115" cy="130" r="5" fill="black" />
                <path
                  d="M85,110 L85,80 L95,90 L100,75 L105,90 L115,80 L115,110"
                  fill="white"
                  stroke="black"
                  strokeWidth="2"
                />

                {/* Second Kodama */}
                <path
                  d="M140,80 C140,95 155,105 170,105 C185,105 200,95 200,80 C200,65 185,55 170,55 C155,55 140,65 140,80 Z"
                  fill="white"
                  opacity="0.8"
                />
                <path
                  d="M155,75 C155,75 160,85 170,85 C180,85 185,75 185,75"
                  stroke="black"
                  strokeWidth="2"
                  fill="none"
                />
                <circle cx="160" cy="70" r="3" fill="black" />
                <circle cx="180" cy="70" r="3" fill="black" />
                <path
                  d="M160,55 L160,35 L165,42 L170,30 L175,42 L180,35 L180,55"
                  fill="white"
                  stroke="black"
                  strokeWidth="2"
                />

                {/* Third Kodama */}
                <path
                  d="M10,80 C10,95 25,105 40,105 C55,105 70,95 70,80 C70,65 55,55 40,55 C25,55 10,65 10,80 Z"
                  fill="white"
                  opacity="0.8"
                />
                <path
                  d="M25,75 C25,75 30,85 40,85 C50,85 55,75 55,75"
                  stroke="black"
                  strokeWidth="2"
                  fill="none"
                />
                <circle cx="30" cy="70" r="3" fill="black" />
                <circle cx="50" cy="70" r="3" fill="black" />
                <path
                  d="M30,55 L30,35 L35,42 L40,30 L45,42 L50,35 L50,55"
                  fill="white"
                  stroke="black"
                  strokeWidth="2"
                />
              </g>
            </svg>
          </div>

          {/* Center - Howl's Castle inspired floating elements */}
          <div className="absolute bottom-0 left-0 transform overflow-hidden opacity-8 pointer-events-none">
            <svg
              viewBox="0 0 200 200"
              className="w-96 h-96"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="castleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F6AD55" />
                  <stop offset="100%" stopColor="#ED8936" />
                </linearGradient>
                <linearGradient id="steamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#CBD5E0" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <g>
                {/* Castle base */}
                <path d="M60,150 L80,100 L120,100 L140,150 Z" fill="url(#castleGradient)" />
                {/* Castle towers */}
                <path d="M70,100 L75,70 L85,70 L90,100 Z" fill="#718096" />
                <path d="M110,100 L115,70 L125,70 L130,100 Z" fill="#718096" />
                <path d="M90,100 L95,80 L105,80 L110,100 Z" fill="#718096" />
                {/* Castle windows */}
                <circle cx="80" cy="120" r="5" fill="#FEEBC8" />
                <circle cx="100" cy="115" r="5" fill="#FEEBC8" />
                <circle cx="120" cy="120" r="5" fill="#FEEBC8" />
                {/* Floating elements */}
                <path
                  d="M30,60 C40,40 60,50 50,70 C65,60 75,75 60,85 C50,95 30,80 30,60 Z"
                  fill="#68D391"
                />
                <path
                  d="M140,40 C150,20 170,30 160,50 C175,40 185,55 170,65 C160,75 140,60 140,40 Z"
                  fill="#4299E1"
                />
                <path
                  d="M90,30 C100,10 120,20 110,40 C125,30 135,45 120,55 C110,65 90,50 90,30 Z"
                  fill="#F687B3"
                />
                {/* Steam/Clouds */}
                <path
                  d="M50,150 C60,140 80,145 70,160 C85,150 95,165 80,175 C70,185 40,170 50,150 Z"
                  fill="url(#steamGradient)"
                />
                <path
                  d="M110,150 C120,140 140,145 130,160 C145,150 155,165 140,175 C130,185 100,170 110,150 Z"
                  fill="url(#steamGradient)"
                />
              </g>
            </svg>
          </div>

          <div className="h-full p-6 bg-transparent relative z-10">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
