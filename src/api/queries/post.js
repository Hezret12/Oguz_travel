import { api } from "../service/apiHelper";

export const loginApi = async (data) => {
  const response = await api.post("/auth/signin", data);
  return response;
};

export const addEmployeeApi = async (data) => {
  const response = await api.postPrivate(
    "/employee/add-employee",
    data,
  );
  return response;
};

export const addUserApi = async (data) => {
  const response = await api.postPrivate(
    "/user/add-user",
    data,
  );
  return response;
};

export const addClientsApi = async (data) => {
  const response = await api.postPrivate(
    "/client/add-client",
    data,
  );
  return response;
};
