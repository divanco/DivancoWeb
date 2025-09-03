import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const LanguageSwitcher = ({ className = '' }) => {
  const { currentLanguage, changeLanguage } = useTranslation();

  const languages = [
    { code: 'es', name: 'ES', flag: '🇪🇸' },
    { code: 'en', name: 'EN', flag: '🇺🇸' }
  ];

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`
            flex items-center space-x-1 px-2 py-1 rounded text-sm transition-all duration-200
            ${currentLanguage === lang.code 
              ? 'bg-naranjaDivanco text-white' 
              : 'text-white/80 hover:text-naranjaDivanco hover:bg-white/10'
            }
          `}
        >
          <span>{lang.flag}</span>
          <span className="font-medium">{lang.name}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
