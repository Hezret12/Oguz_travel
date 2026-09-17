import { memo } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";

// value / onChange use "YYYY-MM".
const SalaryMonthPicker = ({ value, onChange }) => {
  const { t } = useLocale();
  const current = value ? dayjs(`${value}-01`) : dayjs().startOf("month");
  const shift = (amount) => onChange(current.add(amount, "month").format("YYYY-MM"));

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        height: 40,
        borderRadius: "10px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Tooltip title={t("salary.previousMonth")} arrow>
        <IconButton size="small" onClick={() => shift(-1)} sx={{ borderRadius: 0, height: "100%" }}>
          <ChevronLeft size={18} />
        </IconButton>
      </Tooltip>
      <DatePicker
        value={current}
        onChange={(next) => {
          if (next && next.isValid()) onChange(next.format("YYYY-MM"));
        }}
        views={["year", "month"]}
        openTo="month"
        format="MM.YYYY"
        slotProps={{
          textField: {
            size: "small",
            variant: "standard",
            slotProps: { input: { disableUnderline: true } },
            sx: {
              width: 128,
              "& .MuiPickersSectionList-root": {
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.9rem",
              },
            },
          },
        }}
      />
      <Tooltip title={t("salary.nextMonth")} arrow>
        <IconButton size="small" onClick={() => shift(1)} sx={{ borderRadius: 0, height: "100%" }}>
          <ChevronRight size={18} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default memo(SalaryMonthPicker);
