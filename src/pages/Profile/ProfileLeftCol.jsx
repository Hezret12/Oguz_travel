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
import { useLocale } from "../../hooks/useLocale";

const ProfileLeftCol = ({ profile, onEditSection }) => {
  const { t } = useLocale();
  const contact = profile.contact || {};
  const skills = profile.skills || [];

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

        {/* Circular Avatar */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Avatar
            src={profile.avatarUrl}
            alt={profile.fullName}
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
            {profile.fullName?.charAt(0) || "U"}
          </Avatar>
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
          {profile.fullName}
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
          {profile.role}
        </Typography>

        {profile.status && (
          <Chip
            label={profile.status}
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
          {contact.email && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <MailOutlineRoundedIcon sx={{ fontSize: 18, color: "#0c8a7b" }} />
              <Typography variant="body2" sx={{ color: "text.primary", fontSize: "0.86rem" }}>
                {contact.email}
              </Typography>
            </Box>
          )}

          {contact.phone && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <PhoneOutlinedIcon sx={{ fontSize: 18, color: "#0c8a7b" }} />
              <Typography variant="body2" sx={{ color: "text.primary", fontSize: "0.86rem" }}>
                {contact.phone}
              </Typography>
            </Box>
          )}

          {contact.location && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 18, color: "#0c8a7b" }} />
              <Typography variant="body2" sx={{ color: "text.primary", fontSize: "0.86rem" }}>
                {contact.location}
              </Typography>
            </Box>
          )}

          {contact.website && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <LanguageOutlinedIcon sx={{ fontSize: 18, color: "#0c8a7b" }} />
              <Typography variant="body2" sx={{ color: "text.primary", fontSize: "0.86rem" }}>
                {contact.website}
              </Typography>
            </Box>
          )}

          {contact.linkedin && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <LinkedInIcon sx={{ fontSize: 18, color: "#0c8a7b" }} />
              <Typography variant="body2" sx={{ color: "text.primary", fontSize: "0.86rem" }}>
                {contact.linkedin}
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
