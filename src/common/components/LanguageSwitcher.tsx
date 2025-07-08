import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'ja' : 'vi';
    i18n.changeLanguage(newLang);
  };

  const getCurrentLanguage = () => {
    switch (i18n.language) {
      case 'vi':
        return {
          code: 'Tiếng Việt',
          flag: './public/vn.png'
        };
      case 'ja':
        return {
          code: '日本語',
          flag: './public/jp.jpg'
        };
      default:
        return {
          code: 'Tiếng Việt',
          flag: './public/vn.png'
        };
    }
  };

  const currentLang = getCurrentLanguage();

  return (
    <Button
      type="text"
      onClick={changeLanguage}
      style={{
        width: '100%',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 24px',
        border: 'none',
        boxShadow: 'none',
        background: 'transparent',
        fontSize: 16
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <img
          src={currentLang.flag}
          alt="flag"
          style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }}
        />
        <span>{currentLang.code}</span>
      </div>
    </Button>
  );
};

export default LanguageSwitcher;
