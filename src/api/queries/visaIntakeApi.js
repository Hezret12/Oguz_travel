import { api } from "../service/apiHelper";

// ─── GET ───
export const getAllVisaIntakeApi = async (params = {}) => {
  return await api.getPrivate('/visa-intake/get-all', params);
};

// ─── POST ───
export const addVisaIntakeApi = async (data) => {
  const response = await api.postPrivate('/visa-intake/add', data);
  return response;
};

// ─── PATCH ───
export const updateVisaIntakeApi = async (data) => {
  const response = await api.patchPrivate('/visa-intake/update', data);
  return response;
};

// ─── DELETE ───
export const deleteVisaIntakeApi = async (guid) => {
  const response = await api.deletePrivate('/visa-intake/delete', guid);
  return response;
};
