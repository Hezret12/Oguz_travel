import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { CalendarDays, CalendarPlus, Copy, Lock, UserPlus, Users } from "lucide-react";
import { useLocale } from "../../../../hooks/useLocale";

// What "start the month" does, in the order the server does it.
const STEPS = [
  { icon: Users, key: "salary.generateStepEmployees" },
  { icon: Copy, key: "salary.generateStepCarry" },
  { icon: CalendarDays, key: "salary.generateStepDays" },
  // The server only auto-adds new hires to the running month.
  { icon: UserPlus, key: "salary.generateStepAuto", currentMonthOnly: true },
];

// Empty-month placeholder: one click creates a row for every employee.
const SalaryGenerateState = ({ monthLabel, locked, isCurrentMonth, isPending, onGenerate }) => {
  const { t } = useLocale();
  const steps = STEPS.filter((step) => isCurrentMonth || !step.currentMonthOnly);

  return (
    <Box sx={{ py: { xs: 5, md: 7 }, px: 2, display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 520,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: locked ? "warning.main" : "text.primary",
            backgroundColor: "action.hover",
            border: "1px solid",
            borderColor: "divider",
            mb: 2.5,
          }}
        >
          {locked ? <Lock size={28} /> : <CalendarPlus size={28} />}
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {locked
            ? t("salary.lockedTitle", { month: monthLabel })
            : t("salary.generateTitle", { month: monthLabel })}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 420 }}>
          {locked ? t("salary.lockedHint") : t("salary.generateDescription")}
        </Typography>

        {!locked && (
          <>
            <Box
              component="ul"
              sx={{
                listStyle: "none",
                m: 0,
                mt: 3,
                p: 0.5,
                width: "100%",
                textAlign: "left",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "14px",
                backgroundColor: "background.paper",
              }}
            >
              {steps.map(({ icon: Icon, key }) => (
                <Box
                  component="li"
                  key={key}
                  sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1.1 }}
                >
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 32,
                      height: 32,
                      borderRadius: "9px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "text.secondary",
                      backgroundColor: "action.hover",
                    }}
                  >
                    <Icon size={16} />
                  </Box>
                  <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.45 }}>
                    {t(key)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Button
              variant="contained"
              disableElevation
              onClick={onGenerate}
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : <CalendarPlus size={18} />}
              sx={{
                mt: 3,
                minWidth: 220,
                height: 44,
                px: 3,
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                // Monochrome: inverted text colour instead of the brand green.
                color: "background.paper",
                backgroundColor: "text.primary",
                "&:hover": { backgroundColor: "text.primary", opacity: 0.88 },
                "&.Mui-disabled": {
                  color: "background.paper",
                  backgroundColor: "text.primary",
                  opacity: 0.6,
                },
              }}
            >
              {isPending ? t("salary.generating") : t("salary.generateButton", { month: monthLabel })}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default SalaryGenerateState;
