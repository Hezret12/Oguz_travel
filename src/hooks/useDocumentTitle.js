import { useEffect } from 'react';

const APP_NAME = 'Oguz Travel';

export function useDocumentTitle(title) {
  useEffect(() => {
    if (!title || typeof document === 'undefined') return;

    const nextTitle = title.includes(APP_NAME) ? title : `${title} | ${APP_NAME}`;

    if (document.title !== nextTitle) {
      document.title = nextTitle;
    }
  }, [title]);
}

export default useDocumentTitle;


