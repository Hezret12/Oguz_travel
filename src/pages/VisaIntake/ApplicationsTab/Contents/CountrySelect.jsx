import { useCallback, useMemo, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { ChevronDown } from "lucide-react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { getCountriesApi } from "../../../../api/queries/getters";
import { useDebounce } from "../../../../hooks/useDebounce";
import { useLocale } from "../../../../hooks/useLocale";

const PAGE_LIMIT = 20;

// Distinct from "countries" on purpose: useCreate prepends into every
// `["countries", ...]` cache assuming `page.data.data` is an array. Country
// mutations invalidate this key explicitly instead.
export const COUNTRY_OPTIONS_KEY = "countryOptions";

const getPageItems = (page) => {
  const body = page?.data;
  if (Array.isArray(body?.data?.data)) return body.data.data;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body)) return body;
  return [];
};

const getTotalPages = (page) => {
  const body = page?.data;
  return (
    body?.data?.totalPages ??
    body?.totalPages ??
    body?.meta?.totalPages ??
    body?.data?.meta?.totalPages
  );
};

/**
 * Server-side searchable country picker that loads the next page when the
 * list is scrolled to the bottom.
 *
 * `value` / `onChange` work with the full country object (not the guid) so the
 * selected label survives a search that no longer returns that country.
 */
const CountrySelect = ({ value, onChange, width = 240 }) => {
  const { t, selectedLang } = useLocale();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400).trim();

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [COUNTRY_OPTIONS_KEY, debouncedSearch],
      queryFn: ({ pageParam }) =>
        getCountriesApi({
          page: pageParam,
          limit: PAGE_LIMIT,
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const totalPages = getTotalPages(lastPage);
        if (totalPages != null) {
          return allPages.length < totalPages ? allPages.length + 1 : undefined;
        }
        return getPageItems(lastPage).length < PAGE_LIMIT
          ? undefined
          : allPages.length + 1;
      },
      placeholderData: keepPreviousData,
      // Nothing to show until the list is opened.
      enabled: open,
    });

  const options = useMemo(() => {
    const seen = new Set();
    const list = [];
    // Keep the current selection present so MUI can always match `value`.
    if (value?.guid) {
      seen.add(value.guid);
      list.push(value);
    }
    (data?.pages || []).forEach((page) => {
      getPageItems(page).forEach((country) => {
        if (country?.guid && !seen.has(country.guid)) {
          seen.add(country.guid);
          list.push(country);
        }
      });
    });
    return list;
  }, [data, value]);

  const getCountryLabel = useCallback(
    (country) => {
      if (!country) return "";
      const name =
        (typeof country.name === "string" ? country.name : null) ||
        selectedLang(country.name) ||
        country.name?.tk ||
        country.name?.ru ||
        country.name?.en ||
        country.nameTm ||
        country.code ||
        "";
      return country.code ? `${name} (${country.code})` : name;
    },
    [selectedLang],
  );

  const handleListboxScroll = useCallback(
    (event) => {
      const node = event.currentTarget;
      if (
        node.scrollTop + node.clientHeight >= node.scrollHeight - 32 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  return (
    <Autocomplete
      size="small"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      popupIcon={<ChevronDown size={18} />}
      options={options}
      value={value || null}
      loading={isFetching}
      loadingText={t("loading")}
      noOptionsText={t("noData")}
      // Filtering happens on the server.
      filterOptions={(opts) => opts}
      getOptionKey={(option) => option.guid}
      getOptionLabel={getCountryLabel}
      isOptionEqualToValue={(option, val) => option.guid === val?.guid}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === "input") setSearchQuery(newInputValue);
        else if (reason === "reset" || reason === "clear") setSearchQuery("");
      }}
      onChange={(_, country) => onChange?.(country || null)}
      slotProps={{
        listbox: { onScroll: handleListboxScroll },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={t("visaIntake.selectCountryPlaceholder")}
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps?.input,
              endAdornment: (
                <>
                  {isFetching && (
                    <CircularProgress color="inherit" size={16} sx={{ mr: 1 }} />
                  )}
                  {params.slotProps?.input?.endAdornment}
                </>
              ),
            },
          }}
          sx={{
            width,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              height: "40px",
              fontSize: "0.875rem",
              fontWeight: 600,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "#ffffff",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.12)"
                    : "#E2E8F0",
              },
            },
          }}
        />
      )}
    />
  );
};

export default CountrySelect;
