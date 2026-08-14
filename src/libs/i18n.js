import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Cookies from 'js-cookie';

import ru from '../locales/ru.json';
import tk from '../locales/tk.json';
import en from '../locales/en.json';

const savedLang = Cookies.get('language') || localStorage.getItem('language') || 'tk';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ru: { translation: ru },
            tk: { translation: tk },
        },
        lng: savedLang,
        fallbackLng: 'tk',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;


