import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import ProfileLeftCol from "../Profile/ProfileLeftCol";
import ProfileRightCol from "../Profile/ProfileRightCol";
import CVPrintPreviewModal from "../Profile/CVPrintPreviewModal";
import { EMPTY_PROFILE } from "../Profile/constants";
import { useLocale } from "../../hooks/useLocale";
import { useGet } from "../../hooks/CRUD/useGet";
import { getOneUserProfileApi } from "../../api/queries/getters";

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

const UserProfileModal = ({
  open,
  close,
  onClose,
  user,
}) => {
  const { t, selectedLang } = useLocale();
  const [cvPrintOpen, setCvPrintOpen] = useState(false);

  const handleClose = () => {
    if (close) close();
    else if (onClose) onClose();
  };

  const userGuid = user?.guid;

  const { data: serverProfileData, isLoading, isError } = useGet({
    apiFn: () => getOneUserProfileApi(userGuid),
    key: ["userProfile", userGuid],
    options: {
      enabled: Boolean(open && userGuid),
      staleTime: 1000 * 60 * 5,
    },
  });

  const profile = useMemo(() => {
    let raw = {};
    if (serverProfileData && typeof serverProfileData === "object") {
      raw = serverProfileData.data && typeof serverProfileData.data === "object" && !Array.isArray(serverProfileData.data)
        ? serverProfileData.data
        : serverProfileData;
    } else if (user && typeof user === "object") {
      raw = user;
    }

    const emp = raw.employee || user?.employee || {};
    const contact = raw.contact || emp.contact || user?.contact || {};

    let roleStr = "";
    if (Array.isArray(emp.positions) && emp.positions.length > 0) {
      roleStr = emp.positions
        .map((p) => selectedLang(p?.name) || extractPlainString(p?.name))
        .filter(Boolean)
        .join(", ");
    } else if (Array.isArray(emp.position) && emp.position.length > 0) {
      roleStr = emp.position
        .map((p) => selectedLang(p?.name) || extractPlainString(p?.name))
        .filter(Boolean)
        .join(", ");
    } else if (emp.position) {
      roleStr =
        selectedLang(emp.position?.name) ||
        extractPlainString(emp.position?.name || emp.position);
    } else if (raw.role || user?.role) {
      roleStr = extractPlainString(raw.role || user?.role);
    } else if (user?.isAdmin != null) {
      roleStr = user.isAdmin ? "Admin" : "User";
    }

    const officeStr =
      selectedLang(emp.office?.fullName) ||
      extractPlainString(emp.office?.fullName || emp.office?.name || emp.office);

    const nameStr =
      extractPlainString(raw.full_name || raw.fullName) ||
      extractPlainString(emp.fullName || emp.name) ||
      extractPlainString(user?.fullName || user?.name || user?.phone_number);

    return {
      ...EMPTY_PROFILE,
      ...raw,
      guid: raw.guid || user?.guid || emp.guid || "",
      full_name: nameStr,
      role: roleStr,
      status: user?.isActive !== undefined ? (user.isActive ? "Active" : "Inactive") : extractPlainString(raw.status || user?.status || emp.status),
      avatar_url: extractPlainString(raw.avatar_url || raw.avatarUrl || emp.avatar_url || emp.avatarUrl || user?.avatar_url || user?.avatarUrl),
      contact: {
        email: extractPlainString(contact.email || emp.gmail || emp.email || user?.email || user?.gmail),
        phone: extractPlainString(contact.phone || user?.phone_number || emp.phone_number || user?.phone || emp.phone),
        location: extractPlainString(contact.location || emp.address || user?.address || officeStr),
        website: extractPlainString(contact.website),
        linkedin: extractPlainString(contact.linkedin),
      },
      skills: Array.isArray(raw.skills) ? raw.skills : (Array.isArray(emp.skills) ? emp.skills : (Array.isArray(user?.skills) ? user.skills : [])),
      personal_summary: extractPlainString(
        raw.personal_summary || raw.personalSummary || emp.personal_summary || emp.personalSummary || user?.personal_summary || user?.personalSummary
      ),
      work_experience: Array.isArray(raw.work_experience || raw.workExperience)
        ? raw.work_experience || raw.workExperience
        : (Array.isArray(emp.work_experience || emp.workExperience) ? emp.work_experience || emp.workExperience : (Array.isArray(user?.work_experience) ? user.work_experience : [])),
      education: Array.isArray(raw.education) ? raw.education : (Array.isArray(emp.education) ? emp.education : (Array.isArray(user?.education) ? user.education : [])),
      languages: Array.isArray(raw.languages) ? raw.languages : (Array.isArray(emp.languages) ? emp.languages : (Array.isArray(user?.languages) ? user.languages : [])),
    };
  }, [serverProfileData, user, selectedLang]);

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
            title={`${profile.full_name} - ${t("profile.title")}`}
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

      <CVPrintPreviewModal
        open={cvPrintOpen}
        onClose={() => setCvPrintOpen(false)}
        profile={profile}
      />
    </>
  );
};

export default UserProfileModal;
