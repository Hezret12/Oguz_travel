import { memo } from "react";
import { Box, Typography, Paper, FormControl, Select, MenuItem, alpha, useTheme } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";

const ReportHeader = ({
  selectedDate,
  onDateChange,
  selectedQuarter,
  onQuarterChange,
  teal,
  paperSx,
  selectSx,
}) => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const monthLabel = dayjs(selectedDate).format("MMMM YYYY");

  return (
    <Paper sx={{ ...paperSx, p: { xs: 2, sm: 2.5 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              backgroundColor: alpha(teal, 0.15),
              color: teal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AssessmentRoundedIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: isDark ? "#FFF" : "#0F172A",
                lineHeight: 1.2,
              }}
            >
              {t("report.turkishAirlines.title")}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: isDark ? "rgba(255,255,255,0.5)" : "#64748B",
                fontSize: 13,
                mt: 0.2,
                textTransform: "capitalize",
              }}
            >
              {monthLabel} • {t("report.turkishAirlines.subTitle")}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          {/* Day.js & MUI X DatePicker for Month & Year */}
          <DatePicker
            views={["year", "month"]}
            value={selectedDate}
            onChange={(newValue) => {
              if (newValue && newValue.isValid()) {
                onDateChange(newValue);
              }
            }}
            format="MMMM YYYY"
            slotProps={{
              textField: {
                size: "small",
                sx: {
                  ...selectSx,
                  minWidth: 170,
                  "& .MuiInputBase-input": {
                    py: 1,
                    px: 1.5,
                    fontSize: 13.5,
                    fontWeight: 600,
                    textTransform: "capitalize",
                  },
                },
              },
            }}
          />

          {/* Quarter Select (1, 2, 3, 4) */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={selectedQuarter ?? ""}
              onChange={(e) => onQuarterChange(e.target.value)}
              displayEmpty
              IconComponent={KeyboardArrowDownIcon}
              sx={{
                ...selectSx,
                height: 40,
                fontSize: 13.5,
                fontWeight: 600,
                "& .MuiSelect-select": {
                  py: 1,
                  px: 1.5,
                  display: "flex",
                  alignItems: "center",
                },
              }}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: "12px",
                    mt: 0.5,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  },
                },
              }}
            >
              <MenuItem value="">
                <em>{t("report.turkishAirlines.allQuarters") || "Tüm Çeyrekler"}</em>
              </MenuItem>
              <MenuItem value={1}>
                {t("report.turkishAirlines.q1") || "1. Çeyrek (Q1)"}
              </MenuItem>
              <MenuItem value={2}>
                {t("report.turkishAirlines.q2") || "2. Çeyrek (Q2)"}
              </MenuItem>
              <MenuItem value={3}>
                {t("report.turkishAirlines.q3") || "3. Çeyrek (Q3)"}
              </MenuItem>
              <MenuItem value={4}>
                {t("report.turkishAirlines.q4") || "4. Çeyrek (Q4)"}
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Paper>
  );
};

export default memo(ReportHeader);
