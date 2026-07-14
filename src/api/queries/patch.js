import { api } from "../service/apiHelper";


export const updateEmployeeApi = async (data) => {
  const response = await api.patchPrivate(`/employee/update-employee`, data);
  return response;
};

export const updateUserApi = async (data) => {
  const response = await api.patchPrivate(`/user/update-user`, data);
  return response;
};

export const updateClientApi = async (data) => {
  const response = await api.patchPrivate(`/client/update-client`, data);
  return response;
};

export const updateB2BApi = async (data) => {
  const response = await api.patchPrivate(`/b2b/update-b2b`, data);
  return response;
};

export const updateTurkishAirlinesApi = async (data) => {
  const response = await api.patchPrivate(`/turkish-airlines/update-turkish-airlines`, data);
  return response;
};