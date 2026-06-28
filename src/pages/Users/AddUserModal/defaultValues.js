export const getDefaultValues = (user = null) => {
  if (user) {
    return {
      employeeId: user.employeeId || "",
      phoneNumber: user.phoneNumber || "",
      password: "",
      isActive: user.isActive !== undefined ? user.isActive : true,
      permissions: user.permissions || [],
    };
  }
  return {
    employeeId: "",
    phoneNumber: "",
    password: "",
    isActive: true,
    permissions: [],
  };
};
