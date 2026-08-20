import { useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import toast from "react-hot-toast";
import { useLocale } from "../../hooks/useLocale";

const formatText = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val.fullName || val.name || val.shortName || val.title || "";
  }
  return String(val);
};

const ProfileLeftCol = ({ profile, onEditSection, onAvatarChange }) => {
  const { t } = useLocale();
  const fileInputRef = useRef(null);

  const contact = profile.contact || {};
  const skills = profile.skills || [];

  const handleDirectAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("profile.photoHint"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        onAvatarChange?.(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const fullNameStr = formatText(profile.full_name || profile.fullName);
  const roleStr = formatText(profile.role);
  const statusStr = formatText(profile.status);
  const emailStr = formatText(contact.email);
  const phoneStr = formatText(contact.phone);
  const locationStr = formatText(contact.location);
  const websiteStr = formatText(contact.website);
  const linkedinStr = formatText(contact.linkedin);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 1. Main Profile Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          p: 3.5,
          textAlign: "center",
          position: "relative",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
        }}
      >
        <Tooltip title={t("profile.editTitleBasic")} placement="top">
          <IconButton
            size="small"
            onClick={() => onEditSection("basic")}
            sx={{
              position: "absolute",
              top: 14,
              right: 14,
              color: "text.secondary",
              "&:hover": { color: "#0c8a7b", backgroundColor: "rgba(12, 138, 123, 0.08)" },
            }}
          >
            <EditOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Circular Avatar with Camera Hover Overlay */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleDirectAvatarUpload}
            accept="image/png, image/jpeg, image/webp"
            style={{ display: "none" }}
          />
          <Tooltip title={t("profile.changePhoto")} placement="bottom">
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                position: "relative",
                cursor: "pointer",
                borderRadius: "50%",
                "&:hover .avatar-upload-overlay": {
                  opacity: 1,
                },
              }}
            >
              <Avatar
                src={profile.avatar_url || profile.avatarUrl}
                alt={fullNameStr}
                sx={{
                  width: 110,
                  height: 110,
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                  border: "3px solid",
                  borderColor: "background.paper",
                  fontSize: "2.2rem",
                  fontWeight: 700,
                  bgcolor: "#0c8a7b",
                }}
              >
                {fullNameStr.charAt(0) || "U"}
              </Avatar>

              {/* Hover Camera Overlay */}
              <Box
                className="avatar-upload-overlay"
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  backgroundColor: "rgba(0, 0, 0, 0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  opacity: 0,
                  transition: "opacity 0.2s ease",
                }}
              >
                <PhotoCameraRoundedIcon sx={{ fontSize: 26 }} />
              </Box>
            </Box>
          </Tooltip>
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: "1.2rem",
            color: "text.primary",
            lineHeight: 1.2,
            mb: 0.5,
          }}
        >
          {fullNameStr}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
            fontSize: "0.9rem",
            mb: 2,
          }}
        >
          {roleStr}
        </Typography>

        {statusStr && (
          <Chip
            label={statusStr}
            size="small"
            sx={{
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(59, 130, 246, 0.15)"
                  : "rgba(239, 246, 255, 1)",
              color: "#2563eb",
              fontWeight: 700,
              fontSize: "0.75rem",
              borderRadius: "8px",
              px: 1,
              py: 0.25,
            }}
          />
        )}
      </Paper>

      {/* 2. Contact Information Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          p: 3,
          position: "relative",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              fontSize: "0.95rem",
            }}
          >
            {t("profile.contact")}
          </Typography>
          <Tooltip title={t("profile.editTitleContact")} placement="top">
            <IconButton
              size="small"
              onClick={() => onEditSection("contact")}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "#0c8a7b", backgroundColor: "rgba(12, 138, 123, 0.08)" },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
          {emailStr && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <MailOutlineRoundedIcon sx={{ fontSize: 18, color: "#0c8a7b" }} />
              <Typography variant="body2" sx={{ color: "text.primary", fontSize: "0.86rem" }}>
                {emailStr}
              </Typography>
            </Box>
          )}

          {phoneStr && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <PhoneOutlinedIcon sx={{ fontSize: 18, color: "#0c8a7b" }} />
              <Typography variant="body2" sx={{ color: "text.primary", fontSize: "0.86rem" }}>
                {phoneStr}
              </Typography>
            </Box>
          )}

          {locationStr && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 18, color: "#0c8a7b" }} />
              <Typography variant="body2" sx={{ color: "text.primary", fontSize: "0.86rem" }}>
                {locationStr}
              </Typography>
            </Box>
          )}

          {websiteStr && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <LanguageOutlinedIcon sx={{ fontSize: 18, color: "#0c8a7b" }} />
              <Typography variant="body2" sx={{ color: "text.primary", fontSize: "0.86rem" }}>
                {websiteStr}
              </Typography>
            </Box>
          )}

          {linkedinStr && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <LinkedInIcon sx={{ fontSize: 18, color: "#0c8a7b" }} />
              <Typography variant="body2" sx={{ color: "text.primary", fontSize: "0.86rem" }}>
                {linkedinStr}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* 3. Skills Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          p: 3,
          position: "relative",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              fontSize: "0.95rem",
            }}
          >
            {t("profile.skills")}
          </Typography>
          <Tooltip title={t("profile.editTitleSkills")} placement="top">
            <IconButton
              size="small"
              onClick={() => onEditSection("skills")}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "#0c8a7b", backgroundColor: "rgba(12, 138, 123, 0.08)" },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {skills.map((skill, idx) => (
            <Chip
              key={idx}
              label={skill}
              size="small"
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.06)"
                    : "#f1f5f9",
                color: "text.primary",
                fontWeight: 600,
                fontSize: "0.78rem",
                borderRadius: "8px",
                px: 0.5,
              }}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfileLeftCol;
