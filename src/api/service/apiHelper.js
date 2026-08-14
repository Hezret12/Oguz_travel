import { axiosInstance } from '../axiosIntance';

export const api = {
  // Public methods
  get: (url, config = {}) => axiosInstance.get(url, config),
  post: (url, data, config = {}) => axiosInstance.post(url, data, config),
  put: (url, data, config = {}) => axiosInstance.put(url, data, config),
  patch: (url, data, config = {}) => axiosInstance.patch(url, data, config),
  delete: (url, data, config = {}) => axiosInstance.delete(url, { ...config, data }),

  // Private methods (Authorization & Accept-Language are automatically attached by axiosInstance interceptors)
  getPrivate: (url, queryParams, config = {}) =>
    axiosInstance.get(url, { ...config, params: queryParams }),

  postPrivate: (url, data, config = {}) =>
    axiosInstance.post(url, data, config),

  putPrivate: (url, data, config = {}) =>
    axiosInstance.put(url, data, config),

  patchPrivate: (url, data, config = {}) =>
    axiosInstance.patch(url, data, config),

  deletePrivate: (url, data, config = {}) =>
    axiosInstance.delete(url, { ...config, data }),

  // FormData methods (for file uploads)
  postFormDataPrivate: (url, formData, config = {}) =>
    axiosInstance.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
    }),

  patchFormDataPrivate: (url, formData, config = {}) =>
    axiosInstance.patch(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
    }),
};