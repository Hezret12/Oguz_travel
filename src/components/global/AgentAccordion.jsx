import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useWatch } from "react-hook-form";
import CustomTextField from "../CustomTextField";
import PhoneNumberField from "../inputs/PhoneNumber";
import { useLocale } from "../../hooks/useLocale";

const AgentAccordion = ({
  control,
  fullNameName = "agentFullName",
  phoneNumberName = "agentPhoneNumber",
  title,
  fullNameLabel,
  phoneNumberLabel,
  defaultExpanded = false,
  sx = {},
}) => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const fullName = useWatch({ control, name: fullNameName });
  const summaryText = fullName
    ? `${fullName}`
    : t("agent.summary");

  const resolvedTitle = title ?? t("agentForm.title");

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="body2"
        sx={{
          mb: 0.75,
          fontWeight: 600,
          fontSize: "0.875rem",
          color: "text.primary",
        }}
      >
        {resolvedTitle}
      </Typography>

      <Accordion
        disableGutters
        size="small"
        defaultExpanded={defaultExpanded}
        sx={{
          width: "100%",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
          borderRadius: "10px !important",
          overflow: "hidden",
          boxShadow: "none",
          backgroundColor: "background.paper",
          "&:before": { display: "none" },
          ...sx,
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}
          sx={{
            minHeight: 44,
            height: 44,
            px: 1.5,
            py: 1,
            backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
            "&.Mui-expanded": {
              minHeight: 44,
            },
            "& .MuiAccordionSummary-content": {
              minWidth: 0,
              alignItems: "center",
              margin: 0,
            },
            "& .MuiAccordionSummary-content.Mui-expanded": {
              margin: 0,
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ alignItems: "center", minWidth: 0 }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
                backgroundColor: isDark
                  ? "rgba(37,99,235,0.18)"
                  : "rgba(37,99,235,0.08)",
                flexShrink: 0,
              }}
            >
              <PersonOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>

            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {summaryText}
            </Typography>
          </Stack>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            p: 1,
            borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#e2e8f0"}`,
          }}
        >
          <Box>
            <CustomTextField
              name={fullNameName}
              control={control}
              label={
                fullNameLabel ?? t("agentForm.fullName", "Agent Full Name")
              }
            />

            <PhoneNumberField
              name={phoneNumberName}
              control={control}
              label={
                phoneNumberLabel ?? t("agentForm.phoneNumber", "Phone Number")
              }
            />
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default AgentAccordion;
