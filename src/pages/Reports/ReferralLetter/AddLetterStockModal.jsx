import { useMemo } from "react";
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
import { CustomDialog } from "../../../components/Dialog/CustomDialog";

/**
 * AddLetterStockModal - Modal 1 for adding new letter stock batch
 * Matching Image 1 reference UI closely
 */
const AddLetterStockModal = ({ open, close, onSubmitSuccess }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      batchName: "",
      startNo: "0000001",
      endNo: "0090000",
    },
  });

  const watchStartNo = watch("startNo");
  const watchEndNo = watch("endNo");

  const calculatedCount = useMemo(() => {
    const start = parseInt(watchStartNo || "0", 10);
    const end = parseInt(watchEndNo || "0", 10);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      return end - start + 1;
    }
    return 1;
  }, [watchStartNo, watchEndNo]);

  const handleFormSubmit = (data) => {
    console.log("Add Letter Stock Data:", { ...data, count: calculatedCount });
    onSubmitSuccess?.({ ...data, count: calculatedCount });
    reset();
    close();
  };

  const handleClose = () => {
    reset();
    close();
  };

  return (
    <CustomDialog open={open} close={handleClose} widthX={520}>
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
            Täze hat stoky goşmak
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

        {/* Form Inputs */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            {/* Field 1: Partiýanyň ady */}
            <CustomTextField
              name="batchName"
              control={control}
              label="Partiýanyň ady"
              placeholder="Meselem: 2024-nji ýyl hats"
              required
            />

            {/* Field 2 & 3: Başlangyç ÝH № & Soňky ÝH № */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  name="startNo"
                  control={control}
                  label="Başlangyç ÝH №"
                  placeholder="0000001"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  name="endNo"
                  control={control}
                  label="Soňky ÝH №"
                  placeholder="0090000"
                  required
                />
              </Grid>
            </Grid>

            {/* Calculated Quantity Display Box */}
            <Box
              sx={{
                mt: 0.5,
                p: 2,
                borderRadius: "10px",
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.04)"
                  : "#F8FAFC",
                border: "1px solid",
                borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#F1F5F9",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: isDark ? "#CBD5E1" : "#475569",
                  fontSize: "0.875rem",
                }}
              >
                Umumy mukdary:{" "}
                <strong
                  style={{
                    color: isDark ? "#F8FAFC" : "#0F172A",
                    fontWeight: 700,
                  }}
                >
                  {calculatedCount}
                </strong>{" "}
                sany hat
              </Typography>
            </Box>
          </Box>

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

export default AddLetterStockModal;
