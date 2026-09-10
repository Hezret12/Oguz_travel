import { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  IconButton,
  Avatar,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import html2pdf from "html2pdf.js";
import toast from "react-hot-toast";
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

const getLanguageProficiencyPercent = (level) => {
  if (!level) return 70;
  const l = String(level).toLowerCase();
  if (l.includes("native") || l.includes("ýerli") || l.includes("ene dili") || l.includes("родной") || l.includes("c2")) return 100;
  if (l.includes("fluent") || l.includes("erkin") || l.includes("свободн") || l.includes("c1")) return 85;
  if (l.includes("advanced") || l.includes("ýokary") || l.includes("продвинут") || l.includes("b2")) return 75;
  if (l.includes("intermediate") || l.includes("orta") || l.includes("средн") || l.includes("b1")) return 60;
  if (l.includes("beginner") || l.includes("başlangyç") || l.includes("начинающ") || l.includes("a1") || l.includes("a2")) return 35;
  return 65;
};

const CVPrintPreviewModal = ({ open, onClose, profile }) => {
  const { t } = useLocale();
  const sheetRef = useRef(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

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

  const handlePrint = () => {
    if (sheetRef.current) {
      printElement(sheetRef.current, `${fullName || "CV"} - Oguz Travel`);
    }
  };

  const handleDownloadPdf = async () => {
    if (!sheetRef.current || isExportingPdf) return;
    setIsExportingPdf(true);

    try {
      const fileName = `${(fullName || "CV").trim().replace(/\s+/g, "_")}_CV.pdf`;
      const opt = {
        margin: [8, 8, 8, 8],
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          logging: false,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await html2pdf().set(opt).from(sheetRef.current).save();
      toast.success(t("profile.downloadSuccess") || "CV faýly üstünlikli ýüklendi!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("PDF ýüklenende ýalňyşlyk ýüze çykdy");
    } finally {
      setIsExportingPdf(false);
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          {/* Download PDF Button */}
          <Button
            size="small"
            variant="contained"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            startIcon={
              isExportingPdf ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DownloadRoundedIcon sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 750,
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
            {isExportingPdf ? t("downloading") || "Ýüklenýär..." : t("profile.downloadPdf") || "PDF Ýükle"}
          </Button>

          {/* Print Button */}
          <Button
            size="small"
            variant="outlined"
            onClick={handlePrint}
            startIcon={<PrintRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              px: 2,
              py: 0.75,
              borderColor: "divider",
              color: "text.primary",
              bgcolor: "background.paper",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
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
            p: { xs: 4, sm: 5.5 },
            borderRadius: "4px",
            boxShadow: "0 15px 35px -5px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            display: "flex",
            flexDirection: "column",
            gap: 3.5,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top Brand Accent Bar */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "5px",
              background: "linear-gradient(90deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)",
            }}
          />

          {/* 1. Header: Avatar, Name, Role & Quick Contact */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3.5,
              pb: 3,
              borderBottom: "1.5px solid #e2e8f0",
            }}
          >
            <Avatar
              src={getFileUrl(avatarUrl)}
              alt={fullName}
              sx={{
                width: 96,
                height: 96,
                boxShadow: "0 6px 18px rgba(15, 118, 110, 0.2)",
                border: "3px solid #0f766e",
                bgcolor: "#0f766e",
                color: "#ffffff",
                fontSize: "2.2rem",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {fullName?.charAt(0) || "U"}
            </Avatar>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: "#0f172a",
                  fontSize: { xs: "1.6rem", sm: "1.9rem" },
                  lineHeight: 1.15,
                  letterSpacing: "-0.5px",
                  mb: 0.5,
                }}
              >
                {fullName}
              </Typography>

              {role && (
                <Typography
                  sx={{
                    color: "#0f766e",
                    fontWeight: 750,
                    fontSize: "1.02rem",
                    letterSpacing: "0.3px",
                    textTransform: "uppercase",
                    mb: 1.25,
                  }}
                >
                  {role}
                </Typography>
              )}

              {/* Contact Pills */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: { xs: 1.5, sm: 2.25 },
                  fontSize: "0.82rem",
                  color: "#475569",
                  fontWeight: 500,
                }}
              >
                {emailStr && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <MailOutlineRoundedIcon sx={{ fontSize: 16, color: "#0f766e" }} />
                    <Typography component="span" sx={{ fontSize: "0.82rem", fontWeight: 550, color: "#334155" }}>
                      {emailStr}
                    </Typography>
                  </Box>
                )}
                {phoneStr && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <PhoneOutlinedIcon sx={{ fontSize: 16, color: "#0f766e" }} />
                    <Typography component="span" sx={{ fontSize: "0.82rem", fontWeight: 550, color: "#334155" }}>
                      {phoneStr}
                    </Typography>
                  </Box>
                )}
                {locationStr && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 16, color: "#0f766e" }} />
                    <Typography component="span" sx={{ fontSize: "0.82rem", fontWeight: 550, color: "#334155" }}>
                      {locationStr}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* 2. Main Two-Column Corporate Layout (66% Main / 34% Sidebar) */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 240px" },
              gap: 4,
              alignItems: "start",
            }}
          >
            {/* LEFT / MAIN COLUMN: Summary, Experience, Education */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, minWidth: 0 }}>
              {/* Personal Summary */}
              {summary && (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 850,
                      fontSize: "0.92rem",
                      letterSpacing: "0.6px",
                      color: "#0f766e",
                      textTransform: "uppercase",
                      mb: 1.25,
                      borderBottom: "1.5px solid #e2e8f0",
                      pb: 0.5,
                    }}
                  >
                    {t("profile.personalSummary")}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#334155",
                      fontSize: "0.88rem",
                      lineHeight: 1.65,
                      textAlign: "justify",
                    }}
                  >
                    {summary}
                  </Typography>
                </Box>
              )}

              {/* Work Experience */}
              {experiences.length > 0 && (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 850,
                      fontSize: "0.92rem",
                      letterSpacing: "0.6px",
                      color: "#0f766e",
                      textTransform: "uppercase",
                      mb: 1.75,
                      borderBottom: "1.5px solid #e2e8f0",
                      pb: 0.5,
                    }}
                  >
                    {t("profile.workExperience")}
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.75 }}>
                    {experiences.map((exp, idx) => (
                      <Box key={exp.id || idx}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 0.5 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: "0.94rem", color: "#0f172a" }}>
                            {exp.role}
                          </Typography>

                          {exp.period && (
                            <Box
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                                bgcolor: "#f1f5f9",
                                color: "#475569",
                                fontSize: "0.76rem",
                                fontWeight: 650,
                                px: 1,
                                py: 0.25,
                                borderRadius: "4px",
                                flexShrink: 0,
                              }}
                            >
                              <CalendarMonthRoundedIcon sx={{ fontSize: 13, color: "#0f766e" }} />
                              {exp.period}
                            </Box>
                          )}
                        </Box>

                        {(exp.company || exp.location) && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.75 }}>
                            <BusinessRoundedIcon sx={{ fontSize: 15, color: "#0f766e" }} />
                            <Typography sx={{ color: "#0f766e", fontSize: "0.85rem", fontWeight: 700 }}>
                              {exp.company} {exp.location ? `• ${exp.location}` : ""}
                            </Typography>
                          </Box>
                        )}

                        {exp.bullets && exp.bullets.length > 0 && (
                          <Box component="ul" sx={{ pl: 2, m: 0, display: "flex", flexDirection: "column", gap: 0.4 }}>
                            {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                              <Typography
                                key={bIdx}
                                component="li"
                                sx={{ color: "#334155", fontSize: "0.83rem", lineHeight: 1.5 }}
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
                      fontWeight: 850,
                      fontSize: "0.92rem",
                      letterSpacing: "0.6px",
                      color: "#0f766e",
                      textTransform: "uppercase",
                      mb: 1.5,
                      borderBottom: "1.5px solid #e2e8f0",
                      pb: 0.5,
                    }}
                  >
                    {t("profile.education")}
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {educations.map((edu, idx) => (
                      <Box key={edu.id || idx}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 0.25 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>
                            {edu.degree}
                          </Typography>
                          {edu.period && (
                            <Typography sx={{ color: "#64748b", fontSize: "0.76rem", fontWeight: 600 }}>
                              {edu.period}
                            </Typography>
                          )}
                        </Box>
                        {edu.school && (
                          <Typography sx={{ color: "#475569", fontSize: "0.83rem", fontWeight: 600 }}>
                            {edu.school}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            {/* RIGHT / SIDEBAR PANEL: Skills & Languages */}
            <Box
              sx={{
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                p: 2.75,
                display: "flex",
                flexDirection: "column",
                gap: 3.5,
              }}
            >
              {/* Skills */}
              {skills.length > 0 && (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 850,
                      fontSize: "0.88rem",
                      letterSpacing: "0.6px",
                      color: "#0f766e",
                      textTransform: "uppercase",
                      mb: 1.5,
                      borderBottom: "1.5px solid #cbd5e1",
                      pb: 0.5,
                    }}
                  >
                    {t("profile.skills")}
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.85 }}>
                    {skills.map((skill, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          bgcolor: "#ffffff",
                          border: "1px solid #cbd5e1",
                          color: "#0f172a",
                          px: 1.25,
                          py: 0.45,
                          borderRadius: "6px",
                          fontSize: "0.77rem",
                          fontWeight: 650,
                          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        {skill}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Languages with Proficiency Bars */}
              {languages.length > 0 && (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 850,
                      fontSize: "0.88rem",
                      letterSpacing: "0.6px",
                      color: "#0f766e",
                      textTransform: "uppercase",
                      mb: 1.5,
                      borderBottom: "1.5px solid #cbd5e1",
                      pb: 0.5,
                    }}
                  >
                    {t("profile.languages")}
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                    {languages.map((lang, idx) => {
                      const proficiency = getLanguageProficiencyPercent(lang.level);
                      return (
                        <Box key={lang.id || idx}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                            <Typography sx={{ fontWeight: 750, fontSize: "0.83rem", color: "#0f172a" }}>
                              {lang.name}
                            </Typography>
                            <Typography sx={{ color: "#0f766e", fontSize: "0.75rem", fontWeight: 700 }}>
                              {lang.level}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={proficiency}
                            sx={{
                              height: 5,
                              borderRadius: 3,
                              bgcolor: "#e2e8f0",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 3,
                                bgcolor: "#0f766e",
                              },
                            }}
                          />
                        </Box>
                      );
                    })}
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
