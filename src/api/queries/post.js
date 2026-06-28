import { api } from "../service/apiHelper";


export const loginApi = async (data) => {
  const response = await api.post('/auth/signin', data);
  return response;
};