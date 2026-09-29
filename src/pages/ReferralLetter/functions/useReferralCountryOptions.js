import { useMemo } from "react";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getAllReferralCountriesApi } from "../../../api/queries/getters";

// Referral countries as `{ label, value }` select options. Country names are
// kept in Turkmen only. Shares its cache with the Referral countries page.
export const useReferralCountryOptions = () => {
  const { data } = useGet({ apiFn: getAllReferralCountriesApi, key: "referralCountries" });

  return useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((c) => ({
        value: c.guid,
        label: c.name?.tk || "—",
      })),
    [data],
  );
};
