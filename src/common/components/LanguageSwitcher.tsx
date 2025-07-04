import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

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
          code: 'VI',
          name: 'Tiếng Việt',
          flag: '🇻🇳'
        };
      case 'ja':
        return {
          code: 'JA',
          name: '日本語',
          flag: '🇯🇵'
        };
      default:
        return {
          code: 'VI',
          name: 'Tiếng Việt',
          flag: '🇻🇳'
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
        background: 'transparent'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '12px'
      }}>
        <GlobalOutlined />
        <span>{currentLang.code}</span>
        <span>{currentLang.flag}</span>
      </div>
    </Button>
  );
};

export default LanguageSwitcher;