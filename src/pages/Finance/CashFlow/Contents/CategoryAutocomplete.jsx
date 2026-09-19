import { useMemo } from "react";
import AppAutocomplete from "../../../../components/AppAutocomplete";
import { useLocale } from "../../../../hooks/useLocale";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { getAllCategoriesApi } from "../../../../api/queries/getters";

// Search-only category picker. Categories are created/edited/deleted on the
// Umumy → Kategoriýa page (ProfessionalTranslation/Category).
const CategoryAutocomplete = ({
  name = "category_guid",
  control,
  label,
  required = false,
}) => {
  const { t, selectedLang } = useLocale();

  const { data: categories = [], isLoading } = useGet({
    apiFn: getAllCategoriesApi,
    key: "categories",
  });

  const options = useMemo(
    () =>
      (Array.isArray(categories) ? categories : []).map((cat) => ({
        value: cat.guid,
        label:
          typeof cat.name === "object" && cat.name
            ? selectedLang(cat.name) || cat.name.tk || cat.name.ru || cat.name.en || ""
            : String(cat.name || ""),
      })),
    [categories, selectedLang],
  );

  return (
    <AppAutocomplete
      name={name}
      control={control}
      label={label || t("category")}
      options={options}
      loading={isLoading}
      placeholder={t("search")}
      required={required}
    />
  );
};

export default CategoryAutocomplete;
