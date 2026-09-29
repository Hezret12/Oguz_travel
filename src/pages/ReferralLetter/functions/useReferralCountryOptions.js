import { useMemo } from "react";
import { useGet } from "../../../hooks/CRUD/useGet";
import { useLocale } from "../../../hooks/useLocale";
import { getAllReferralCountriesApi } from "../../../api/queries/getters";

// Referral countries as `{ label, value }` select options, in the current
// language. Shares its cache with the Referral countries page.
export const useReferralCountryOptions = () => {
  const { selectedLang } = useLocale();
  const { data } = useGet({ apiFn: getAllReferralCountriesApi, key: "referralCountries" });

  return useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((c) => ({
        value: c.guid,
        label: selectedLang(c.name) || c.name?.tk || "—",
      })),
    [data, selectedLang],
  );
};
