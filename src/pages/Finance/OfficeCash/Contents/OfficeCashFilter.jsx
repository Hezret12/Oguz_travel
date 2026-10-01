import { memo, useMemo } from "react";
import { Stack } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import { FilterDate, FilterSelect } from "../../CashFlow/Contents/CashFlowFilter";
import { CURRENCY_OPTIONS } from "../../CashFlow/functions/cashFlowHelpers";

// The office itself is picked with the office cards above the table.
const OfficeCashFilter = ({ draft = {}, setDraftFilter, selectsOpen = {}, openSelect, closeSelect }) => {
  const { t } = useLocale();

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
          onChange={setDraftFilter}
        />
        <FilterDate
          label={t("finance.cashBook.dateTo")}
          name="date_to"
          value={draft.date_to}
          onChange={setDraftFilter}
        />
      </Stack>
    </Stack>
  );
};

export default memo(OfficeCashFilter);
