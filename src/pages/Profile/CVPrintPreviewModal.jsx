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

  if (!profile) return null;

  const handlePrint = () => {
    window.print();
  };

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
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "#0f172a" : "#f1f5f9",
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* Top Toolbar (Hidden on print) */}
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
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "#1e293b" : "#ffffff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "rgba(12, 138, 123, 0.12)",
              color: "#0c8a7b",
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {profile.fullName} — {t("profile.previewTitle")}
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

          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: "text.secondary",
              p: 0.75,
              borderRadius: "8px",
              "&:hover": { backgroundColor: "action.hover" },
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
        {/* The Printable A4 Resume Sheet */}
        <Box
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
          {/* 1. Header: Avatar, Name, Role, and Contact Strip */}
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

              {/* Contact Icons Ribbon */}
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

          {/* 2. Personal Summary Section */}
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

          {/* 3. Two-Column CV Body Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "6.5fr 3.5fr" },
              gap: 4,
              alignItems: "start",
            }}
          >
            {/* Left Column (Work Experience & Education) */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
              {/* Work Experience */}
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

              {/* Education */}
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

            {/* Right Column (Skills, Certifications, Languages, References) */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
              {/* Skills */}
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



              {/* Languages */}
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

      {/* Global CSS for Clean Printing of the CV */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-cv-sheet, #printable-cv-sheet * {
              visibility: visible !important;
            }
            #printable-cv-sheet {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              padding: 24px !important;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
    </Dialog>
  );
};

export default CVPrintPreviewModal;
