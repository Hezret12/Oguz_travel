import { useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  IconButton,
  Avatar,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useLocale } from "../../hooks/useLocale";
import { getFileUrl } from "../../functions/generalHelpers";
import { printElement } from "../../functions/printHelper";

const formatText = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val.fullName || val.name || val.shortName || val.title || "";
  }
  return String(val);
};

const CVPrintPreviewModal = ({ open, onClose, profile }) => {
  const { t } = useLocale();
  const sheetRef = useRef(null);

  if (!profile) return null;

  const contact = profile.contact || {};
  const skills = profile.skills || [];
  const experiences = profile.work_experience || profile.workExperience || [];
  const educations = profile.education || [];
  const languages = profile.languages || [];
  const summary = formatText(profile.personal_summary || profile.personalSummary);
  const fullName = formatText(profile.full_name || profile.fullName);
  const role = formatText(profile.role);
  const avatarUrl = profile.avatar_url || profile.avatarUrl;
  const emailStr = formatText(contact.email);
  const phoneStr = formatText(contact.phone);
  const locationStr = formatText(contact.location);
  const websiteStr = formatText(contact.website);
  const linkedinStr = formatText(contact.linkedin);

  const handlePrint = () => {
    if (sheetRef.current) {
      printElement(sheetRef.current, "");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "20px",
            maxHeight: "95vh",
            backgroundColor: "background.default",
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      <DialogTitle
        className="no-print"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: "10px",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: "text.primary" }}>
              {fullName} — {t("profile.previewTitle")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              {t("profile.previewSubtitle")}
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            size="small"
            variant="contained"
            onClick={handlePrint}
            startIcon={<PrintRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              px: 2.5,
              py: 0.75,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(
                  theme.palette.primary.main,
                  0.82
                )} 100%)`,
              color: "#ffffff",
              boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.28)}`,
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: (theme) => `0 6px 18px ${alpha(theme.palette.primary.main, 0.38)}`,
              },
            }}
          >
            {t("profile.printCv")}
          </Button>

          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: "text.secondary",
              borderRadius: "8px",
              p: 0.75,
              "&:hover": {
                color: "text.primary",
                backgroundColor: "action.hover",
              },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Main A4 Document Sheet Canvas */}
      <DialogContent
        sx={{
          p: { xs: 2, sm: 4 },
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "#0b0f19" : "#cbd5e1",
          overflowY: "auto",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          ref={sheetRef}
          id="printable-cv-sheet"
          sx={{
            width: "100%",
            maxWidth: "794px",
            minHeight: "1123px",
            backgroundColor: "#ffffff",
            color: "#1e293b",
            p: { xs: 4, sm: 6 },
            borderRadius: "4px",
            boxShadow: "0 15px 35px -5px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
            fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
            display: "flex",
            flexDirection: "column",
            gap: 3.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3.5,
              pb: 3,
              borderBottom: "2px solid #0f766e",
            }}
          >
            <Avatar
              src={getFileUrl(avatarUrl)}
              alt={fullName}
              sx={{
                width: 90,
                height: 90,
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
                border: "2px solid #0f766e",
                bgcolor: "#0f766e",
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              {fullName?.charAt(0) || "U"}
            </Avatar>

            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: "#0f172a",
                  fontSize: "1.75rem",
                  lineHeight: 1.15,
                  letterSpacing: "-0.5px",
                  mb: 0.5,
                }}
              >
                {fullName}
              </Typography>

              <Typography
                sx={{
                  color: "#0f766e",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  letterSpacing: "0.2px",
                  mb: 1.5,
                }}
              >
                {role}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: { xs: 1.5, sm: 2.5 },
                  fontSize: "0.82rem",
                  color: "#475569",
                }}
              >
                {emailStr && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <MailOutlineRoundedIcon sx={{ fontSize: 16, color: "#0f766e" }} />
                    <span>{emailStr}</span>
                  </Box>
                )}
                {phoneStr && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <PhoneOutlinedIcon sx={{ fontSize: 16, color: "#0f766e" }} />
                    <span>{phoneStr}</span>
                  </Box>
                )}
                {locationStr && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 16, color: "#0f766e" }} />
                    <span>{locationStr}</span>
                  </Box>
                )}
                {websiteStr && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <LanguageOutlinedIcon sx={{ fontSize: 16, color: "#0f766e" }} />
                    <span>{websiteStr}</span>
                  </Box>
                )}
                {linkedinStr && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <LinkedInIcon sx={{ fontSize: 16, color: "#0f766e" }} />
                    <span>{linkedinStr}</span>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {summary && (
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "0.92rem",
                  letterSpacing: "0.5px",
                  color: "#0f766e",
                  textTransform: "uppercase",
                  mb: 1,
                  borderBottom: "1px solid #e2e8f0",
                  pb: 0.5,
                }}
              >
                {t("profile.personalSummary")}
              </Typography>
              <Typography
                sx={{
                  color: "#334155",
                  fontSize: "0.88rem",
                  lineHeight: 1.6,
                  textAlign: "justify",
                }}
              >
                {summary}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "6.5fr 3.5fr" },
              gap: 4,
              alignItems: "start",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
              {experiences.length > 0 && (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.92rem",
                      letterSpacing: "0.5px",
                      color: "#0f766e",
                      textTransform: "uppercase",
                      mb: 1.5,
                      borderBottom: "1px solid #e2e8f0",
                      pb: 0.5,
                    }}
                  >
                    {t("profile.workExperience")}
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    {experiences.map((exp, idx) => (
                      <Box key={exp.id || idx}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>
                            {exp.role}
                          </Typography>
                          <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>
                            {exp.period}
                          </Typography>
                        </Box>

                        {(exp.company || exp.location) && (
                          <Typography sx={{ color: "#0f766e", fontSize: "0.82rem", fontWeight: 600, mb: 0.75 }}>
                            {exp.company} {exp.location ? `• ${exp.location}` : ""}
                          </Typography>
                        )}

                        {exp.bullets && exp.bullets.length > 0 && (
                          <Box component="ul" sx={{ pl: 2.25, m: 0, display: "flex", flexDirection: "column", gap: 0.4 }}>
                            {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                              <Typography
                                key={bIdx}
                                component="li"
                                sx={{ color: "#334155", fontSize: "0.82rem", lineHeight: 1.45 }}
                              >
                                {bullet}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {educations.length > 0 && (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.92rem",
                      letterSpacing: "0.5px",
                      color: "#0f766e",
                      textTransform: "uppercase",
                      mb: 1.5,
                      borderBottom: "1px solid #e2e8f0",
                      pb: 0.5,
                    }}
                  >
                    {t("profile.education")}
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                    {educations.map((edu, idx) => (
                      <Box key={edu.id || idx}>
                        <Typography sx={{ fontWeight: 800, fontSize: "0.88rem", color: "#0f172a" }}>
                          {edu.degree}
                        </Typography>
                        {edu.school && (
                          <Typography sx={{ color: "#475569", fontSize: "0.82rem", fontWeight: 500 }}>
                            {edu.school}
                          </Typography>
                        )}
                        {edu.period && (
                          <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 500, mt: 0.2 }}>
                            {edu.period}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
              {skills.length > 0 && (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.92rem",
                      letterSpacing: "0.5px",
                      color: "#0f766e",
                      textTransform: "uppercase",
                      mb: 1.25,
                      borderBottom: "1px solid #e2e8f0",
                      pb: 0.5,
                    }}
                  >
                    {t("profile.skills")}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {skills.map((skill, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          bgcolor: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          color: "#1e293b",
                          px: 1.25,
                          py: 0.4,
                          borderRadius: "6px",
                          fontSize: "0.76rem",
                          fontWeight: 600,
                        }}
                      >
                        {skill}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}


              {languages.length > 0 && (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.92rem",
                      letterSpacing: "0.5px",
                      color: "#0f766e",
                      textTransform: "uppercase",
                      mb: 1.25,
                      borderBottom: "1px solid #e2e8f0",
                      pb: 0.5,
                    }}
                  >
                    {t("profile.languages")}
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {languages.map((lang, idx) => (
                      <Box key={lang.id || idx} sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#1e293b" }}>
                          {lang.name}
                        </Typography>
                        <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 500 }}>
                          {lang.level}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}


            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CVPrintPreviewModal;
