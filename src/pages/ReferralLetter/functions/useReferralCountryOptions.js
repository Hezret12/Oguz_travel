import { useMemo } from "react";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getAllReferralCountriesApi } from "../../../api/queries/getters";

// Referral countries as `{ label, value }` select options. Country names are
// kept in Turkmen only. Shares its cache with the Referral countries page.
//
// `refreshOnOpen` is for the add/edit dialogs, which mount each time they
// open: the list is refetched then once it is over 5 minutes old, so a country
// added by someone else shows up without a page reload.
export const useReferralCountryOptions = ({ refreshOnOpen = false } = {}) => {
  const { data } = useGet({
    apiFn: getAllReferralCountriesApi,
    key: "referralCountries",
    options: refreshOnOpen ? { staleTime: 5 * 60 * 1000 } : {},
  });

  return useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((c) => ({
        value: c.guid,
        label: c.name?.tk || "—",
      })),
    [data],
  );
};
