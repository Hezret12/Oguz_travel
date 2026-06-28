import { useState, useMemo } from "react";
import { useDebounce } from "./useDebounce";

const INITIAL_USERS = [
  {
    id: "1",
    employeeId: "1",
    fullName: "Ahmet Yılmaz",
    phoneNumber: "61123456",
    isActive: true,
    permissions: ["users_view", "users_create", "users_edit", "dashboard_view"],
  },
  {
    id: "2",
    employeeId: "2",
    fullName: "Fatma Demir",
    phoneNumber: "62234567",
    isActive: true,
    permissions: ["dashboard_view", "reports_view"],
  },
  {
    id: "3",
    employeeId: "3",
    fullName: "Mehmet Kaya",
    phoneNumber: "63345678",
    isActive: false,
    permissions: [],
  },
  {
    id: "4",
    employeeId: "4",
    fullName: "Ayşe Çelik",
    phoneNumber: "64456789",
    isActive: true,
    permissions: ["tickets_view", "tickets_create", "tickets_edit"],
  },
  {
    id: "5",
    employeeId: "5",
    fullName: "Ali Şahin",
    phoneNumber: "65567890",
    isActive: true,
    permissions: ["reports_view"],
  },
];

export const useUserSearch = () => {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);

  const filteredUsers = useMemo(() => {
    if (!debouncedQuery.trim()) return users;
    const q = debouncedQuery.toLowerCase();
    return users.filter((u) =>
      Object.values(u).some((val) =>
        String(val).toLowerCase().includes(q)
      )
    );
  }, [users, debouncedQuery]);

  const addUser = (newUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const updateUser = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
  };

  const deleteUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return {
    users: filteredUsers,
    allRawUsers: users,
    isLoading: false,
    searchQuery,
    setSearchQuery,
    addUser,
    updateUser,
    deleteUser,
  };
};
export default useUserSearch;
