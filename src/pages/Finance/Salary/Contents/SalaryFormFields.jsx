import { Box, Grid, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import { Controller, useWatch } from "react-hook-form";
import { Info, Percent } from "lucide-react";
import CustomTextField from "../../../../components/CustomTextField";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import CurrencyAmount from "../../../../components/inputs/CurrencyAmount";
import OverflowTooltipLabel from "../../../../components/OverflowTooltipLabel";
import GlobalEmployeeAutocomplete from "../../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import { useLocale } from "../../../../hooks/useLocale";
import { getSalaryEmployeesApi } from "../../../../api/queries/getters";
import {
  BONUS_CURRENCIES,
  BONUS_CURRENCY,
  BONUS_TYPE,
  calculatePercentBonus,
  calculateSalary,
  formatMoney,
  toNumber,
} from "../functions/salaryUtils";

const FIELD_HEIGHT = 46;

const CALC_FIELDS = [
  "base_salary",
  "work_days",
  "worked_days",
  "card_amount",
  "advance",
  "cafeteria_credit",
  "loan",
  "bonus",
  "bonus_type",
  "bonus_currency",
  "sales_amount",
  "bonus_percent",
];

const money = (v, currency) => formatMoney(v, { dashZero: false, currency });

// Shrinks every input in the form (text, picker, autocomplete) from the
// shared 44px default to FIELD_HEIGHT. Three-class selectors + !important are needed
// to beat the !important heights CustomDatePicker sets on itself.
const compactSx = {
  "& .MuiFormControl-root .MuiInputBase-root": {
    height: `${FIELD_HEIGHT}px !important`,
    minHeight: `${FIELD_HEIGHT}px !important`,
    maxHeight: `${FIELD_HEIGHT}px !important`,
    fontSize: "0.925rem !important",
  },
  "& .MuiFormControl-root .MuiInputBase-root input": {
    height: `${FIELD_HEIGHT}px !important`,
    maxHeight: `${FIELD_HEIGHT}px !important`,
    paddingTop: "0 !important",
    paddingBottom: "0 !important",
    fontSize: "0.925rem !important",
    boxSizing: "border-box",
  },
};

// Read-only computed value, same size as an input.
const ResultBox = ({ label, value }) => (
  <Box>
    <OverflowTooltipLabel label={label} />
    <Box
      sx={{
        height: FIELD_HEIGHT,
        px: 1.25,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        borderRadius: "7px",
        border: "1px dashed",
        borderColor: "primary.main",
        color: "primary.main",
      }}
    >
      <Typography noWrap sx={{ fontSize: "0.95rem", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const BonusTypeField = ({ control }) => {
  const { t } = useLocale();
  return (
    <Box>
      <OverflowTooltipLabel label={t("salary.sectionBonus")} />
      <Controller
        name="bonus_type"
        control={control}
        render={({ field }) => (
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={field.value}
            onChange={(_e, next) => next && field.onChange(next)}
            sx={{
              height: FIELD_HEIGHT,
              "& .MuiToggleButton-root": {
                px: 0.75,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
                whiteSpace: "nowrap",
              },
            }}
          >
            <ToggleButton value={BONUS_TYPE.PERCENT}>%</ToggleButton>
            <ToggleButton value={BONUS_TYPE.FIXED}>{t("salary.bonusFixed")}</ToggleButton>
          </ToggleButtonGroup>
        )}
      />
    </Box>
  );
};

// Bonus money input with its currency (TMT / USD) picked right beside it.
const BonusAmountField = ({ control, name, label }) => (
  <Controller
    name="bonus_currency"
    control={control}
    render={({ field }) => (
      <CurrencyAmount
        name={name}
        control={control}
        label={label}
        currency={field.value}
        onCurrencyChange={field.onChange}
        currencies={BONUS_CURRENCIES}
        allowNegative={false}
        placeholder="0"
      />
    )}
  />
);

// Percent-of-sales or fixed amount; the row keeps the same height either way.
// The currency picked on the amount is the bonus currency in both modes.
const BonusFields = ({ control }) => {
  const { t } = useLocale();
  const [bonusType, sales, percent, currency] = useWatch({
    control,
    name: ["bonus_type", "sales_amount", "bonus_percent", "bonus_currency"],
  });

  if (bonusType !== BONUS_TYPE.PERCENT) {
    // The spacer fills the columns the percent inputs use (4 + 2 + 3), so the
    // fixed input keeps its row and the fields below never move up.
    return (
      <>
        <Grid size={{ xs: 12, sm: 4 }}>
          <BonusAmountField control={control} name="bonus" label={t("salary.bonusResult")} />
        </Grid>
        <Grid size={{ xs: 0, sm: 5 }} sx={{ display: { xs: "none", sm: "block" } }} />
      </>
    );
  }

  return (
    <>
      <Grid size={{ xs: 12, sm: 4 }}>
        <BonusAmountField control={control} name="sales_amount" label={t("salary.salesAmount")} />
      </Grid>
      <Grid size={{ xs: 5, sm: 2 }}>
        <CustomTextField
          name="bonus_percent"
          control={control}
          label={t("salary.percent")}
          type="number"
          allowNegative={false}
          placeholder="0"
          required
          endIcon={<Percent size={13} />}
        />
      </Grid>
      <Grid size={{ xs: 7, sm: 3 }}>
        <ResultBox
          label={t("salary.bonusResult")}
          value={money(calculatePercentBonus(sales, percent), currency)}
        />
      </Grid>
    </>
  );
};

const SummaryItem = ({ label, value, extra, strong = false }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography noWrap sx={{ fontSize: "0.78rem", color: "text.secondary", fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography
      noWrap
      sx={{
        fontSize: strong ? "1.3rem" : "0.98rem",
        fontWeight: strong ? 800 : 700,
        fontVariantNumeric: "tabular-nums",
        color: strong ? "primary.main" : "text.primary",
        lineHeight: 1.3,
      }}
    >
      {value}
    </Typography>
    {extra && (
      <Typography
        noWrap
        sx={{ fontSize: "0.78rem", fontWeight: 700, color: "text.secondary", fontVariantNumeric: "tabular-nums" }}
      >
        {extra}
      </Typography>
    )}
  </Box>
);

// One-line result; the full formula is in the ⓘ tooltip.
const SalarySummaryBar = ({ control }) => {
  const { t } = useLocale();
  const watched = useWatch({ control, name: CALC_FIELDS });
  const values = Object.fromEntries(CALC_FIELDS.map((f, i) => [f, watched[i]]));
  const calc = calculateSalary(values);
  const isPercent = values.bonus_type === BONUS_TYPE.PERCENT;
  const isUsdBonus = calc.bonusCurrency === BONUS_CURRENCY.USD;

  const bonusLine = `${t("salary.bonus")}: ${money(calc.bonus, calc.bonusCurrency)}${
    isPercent
      ? ` (${t("salary.percentOf", {
          sales: money(values.sales_amount, calc.bonusCurrency),
          percent: toNumber(values.bonus_percent),
        })})`
      : ""
  }`;

  // A USD bonus is not part of the TMT sum, so it is listed after it.
  const formula = [
    `${t("salary.baseSalary")}: ${money(calc.baseSalary)} × ${calc.workedDays}/${calc.workDays} = ${money(calc.earned)}`,
    ...(isUsdBonus ? [] : [`+ ${bonusLine}`]),
    `= ${t("salary.total")}: ${money(calc.total)}`,
    `− ${t("salary.deductions")}: ${money(calc.deductions)}`,
    `= ${t("salary.payable")}: ${money(calc.payable)}`,
    `− ${t("salary.paidAmount")}: ${money(values.paid_amount)} → ${t("salary.remaining")}: ${money(calc.remaining)}`,
    ...(isUsdBonus ? [`${bonusLine} — ${t("salary.bonusSeparate")}`] : []),
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr) 1.2fr auto" },
        alignItems: "center",
        columnGap: 2,
        rowGap: 1,
        px: 1.5,
        py: 1,
        borderRadius: "10px",
        backgroundColor: "action.hover",
      }}
    >
      <SummaryItem label={t("salary.earned")} value={money(calc.earned)} />
      <SummaryItem label={t("salary.total")} value={money(calc.total)} />
      <SummaryItem label={t("salary.deductions")} value={`− ${money(calc.deductions)}`} />
      <SummaryItem
        label={t("salary.payable")}
        value={money(calc.payable)}
        extra={calc.bonusUsd > 0 ? `+ ${money(calc.bonusUsd, BONUS_CURRENCY.USD)} ${t("salary.bonus")}` : null}
        strong
      />
      <Tooltip
        arrow
        placement="top"
        title={
          <Box sx={{ whiteSpace: "pre-line", fontVariantNumeric: "tabular-nums" }}>
            {formula.join("\n")}
          </Box>
        }
      >
        <Box sx={{ display: { xs: "none", sm: "flex" }, color: "text.secondary", cursor: "help" }}>
          <Info size={18} />
        </Box>
      </Tooltip>
    </Box>
  );
};

/**
 * Four rows in the paper sheet's order:
 *   Işgär · Aý
 *   Oklad · Iş gün · Işlän · Karta
 *   Awans · Kofe · Karz
 *   Bonus (type · sales · % · result)
 *   Berlen · Senesi · Bellik
 * rowSpacing leaves room for CustomTextField's absolutely positioned errors.
 */
const SalaryFormFields = ({ control, initialEmployee, onEmployeeChange }) => {
  const { t } = useLocale();

  const moneyField = (name, label, extra = {}) => (
    <CustomTextField
      name={name}
      control={control}
      label={label}
      type="number"
      allowNegative={false}
      placeholder="0"
      size="small"
      {...extra}
    />
  );

  return (
    <Box sx={compactSx}>
      <Grid container columnSpacing={1.5} rowSpacing={2.5}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <GlobalEmployeeAutocomplete
            name="employee_guid"
            control={control}
            label={t("salary.employee")}
            initialEmployee={initialEmployee}
            onEmployeeChange={onEmployeeChange}
            // Only the caller's office, active employees.
            apiFn={getSalaryEmployeesApi}
            queryKeyPrefix="salaryEmployees"
            size="small"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomDatePicker
            name="month"
            control={control}
            label={t("salary.month")}
            views={["year", "month"]}
            openTo="month"
            format="MM.YYYY"
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          {moneyField("base_salary", t("salary.baseSalary"), { required: true })}
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          {moneyField("work_days", t("salary.workDays"), { required: true, placeholder: "" })}
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          {moneyField("worked_days", t("salary.workedDays"), { required: true, placeholder: "" })}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>{moneyField("card_amount", t("salary.cardAmount"))}</Grid>

        <Grid size={{ xs: 12, sm: 4 }}>{moneyField("advance", t("salary.advance"))}</Grid>
        <Grid size={{ xs: 6, sm: 4 }}>{moneyField("cafeteria_credit", t("salary.cafeteriaCredit"))}</Grid>
        <Grid size={{ xs: 6, sm: 4 }}>{moneyField("loan", t("salary.loan"))}</Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <BonusTypeField control={control} />
        </Grid>
        <BonusFields control={control} />

        <Grid size={{ xs: 6, sm: 4 }}>{moneyField("paid_amount", t("salary.paidAmount"))}</Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <CustomDatePicker name="paid_date" control={control} label={t("salary.paidDate")} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField name="note" control={control} label={t("salary.note")} size="small" />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <SalarySummaryBar control={control} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalaryFormFields;
