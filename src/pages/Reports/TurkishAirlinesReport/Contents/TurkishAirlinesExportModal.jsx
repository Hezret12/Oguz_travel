import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import toast from "react-hot-toast";
import dayjs from "dayjs";

import { useLocale } from "../../../../hooks/useLocale";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import FooterButton from "../../../../components/Dialog/FooterButton";
import { exportTurkishAirlinesExcel } from "../functions/exportTurkishAirlinesExcel";

const TK_MONTHS = [
  "Ýanwar",
  "Fewral",
  "Mart",
  "Aprel",
  "Maý",
  "Iýun",
  "Iýul",
  "Awgust",
  "Sentýabr",
  "Oktýabr",
  "Noýabr",
  "Dekabr",
];

const TurkishAirlinesExportModal = ({
  open,
  close,
  selectedDate,
  daysInMonth,
  offices = [],
  rows = [],
  grandTotal = {},
  findFooter,
}) => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [isExporting, setIsExporting] = useState(false);

  const d = dayjs.isDayjs(selectedDate) ? selectedDate : dayjs(selectedDate);
  const validDate = d.isValid() ? d : dayjs();
  const monthNameTk = TK_MONTHS[validDate.month()] || "Awgust";
  const yearStr = validDate.format("YYYY");
  const numDays = daysInMonth || validDate.daysInMonth();
  const fileNamePreview = `Turk_howa_yollary_${monthNameTk}_${yearStr}_Hasabaty.xlsx`;

  const totalQuoted =
    Number(grandTotal?.month_total_quoted ?? grandTotal?.total_quoted) ||
    rows.reduce((acc, curr) => acc + Number(curr.total || 0), 0);

  const totalBase =
    Number(grandTotal?.month_total_base ?? grandTotal?.total_base) ||
    rows.reduce((acc, curr) => acc + Number(curr.totalBase || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isExporting) return;

    setIsExporting(true);
    try {
      await exportTurkishAirlinesExcel({
        selectedDate: validDate,
        daysInMonth: numDays,
        offices,
        rows,
        grandTotal,
        findFooter,
      });
      toast.success(t("report.turkishAirlines.exportSuccess", "Hasabat üstünlikli ýüklendi"));
      close();
    } catch (err) {
      console.error("Turkish Airlines Excel export error:", err);
      toast.error(t("common.exportError", "Eksport edilende ýalňyşlyk ýüze çykdy"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <CustomDialog open={open} close={close} widthX={560}>
      <CustomDialogHeader
        title={t("report.turkishAirlines.exportModalTitle", "Turkish Airlines Hasabatyny Eksport Etmek")}
      />
      <CustomForm onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2, p: 0.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13.5px" }}>
            {t(
              "report.turkishAirlines.exportModalDesc",
              "Seçilen döwür üçin Turkish Airlines Excel hasabatyny ýükläň."
            )}
          </Typography>

          {/* Period & File Summary Card */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: "10px",
              borderColor: "divider",
              bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  {t("report.turkishAirlines.exportPeriod", "Hasabat Döwri")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.5 }}>
                  <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: "#0D9488" }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {monthNameTk} {yearStr} ({numDays} {t("report.turkishAirlines.day", "gün")})
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  {t("report.turkishAirlines.exportFileFormat", "Faýl Formatı")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.5 }}>
                  <DescriptionRoundedIcon sx={{ fontSize: 18, color: "#16A34A" }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                    Microsoft Excel (.xlsx)
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Financial Summary */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pt: 1.5,
                borderTop: (th) => `1px dashed ${th.palette.divider}`,
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                  {t("report.turkishAirlines.quotedPrice", "Jemi Satyş")}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: "text.primary" }}>
                  ${totalQuoted.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                  {t("report.turkishAirlines.baseFare", "Jemi Esasy Baha (BF)")}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: "#DC2626" }}>
                  ${totalBase.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Included Offices Chips */}
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mb: 0.8, display: "block" }}>
              {t("report.turkishAirlines.exportOffices", "Gatnaşýan Ofisler")} ({offices.length})
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
              {offices.map((off) => (
                <Chip
                  key={off.short}
                  size="small"
                  label={off.full || off.short}
                  sx={{
                    fontWeight: 600,
                    fontSize: "12px",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  }}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          {/* Filename display */}
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mb: 0.4, display: "block" }}>
              {t("report.turkishAirlines.exportFileName", "Faýl Ady")}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                color: "text.primary",
                bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                px: 1.2,
                py: 0.6,
                borderRadius: "6px",
                display: "inline-block",
              }}
            >
              {fileNamePreview}
            </Typography>
          </Box>
        </Box>

        <FooterButton
          loading={isExporting}
          onCancel={close}
          saveText={t("report.turkishAirlines.exportButton", "Excel Ýüklemek")}
          cancelText={t("cancel", "Ýatyr")}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default TurkishAirlinesExportModal;
