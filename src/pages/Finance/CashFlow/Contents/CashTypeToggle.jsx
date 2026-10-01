import { Controller } from "react-hook-form";
import { ToggleButton, ToggleButtonGroup, alpha } from "@mui/material";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useLocale } from "../../../../hooks/useLocale";

const TYPE_COLORS = { INCOME: "#16a34a", EXPENSE: "#dc2626" };

// Income / Expense switch for a cash transaction form field (default name "type").
const CashTypeToggle = ({ control, name = "type" }) => {
  const { t } = useLocale();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={field.value}
          onChange={(_, v) => v && field.onChange(v)}
          sx={{ "& .MuiToggleButton-root": { py: 1, gap: 1, fontWeight: 600, textTransform: "none", borderRadius: "10px" } }}
        >
          {[
            { value: "INCOME", label: t("finance.income"), Icon: ArrowDownLeft },
            { value: "EXPENSE", label: t("finance.expense"), Icon: ArrowUpRight },
          ].map(({ value, label, Icon }) => (
            <ToggleButton
              key={value}
              value={value}
              sx={{
                "&.Mui-selected, &.Mui-selected:hover": {
                  color: TYPE_COLORS[value],
                  bgcolor: alpha(TYPE_COLORS[value], 0.12),
                  borderColor: alpha(TYPE_COLORS[value], 0.5),
                },
              }}
            >
              <Icon size={18} />
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      )}
    />
  );
};

export default CashTypeToggle;
