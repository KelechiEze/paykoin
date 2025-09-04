import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Wallet, User, Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/contexts/SettingsContext';

type SidebarContextType = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

type NavItem = {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
};

const navItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Wallet, label: 'Wallets', path: '/wallets' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

// Translation maps for different languages
const translations: Record<string, Record<string, string>> = {
  english: {
    Dashboard: 'Dashboard',
    Wallets: 'Wallets',
    Profile: 'Profile',
    Settings: 'Settings',
    'Need help?': 'Need help?',
    'Contact Support': 'Contact Support',
  },
  spanish: {
    Dashboard: 'Panel de Control',
    Wallets: 'Carteras',
    Profile: 'Perfil',
    Settings: 'Configuración',
    'Need help?': '¿Necesitas ayuda?',
    'Contact Support': 'Contactar Soporte',
  },
  french: {
    Dashboard: 'Tableau de Bord',
    Wallets: 'Portefeuilles',
    Profile: 'Profil',
    Settings: 'Paramètres',
    'Need help?': 'Besoin d\'aide?',
    'Contact Support': 'Contacter le Support',
  },
  german: {
    Dashboard: 'Übersicht',
    Wallets: 'Brieftaschen',
    Profile: 'Profil',
    Settings: 'Einstellungen',
    'Need help?': 'Brauchst du Hilfe?',
    'Contact Support': 'Support kontaktieren',
  },
  japanese: {
    Dashboard: 'ダッシュボード',
    Wallets: 'ウォレット',
    Profile: 'プロフィール',
    Settings: '設定',
    'Need help?': 'お手伝いが必要ですか？',
    'Contact Support': 'サポートに連絡する',
  },
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { darkMode, language } = useSettings();
  
  // Close sidebar on route change in mobile view
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  // Default to open on desktop, closed on mobile
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const toggle = () => setIsOpen(prev => !prev);
  const close = () => setIsOpen(false);

  // Get the translation function
  const translate = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      <div className={cn(
        "flex min-h-screen transition-colors duration-200",
        darkMode ? "bg-gray-900 text-white" : "bg-crypto-light"
      )}>
        <Sidebar isOpen={isOpen} translate={translate} />
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out overflow-x-hidden",
          isOpen && !isMobile ? "ml-64" : "ml-0",
        )}>
          <TopNav />
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
};

