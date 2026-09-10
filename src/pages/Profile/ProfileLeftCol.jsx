import { useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Button,
  Badge,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
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

const ProfileLeftCol = ({ profile, onEditSection, onAvatarChange, onPrintCv, readOnly = false }) => {
  const { t } = useLocale();
  const fileInputRef = useRef(null);
  const [copiedKey, setCopiedKey] = useState(null);

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

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(t("profile.copied"));
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const fullNameStr = formatText(profile.full_name || profile.fullName);
  const roleStr = formatText(profile.role);
  const statusStr = formatText(profile.status);
  const emailStr = formatText(contact.email);
  const phoneStr = formatText(contact.phone);
  const locationStr = formatText(contact.location);
  const websiteStr = formatText(contact.website);
  const linkedinStr = formatText(contact.linkedin);

  const hasContactInfo = Boolean(emailStr || phoneStr || locationStr || websiteStr || linkedinStr);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "20px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        overflow: "hidden",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
        transition: "box-shadow 0.25s ease",
        "&:hover": {
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.07)",
        },
      }}
    >
      {/* 1. Header & Identity Section */}
      <Box
        sx={{
          p: { xs: 3, sm: 3.5 },
          textAlign: "center",
          position: "relative",
          background: (theme) =>
            `radial-gradient(ellipse at top, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 75%)`,
        }}
      >
        {!readOnly && Boolean(onEditSection) && (
          <Tooltip title={t("profile.editTitleBasic")} placement="top">
            <IconButton
              size="small"
              onClick={() => onEditSection("basic")}
              sx={{
                position: "absolute",
                top: 14,
                right: 14,
                color: "text.secondary",
                borderRadius: "10px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                "&:hover": {
                  color: "primary.main",
                  borderColor: "primary.main",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        )}

        {/* Avatar with Camera Overlay & Presence Badge */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2.25, mt: 0.5 }}>
          {!readOnly && Boolean(onAvatarChange) ? (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleDirectAvatarUpload}
                accept="image/png, image/jpeg, image/webp"
                style={{ display: "none" }}
              />
              <Tooltip title={t("profile.changePhoto")} placement="bottom">
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        bgcolor: "#10B981",
                        border: "2.5px solid",
                        borderColor: "background.paper",
                        boxShadow: "0 0 0 1px rgba(16, 185, 129, 0.25)",
                      }}
                    />
                  }
                >
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      borderRadius: "50%",
                      p: "3.5px",
                      background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(
                          theme.palette.primary.main,
                          0.25
                        )})`,
                      transition: "transform 0.2s ease",
                      "&:hover": {
                        transform: "scale(1.02)",
                      },
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
                        border: "3px solid",
                        borderColor: "background.paper",
                        fontSize: "2.2rem",
                        fontWeight: 800,
                        bgcolor: "primary.main",
                        color: "#ffffff",
                      }}
                    >
                      {fullNameStr.charAt(0) || "U"}
                    </Avatar>

                    <Box
                      className="avatar-upload-overlay"
                      sx={{
                        position: "absolute",
                        inset: "3.5px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0, 0, 0, 0.48)",
                        backdropFilter: "blur(2px)",
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
                </Badge>
              </Tooltip>
            </>
          ) : (
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    bgcolor: "#10B981",
                    border: "2.5px solid",
                    borderColor: "background.paper",
                  }}
                />
              }
            >
              <Box
                sx={{
                  borderRadius: "50%",
                  p: "3px",
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )})`,
                }}
              >
                <Avatar
                  src={getFileUrl(profile.avatar_url || profile.avatarUrl)}
                  alt={fullNameStr}
                  sx={{
                    width: 104,
                    height: 104,
                    border: "3px solid",
                    borderColor: "background.paper",
                    fontSize: "2.2rem",
                    fontWeight: 800,
                    bgcolor: "primary.main",
                    color: "#ffffff",
                  }}
                >
                  {fullNameStr.charAt(0) || "U"}
                </Avatar>
              </Box>
            </Badge>
          )}
        </Box>

        {/* Name, Role & Status */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: "1.22rem",
            color: "text.primary",
            lineHeight: 1.25,
            letterSpacing: "-0.3px",
            mb: 0.6,
          }}
        >
          {fullNameStr || "—"}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            fontSize: "0.9rem",
            mb: 1.5,
          }}
        >
          {roleStr || "—"}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 0.75 }}>
          {statusStr ? (
            <Chip
              label={statusStr}
              size="small"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                fontWeight: 700,
                fontSize: "0.76rem",
                borderRadius: "8px",
                px: 0.75,
                height: 24,
                border: "1px solid",
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              }}
            />
          ) : (
            <Chip
              label={t("profile.activeStatus")}
              size="small"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                color: "success.main",
                fontWeight: 700,
                fontSize: "0.76rem",
                borderRadius: "8px",
                px: 0.75,
                height: 24,
                border: "1px solid",
                borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
              }}
            />
          )}
        </Box>

        {Boolean(onPrintCv) && (
          <Button
            variant="contained"
            fullWidth
            onClick={onPrintCv}
            startIcon={<PrintRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              mt: 2.5,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.88rem",
              py: 1,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(
                  theme.palette.primary.main,
                  0.82
                )} 100%)`,
              color: "#ffffff",
              boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: (theme) => `0 6px 18px ${alpha(theme.palette.primary.main, 0.35)}`,
              },
            }}
          >
            {t("profile.viewAndPrintCv")}
          </Button>
        )}
      </Box>

      {/* Divider */}
      <Divider sx={{ borderColor: "divider" }} />

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
              fontSize: "0.94rem",
              letterSpacing: "-0.2px",
            }}
          >
            {t("profile.contact")}
          </Typography>
          {!readOnly && Boolean(onEditSection) && (
            <Tooltip title={t("profile.editTitleContact")} placement="top">
              <IconButton
                size="small"
                onClick={() => onEditSection("contact")}
                sx={{
                  color: "text.secondary",
                  borderRadius: "8px",
                  "&:hover": {
                    color: "primary.main",
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {hasContactInfo ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {/* Email with Click-to-Copy */}
            {emailStr && (
              <Tooltip
                title={copiedKey === "email" ? t("profile.copied") : t("profile.copy")}
                placement="top"
              >
                <Box
                  onClick={() => handleCopy(emailStr, "email")}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.25,
                    borderRadius: "10px",
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    transition: "all 0.18s ease",
                    "&:hover": {
                      bgcolor: "action.hover",
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                      transform: "translateX(2px)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, mr: 1 }}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.09),
                        color: "primary.main",
                        flexShrink: 0,
                      }}
                    >
                      <MailOutlineRoundedIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", display: "block", fontSize: "0.72rem", fontWeight: 600 }}
                      >
                        {t("profile.email")}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.primary",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {emailStr}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" sx={{ color: copiedKey === "email" ? "success.main" : "text.secondary" }}>
                    {copiedKey === "email" ? (
                      <CheckRoundedIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
                    )}
                  </IconButton>
                </Box>
              </Tooltip>
            )}

            {/* Phone with Click-to-Copy */}
            {phoneStr && (
              <Tooltip
                title={copiedKey === "phone" ? t("profile.copied") : t("profile.copy")}
                placement="top"
              >
                <Box
                  onClick={() => handleCopy(phoneStr, "phone")}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.25,
                    borderRadius: "10px",
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    transition: "all 0.18s ease",
                    "&:hover": {
                      bgcolor: "action.hover",
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                      transform: "translateX(2px)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, mr: 1 }}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.09),
                        color: "primary.main",
                        flexShrink: 0,
                      }}
                    >
                      <PhoneOutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", display: "block", fontSize: "0.72rem", fontWeight: 600 }}
                      >
                        {t("profile.phone")}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.primary",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {phoneStr}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" sx={{ color: copiedKey === "phone" ? "success.main" : "text.secondary" }}>
                    {copiedKey === "phone" ? (
                      <CheckRoundedIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
                    )}
                  </IconButton>
                </Box>
              </Tooltip>
            )}

            {/* Location */}
            {locationStr && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 1.25,
                  borderRadius: "10px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.09),
                    color: "primary.main",
                    flexShrink: 0,
                    mr: 1.25,
                  }}
                >
                  <LocationOnOutlinedIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block", fontSize: "0.72rem", fontWeight: 600 }}
                  >
                    {t("profile.location")}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {locationStr}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Website External Link */}
            {websiteStr && (
              <Box
                component="a"
                href={websiteStr.startsWith("http") ? websiteStr : `https://${websiteStr}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.25,
                  borderRadius: "10px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  textDecoration: "none",
                  transition: "all 0.18s ease",
                  "&:hover": {
                    bgcolor: "action.hover",
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                    transform: "translateX(2px)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, mr: 1 }}>
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.09),
                      color: "primary.main",
                      flexShrink: 0,
                    }}
                  >
                    <LanguageRoundedIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", display: "block", fontSize: "0.72rem", fontWeight: 600 }}
                    >
                      {t("profile.website")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "primary.main",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {websiteStr}
                    </Typography>
                  </Box>
                </Box>
                <OpenInNewRoundedIcon sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
              </Box>
            )}

            {/* LinkedIn External Link */}
            {linkedinStr && (
              <Box
                component="a"
                href={linkedinStr.startsWith("http") ? linkedinStr : `https://${linkedinStr}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.25,
                  borderRadius: "10px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  textDecoration: "none",
                  transition: "all 0.18s ease",
                  "&:hover": {
                    bgcolor: "action.hover",
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                    transform: "translateX(2px)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, mr: 1 }}>
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.09),
                      color: "primary.main",
                      flexShrink: 0,
                    }}
                  >
                    <LinkedInIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", display: "block", fontSize: "0.72rem", fontWeight: 600 }}
                    >
                      {t("profile.linkedin")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "primary.main",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {linkedinStr}
                    </Typography>
                  </Box>
                </Box>
                <OpenInNewRoundedIcon sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              border: "1px dashed",
              borderColor: "divider",
              textAlign: "center",
              bgcolor: "action.hover",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.85rem",
                mb: 1.5,
              }}
            >
              {t("profile.noContact")}
            </Typography>
            {!readOnly && Boolean(onEditSection) && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => onEditSection("contact")}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                }}
              >
                {t("profile.editTitleContact")}
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* Divider */}
      <Divider sx={{ borderColor: "divider" }} />

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
              fontSize: "0.94rem",
              letterSpacing: "-0.2px",
            }}
          >
            {t("profile.skills")}
          </Typography>
          {!readOnly && Boolean(onEditSection) && (
            <Tooltip title={t("profile.editTitleSkills")} placement="top">
              <IconButton
                size="small"
                onClick={() => onEditSection("skills")}
                sx={{
                  color: "text.secondary",
                  borderRadius: "8px",
                  "&:hover": {
                    color: "primary.main",
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {skills.length > 0 ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {skills.map((skill, idx) => (
              <Chip
                key={idx}
                label={skill}
                size="small"
                sx={{
                  bgcolor: "action.hover",
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: "divider",
                  px: 0.5,
                  py: 0.25,
                  transition: "all 0.18s ease",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                    transform: "translateY(-1px)",
                  },
                }}
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              border: "1px dashed",
              borderColor: "divider",
              textAlign: "center",
              bgcolor: "action.hover",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.85rem",
                mb: 1.5,
              }}
            >
              {t("profile.noSkills")}
            </Typography>
            {!readOnly && Boolean(onEditSection) && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => onEditSection("skills")}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                }}
              >
                {t("profile.addSkill")}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ProfileLeftCol;
