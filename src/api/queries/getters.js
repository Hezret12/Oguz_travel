import { axiosInstance } from "../axiosIntance";
import Cookies from 'js-cookie';
import { api } from '../service/apiHelper';


export const renewAccessTokenApi = async () => {
  const refreshToken = Cookies.get('refreshToken');
  const bearer = 'Bearer ' + refreshToken;
  return axiosInstance.get('/auth/renew-access-token', {
    headers: {
      Authorization: bearer,
    },
  });
};


export const getAllDepartmentApi = async (params = {}) => {
  return await api.getPrivate('/department/get-all-departments', params);
};

export const getAllPositionApi = async (params = {}) => {
  return await api.getPrivate('/position/get-all-postions', params);
};

export const getAllOfficeApi = async (params = {}) => {
  return await api.getPrivate('/office/get-all-offices', params);
};

export const getAllEmployeeApi = async (params = {}) => {
  return await api.getPrivate('/employee/get-all-employees', params);
};

export const getAllStatusApi = async (params = {}) => {
  return await api.getPrivate('/general/get-all-status', params);
};

export const getClientsApi = async (params = {}) => {
  return await api.getPrivate('/client/get-all-client', params);
};

