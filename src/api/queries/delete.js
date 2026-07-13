import { api } from "../service/apiHelper";


export const deleteEmployee = async (guid) => {
  const response = await api.deletePrivate('/employee/delete-employee', guid);
  return response;
};

export const deleteClient = async (guid) => {
  const response = await api.deletePrivate('/client/delete-client', guid);
  return response;
};

export const deleteB2BApi = async (guid) => {
  const response = await api.deletePrivate('/ticket-b2b/delete-ticket-b2b', guid);
  return response;
};

export const deleteTicketPaymentApi = async (guid) => {
  const response = await api.deletePrivate('/ticket-payment/delete-ticket-payment', guid);
  return response;
};