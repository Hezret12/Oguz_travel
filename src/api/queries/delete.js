import { api } from "../service/apiHelper";


export const deleteEmployee = async (complexOfBuilding) => {
  const response = await api.deletePrivate('/employee/delete-employee', complexOfBuilding);
  return response;
};