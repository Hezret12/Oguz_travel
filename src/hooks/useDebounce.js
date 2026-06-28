import { useState, useEffect } from 'react';

/**
 * Verilen değeri belirtilen gecikme süresi kadar debounce eder.
 * Kullanıcı yazmayı bıraktıktan sonra API'ye istek gönderir.
 *
 * @param {any} value - Debounce edilecek değer
 * @param {number} delay - Gecikme süresi (ms), varsayılan 400ms
 * @returns {any} - Debounce edilmiş değer
 */
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
