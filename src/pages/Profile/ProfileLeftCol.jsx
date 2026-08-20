import { useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import toast from "react-hot-toast";
import { useLocale } from "../../hooks/useLocale";
import { getFileUrl } from "../../functions/generalHelpers";

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
        onAvatarChange?.(dataUrl, file);
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

  const hasContactInfo = Boolean(emailStr || phoneStr || locationStr || websiteStr);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "20px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
        transition: "all 0.2s ease-in-out",
      }}
    >
      {/* 1. Header & Identity Section */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          textAlign: "center",
          position: "relative",
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
              borderRadius: "8px",
              "&:hover": {
                color: "#0c8a7b",
                backgroundColor: "rgba(12, 138, 123, 0.08)",
              },
            }}
          >
            <EditOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Avatar with Camera Trigger */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2, mt: 0.5 }}>
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
                src={getFileUrl(profile.avatar_url || profile.avatarUrl)}
                alt={fullNameStr}
                sx={{
                  width: 104,
                  height: 104,
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                  border: "3px solid",
                  borderColor: "background.paper",
                  fontSize: "2.1rem",
                  fontWeight: 700,
                  bgcolor: "#0c8a7b",
                }}
              >
                {fullNameStr.charAt(0) || "U"}
              </Avatar>

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
                <PhotoCameraRoundedIcon sx={{ fontSize: 24 }} />
              </Box>
            </Box>
          </Tooltip>
        </Box>

        {/* Name & Role */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: "1.18rem",
            color: "text.primary",
            lineHeight: 1.25,
            mb: 0.5,
          }}
        >
          {fullNameStr || "—"}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
            fontSize: "0.88rem",
            mb: statusStr ? 1.5 : 0,
          }}
        >
          {roleStr || "—"}
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
      </Box>

      {/* Divider */}
      <Divider sx={{ borderColor: "divider", opacity: 0.6 }} />

      {/* 2. Contact Section */}
      <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              fontSize: "0.92rem",
              letterSpacing: "-0.2px",
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
                borderRadius: "8px",
                "&:hover": {
                  color: "#0c8a7b",
                  backgroundColor: "rgba(12, 138, 123, 0.08)",
                },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {hasContactInfo ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
            {emailStr && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(13, 148, 136, 0.15)"
                        : "rgba(14, 133, 132, 0.08)",
                    color: "#0c8a7b",
                    flexShrink: 0,
                  }}
                >
                  <MailOutlineRoundedIcon sx={{ fontSize: 17 }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.primary",
                    fontSize: "0.86rem",
                    wordBreak: "break-all",
                    fontWeight: 500,
                  }}
                >
                  {emailStr}
                </Typography>
              </Box>
            )}

            {phoneStr && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(13, 148, 136, 0.15)"
                        : "rgba(14, 133, 132, 0.08)",
                    color: "#0c8a7b",
                    flexShrink: 0,
                  }}
                >
                  <PhoneOutlinedIcon sx={{ fontSize: 17 }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.primary",
                    fontSize: "0.86rem",
                    fontWeight: 500,
                  }}
                >
                  {phoneStr}
                </Typography>
              </Box>
            )}

            {locationStr && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(13, 148, 136, 0.15)"
                        : "rgba(14, 133, 132, 0.08)",
                    color: "#0c8a7b",
                    flexShrink: 0,
                  }}
                >
                  <LocationOnOutlinedIcon sx={{ fontSize: 17 }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.primary",
                    fontSize: "0.86rem",
                    fontWeight: 500,
                  }}
                >
                  {locationStr}
                </Typography>
              </Box>
            )}

            {websiteStr && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(13, 148, 136, 0.15)"
                        : "rgba(14, 133, 132, 0.08)",
                    color: "#0c8a7b",
                    flexShrink: 0,
                  }}
                >
                  <LanguageRoundedIcon sx={{ fontSize: 17 }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.primary",
                    fontSize: "0.86rem",
                    fontWeight: 500,
                    wordBreak: "break-all",
                  }}
                >
                  {websiteStr}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.86rem",
              fontStyle: "italic",
            }}
          >
            {t("profile.noContact")}
          </Typography>
        )}
      </Box>

      {/* Divider */}
      <Divider sx={{ borderColor: "divider", opacity: 0.6 }} />

      {/* 3. Skills Section */}
      <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              fontSize: "0.92rem",
              letterSpacing: "-0.2px",
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
                borderRadius: "8px",
                "&:hover": {
                  color: "#0c8a7b",
                  backgroundColor: "rgba(12, 138, 123, 0.08)",
                },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {skills.length > 0 ? (
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
                  border: "1px solid",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.08)"
                      : "transparent",
                  px: 0.5,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.12)"
                        : "#e2e8f0",
                  },
                }}
              />
            ))}
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.86rem",
              fontStyle: "italic",
            }}
          >
            {t("profile.noSkills")}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default ProfileLeftCol;
