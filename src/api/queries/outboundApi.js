import { api } from "../service/apiHelper";

export const getAllOutboundApi = async (params = {}) => {
  return await api.getPrivate('/outbound/get-all', params);
};

export const addOutboundApi = async (data) => {
  return await api.postPrivate('/outbound/add', data);
};

export const updateOutboundApi = async (data) => {
  return await api.patchPrivate('/outbound/update', data);
};

export const deleteOutboundApi = async (guid) => {
  return await api.deletePrivate('/outbound/delete', guid);
};
