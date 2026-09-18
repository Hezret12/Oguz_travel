import { Box, Button, Popover, Typography } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import dayjs from "dayjs";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import { useLocale } from "../../../../hooks/useLocale";
import { MAX_RANGE_DAYS } from "../functions/officeAnalyticsMock";

// Start / end picker for a custom report range. MUI's DateRangePicker is a
// paid (Pro) component, so this pairs two community DatePickers that constrain
// each other. Mount it only while open: the form starts from `value` each time.
//
// `value` / `onApply` use { start, end } as "YYYY-MM-DD" (both inclusive).
const DateRangePopover = ({ anchorEl, value, onApply, onClose }) => {
  const { t } = useLocale();
  const today = dayjs();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      start: dayjs(value?.start ?? today.startOf("month")).toISOString(),
      end: dayjs(value?.end ?? today).toISOString(),
    },
  });

  const [startValue, endValue] = useWatch({ control, name: ["start", "end"] });
  const start = startValue ? dayjs(startValue) : null;
  const end = endValue ? dayjs(endValue) : null;
  const days = start && end ? end.startOf("day").diff(start.startOf("day"), "day") + 1 : 0;

  let error = null;
  if (start && end && start.isAfter(end, "day")) {
    error = t("finance.analytics.rangeInvalid");
  } else if (days > MAX_RANGE_DAYS) {
    error = t("finance.analytics.rangeTooLong", { days: MAX_RANGE_DAYS });
  }
  const canApply = Boolean(start?.isValid() && end?.isValid() && !error);

  const submit = () => {
    if (!canApply) return;
    onApply({ start: start.format("YYYY-MM-DD"), end: end.format("YYYY-MM-DD") });
  };

  return (
    <Popover
      open
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            p: 2,
            width: 380,
            maxWidth: "calc(100vw - 32px)",
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "divider",
            backgroundImage: "none",
          },
        },
      }}
    >
      <Box component="form" noValidate onSubmit={handleSubmit(submit)}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 1.5,
          }}
        >
          <CustomDatePicker
            name="start"
            control={control}
            label={t("columns.startDate")}
            disableFuture
            maxDate={end?.isValid() ? end : today}
          />
          <CustomDatePicker
            name="end"
            control={control}
            label={t("columns.endDate")}
            disableFuture
            minDate={start?.isValid() ? start : undefined}
          />
        </Box>

        <Typography
          role={error ? "alert" : undefined}
          sx={{ mt: 1, minHeight: 18, fontSize: "0.75rem", color: error ? "error.main" : "text.secondary" }}
        >
          {error || (start && end ? `${start.format("DD.MM.YYYY")} – ${end.format("DD.MM.YYYY")}` : "")}
        </Typography>

        <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 600, color: "text.secondary" }}>
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={!canApply}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 2.5 }}
          >
            {t("apply")}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};

export default DateRangePopover;
