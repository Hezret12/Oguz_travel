import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import ProfileLeftCol from "../../Profile/ProfileLeftCol";
import ProfileRightCol from "../../Profile/ProfileRightCol";
import CVPrintPreviewModal from "../../Profile/CVPrintPreviewModal";
import { EMPTY_PROFILE } from "../../Profile/constants";
import { useLocale } from "../../../hooks/useLocale";

const extractPlainString = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return (
      val.tk ||
      val.en ||
      val.ru ||
      val.fullName ||
      val.name ||
      val.title ||
      val.shortName ||
      ""
    );
  }
  return String(val);
};

const EmployeeProfileModal = ({
  open,
  close,
  onClose,
  employee,
  isLoading = false,
  isError = false,
}) => {
  const { t, selectedLang } = useLocale();
  const [cvPrintOpen, setCvPrintOpen] = useState(false);

  const handleClose = () => {
    if (close) close();
    else if (onClose) onClose();
  };

  const profile = useMemo(() => {
    if (!employee) return EMPTY_PROFILE;

    const contact = employee.contact || {};

    let roleStr = "";
    if (Array.isArray(employee.positions) && employee.positions.length > 0) {
      roleStr = employee.positions
        .map((p) => selectedLang(p?.name) || extractPlainString(p?.name))
        .filter(Boolean)
        .join(", ");
    } else if (Array.isArray(employee.position) && employee.position.length > 0) {
      roleStr = employee.position
        .map((p) => selectedLang(p?.name) || extractPlainString(p?.name))
        .filter(Boolean)
        .join(", ");
    } else if (employee.position) {
      roleStr =
        selectedLang(employee.position?.name) ||
        extractPlainString(employee.position?.name || employee.position);
    }

    const officeStr =
      selectedLang(employee.office?.fullName) ||
      extractPlainString(employee.office?.fullName || employee.office?.name || employee.office);

    return {
      ...EMPTY_PROFILE,
      guid: employee.guid || "",
      full_name: extractPlainString(employee.fullName || employee.full_name || employee.name),
      role: roleStr,
      status: extractPlainString(employee.status),
      avatar_url: extractPlainString(employee.avatar_url || employee.avatarUrl || employee.avatar),
      contact: {
        email: extractPlainString(contact.email || employee.gmail || employee.email),
        phone: extractPlainString(contact.phone || employee.phone_number || employee.phone),
        location: extractPlainString(contact.location || employee.address || officeStr),
        website: extractPlainString(contact.website),
        linkedin: extractPlainString(contact.linkedin),
      },
      skills: Array.isArray(employee.skills) ? employee.skills : [],
      personal_summary: extractPlainString(
        employee.personal_summary || employee.personalSummary || employee.summary
      ),
      work_experience: Array.isArray(employee.work_experience || employee.workExperience)
        ? employee.work_experience || employee.workExperience
        : [],
      education: Array.isArray(employee.education) ? employee.education : [],
      languages: Array.isArray(employee.languages) ? employee.languages : [],
    };
  }, [employee, selectedLang]);

  if (!open) return null;

  return (
    <>
      <CustomDialog open={open} close={handleClose} widthX={1050}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            pr: 5,
            mb: 2.5,
          }}
        >
          <CustomDialogHeader
            variant="h5"
            title={`${profile.full_name || t("columns.fullName")} — ${t("profile.title")}`}
          />

          <Button
            variant="contained"
            size="small"
            onClick={() => setCvPrintOpen(true)}
            startIcon={<PrintRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: "9px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.82rem",
              px: 2,
              py: 0.6,
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)"
                  : "#0E8584",
              border: "0.5px solid #2CA7A6",
              color: "#ffffff",
              boxShadow: "0 2px 8px rgba(14, 133, 132, 0.28)",
              transition: "all 0.2s ease",
              "&:hover": {
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #0B7F74 0%, #0891B2 100%)"
                    : "#0C7776",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(14, 133, 132, 0.36)",
              },
            }}
          >
            {t("profile.printCv")}
          </Button>
        </Box>

        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "320px",
              width: "100%",
            }}
          >
            <CircularProgress
              size={38}
              thickness={4}
              sx={{ color: "primary.main" }}
            />
          </Box>
        ) : isError ? (
          <Box sx={{ py: 4, px: 2 }}>
            <Alert severity="error" sx={{ borderRadius: "10px" }}>
              {t("profile.fetchFailed")}
            </Alert>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ pb: 1 }}>
            <Grid size={{ xs: 12, md: 4.2, lg: 3.8 }}>
              <ProfileLeftCol profile={profile} readOnly={true} />
            </Grid>

            <Grid size={{ xs: 12, md: 7.8, lg: 8.2 }}>
              <ProfileRightCol profile={profile} readOnly={true} />
            </Grid>
          </Grid>
        )}
      </CustomDialog>

      {/* CV Print Preview Modal */}
      <CVPrintPreviewModal
        open={cvPrintOpen}
        onClose={() => setCvPrintOpen(false)}
        profile={profile}
      />
    </>
  );
};

export default EmployeeProfileModal;
