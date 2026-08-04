import {
  Box,
  Button,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import CustomTextField from "../../../components/CustomTextField";
import CustomDatePicker from "../../../components/CustomDatePicker";
import CustomSelect from "../../../components/CustomSelect";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";

const STATUS_OPTIONS = [
  { label: "Satyldy", value: "Satyldy", color: "#16a34a" },
  { label: "Zyýan ýeten", value: "Zyýan ýeten", color: "#ea580c" },
  { label: "Ýitirilen", value: "Ýitirilen", color: "#dc2626" },
];

/**
 * AddReferralReportModal - Modal 2 for adding new report entry
 * Matching Image 2 reference UI closely
 */
const AddReferralReportModal = ({ open, close, onSubmitSuccess }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      date: null,
      quantity: "",
      submittedBy: "",
      receivedBy: "",
      startNo: "",
      endNo: "",
      status: "Satyldy",
    },
  });

  const handleFormSubmit = (data) => {
    console.log("Add Referral Report Data:", data);
    onSubmitSuccess?.(data);
    reset();
    close();
  };

  const handleClose = () => {
    reset();
    close();
  };

  return (
    <CustomDialog open={open} close={handleClose} widthX={560}>
      <Box sx={{ position: "relative", p: 1 }}>
        {/* Header Title & Close Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.2rem",
              color: isDark ? "#F8FAFC" : "#0F172A",
            }}
          >
            Täze hasabat goşmak
          </Typography>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: isDark ? "#94A3B8" : "#64748B",
              "&:hover": {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Form Inputs Grid */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={2.25}>
            {/* Row 1: Sene & Mukdary */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomDatePicker
                name="date"
                control={control}
                label="Sene"
                placeholder="ДД.ММ.ГГГГ"
                size="medium"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="quantity"
                control={control}
                label="Mukdary"
                type="number"
              />
            </Grid>

            {/* Row 2: Tabşyran & Kabul eden */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="submittedBy"
                control={control}
                label="Tabşyran"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="receivedBy"
                control={control}
                label="Kabul eden"
              />
            </Grid>

            {/* Row 3: ÝH №-den & ÝH № çenli */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="startNo"
                control={control}
                label="ÝH №-den"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="endNo"
                control={control}
                label="ÝH № çenli"
              />
            </Grid>

            {/* Row 4: Status (Full Width) */}
            <Grid size={{ xs: 12 }}>
              <CustomSelect
                name="status"
                control={control}
                label="Status"
                options={STATUS_OPTIONS}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1.5,
              mt: 3.5,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
                height: 40,
                px: 3,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: isDark ? "#F8FAFC" : "#0F172A",
                borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "#E2E8F0",
                "&:hover": {
                  borderColor: isDark ? "rgba(255, 255, 255, 0.4)" : "#CBD5E1",
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.02)",
                },
              }}
            >
              Ýatyr
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                height: 40,
                px: 3.5,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                backgroundColor: isDark ? "#14B8A6" : "#18181B",
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: isDark ? "#0E8584" : "#27272A",
                },
              }}
            >
              Goş
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDialog>
  );
};

export default AddReferralReportModal;
