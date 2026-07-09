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
  const response = await api.patchPrivate(`/user/update-user`, data);
  return response;
};