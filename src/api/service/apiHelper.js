import i18n from '../../libs/i18n';
import Cookies from 'js-cookie';
import { axiosInstance } from '../axiosIntance';


const config = {
  withCredentials: false,
};


const privateConfig = {
  headers: {
    "Authorization": "",
    "Content-type": "application/json",
    "Accept-Language" : i18n.language
  },
  withCredentials: false,
};

const getAccessToken = () => Cookies.get('accessToken');


export const api = {
  // Get
  get: async (url) => {
    const response = await axiosInstance.get(url, { ...config });
    return response;
  },
  // Post
  post: async (url, data) => {
    const response = await axiosInstance.post(url, data, { ...config });
    return response;
  },
  // Put
  put: async (url, data) => {
    const response = await axiosInstance.put(url, data, { ...config });
    return response;
  },
  //Patch
    patch: async (url, data) => {
    const response = await axiosInstance.patch(url, data, { ...config });
    return response;
  },
  // Delete
  delete: async (url, data) => {
    const response = await axiosInstance.delete(url, {
      ...config,
      data: data,
    });
    return response;
  },
  // Get private
  getPrivate: async (url, queryParams) => {
    const token = 'Bearer ' + getAccessToken();
    const config = {
      ...privateConfig,
      headers: {
        ...privateConfig.headers,
        Authorization: token
      },
      params: queryParams
    };
    const res = axiosInstance.get(url, { ...config });
    return res;
  },
  // Post private
  postPrivate: async (url, data) => {
    const token = 'Bearer ' + getAccessToken();
    const config = {
      ...privateConfig,
      headers: {
        ...privateConfig.headers,
        "Authorization": token,
      },
    };
    const res = await axiosInstance.post(url, { ...data }, { ...config });
    return res;
  },
  // Put private
  putPrivate: async (url, data) => {
    const token = 'Bearer ' + getAccessToken();
    const config = {
      ...privateConfig,
      headers: {
        ...privateConfig.headers,
        Authorization: token
      },
    };
    const res = await axiosInstance.put(url, { ...data }, { ...config });
    return res;
  },
  //Patch
   patchPrivate: async (url, data) => {
    const token = 'Bearer ' + getAccessToken();
    const config = {
      ...privateConfig,
      headers: {
        ...privateConfig.headers,
        Authorization: token,
      },
    };
    const res = await axiosInstance.patch(url, { ...data }, { ...config });
    return res;
  },
  // Delete private
  deletePrivate: async (url, data) => {
    const token = 'Bearer ' + getAccessToken();
    const config = {
      ...privateConfig,
      headers: {
        ...privateConfig.headers,
        Authorization: token
      },
    };
    const res = await axiosInstance.delete(url, { ...config, data: data });
    return res;
  },
  // Post FormData private (for file upload)
  postFormDataPrivate: async (url, formData) => {
    const token = 'Bearer ' + getAccessToken();
    const res = await axiosInstance.post(url, formData, {
      headers: {
        Authorization: token,
        'Content-Type': 'multipart/form-data',
        'Accept-Language': i18n.language,
      },
    });
    return res;
  },
  // Patch FormData private (for file upload)
  patchFormDataPrivate: async (url, formData) => {
    const token = 'Bearer ' + getAccessToken();
    const res = await axiosInstance.patch(url, formData, {
      headers: {
        Authorization: token,
        'Content-Type': 'multipart/form-data',
        'Accept-Language': i18n.language,
      },
    });
    return res;
  },
};