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

export const getAllComplexApi = async ({ limit = 30, page = 1 }) => {
  return await api.getPrivate('/employee/get-all-employee', {
    limit,
    page,
  });
};


export const getEmployees = async (params = {}) => {
  return await api.getPrivate('/employee/get-all-employee', params);
};

export const getAllDepartmentApi = async (params = {}) => {
  return await api.getPrivate('/employee/get-all-employee', params);
};

export const getAllPositionApi = async (params = {}) => {
  return await api.getPrivate('/employee/get-all-employee', params);
};

export const getAllEmployeeApi = async (params = {}) => {
  return await api.getPrivate('/employee/get-all-employee', params);
};

