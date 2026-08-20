import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";
import ProfileLeftCol from "./ProfileLeftCol";
import ProfileRightCol from "./ProfileRightCol";
import EditSectionModal from "./EditSectionModal";
import { DEFAULT_PROFILE, STORAGE_KEY_PROFILE } from "./constants";

const ProfilePage = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }

    // Default template with current logged-in user name if available
    return {
      ...DEFAULT_PROFILE,
      fullName: user?.name || user?.fullName || DEFAULT_PROFILE.fullName,
      role: user?.position || user?.position_name || DEFAULT_PROFILE.role,
      contact: {
        ...DEFAULT_PROFILE.contact,
        email: user?.email || DEFAULT_PROFILE.contact.email,
        phone: user?.phone_number || DEFAULT_PROFILE.contact.phone,
      },
    };
  });

  const [activeModalSection, setActiveModalSection] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch {
      // Ignore write errors
    }
  }, [profile]);

  const handleUpdateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  const handleManualSave = () => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    toast.success("Profil maglumatlary üstünlikli ýatda saklandy!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${profile.fullName.replace(/\s+/g, "_")}_CV.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("CV faýly üstünlikli ýüklendi!");
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
            CV Builder & Profile
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
            Build, edit, and export your resume & profile
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
            Download Data
          </Button>

          <Button
            variant="contained"
            onClick={handlePrint}
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
            Print CV
          </Button>

          <Button
            variant="contained"
            onClick={handleManualSave}
            startIcon={<SaveRoundedIcon sx={{ fontSize: 18 }} />}
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
            Ýatda sakla
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

      {/* Dynamic Edit Modal */}
      <EditSectionModal
        open={Boolean(activeModalSection)}
        sectionKey={activeModalSection}
        profileData={profile}
        onClose={() => setActiveModalSection(null)}
        onSave={handleUpdateProfile}
      />

      {/* Print Stylesheet for Clean A4 CV Export */}
      <style>
        {`
          @media print {
            .no-print, header, nav, aside {
              display: none !important;
            }
            body {
              background: #ffffff !important;
              color: #000000 !important;
            }
            #profile-cv-page-container {
              padding: 0 !important;
              margin: 0 !important;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default ProfilePage;
