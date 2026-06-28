import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ru from '../locales/ru.json';
import tk from '../locales/tk.json';
import en from '../locales/en.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ru: { translation: ru },
            tk: { translation: tk },
        },
        lng: localStorage.getItem("language") || "tk",
        fallbackLng: 'tk',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
