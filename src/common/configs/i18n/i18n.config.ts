import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import viCommon from '../../locales/vi/common.json';
import jaCommon from '../../locales/ja/common.json';
import viLogin from '../../locales/vi/login.json';
import jaLogin from '../../locales/ja/login.json';
import jaMainLayout from '../../locales/ja/mainLayout.json';
import viMainlayout from '../../locales/vi/mainLayout.json';
import jaUser from '../../locales/ja/user.json';
import viUser from '../../locales/vi/user.json';
import jaCustomer from '../../locales/ja/customer.json';
import viCustomer from '../../locales/vi/customer.json';
import jaProjectRequest from '../../locales/ja/projectRequest.json';
import viProjectRequest from '../../locales/vi/projectRequest.json';



const savedLanguage = localStorage.getItem('language') || 'vi';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: {
        common: viCommon,
        login : viLogin,
        mainLayout : viMainlayout,
        user : viUser,
        customer : viCustomer,
        projectRequest: viProjectRequest,
        // login: viLogin,
      },
      ja: {
        common: jaCommon,
        login : jaLogin,
        mainLayout : jaMainLayout,
        user : jaUser,
        customer : jaCustomer,
        projectRequest: jaProjectRequest,
        // login: jaLogin,
      },
    },
    lng: savedLanguage,
    fallbackLng: 'vi',
    ns: ['common', 'login' , 'mainLayout' , 'user','customer', 'projectRequest'], // Định nghĩa các namespace
    defaultNS: 'common', // Namespace mặc định
    interpolation: {
      escapeValue: false,
    },
  });

// Lưu ngôn ngữ vào localStorage khi thay đổi
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;