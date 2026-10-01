import { memo, useMemo } from "react";
import { Stack } from "@mui/material";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { getAllOfficeApi } from "../../../../api/queries/getters";
import { FilterDate, FilterSelect } from "../../CashFlow/Contents/CashFlowFilter";
import { CURRENCY_OPTIONS } from "../../CashFlow/functions/cashFlowHelpers";

const OfficeCashFilter = ({ draft = {}, setDraftFilter, selectsOpen = {}, openSelect, closeSelect }) => {
  const { t, selectedLang } = useLocale();

  const { data: officesData } = useGet({ apiFn: getAllOfficeApi, key: "all-offices-filter" });

  const officeOptions = useMemo(
    () =>
      (Array.isArray(officesData) ? officesData : []).map((o) => ({
        label: selectedLang(o.fullName) || selectedLang(o.shortName) || "—",
        value: o.guid,
      })),
    [officesData, selectedLang],
  );

  const typeOptions = useMemo(
    () => [
      { label: t("finance.income"), value: "INCOME" },
      { label: t("finance.expense"), value: "EXPENSE" },
    ],
    [t],
  );

  return (
    <Stack spacing={2.5}>
      <FilterSelect
        label={t("finance.officeCash.office")}
        name="office_guid"
        value={draft.office_guid}
        options={officeOptions}
        isOpen={selectsOpen.office_guid}
        allText={t("all")}
        onChange={setDraftFilter}
        onOpen={openSelect}
        onClose={closeSelect}
      />

      <FilterSelect
        label={t("finance.cashBook.direction")}
        name="type"
        value={draft.type}
        options={typeOptions}
        isOpen={selectsOpen.type}
        allText={t("all")}
        onChange={setDraftFilter}
        onOpen={openSelect}
        onClose={closeSelect}
      />

      <FilterSelect
        label={t("currency")}
        name="currency"
        value={draft.currency}
        options={CURRENCY_OPTIONS}
        isOpen={selectsOpen.currency}
        allText={t("all")}
        onChange={setDraftFilter}
        onOpen={openSelect}
        onClose={closeSelect}
      />

      <Stack direction="row" spacing={1.5}>
        <FilterDate
          label={t("finance.cashBook.dateFrom")}
          name="date_from"
          value={draft.date_from}
          maxDate={draft.date_to ? dayjs(draft.date_to) : undefined}
          onChange={setDraftFilter}
        />
        <FilterDate
          label={t("finance.cashBook.dateTo")}
          name="date_to"
          value={draft.date_to}
          minDate={draft.date_from ? dayjs(draft.date_from) : undefined}
          onChange={setDraftFilter}
        />
      </Stack>
    </Stack>
  );
};

export default memo(OfficeCashFilter);
