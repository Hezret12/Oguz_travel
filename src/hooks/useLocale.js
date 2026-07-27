import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';

export function useLocale() {
    const { t, i18n } = useTranslation();

    const currentLanguage = i18n.language || Cookies.get('language') || 'tk';

    function changeLang(value) {
        Cookies.set('language', value, { expires: 365, path: '/' });
        i18n.changeLanguage(value);
    }

    const getLang = () => {
        if (currentLanguage === 'tk') {
            return 'Türkmençe';
        } else if (currentLanguage === 'ru') {
            return 'Rusça';
        } else if (currentLanguage === 'en') {
            return 'English';
        }
        return 'Türkmençe';
    };

    const selectedLang = useCallback((text) => {
        if (currentLanguage === 'tk') {
            return text?.tk;
        }
        if (currentLanguage === 'ru') {
            return text?.ru;
        }
        if (currentLanguage === 'en') {
            return text?.en;
        }
        return text?.tk;
    }, [currentLanguage]);

    return { t, currentLanguage, changeLang, getLang, selectedLang, i18n };
}
