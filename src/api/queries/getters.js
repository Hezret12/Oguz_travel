import { axiosInstance } from '../axiosIntance';

/**
 * Çalışan listesini getirir.
 * 
 * @param {Object} params - Query parametreleri
 * @param {string} [params.search] - Arama metni
 * @returns {Promise<Array>} - Çalışan listesi
 * 
 * Kullanım (useEmployeeSearch.js içinde):
 *   const { data } = useApiQuery(
 *     ['employees', debouncedQuery],
 *     () => getEmployees({ search: debouncedQuery }),
 *   );
 */
export const getEmployees = (params = {}) =>
  axiosInstance.get('/employees', { params }).then((res) => res.data);
