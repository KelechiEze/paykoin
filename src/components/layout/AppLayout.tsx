import React, { useState, createContext, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Wallet, User, Settings, ChevronRight, Mail, ExternalLink, LogOut } from 'lucide-react';
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
    'Are you sure you want to logout?': 'Are you sure you want to logout?',
    'Logout': 'Logout',
    'Cancel': 'Cancel',
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
    'Are you sure you want to logout?': '¿Estás seguro de que quieres cerrar sesión?',
    'Logout': 'Cerrar Sesión',
    'Cancel': 'Cancelar',
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
    'Are you sure you want to logout?': 'Êtes-vous sûr de vouloir vous déconnecter?',
    'Logout': 'Déconnexion',
    'Cancel': 'Annuler',
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
    'Are you sure you want to logout?': 'Sind Sie sicher, dass Sie sich abmelden möchten?',
    'Logout': 'Abmelden',
    'Cancel': 'Abbrechen',
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
    'Are you sure you want to logout?': 'ログアウトしますか？',
    'Logout': 'ログアウト',
    'Cancel': 'キャンセル',
  },
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { darkMode, language } = useSettings();
  
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const toggle = () => setIsOpen(prev => !prev);
  const close = () => setIsOpen(false);

  const translate = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  const handleContactSupport = (useGmail: boolean) => {
    if (useGmail) {
      const subject = encodeURIComponent("Support Request");
      const body = encodeURIComponent("Hello PayCoin Support Team,\n\nI need assistance with:");
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=paycoincustomercare@gmail.com&su=${subject}&body=${body}`, '_blank');
    } else {
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
        
        {isContactModalOpen && (
          <ContactSupportModal 
            isOpen={isContactModalOpen}
            onClose={() => setContactModalOpen(false)}
            onConfirm={handleContactSupport}
            darkMode={darkMode}
            translate={translate}
          />
        )}

        {/* Only Tawk.to chat widget now */}
        <TawkToWidget />
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
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fade-in" 
          onClick={toggle}
        />
      )}
    
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
          <a 
            href="https://paycoin.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-full bg-crypto-blue text-white flex items-center justify-center">P</div>
            <span className="font-semibold text-xl">PayCoin</span>
          </a>
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
  const { darkMode, language } = useSettings();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  
  const translate = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <>
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

      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        darkMode={darkMode}
        translate={translate}
        onLogout={() => {
          localStorage.removeItem("authToken");
          navigate("/login");
        }}
      />
    </>
  );
};

const LogoutModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  translate: (key: string) => string;
  onLogout: () => void;
}> = ({ isOpen, onClose, darkMode, translate, onLogout }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300",
        isClosing ? "opacity-0" : "opacity-100"
      )}
      onClick={handleClose}
    >
      <div 
        className={cn(
          "relative w-full max-w-md rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300",
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900",
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-crypto-blue to-crypto-purple"></div>
        
        <div className="absolute -left-12 -top-12 w-24 h-24 rounded-full bg-crypto-blue/10 animate-pulse"></div>
        <div className="absolute -right-8 -bottom-8 w-16 h-16 rounded-full bg-crypto-purple/10 animate-pulse delay-300"></div>
        
        <div className="relative z-10 p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4 shadow-lg">
              <LogOut className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">
              {translate('Are you sure you want to logout?')}
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400">
              {translate('You will need to login again to access your account')}
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={onLogout}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {translate('Logout')}
            </button>
            <button
              onClick={handleClose}
              className={cn(
                "w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 border",
                darkMode 
                  ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600" 
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
              )}
            >
              {translate('Cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      onClick={onClose}
    >
      <div 
        className={cn(
          "p-6 rounded-lg shadow-lg w-full max-w-md",
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        )}
        onClick={(e) => e.stopPropagation()}
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

// Tawk.to Widget Component
const TawkToWidget: React.FC = () => {
  useEffect(() => {
    const s1 = document.createElement('script');
    const s0 = document.getElementsByTagName('script')[0];
    
    s1.async = true;
    s1.src = 'https://embed.tawk.to/68c7c85653558c1921183e23/1j566d6rh';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.head.appendChild(s1);
    }

    if (typeof window !== 'undefined') {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();
    }

    return () => {
      if (s1.parentNode) {
        s1.parentNode.removeChild(s1);
      }
    };
  }, []);

  return null;
};

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}