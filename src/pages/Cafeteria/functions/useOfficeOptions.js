import { useMemo } from "react";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getAllOfficeApi } from "../../../api/queries/getters";
import { useLocale } from "../../../hooks/useLocale";

// Office select options; shares its cache key with the other office filters.
export const useOfficeOptions = () => {
  const { selectedLang } = useLocale();
  const { data } = useGet({ apiFn: getAllOfficeApi, key: "all-offices-filter" });
  return useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((office) => ({
        value: office.guid,
        label: selectedLang(office.shortName) || selectedLang(office.fullName) || "—",
      })),
    [data, selectedLang],
  );
};

// The row's own office; rows saved before offices were picked show the creator's.
export const getRowOffice = (row) => row?.office || row?.createdBy?.office || null;
