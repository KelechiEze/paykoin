import React, { useState, createContext, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Wallet, User, Settings, ChevronRight, Mail, ExternalLink } from 'lucide-react';
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
    'Contact Support Title': 'Contact Customer Care',
    'Contact Support Message': 'Do you wish to contact our customer care support team?',
    'Yes': 'Yes',
    'No': 'No',
    'Open in Gmail': 'Open in Gmail',
    'Open in Email Client': 'Open in Email Client',
    'Choose an option': 'Choose an option',
  },
  spanish: {
    Dashboard: 'Panel de Control',
    Wallets: 'Carteras',
    Profile: 'Perfil',
    Settings: 'Configuración',
    'Need help?': '¿Necesitas ayuda?',
    'Contact Support': 'Contactar Soporte',
    'Contact Support Title': 'Contactar Atención al Cliente',
    'Contact Support Message': '¿Deseas contactar a nuestro equipo de soporte de atención al cliente?',
    'Yes': 'Sí',
    'No': 'No',
    'Open in Gmail': 'Abrir en Gmail',
    'Open in Email Client': 'Abrir en cliente de correo',
    'Choose an option': 'Elige una opción',
  },
  french: {
    Dashboard: 'Tableau de Bord',
    Wallets: 'Portefeuilles',
    Profile: 'Profil',
    Settings: 'Paramètres',
    'Need help?': 'Besoin d\'aide?',
    'Contact Support': 'Contacter le Support',
    'Contact Support Title': 'Contacter le Service Client',
    'Contact Support Message': 'Souhaitez-vous contacter notre équipe de support client?',
    'Yes': 'Oui',
    'No': 'Non',
    'Open in Gmail': 'Ouvrir dans Gmail',
    'Open in Email Client': 'Ouvrir dans le client de messagerie',
    'Choose an option': 'Choisissez une option',
  },
  german: {
    Dashboard: 'Übersicht',
    Wallets: 'Brieftaschen',
    Profile: 'Profil',
    Settings: 'Einstellungen',
    'Need help?': 'Brauchst du Hilfe?',
    'Contact Support': 'Support kontaktieren',
    'Contact Support Title': 'Kundendienst kontaktieren',
    'Contact Support Message': 'Möchten Sie unser Kundensupport-Team kontaktieren?',
    'Yes': 'Ja',
    'No': 'Nein',
    'Open in Gmail': 'In Gmail öffnen',
    'Open in Email Client': 'Im E-Mail-Client öffnen',
    'Choose an option': 'Wählen Sie eine Option',
  },
  japanese: {
    Dashboard: 'ダッシュボード',
    Wallets: 'ウォレット',
    Profile: 'プロフィール',
    Settings: '設定',
    'Need help?': 'お手伝いが必要ですか？',
    'Contact Support': 'サポートに連絡する',
    'Contact Support Title': 'カスタマーケアにお問い合わせ',
    'Contact Support Message': 'カスタマーケアサポートチームに連絡しますか？',
    'Yes': 'はい',
    'No': 'いいえ',
    'Open in Gmail': 'Gmailで開く',
    'Open in Email Client': 'メールクライアントで開く',
    'Choose an option': 'オプションを選択',
  },
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);
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

  const handleContactSupport = (useGmail: boolean) => {
    if (useGmail) {
      // Open Gmail in a new tab with pre-filled email
      const subject = encodeURIComponent("Support Request");
      const body = encodeURIComponent("Hello PayCoin Support Team,\n\nI need assistance with:");
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=paycoincustomercare@gmail.com&su=${subject}&body=${body}`, '_blank');
    } else {
      // Use standard mailto link
      window.location.href = 'mailto:paycoincustomercare@gmail.com';
    }
    setContactModalOpen(false);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      <div className={cn(
        "flex min-h-screen transition-colors duration-200",
        darkMode ? "bg-gray-900 text-white" : "bg-crypto-light"
      )}>
        <Sidebar 
          isOpen={isOpen} 
          translate={translate} 
          onContactSupport={() => setContactModalOpen(true)} 
        />
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out overflow-x-hidden",
          isOpen && !isMobile ? "ml-64" : "ml-0",
        )}>
          <TopNav />
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
        
        {/* Contact Support Modal */}
        {isContactModalOpen && (
          <ContactSupportModal 
            isOpen={isContactModalOpen}
            onClose={() => setContactModalOpen(false)}
            onConfirm={handleContactSupport}
            darkMode={darkMode}
            translate={translate}
          />
        )}
      </div>
    </SidebarContext.Provider>
  );
};

const Sidebar: React.FC<{ 
  isOpen: boolean, 
  translate: (key: string) => string,
  onContactSupport: () => void
}> = ({ isOpen, translate, onContactSupport }) => {
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
            <button 
              onClick={onContactSupport}
              className="mt-2 text-sm font-medium text-crypto-blue hover:underline flex items-center"
            >
              <Mail size={16} className="mr-1" />
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
        "h-16 flex items-center px-4",
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-b"
      )}>
        {!isOpen && (
          <button onClick={toggle} className={cn(
            "p-2 rounded-full transition-colors",
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
          )}>
            <Menu size={20} />
          </button>
        )}

        {/* User Profile Icon */}
        <div className="ml-auto flex items-center space-x-4">
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
            "p-6 rounded-lg shadow-lg w-96 max-w-[90vw] text-center",
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

// Contact Support Modal Component
const ContactSupportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (useGmail: boolean) => void;
  darkMode: boolean;
  translate: (key: string) => string;
}> = ({ isOpen, onClose, onConfirm, darkMode, translate }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose} // clicking backdrop closes
    >
      <div 
        className={cn(
          "p-6 rounded-lg shadow-lg w-full max-w-md",
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        )}
        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside modal
      >
        <div className="flex flex-col items-center mb-4">
          <Mail size={48} className="text-crypto-blue mb-3" />
          <h2 className="text-xl font-semibold text-center">
            {translate('Contact Support Title')}
          </h2>
        </div>
        
        <p className="text-center mb-6">
          {translate('Contact Support Message')}
        </p>
        
        <p className="text-center mb-4 font-medium">
          {translate('Choose an option')}
        </p>
        
        <div className="flex flex-col gap-3 mb-4">
          <button
            onClick={() => onConfirm(true)}
            className="flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink size={18} className="mr-2" />
            {translate('Open in Gmail')}
          </button>
          <button
            onClick={() => onConfirm(false)}
            className="px-5 py-3 bg-crypto-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {translate('Open in Email Client')}
          </button>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {translate('No')}
          </button>
        </div>
      </div>
    </div>
  );
};