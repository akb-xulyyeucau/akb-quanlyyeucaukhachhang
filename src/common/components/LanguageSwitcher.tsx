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
  console.log('i18n ------', i18n.language);
  
  const buttonText = i18n.language === 'vi' ? 'VI - JA' : 'JA - VI';
  return (
    <div>
      <Button
        icon={<GlobalOutlined />}
        onClick={changeLanguage}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default LanguageSwitcher;