import React from 'react';
import { Moon, Sun, Languages, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { useSettings, LanguageType, CurrencyType } from '@/contexts/SettingsContext';

// Translations for each language
const translations: Record<string, Record<string, string>> = {
  english: {
    'Dark Mode': 'Dark Mode',
    'Switch between light and dark theme': 'Switch between light and dark theme',
    'Language': 'Language',
    'Select your preferred language': 'Select your preferred language',
    'Currency': 'Currency',
    'Select your preferred display currency': 'Select your preferred display currency',
    'US Dollar (USD)': 'US Dollar (USD)',
    'Euro (EUR)': 'Euro (EUR)',
    'British Pound (GBP)': 'British Pound (GBP)',
    'Japanese Yen (JPY)': 'Japanese Yen (JPY)',
    'Dark Mode Enabled': 'Dark Mode Enabled',
    'Light Mode Enabled': 'Light Mode Enabled',
    'The application theme has been updated.': 'The application theme has been updated.',
    'Language Updated': 'Language Updated',
    'Your preferred language has been set to': 'Your preferred language has been set to',
    'Currency Updated': 'Currency Updated',
    'Your display currency has been updated.': 'Your display currency has been updated.',
  },
  spanish: {
    'Dark Mode': 'Modo Oscuro',
    'Switch between light and dark theme': 'Cambiar entre tema claro y oscuro',
    'Language': 'Idioma',
    'Select your preferred language': 'Selecciona tu idioma preferido',
    'Currency': 'Moneda',
    'Select your preferred display currency': 'Selecciona tu moneda de visualización preferida',
    'US Dollar (USD)': 'Dólar Estadounidense (USD)',
    'Euro (EUR)': 'Euro (EUR)',
    'British Pound (GBP)': 'Libra Esterlina (GBP)',
    'Japanese Yen (JPY)': 'Yen Japonés (JPY)',
    'Dark Mode Enabled': 'Modo Oscuro Activado',
    'Light Mode Enabled': 'Modo Claro Activado',
    'The application theme has been updated.': 'El tema de la aplicación ha sido actualizado.',
    'Language Updated': 'Idioma Actualizado',
    'Your preferred language has been set to': 'Tu idioma preferido ha sido establecido a',
    'Currency Updated': 'Moneda Actualizada',
    'Your display currency has been updated.': 'Tu moneda de visualización ha sido actualizada.',
  },
  french: {
    'Dark Mode': 'Mode Sombre',
    'Switch between light and dark theme': 'Basculer entre les thèmes clair et sombre',
    'Language': 'Langue',
    'Select your preferred language': 'Sélectionnez votre langue préférée',
    'Currency': 'Devise',
    'Select your preferred display currency': 'Sélectionnez votre devise d\'affichage préférée',
    'US Dollar (USD)': 'Dollar Américain (USD)',
    'Euro (EUR)': 'Euro (EUR)',
    'British Pound (GBP)': 'Livre Sterling (GBP)',
    'Japanese Yen (JPY)': 'Yen Japonais (JPY)',
    'Dark Mode Enabled': 'Mode Sombre Activé',
    'Light Mode Enabled': 'Mode Clair Activé',
    'The application theme has been updated.': 'Le thème de l\'application a été mis à jour.',
    'Language Updated': 'Langue Mise à Jour',
    'Your preferred language has been set to': 'Votre langue préférée a été définie sur',
    'Currency Updated': 'Devise Mise à Jour',
    'Your display currency has been updated.': 'Votre devise d\'affichage a été mise à jour.',
  },
  german: {
    'Dark Mode': 'Dunkelmodus',
    'Switch between light and dark theme': 'Zwischen hellem und dunklem Design wechseln',
    'Language': 'Sprache',
    'Select your preferred language': 'Wählen Sie Ihre bevorzugte Sprache',
    'Currency': 'Währung',
    'Select your preferred display currency': 'Wählen Sie Ihre bevorzugte Anzeigewährung',
    'US Dollar (USD)': 'US-Dollar (USD)',
    'Euro (EUR)': 'Euro (EUR)',
    'British Pound (GBP)': 'Britisches Pfund (GBP)',
    'Japanese Yen (JPY)': 'Japanischer Yen (JPY)',
    'Dark Mode Enabled': 'Dunkelmodus Aktiviert',
    'Light Mode Enabled': 'Hellmodus Aktiviert',
    'The application theme has been updated.': 'Das Anwendungsdesign wurde aktualisiert.',
    'Language Updated': 'Sprache Aktualisiert',
    'Your preferred language has been set to': 'Ihre bevorzugte Sprache wurde auf gesetzt',
    'Currency Updated': 'Währung Aktualisiert',
    'Your display currency has been updated.': 'Ihre Anzeigewährung wurde aktualisiert.',
  },
  japanese: {
    'Dark Mode': 'ダークモード',
    'Switch between light and dark theme': '明暗テーマを切り替える',
    'Language': '言語',
    'Select your preferred language': '希望の言語を選択してください',
    'Currency': '通貨',
    'Select your preferred display currency': '表示する通貨を選択してください',
    'US Dollar (USD)': '米ドル (USD)',
    'Euro (EUR)': 'ユーロ (EUR)',
    'British Pound (GBP)': '英ポンド (GBP)',
    'Japanese Yen (JPY)': '日本円 (JPY)',
    'Dark Mode Enabled': 'ダークモードが有効になりました',
    'Light Mode Enabled': 'ライトモードが有効になりました',
    'The application theme has been updated.': 'アプリのテーマが更新されました。',
    'Language Updated': '言語が更新されました',
    'Your preferred language has been set to': '希望の言語が次のように設定されました：',
    'Currency Updated': '通貨が更新されました',
    'Your display currency has been updated.': '表示通貨が更新されました。',
  },
};

// Language display names in their native language
const languageNames: Record<string, string> = {
  english: 'English',
  spanish: 'Español',
  french: 'Français',
  german: 'Deutsch',
  japanese: '日本語',
};

// Currency information
const currencies = [
  { id: 'usd', name: 'US Dollar (USD)', symbol: '$' },
  { id: 'eur', name: 'Euro (EUR)', symbol: '€' },
  { id: 'gbp', name: 'British Pound (GBP)', symbol: '£' },
  { id: 'jpy', name: 'Japanese Yen (JPY)', symbol: '¥' }
];

export const PreferencesSettings: React.FC = () => {
  const { toast } = useToast();
  const { darkMode, language, currency, setDarkMode, setLanguage, setCurrency } = useSettings();

  // Helper function to translate text based on selected language
  const translate = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    toast({
      title: translate(newMode ? 'Dark Mode Enabled' : 'Light Mode Enabled'),
      description: translate('The application theme has been updated.'),
    });
  };

  const handleLanguageChange = (lang: LanguageType) => {
    setLanguage(lang);
    
    // We use the English translation for the toast since the language just changed
    toast({
      title: translations[lang]['Language Updated'] || 'Language Updated',
      description: `${translations[lang]['Your preferred language has been set to'] || 'Your preferred language has been set to'} ${languageNames[lang]}.`,
    });
  };

  const handleCurrencyChange = (curr: CurrencyType) => {
    setCurrency(curr);
    
    toast({
      title: translate('Currency Updated'),
      description: translate('Your display currency has been updated.'),
    });
  };
  
  return (
    <div className="space-y-6">
      <div className={cn(
        "p-4 rounded-xl border",
        darkMode ? "border-gray-700" : "border-gray-100"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={cn(
              "p-2 rounded-full mr-3",
              darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
            )}>
              {darkMode ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <div>
              <h3 className="font-medium">{translate('Dark Mode')}</h3>
              <p className={cn(
                "text-sm",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>{translate('Switch between light and dark theme')}</p>
            </div>
          </div>
          
          <Switch 
            checked={darkMode}
            onCheckedChange={handleDarkModeToggle}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              darkMode ? "bg-crypto-blue" : "bg-gray-200"
            )}
          />
        </div>
      </div>
      
      <div className={cn(
        "p-4 rounded-xl border",
        darkMode ? "border-gray-700" : "border-gray-100"
      )}>
        <div className="flex items-center mb-4">
          <div className={cn(
            "p-2 rounded-full mr-3",
            darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
          )}>
            <Languages size={18} />
          </div>
          <div>
            <h3 className="font-medium">{translate('Language')}</h3>
            <p className={cn(
              "text-sm",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>{translate('Select your preferred language')}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {Object.keys(languageNames).map((lang) => (
            <button 
              key={lang}
              onClick={() => handleLanguageChange(lang as LanguageType)}
              className={cn(
                "w-full py-2 px-3 rounded-lg text-left transition-colors",
                language === lang 
                  ? darkMode 
                    ? "bg-crypto-blue/20 text-crypto-blue" 
                    : "bg-crypto-blue/10 text-crypto-blue"
                  : darkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-50"
              )}
            >
              {languageNames[lang]}
              {language === lang && (
                <span className="ml-auto float-right">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className={cn(
        "p-4 rounded-xl border",
        darkMode ? "border-gray-700" : "border-gray-100"
      )}>
        <div className="flex items-center mb-4">
          <div className={cn(
            "p-2 rounded-full mr-3",
            darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
          )}>
            <DollarSign size={18} />
          </div>
          <div>
            <h3 className="font-medium">{translate('Currency')}</h3>
            <p className={cn(
              "text-sm",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>{translate('Select your preferred display currency')}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {currencies.map((curr) => (
            <button 
              key={curr.id}
              onClick={() => handleCurrencyChange(curr.id as CurrencyType)}
              className={cn(
                "w-full py-2 px-3 rounded-lg text-left transition-colors",
                currency === curr.id 
                  ? darkMode 
                    ? "bg-crypto-blue/20 text-crypto-blue" 
                    : "bg-crypto-blue/10 text-crypto-blue"
                  : darkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-50"
              )}
            >
              {translate(curr.name)}
              {currency === curr.id && (
                <span className="ml-auto float-right">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
