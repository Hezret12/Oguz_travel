import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../hooks/useLocale";
import { useGet } from "../../hooks/CRUD/useGet";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { getUserProfileApi } from "../../api/queries/getters";
import { updateUserProfileApi } from "../../api/queries/patch";
import ProfileLeftCol from "./ProfileLeftCol";
import ProfileRightCol from "./ProfileRightCol";
import EditSectionModal from "./EditSectionModal";
import CVPrintPreviewModal from "./CVPrintPreviewModal";
import { DEFAULT_PROFILE, STORAGE_KEY_PROFILE } from "./constants";

const ProfilePage = () => {
  const { user } = useAuth();
  const { t } = useLocale();

  const userKey = user?.guid || user?.id || user?.phone_number || "me";
  const userStorageKey = `${STORAGE_KEY_PROFILE}_${userKey}`;

  // Local state initialized with user-specific fallback
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(userStorageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }

    return {
      ...DEFAULT_PROFILE,
      full_name: user?.name || user?.fullName || DEFAULT_PROFILE.full_name,
      role: user?.position || user?.position_name || DEFAULT_PROFILE.role,
      contact: {
        ...DEFAULT_PROFILE.contact,
        email: user?.email || DEFAULT_PROFILE.contact.email,
        phone: user?.phone_number || DEFAULT_PROFILE.contact.phone,
      },
    };
  });

  const [activeModalSection, setActiveModalSection] = useState(null);
  const [cvPrintOpen, setCvPrintOpen] = useState(false);

  // 1. Fetch Profile from Backend via useGet scoped to current user
  const { data: serverProfileData, isLoading: isProfileLoading } = useGet({
    apiFn: getUserProfileApi,
    key: ["userProfile", userKey],
    options: {
      retry: false,
    },
  });

  // When server data arrives, merge into local state
  useEffect(() => {
    if (serverProfileData && typeof serverProfileData === "object" && Object.keys(serverProfileData).length > 0) {
      setProfile((prev) => ({
        ...prev,
        ...serverProfileData,
        full_name: serverProfileData.full_name || serverProfileData.fullName || prev.full_name,
        avatar_url: serverProfileData.avatar_url || serverProfileData.avatarUrl || prev.avatar_url,
        personal_summary:
          serverProfileData.personal_summary ||
          serverProfileData.personalSummary ||
          prev.personal_summary,
        work_experience:
          serverProfileData.work_experience ||
          serverProfileData.workExperience ||
          prev.work_experience,
        references_text:
          serverProfileData.references_text ||
          (serverProfileData.references || []).map((r) => r.text || "").join("\n") ||
          prev.references_text,
      }));
    }
  }, [serverProfileData]);

  // 2. Update Profile to Backend via useUpdate
  const { mutate: mutateUpdateProfile, isPending: isUpdating } = useUpdate({
    apiFn: updateUserProfileApi,
    key: ["userProfile", userKey],
    idKey: "guid",
    onSuccessUpdate: () => {
      toast.success(t("profile.saveSuccess"));
    },
  });

  // Sync to user-scoped localStorage
  useEffect(() => {
    try {
      localStorage.setItem(userStorageKey, JSON.stringify(profile));
    } catch {
      // Ignore write errors
    }
  }, [profile, userStorageKey]);

  const handleUpdateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    try {
      mutateUpdateProfile(updatedProfile);
    } catch {
      // Local fallback
    }
  };

  const handleManualSave = () => {
    localStorage.setItem(userStorageKey, JSON.stringify(profile));
    try {
      mutateUpdateProfile(profile);
    } catch {
      // Local fallback
    }
    toast.success(t("profile.saveSuccess"));
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${(profile.full_name || profile.fullName || "CV").replace(/\s+/g, "_")}_CV.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(t("profile.downloadSuccess"));
  };

  return (
    <Box
      id="profile-cv-page-container"
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        pb: 6,
      }}
    >
      {/* Top Header Toolbar */}
      <Box
        className="no-print"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          py: 2,
          px: { xs: 0.5, sm: 1 },
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              fontSize: { xs: "1.3rem", sm: "1.55rem" },
              letterSpacing: "-0.3px",
              lineHeight: 1.2,
            }}
          >
            {t("profile.cvBuilder")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              fontSize: "0.86rem",
              mt: 0.25,
            }}
          >
            {t("profile.cvBuilderSubtitle")}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={handleDownloadJson}
            startIcon={<DownloadRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.88rem",
              px: 2,
              py: 0.75,
              borderColor: "divider",
              color: "text.primary",
              backgroundColor: "background.paper",
              "&:hover": {
                borderColor: "text.primary",
                backgroundColor: "action.hover",
              },
            }}
          >
            {t("profile.downloadData")}
          </Button>

          <Button
            variant="contained"
            onClick={() => setCvPrintOpen(true)}
            startIcon={<PrintRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.88rem",
              px: 2.25,
              py: 0.75,
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
                boxShadow: "0 4px 14px rgba(14, 133, 132, 0.36)",
              },
            }}
          >
            {t("profile.printCv")}
          </Button>

          <Button
            variant="contained"
            onClick={handleManualSave}
            disabled={isUpdating}
            startIcon={
              isUpdating ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveRoundedIcon sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.88rem",
              px: 2.25,
              py: 0.75,
              bgcolor: "#0f172a",
              color: "#ffffff",
              "&:hover": { bgcolor: "#1e293b" },
            }}
          >
            {t("save")}
          </Button>
        </Box>
      </Box>

      {/* Main Two-Column Profile & CV Layout */}
      <Grid container spacing={3} sx={{ px: { xs: 0.5, sm: 1 } }}>
        {/* Left Column (Avatar, Contact, Skills) */}
        <Grid size={{ xs: 12, md: 4.2, lg: 3.8 }}>
          <ProfileLeftCol
            profile={profile}
            onEditSection={(section) => setActiveModalSection(section)}
            onAvatarChange={(newAvatarUrl) => {
              handleUpdateProfile({ ...profile, avatar_url: newAvatarUrl });
            }}
          />
        </Grid>

        {/* Right Column (Summary, Experience, Education, Certifications, Languages, References) */}
        <Grid size={{ xs: 12, md: 7.8, lg: 8.2 }}>
          <ProfileRightCol
            profile={profile}
            onEditSection={(section) => setActiveModalSection(section)}
          />
        </Grid>
      </Grid>

      {/* Dynamic Section Edit Modal */}
      <EditSectionModal
        open={Boolean(activeModalSection)}
        sectionKey={activeModalSection}
        profileData={profile}
        isSaving={isUpdating}
        onClose={() => setActiveModalSection(null)}
        onSave={handleUpdateProfile}
      />

      {/* Professional A4 CV Print & PDF Preview Modal */}
      <CVPrintPreviewModal
        open={cvPrintOpen}
        onClose={() => setCvPrintOpen(false)}
        profile={profile}
      />
    </Box>
  );
};

export default ProfilePage;
