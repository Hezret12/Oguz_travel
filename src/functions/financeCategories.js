import { useMemo } from "react";
import { useGet } from "../hooks/CRUD/useGet";
import { useCreate } from "../hooks/CRUD/useCreate";
import { useUpdate } from "../hooks/CRUD/useUpdate";
import { useDelete } from "../hooks/CRUD/useDelete";
import { getAllFinanceCategoriesApi } from "../api/queries/getters";
import { addFinanceCategoryApi } from "../api/queries/post";
import { updateFinanceCategoryApi } from "../api/queries/patch";
import { deleteFinanceCategoryApi } from "../api/queries/delete";

export const DEFAULT_FINANCE_CATEGORIES = [
  { value: "B2B", label: "B2B Bilet", isBuiltIn: true },
  { value: "TURKISH_AIRLINES", label: "Türk Howa Ýollary", isBuiltIn: true },
  { value: "AIRWAY", label: "Awia Hyzmat", isBuiltIn: true },
  { value: "RAILWAY", label: "Demir Ýol", isBuiltIn: true },
  { value: "HOTEL", label: "Myhmanhana", isBuiltIn: true },
  { value: "TOUR", label: "Syýahat", isBuiltIn: true },
  { value: "TRANSFER", label: "Ulag / Geçirim", isBuiltIn: true },

];

const STORAGE_KEY = "finance_custom_categories";
const EVENT_NAME = "finance_categories_updated";

export const getStoredCustomCategories = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading custom finance categories:", err);
    return [];
  }
};

export const saveStoredCustomCategories = (customCategories) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (err) {
    console.error("Error saving custom finance categories:", err);
  }
};

export const getAllFinanceCategories = () => {
  const custom = getStoredCustomCategories();
  const builtInValues = new Set(DEFAULT_FINANCE_CATEGORIES.map((c) => c.value));
  const validCustom = custom.filter((c) => !builtInValues.has(c.value));
  return [...DEFAULT_FINANCE_CATEGORIES, ...validCustom];
};

export const addCustomCategory = (name) => {
  const trimmed = name?.trim();
  if (!trimmed) return null;

  const value = trimmed
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "") || `CAT_${Date.now()}`;

  const currentCustom = getStoredCustomCategories();
  const existing = currentCustom.find(
    (c) => c.value === value || c.label.toLowerCase() === trimmed.toLowerCase()
  );

  if (existing) {
    return existing;
  }

  const newCategory = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    value,
    label: trimmed,
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
  };

  const updated = [...currentCustom, newCategory];
  saveStoredCustomCategories(updated);
  return newCategory;
};

export const updateCustomCategory = (idOrValue, newLabel) => {
  const trimmed = newLabel?.trim();
  if (!trimmed) return false;

  const currentCustom = getStoredCustomCategories();
  const updated = currentCustom.map((cat) => {
    if (cat.id === idOrValue || cat.value === idOrValue) {
      return { ...cat, label: trimmed };
    }
    return cat;
  });

  saveStoredCustomCategories(updated);
  return true;
};

export const deleteCustomCategory = (idOrValue) => {
  const currentCustom = getStoredCustomCategories();
  const updated = currentCustom.filter(
    (cat) => cat.id !== idOrValue && cat.value !== idOrValue
  );
  saveStoredCustomCategories(updated);
  return true;
};

export const useFinanceCategories = () => {
  const { data: rawCategories, isLoading, isFetching, refetch } = useGet({
    apiFn: getAllFinanceCategoriesApi,
    key: "finance-categories",
  });

  const categories = useMemo(() => {
    const list = Array.isArray(rawCategories?.data)
      ? rawCategories.data
      : Array.isArray(rawCategories)
      ? rawCategories
      : getAllFinanceCategories();
    return list;
  }, [rawCategories]);

  const { mutate: createCategory, mutateAsync: createCategoryAsync, isPending: isCreating } = useCreate({
    apiFn: addFinanceCategoryApi,
    key: "finance-categories",
  });

  const { mutate: updateCategory, mutateAsync: updateCategoryAsync, isPending: isUpdating } = useUpdate({
    apiFn: updateFinanceCategoryApi,
    key: "finance-categories",
    idKey: "value",
  });

  const { mutate: deleteCategory, mutateAsync: deleteCategoryAsync, isPending: isDeleting } = useDelete({
    deleteFn: deleteFinanceCategoryApi,
    queryKey: "finance-categories",
    idKey: "value",
  });

  return {
    categories,
    isLoading,
    isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    refetch,
    addCategory: createCategory,
    addCategoryAsync: createCategoryAsync,
    updateCategory,
    updateCategoryAsync,
    deleteCategory,
    deleteCategoryAsync,
  };
};
