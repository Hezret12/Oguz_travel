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
  inline = false,
  sx = {},
}) => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const fullName = useWatch({ control, name: fullNameName });
  const resolvedTitle = title ?? t("columns.agent");
  const summaryText = fullName ? `${fullName}` : resolvedTitle;
  const resolvedFullNameLabel = fullNameLabel ?? t("columns.agentFullName");
  const resolvedPhoneNumberLabel = phoneNumberLabel ?? t("columns.phoneNumber");

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
          border: "1px solid",
          borderColor: "divider",
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
            backgroundColor: "action.hover",
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
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={
              inline
                ? {
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1,
                  }
                : {}
            }
          >
            <CustomTextField
              name={fullNameName}
              control={control}
              label={resolvedFullNameLabel}
            />

            <PhoneNumberField
              name={phoneNumberName}
              control={control}
              label={resolvedPhoneNumberLabel}
            />
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default AgentAccordion;
