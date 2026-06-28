import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

// Handle error
export function handleError(msg, error) {
  console.error(msg, error);
  hdlErrResMsg(error);
};

// Handle error response message
export function hdlErrResMsg(error) {
  toast.error(error?.response?.data?.message || error?.message || 'Unknown error');
};

// Handle success response message
export function hdlScsResMsg(response) {
  toast.success(response?.data?.message || response?.message);
};

// Handle response data
export function hdlResData(response, key) {
  return response?.data[key];
};

export function hdlCloseTableEditModal(table) {
  table.setEditingRow(null);
};

// Handle installed date
export function handleInstDate(value) {
  return value ? dayjs(value) : null;
};

export const useUserInfo = () => {
  const { user, isAuthenticated } = useAuth();

  return {
    userIsLogin: isAuthenticated && Boolean(user?.user_is_login),
    userIsAdmin: Boolean(user?.user_is_admin),
    role: user?.role,
  };
};