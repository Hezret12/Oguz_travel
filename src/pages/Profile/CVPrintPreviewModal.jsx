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
import { getFileUrl, useDateFormat } from "../../functions/generalHelpers";
import { printElement } from "../../functions/printHelper";
import OguzLogo from "../../assets/icons/OguzLogo";

// Oguz Travel brand palette (matches the logo emblem)
const BRAND = "#017C7D";
const BRAND_DARK = "#005A5A";
const BRAND_SOFT = "rgba(1, 124, 125, 0.08)";
const INK = "#0f172a";
const INK_MUTED = "#475569";
const RULE = "#e2e8f0";

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

const SectionTitle = ({ children, mb = 1.75 }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb }}>
    <Box sx={{ width: 4, height: 16, borderRadius: "2px", bgcolor: BRAND, flexShrink: 0 }} />
    <Typography
      sx={{
        fontWeight: 800,
        fontSize: "0.86rem",
        letterSpacing: "1.4px",
        color: INK,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Typography>
    <Box sx={{ flexGrow: 1, height: "1px", bgcolor: RULE }} />
  </Box>
);

const CVPrintPreviewModal = ({ open, onClose, profile }) => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
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
  const generatedOn = formatChange(new Date(), { dateOnly: true });

  const handlePrint = () => {
    if (sheetRef.current) {
      printElement(sheetRef.current, `${fullName || "CV"}_Resume`);
    }
  };

  const contactItems = [
    { icon: LocationOnOutlinedIcon, value: locationStr },
    { icon: MailOutlineRoundedIcon, value: emailStr },
    { icon: PhoneOutlinedIcon, value: phoneStr },
  ].filter((item) => item.value);

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
          backgroundColor: "action.selected",
          overflowY: "auto",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Printable A4 Sheet — padding lives on the inner body so the letterhead can bleed edge to edge */}
        <Box
          ref={sheetRef}
          id="printable-cv-sheet"
          sx={{
            width: "100%",
            maxWidth: "794px",
            minHeight: "1123px",
            flexShrink: 0,
            alignSelf: "flex-start",
            backgroundColor: "#ffffff",
            color: INK,
            p: 0,
            borderRadius: "4px",
            overflow: "hidden",
            boxShadow: "0 20px 40px -8px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)",
            fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif)",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            printColorAdjust: "exact",
            WebkitPrintColorAdjust: "exact",
          }}
        >
          {/* 1. Oguz Travel Letterhead */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              px: { xs: 3, sm: 6 },
              py: 1.25,
              background: `linear-gradient(120deg, ${BRAND_DARK} 0%, ${BRAND} 100%)`,
            }}
          >
            <OguzLogo
              forceLight
              sx={{
                width: { xs: 110, sm: 136 },
                height: "auto",
                mx: 0,
                flexShrink: 0,
                "& path": { fill: "#FFFFFF !important" },
              }}
            />

            <Box sx={{ textAlign: "right", minWidth: 0 }}>
              <Typography
                sx={{
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: { xs: "0.8rem", sm: "0.95rem" },
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  lineHeight: 1.2,
                }}
              >
                {t("profile.cvDocumentTitle")}
              </Typography>
              <Typography sx={{ color: "rgba(255, 255, 255, 0.78)", fontSize: "0.72rem", fontWeight: 500, mt: 0.5 }}>
                {t("profile.cvGeneratedOn")}: {generatedOn}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ height: "3px", bgcolor: "#0E8584" }} />
          <Box sx={{ height: "1px", bgcolor: BRAND, opacity: 0.35, mt: "2px" }} />

          {/* Document body */}
          <Box
            className="cv-print-body"
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              gap: 3.5,
              px: { xs: 3, sm: 6 },
              pt: { xs: 3, sm: 4 },
              pb: { xs: 3, sm: 4 },
            }}
          >
            {/* 2. Candidate Identity */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 3.5, breakInside: "avoid", pageBreakInside: "avoid" }}>
              <Avatar
                src={getFileUrl(avatarUrl)}
                alt={fullName}
                sx={{
                  width: 108,
                  height: 108,
                  border: "4px solid #ffffff",
                  boxShadow: `0 6px 16px rgba(15, 23, 42, 0.14), 0 0 0 2px ${BRAND}`,
                  bgcolor: BRAND,
                  color: "#ffffff",
                  fontSize: "2.4rem",
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {fullName?.charAt(0) || "U"}
              </Avatar>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    color: INK,
                    fontSize: { xs: "1.6rem", sm: "2rem" },
                    lineHeight: 1.1,
                    letterSpacing: "-0.5px",
                    mb: 0.75,
                  }}
                >
                  {fullName || "—"}
                </Typography>

                {role && (
                  <Typography
                    sx={{
                      color: BRAND,
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      letterSpacing: "1.8px",
                      textTransform: "uppercase",
                      mb: 1.5,
                    }}
                  >
                    {role}
                  </Typography>
                )}

                {contactItems.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      columnGap: 2.25,
                      rowGap: 0.75,
                      pt: 1.25,
                      borderTop: `1px solid ${RULE}`,
                      fontSize: "0.8rem",
                      color: INK_MUTED,
                      fontWeight: 550,
                    }}
                  >
                    {contactItems.map(({ icon: Icon, value }) => (
                      <Box key={value} sx={{ display: "flex", alignItems: "center", gap: 0.65, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            bgcolor: BRAND_SOFT,
                            flexShrink: 0,
                          }}
                        >
                          <Icon sx={{ fontSize: 13, color: BRAND }} />
                        </Box>
                        <Box component="span" sx={{ overflowWrap: "anywhere" }}>
                          {value}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>

            {/* 3. Professional Summary */}
            {summary && (
              <Box sx={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                <SectionTitle mb={1.25}>{t("profile.personalSummary")}</SectionTitle>
                <Box
                  sx={{
                    bgcolor: BRAND_SOFT,
                    borderLeft: `3px solid ${BRAND}`,
                    borderRadius: "0 6px 6px 0",
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <Typography sx={{ color: "#334155", fontSize: "0.86rem", lineHeight: 1.7, textAlign: "justify" }}>
                    {summary}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* 4. Two-Column Grid: Experience (65%) + Sidebar Credentials (35%) */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "6.5fr 3.5fr" },
                gap: 4,
                alignItems: "start",
              }}
            >
              {/* Left Column: Work Experience */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                {experiences.length > 0 && (
                  <Box>
                    <SectionTitle mb={2}>{t("profile.workExperience")}</SectionTitle>

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
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  bgcolor: "#ffffff",
                                  border: `2.5px solid ${BRAND}`,
                                  mt: "5px",
                                }}
                              />
                              {!isLast && (
                                <Box sx={{ width: "1.5px", bgcolor: "#cbd5e1", flexGrow: 1, my: 0.75, minHeight: 24 }} />
                              )}
                            </Box>

                            {/* Experience Content */}
                            <Box sx={{ pb: isLast ? 0 : 3, flexGrow: 1, minWidth: 0 }}>
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
                                <Typography sx={{ fontWeight: 800, fontSize: "0.94rem", color: INK, lineHeight: 1.25 }}>
                                  {exp.role}
                                </Typography>

                                {exp.period && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                      bgcolor: BRAND_SOFT,
                                      color: BRAND_DARK,
                                      fontSize: "0.72rem",
                                      fontWeight: 700,
                                      px: 1,
                                      py: 0.25,
                                      borderRadius: "4px",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    <CalendarMonthRoundedIcon sx={{ fontSize: 13, color: BRAND }} />
                                    <span>{exp.period}</span>
                                  </Box>
                                )}
                              </Box>

                              {(exp.company || exp.location) && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.6,
                                    color: BRAND,
                                    fontSize: "0.83rem",
                                    fontWeight: 700,
                                    mb: 1,
                                  }}
                                >
                                  <BusinessRoundedIcon sx={{ fontSize: 15 }} />
                                  <span>{exp.company}</span>
                                  {exp.location && (
                                    <span style={{ color: "#64748b", fontWeight: 500 }}>• {exp.location}</span>
                                  )}
                                </Box>
                              )}

                              {exp.bullets && exp.bullets.length > 0 && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, pl: 0.5 }}>
                                  {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                                    <Box key={bIdx} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                                      <Box
                                        sx={{
                                          width: 4,
                                          height: 4,
                                          borderRadius: "50%",
                                          bgcolor: BRAND,
                                          mt: "7px",
                                          flexShrink: 0,
                                        }}
                                      />
                                      <Typography sx={{ color: "#334155", fontSize: "0.82rem", lineHeight: 1.5 }}>
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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, minWidth: 0 }}>
                {educations.length > 0 && (
                  <Box sx={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                    <SectionTitle>{t("profile.education")}</SectionTitle>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {educations.map((edu, idx) => (
                        <Box
                          key={edu.id || idx}
                          sx={{
                            p: 1.5,
                            borderRadius: "8px",
                            bgcolor: "#f8fafc",
                            border: `1px solid ${RULE}`,
                            borderTop: `3px solid ${BRAND}`,
                            breakInside: "avoid",
                            pageBreakInside: "avoid",
                          }}
                        >
                          <Typography sx={{ fontWeight: 800, fontSize: "0.86rem", color: INK, lineHeight: 1.25, mb: 0.4 }}>
                            {edu.degree}
                          </Typography>
                          {edu.school && (
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, mb: 0.5 }}>
                              <SchoolOutlinedIcon sx={{ fontSize: 15, color: "#64748b", mt: "1px" }} />
                              <Typography sx={{ color: INK_MUTED, fontSize: "0.79rem", fontWeight: 600 }}>
                                {edu.school}
                              </Typography>
                            </Box>
                          )}
                          {edu.period && (
                            <Typography sx={{ color: BRAND, fontSize: "0.74rem", fontWeight: 700 }}>
                              {edu.period}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {skills.length > 0 && (
                  <Box sx={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                    <SectionTitle>{t("profile.skills")}</SectionTitle>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                      {skills.map((skill, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            bgcolor: BRAND_SOFT,
                            border: "1px solid rgba(1, 124, 125, 0.18)",
                            color: BRAND_DARK,
                            px: 1.25,
                            py: 0.4,
                            borderRadius: "6px",
                            fontSize: "0.76rem",
                            fontWeight: 650,
                          }}
                        >
                          {skill}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {languages.length > 0 && (
                  <Box sx={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                    <SectionTitle>{t("profile.languages")}</SectionTitle>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {languages.map((lang, idx) => {
                        const dots = getLanguageDots(lang.level);
                        return (
                          <Box
                            key={lang.id || idx}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 1,
                              py: 0.9,
                              borderBottom: idx === languages.length - 1 ? "none" : `1px dashed ${RULE}`,
                            }}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 750, fontSize: "0.82rem", color: INK }}>
                                {lang.name}
                              </Typography>
                              <Typography sx={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 600 }}>
                                {lang.level}
                              </Typography>
                            </Box>

                            {/* 5-Dot Proficiency Indicator */}
                            <Box sx={{ display: "flex", gap: 0.4, flexShrink: 0 }}>
                              {[1, 2, 3, 4, 5].map((dot) => (
                                <Box
                                  key={dot}
                                  sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    bgcolor: dot <= dots ? BRAND : "#cbd5e1",
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

            {/* 5. Corporate Footer */}
            <Box
              sx={{
                mt: "auto",
                pt: 1.5,
                borderTop: `1px solid ${RULE}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                breakInside: "avoid",
                pageBreakInside: "avoid",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <OguzLogo forceLight iconOnly sx={{ width: 22, height: "auto", mx: 0 }} />
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: BRAND_DARK, letterSpacing: "0.5px" }}>
                  Oguz Travel
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500, textAlign: "right" }}>
                {fullName ? `${fullName} · ` : ""}
                {t("profile.cvDocumentTitle")}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CVPrintPreviewModal;