const Sidebar: React.FC<{ isOpen: boolean, translate: (key: string) => string }> = ({ isOpen, translate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toggle } = useSidebar();
  const { darkMode } = useSettings();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) toggle();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fade-in" 
          onClick={toggle}
        />
      )}
    
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full z-50 w-64 shadow-lg transition-transform duration-300 ease-in-out transform",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "flex flex-col",
        darkMode ? "bg-gray-800 text-white" : "bg-white"
      )}>
        <div className={cn(
          "flex items-center justify-between p-4",
          darkMode ? "border-gray-700" : "border-b"
        )}>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-crypto-blue text-white flex items-center justify-center">P</div>
            <span className="font-semibold text-xl">PayCoin</span>
          </div>
          {isMobile && (
            <button onClick={toggle} className={cn(
              "p-2 rounded-full transition-colors",
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            )}>
              <X size={20} />
            </button>
          )}
        </div>
        
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
                    location.pathname === item.path 
                      ? darkMode 
                        ? "bg-crypto-blue/20 text-crypto-blue" 
                        : "bg-crypto-blue/10 text-crypto-blue" 
                      : darkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5",
                    location.pathname === item.path ? "text-crypto-blue" : darkMode ? "text-gray-400" : "text-gray-500"
                  )} />
                  <span>{translate(item.label)}</span>
                  {location.pathname === item.path && (
                    <ChevronRight className="w-4 h-4 ml-auto text-crypto-blue" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className={cn(
          "p-4",
          darkMode ? "border-t border-gray-700" : "border-t"
        )}>
          <div className={cn(
            "p-4 rounded-xl",
            darkMode ? "bg-gray-700" : "bg-gray-50"
          )}>
            <p className={cn(
              "text-sm",
              darkMode ? "text-gray-300" : "text-gray-600"
            )}>{translate('Need help?')}</p>
            <button className="mt-2 text-sm font-medium text-crypto-blue hover:underline">
              {translate('Contact Support')}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const TopNav: React.FC = () => {
  const { toggle, isOpen } = useSidebar();
  const isMobile = useIsMobile();
  const { darkMode } = useSettings();
  const navigate = useNavigate();

  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

  return (
    <>
      {/* Top Navbar */}
      <header className={cn(
        "h-16 flex items-center px-4 sticky top-0 z-30",
        darkMode ? "bg-gray-800 border-b border-gray-700" : "bg-white border-b"
      )}>
        {!isOpen && (
          <button onClick={toggle} className={cn(
            "p-2 rounded-full transition-colors",
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
          )}>
            <Menu size={20} />
          </button>
        )}

        {/* Notification and Message Icons - COMMENTED OUT */}
        {/* <div className="ml-auto flex items-center space-x-4">
          {/* Notification Icon - COMMENTED OUT * /}
          {/* <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowMessages(false);
              }}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors relative",
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              )}
            >
              <Bell size={20} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown - COMMENTED OUT * /}
            {showNotifications && (
              <div className={cn(
                "absolute right-0 mt-2 w-80 rounded-md shadow-lg z-50",
                darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
              )}>
                <div className={cn(
                  "p-3 border-b",
                  darkMode ? "border-gray-700" : "border-gray-200"
                )}>
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-3 text-center text-gray-500">No notifications</p>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 border-b cursor-pointer transition-colors",
                          darkMode 
                            ? "border-gray-700 hover:bg-gray-700" 
                            : "border-gray-200 hover:bg-gray-50",
                          !notification.read && "bg-blue-50"
                        )}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <p className={cn(!notification.read && "font-medium")}>
                          {notification.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div> */}

          {/* Message Icon - COMMENTED OUT * /}
          {/* <div className="relative">
            <button 
              onClick={() => {
                setShowMessages(!showMessages);
                setShowNotifications(false);
              }}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors relative",
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              )}
            >
              <MessageSquare size={20} />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Messages Dropdown - COMMENTED OUT * /}
            {showMessages && (
              <div className={cn(
                "absolute right-0 mt-2 w-80 rounded-md shadow-lg z-50",
                darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
              )}>
                <div className={cn(
                  "p-3 border-b flex items-center",
                  darkMode ? "border-gray-700" : "border-gray-200"
                )}>
                  <h3 className="font-semibold flex-grow">Messages</h3>
                  <button className="p-1 rounded hover:bg-gray-200">
                    <Search size={16} />
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <p className="p-3 text-center text-gray-500">No messages</p>
                  ) : (
                    conversations.map(conversation => (
                      <div
                        key={conversation.id}
                        className={cn(
                          "p-3 border-b cursor-pointer transition-colors",
                          darkMode 
                            ? "border-gray-700 hover:bg-gray-700" 
                            : "border-gray-200 hover:bg-gray-50",
                          conversation.unread && "bg-blue-50"
                        )}
                        onClick={() => handleConversationSelect(conversation)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-crypto-blue flex items-center justify-center text-white mr-3">
                            {conversation.participant.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <p className={cn("font-semibold truncate", conversation.unread && "text-blue-600")}>
                                {conversation.participant}
                              </p>
                              <span className="text-xs text-gray-500">
                                {conversation.messages[conversation.messages.length - 1].timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className={cn("truncate text-sm", conversation.unread ? "font-medium" : "text-gray-500")}>
                              {conversation.messages[conversation.messages.length - 1].text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className={cn(
                  "p-3 border-t",
                  darkMode ? "border-gray-700" : "border-gray-200"
                )}>
                  <button 
                    className="text-crypto-blue hover:underline"
                    onClick={() => navigate('/messages')}
                  >
                    View all messages
                  </button>
                </div>
              </div>
            )}
          </div> */}

        {/* User Profile Icon */}
        <div className="ml-auto">
          <button 
            onClick={() => setLogoutModalOpen(true)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-500 hover:bg-gray-300"
            )}
          >
            <User size={20} />
          </button>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={cn(
            "p-6 rounded-lg shadow-lg w-96 text-center",
            darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
          )}>
            <h2 className="text-xl font-semibold">Are you sure you want to logout?</h2>
            <div className="mt-4 flex justify-center space-x-4">
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={() => {
                  localStorage.removeItem("authToken"); // Simulating logout
                  setLogoutModalOpen(false);
                  navigate("/login");
                }}
              >
                Logout
              </button>
              <button 
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                onClick={() => setLogoutModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};