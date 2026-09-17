import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { CalendarPlus, Lock } from "lucide-react";
import { useLocale } from "../../../../hooks/useLocale";

// Empty-month placeholder: one click creates a row for every employee.
const SalaryGenerateState = ({ monthLabel, locked, isPending, onGenerate }) => {
  const { t } = useLocale();

  return (
    <Box
      sx={{
        py: 8,
        px: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "action.hover",
          color: locked ? "text.secondary" : "primary.main",
        }}
      >
        {locked ? <Lock size={26} /> : <CalendarPlus size={26} />}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {t("salary.generateTitle", { month: monthLabel })}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440 }}>
        {locked ? t("salary.lockedHint") : t("salary.generateDescription")}
      </Typography>
      {!locked && (
        <Button
          variant="contained"
          disableElevation
          onClick={onGenerate}
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : <CalendarPlus size={18} />}
          sx={{ mt: 1, borderRadius: "10px", textTransform: "none", fontWeight: 600, px: 3, height: 42 }}
        >
          {t("salary.generateButton", { month: monthLabel })}
        </Button>
      )}
    </Box>
  );
};

export default SalaryGenerateState;
