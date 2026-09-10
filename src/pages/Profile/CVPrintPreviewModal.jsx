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
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
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

const getLanguageDots = (level) => {
  if (!level) return 4;
  const l = String(level).toLowerCase();
  if (l.includes("native") || l.includes("ýerli") || l.includes("ene dili") || l.includes("родной") || l.includes("c2")) return 5;
  if (l.includes("fluent") || l.includes("erkin") || l.includes("свободн") || l.includes("c1")) return 4;
  if (l.includes("advanced") || l.includes("ýokary") || l.includes("продвинут") || l.includes("b2")) return 4;
  if (l.includes("intermediate") || l.includes("orta") || l.includes("средн") || l.includes("b1")) return 3;
  if (l.includes("beginner") || l.includes("başlangyç") || l.includes("начинающ") || l.includes("a1") || l.includes("a2")) return 2;
  return 3;
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

  const handlePrint = () => {
    if (sheetRef.current) {
      printElement(sheetRef.current, `${fullName || "CV"}_Resume`);
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
      {/* Top Modal Navigation / Action Bar */}
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
              {t("profile.previewSubtitle")} (A4)
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
              fontSize: "0.86rem",
              px: 2.75,
              py: 0.85,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(
                  theme.palette.primary.main,
                  0.85
                )} 100%)`,
              color: "#ffffff",
              boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: (theme) => `0 6px 18px ${alpha(theme.palette.primary.main, 0.4)}`,
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

      {/* Preview Canvas Area */}
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
        {/* Printable Executive A4 Sheet Container */}
        <Box
          ref={sheetRef}
          id="printable-cv-sheet"
          sx={{
            width: "100%",
            maxWidth: "794px",
            minHeight: "1123px",
            backgroundColor: "#ffffff",
            color: "#0f172a",
            p: { xs: "32px 24px", sm: "44px 48px" },
            borderRadius: "4px",
            boxShadow: "0 20px 40px -8px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)",
            fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif)",
            display: "flex",
            flexDirection: "column",
            gap: 3.5,
            boxSizing: "border-box",
            printColorAdjust: "exact",
            WebkitPrintColorAdjust: "exact",
          }}
        >
          {/* 1. Executive Corporate Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3.5,
              pb: 3,
              borderBottom: "2px solid #0d9488",
              position: "relative",
            }}
          >
            {/* Professional Portrait Avatar */}
            <Avatar
              src={getFileUrl(avatarUrl)}
              alt={fullName}
              sx={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                border: "3px solid #ffffff",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15), 0 0 0 2px #0d9488",
                bgcolor: "#0d9488",
                color: "#ffffff",
                fontSize: "2.2rem",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {fullName?.charAt(0) || "U"}
            </Avatar>

            {/* Candidate Identity & Contact Metadata */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  color: "#0f172a",
                  fontSize: "1.85rem",
                  lineHeight: 1.15,
                  letterSpacing: "-0.5px",
                  mb: 0.6,
                }}
              >
                {fullName || "—"}
              </Typography>

              {role && (
                <Typography
                  sx={{
                    color: "#0d9488",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    mb: 1.5,
                  }}
                >
                  {role}
                </Typography>
              )}

              {/* Clean Contact Metadata Strip */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: { xs: 1.25, sm: 2.25 },
                  fontSize: "0.82rem",
                  color: "#475569",
                  fontWeight: 550,
                }}
              >
                {locationStr && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.65 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 16, color: "#0d9488" }} />
                    <span>{locationStr}</span>
                  </Box>
                )}
                {emailStr && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.65 }}>
                    <MailOutlineRoundedIcon sx={{ fontSize: 16, color: "#0d9488" }} />
                    <span>{emailStr}</span>
                  </Box>
                )}
                {phoneStr && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.65 }}>
                    <PhoneOutlinedIcon sx={{ fontSize: 16, color: "#0d9488" }} />
                    <span>{phoneStr}</span>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* 2. Executive Professional Summary */}
          {summary && (
            <Box sx={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 850,
                    fontSize: "0.88rem",
                    letterSpacing: "1.2px",
                    color: "#0f172a",
                    textTransform: "uppercase",
                  }}
                >
                  {t("profile.personalSummary")}
                </Typography>
                <Box sx={{ flexGrow: 1, height: "1px", bgcolor: "#e2e8f0", ml: 1 }} />
              </Box>

              <Box
                sx={{
                  borderLeft: "3.5px solid #0d9488",
                  pl: 2,
                  py: 0.25,
                }}
              >
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
            </Box>
          )}

          {/* 3. Executive Two-Column Grid: Main Experience (65%) + Sidebar Credentials (35%) */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "6.5fr 3.5fr" },
              gap: 4,
              alignItems: "start",
            }}
          >
            {/* Left Column: Work Experience */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {experiences.length > 0 && (
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Typography
                      sx={{
                        fontWeight: 850,
                        fontSize: "0.88rem",
                        letterSpacing: "1.2px",
                        color: "#0f172a",
                        textTransform: "uppercase",
                      }}
                    >
                      {t("profile.workExperience")}
                    </Typography>
                    <Box sx={{ flexGrow: 1, height: "1px", bgcolor: "#e2e8f0", ml: 1 }} />
                  </Box>

                  {/* Vertical Timeline */}
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {experiences.map((exp, idx) => {
                      const isLast = idx === experiences.length - 1;
                      return (
                        <Box
                          key={exp.id || idx}
                          sx={{
                            display: "flex",
                            gap: 2,
                            position: "relative",
                            breakInside: "avoid",
                            pageBreakInside: "avoid",
                          }}
                        >
                          {/* Timeline Node & Connector */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                bgcolor: "#0d9488",
                                boxShadow: "0 0 0 3px rgba(13, 148, 136, 0.2)",
                                mt: "5px",
                              }}
                            />
                            {!isLast && (
                              <Box
                                sx={{
                                  width: "1.5px",
                                  bgcolor: "#cbd5e1",
                                  flexGrow: 1,
                                  my: 0.75,
                                  minHeight: 24,
                                }}
                              />
                            )}
                          </Box>

                          {/* Experience Content */}
                          <Box sx={{ pb: isLast ? 0 : 3, flexGrow: 1, minWidth: 0 }}>
                            {/* Role & Period */}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                flexWrap: "wrap",
                                gap: 1,
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  fontSize: "0.94rem",
                                  color: "#0f172a",
                                  lineHeight: 1.25,
                                }}
                              >
                                {exp.role}
                              </Typography>

                              {exp.period && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    bgcolor: "#f1f5f9",
                                    color: "#475569",
                                    fontSize: "0.74rem",
                                    fontWeight: 700,
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: "4px",
                                  }}
                                >
                                  <CalendarMonthRoundedIcon sx={{ fontSize: 13, color: "#0d9488" }} />
                                  <span>{exp.period}</span>
                                </Box>
                              )}
                            </Box>

                            {/* Company & Location */}
                            {(exp.company || exp.location) && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.6,
                                  color: "#0d9488",
                                  fontSize: "0.84rem",
                                  fontWeight: 700,
                                  mb: 1,
                                }}
                              >
                                <BusinessRoundedIcon sx={{ fontSize: 15 }} />
                                <span>{exp.company}</span>
                                {exp.location && (
                                  <span style={{ color: "#64748b", fontWeight: 500 }}>
                                    • {exp.location}
                                  </span>
                                )}
                              </Box>
                            )}

                            {/* Achievements & Bullet Points */}
                            {exp.bullets && exp.bullets.length > 0 && (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 0.5,
                                  pl: 0.5,
                                }}
                              >
                                {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                                  <Box
                                    key={bIdx}
                                    sx={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: 1,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 4,
                                        height: 4,
                                        borderRadius: "50%",
                                        bgcolor: "#0d9488",
                                        mt: "7px",
                                        flexShrink: 0,
                                      }}
                                    />
                                    <Typography
                                      sx={{
                                        color: "#334155",
                                        fontSize: "0.82rem",
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {bullet}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Right Column (Sidebar): Education, Skills, Languages */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
              {/* Education Section */}
              {educations.length > 0 && (
                <Box sx={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.75 }}>
                    <Typography
                      sx={{
                        fontWeight: 850,
                        fontSize: "0.88rem",
                        letterSpacing: "1.2px",
                        color: "#0f172a",
                        textTransform: "uppercase",
                      }}
                    >
                      {t("profile.education")}
                    </Typography>
                    <Box sx={{ flexGrow: 1, height: "1px", bgcolor: "#e2e8f0", ml: 1 }} />
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {educations.map((edu, idx) => (
                      <Box
                        key={edu.id || idx}
                        sx={{
                          p: 1.5,
                          borderRadius: "8px",
                          bgcolor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          breakInside: "avoid",
                          pageBreakInside: "avoid",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.88rem",
                            color: "#0f172a",
                            lineHeight: 1.25,
                            mb: 0.4,
                          }}
                        >
                          {edu.degree}
                        </Typography>
                        {edu.school && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                            <SchoolOutlinedIcon sx={{ fontSize: 15, color: "#64748b" }} />
                            <Typography
                              sx={{
                                color: "#475569",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                              }}
                            >
                              {edu.school}
                            </Typography>
                          </Box>
                        )}
                        {edu.period && (
                          <Typography
                            sx={{
                              color: "#0d9488",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                            }}
                          >
                            {edu.period}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Skills Section */}
              {skills.length > 0 && (
                <Box sx={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.75 }}>
                    <Typography
                      sx={{
                        fontWeight: 850,
                        fontSize: "0.88rem",
                        letterSpacing: "1.2px",
                        color: "#0f172a",
                        textTransform: "uppercase",
                      }}
                    >
                      {t("profile.skills")}
                    </Typography>
                    <Box sx={{ flexGrow: 1, height: "1px", bgcolor: "#e2e8f0", ml: 1 }} />
                  </Box>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {skills.map((skill, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          bgcolor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          color: "#0f172a",
                          px: 1.25,
                          py: 0.4,
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: 650,
                        }}
                      >
                        {skill}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Languages Section */}
              {languages.length > 0 && (
                <Box sx={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.75 }}>
                    <Typography
                      sx={{
                        fontWeight: 850,
                        fontSize: "0.88rem",
                        letterSpacing: "1.2px",
                        color: "#0f172a",
                        textTransform: "uppercase",
                      }}
                    >
                      {t("profile.languages")}
                    </Typography>
                    <Box sx={{ flexGrow: 1, height: "1px", bgcolor: "#e2e8f0", ml: 1 }} />
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    {languages.map((lang, idx) => {
                      const dots = getLanguageDots(lang.level);
                      return (
                        <Box
                          key={lang.id || idx}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 1.25,
                            borderRadius: "6px",
                            bgcolor: "#f8fafc",
                            border: "1px solid #f1f5f9",
                          }}
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 750,
                                fontSize: "0.82rem",
                                color: "#0f172a",
                              }}
                            >
                              {lang.name}
                            </Typography>
                            <Typography
                              sx={{
                                color: "#64748b",
                                fontSize: "0.74rem",
                                fontWeight: 600,
                              }}
                            >
                              {lang.level}
                            </Typography>
                          </Box>

                          {/* 5-Dot Proficiency Indicator */}
                          <Box sx={{ display: "flex", gap: 0.4 }}>
                            {[1, 2, 3, 4, 5].map((dot) => (
                              <Box
                                key={dot}
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  bgcolor: dot <= dots ? "#0d9488" : "#cbd5e1",
                                }}
                              />
                            ))}
                          </Box>
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
