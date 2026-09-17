import { Box, Grid, Typography } from "@mui/material";
import { useWatch } from "react-hook-form";
import CustomTextField from "../../../../components/CustomTextField";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import GlobalEmployeeAutocomplete from "../../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import { useLocale } from "../../../../hooks/useLocale";
import { calculateSalary, formatMoney } from "../functions/salaryUtils";

const MONEY_FIELDS = [
  "base_salary",
  "work_days",
  "worked_days",
  "card_amount",
  "advance",
  "cafeteria_credit",
  "loan",
  "bonus",
];

const SectionTitle = ({ children }) => (
  <Typography
    variant="overline"
    sx={{
      display: "block",
      color: "text.secondary",
      fontWeight: 700,
      letterSpacing: "0.06em",
      lineHeight: 1.6,
    }}
  >
    {children}
  </Typography>
);

const SummaryItem = ({ label, value, highlight = false }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
      {label}
    </Typography>
    <Typography
      noWrap
      sx={{
        fontWeight: highlight ? 800 : 700,
        fontSize: highlight ? "1.05rem" : "0.95rem",
        color: highlight ? "primary.main" : "text.primary",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {value}
    </Typography>
  </Box>
);

// Live JEMI / BERMELI preview; the server recomputes these on save.
const SalarySummary = ({ control }) => {
  const { t } = useLocale();
  const watched = useWatch({ control, name: MONEY_FIELDS });
  const values = Object.fromEntries(MONEY_FIELDS.map((f, i) => [f, watched[i]]));
  const { earned, total, deductions, payable } = calculateSalary(values);
  const money = (v) => formatMoney(v, { dashZero: false });

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
        gap: 2,
        p: 1.5,
        borderRadius: "10px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "action.hover",
      }}
    >
      <SummaryItem label={t("salary.earned")} value={money(earned)} />
      <SummaryItem label={t("salary.total")} value={money(total)} />
      <SummaryItem label={t("salary.deductions")} value={money(deductions)} />
      <SummaryItem label={t("salary.payable")} value={money(payable)} highlight />
    </Box>
  );
};

const SalaryFormFields = ({ control, initialEmployee, onEmployeeChange, hint }) => {
  const { t } = useLocale();

  const moneyField = (name, label, extra = {}) => (
    <CustomTextField
      name={name}
      control={control}
      label={label}
      type="number"
      allowNegative={false}
      placeholder="0"
      {...extra}
    />
  );

  return (
    <Grid container spacing={2.25}>
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
      <Grid size={{ xs: 12, sm: 8 }}>
        <GlobalEmployeeAutocomplete
          name="employee_guid"
          control={control}
          label={t("salary.employee")}
          initialEmployee={initialEmployee}
          onEmployeeChange={onEmployeeChange}
          required
        />
      </Grid>

      {/* Hint shares the title row so showing it never changes dialog height */}
      <Grid
        size={{ xs: 12 }}
        sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2 }}
      >
        <SectionTitle>{t("salary.sectionEarnings")}</SectionTitle>
        {hint && (
          <Typography variant="caption" color="info.main" noWrap sx={{ minWidth: 0 }}>
            {hint}
          </Typography>
        )}
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        {moneyField("base_salary", t("salary.baseSalary"), { required: true })}
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        {moneyField("work_days", t("salary.workDays"), { required: true, placeholder: "" })}
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        {moneyField("worked_days", t("salary.workedDays"), { required: true, placeholder: "" })}
      </Grid>

      <Grid size={{ xs: 12 }}>
        <SectionTitle>{t("salary.sectionDeductions")}</SectionTitle>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>{moneyField("card_amount", t("salary.cardAmount"))}</Grid>
      <Grid size={{ xs: 6, sm: 4 }}>{moneyField("advance", t("salary.advance"))}</Grid>
      <Grid size={{ xs: 6, sm: 4 }}>{moneyField("cafeteria_credit", t("salary.cafeteriaCredit"))}</Grid>
      <Grid size={{ xs: 6, sm: 4 }}>{moneyField("loan", t("salary.loan"))}</Grid>
      <Grid size={{ xs: 12, sm: 4 }}>{moneyField("bonus", t("salary.bonus"))}</Grid>

      <Grid size={{ xs: 12 }}>
        <SalarySummary control={control} />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <SectionTitle>{t("salary.sectionPayment")}</SectionTitle>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>{moneyField("paid_amount", t("salary.paidAmount"))}</Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomDatePicker name="paid_date" control={control} label={t("salary.paidDate")} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CustomTextField
          name="note"
          control={control}
          label={t("salary.note")}
          multiline
          rows={2}
        />
      </Grid>
    </Grid>
  );
};

export default SalaryFormFields;
