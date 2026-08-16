import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = title.includes('Oguz') ? title : `${title} | Oguz Travel`;
    }
  }, [title]);
}

export default useDocumentTitle;
