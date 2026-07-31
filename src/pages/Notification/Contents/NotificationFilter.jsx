import { Box, Button, Typography, Stack } from "@mui/material";
import CustomSelect from "../../../components/CustomSelect";
import CustomDatePicker from "../../../components/CustomDatePicker";
import CustomTextField from "../../../components/CustomTextField";
import { useForm } from "react-hook-form";
import { useLocale } from "../../../hooks/useLocale";

const STATUS_OPTIONS = [
  { label: "Ählisi (All)", value: "all" },
  { label: "Okalmadyklar (Unread)", value: "unread" },
  { label: "Okalanlar (Read)", value: "read" },
];

const TYPE_OPTIONS = [
  { label: "Ählisi (All)", value: "all" },
  { label: "Bilet (Ticket)", value: "ticket" },
  { label: "Töleg (Payment)", value: "payment" },
  { label: "Tabşyryk (Task)", value: "task" },
  { label: "Terjime (Translation)", value: "translation" },
  { label: "Ulgam (System)", value: "system" },
];

const NotificationFilter = ({ appliedFilters, onApply, onReset }) => {
  const { t } = useLocale();
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      status: appliedFilters?.status || "all",
      type: appliedFilters?.type || "all",
      startDate: appliedFilters?.startDate || null,
      endDate: appliedFilters?.endDate || null,
      sender: appliedFilters?.sender || "",
    },
  });

  const onSubmit = (data) => {
    onApply?.(data);
  };

  const handleReset = () => {
    const emptyFilters = {
      status: "all",
      type: "all",
      startDate: null,
      endDate: null,
      sender: "",
    };
    reset(emptyFilters);
    onReset?.(emptyFilters);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
      <Stack spacing={2.5}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: -1 }}>
          {t("filter")}
        </Typography>

        {/* Read/Unread Status Filter */}
        <CustomSelect
          name="status"
          control={control}
          label={t("notifications.statusFilter")}
          options={STATUS_OPTIONS}
        />

        {/* Category / Type Filter */}
        <CustomSelect
          name="type"
          control={control}
          label={t("notifications.typeFilter")}
          options={TYPE_OPTIONS}
        />

        {/* Sender Filter */}
        <CustomTextField
          name="sender"
          control={control}
          label={t("notifications.senderFilter")}
          placeholder="Ugradanyň ady..."
        />

        {/* Start Date */}
        <CustomDatePicker
          name="startDate"
          control={control}
          label={t("notifications.startDate")}
        />

        {/* End Date */}
        <CustomDatePicker
          name="endDate"
          control={control}
          label={t("notifications.endDate")}
        />

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1.5, pt: 1 }}>
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            fullWidth
            onClick={handleReset}
            sx={{ borderRadius: "10px", py: 1, textTransform: "none", fontWeight: 600 }}
          >
            {t("reset") || "Arassala"}
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ borderRadius: "10px", py: 1, textTransform: "none", fontWeight: 600 }}
          >
            {t("apply")}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default NotificationFilter;
