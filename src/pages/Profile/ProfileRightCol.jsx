import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Button,
  LinearProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { useLocale } from "../../hooks/useLocale";

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

const ProfileRightCol = ({ profile, onEditSection, readOnly = false }) => {
  const { t } = useLocale();
  const experiences = profile.work_experience || profile.workExperience || [];
  const educations = profile.education || [];
  const languages = profile.languages || [];
  const summary = profile.personal_summary || profile.personalSummary;

  const cardStyle = {
    borderRadius: "20px",
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
    p: { xs: 2.5, sm: 3.5 },
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
    transition: "box-shadow 0.25s ease",
    "&:hover": {
      boxShadow: "0 12px 36px rgba(0, 0, 0, 0.07)",
    },
  };

  const renderSectionHeader = (title, icon, editKey, editTooltip, count = null) => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.09),
            color: "primary.main",
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: "text.primary",
            fontSize: "1.05rem",
            letterSpacing: "-0.2px",
          }}
        >
          {title}
        </Typography>
        {typeof count === "number" && count > 0 && (
          <Chip
            label={count}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.72rem",
              fontWeight: 700,
              bgcolor: "action.hover",
              color: "text.secondary",
            }}
          />
        )}
      </Box>

      {!readOnly && Boolean(onEditSection) && (
        <Tooltip title={editTooltip} placement="top">
          <IconButton
            size="small"
            onClick={() => onEditSection(editKey)}
            sx={{
              color: "text.secondary",
              borderRadius: "8px",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": {
                color: "primary.main",
                borderColor: "primary.main",
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <EditOutlinedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 1. Personal Summary */}
      <Paper elevation={0} sx={cardStyle}>
        {renderSectionHeader(
          t("profile.personalSummary"),
          <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />,
          "summary",
          t("profile.editTitleSummary")
        )}

        {summary ? (
          <Box
            sx={{
              borderLeft: "3.5px solid",
              borderColor: "primary.main",
              pl: 2.5,
              py: 1,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
              borderRadius: "0 12px 12px 0",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "text.primary",
                fontSize: "0.94rem",
                lineHeight: 1.75,
                fontWeight: 450,
                letterSpacing: "0.01em",
              }}
            >
              {summary}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              p: 3,
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
                fontSize: "0.9rem",
                mb: 1.5,
              }}
            >
              {t("profile.noSummary")}
            </Typography>
            {!readOnly && Boolean(onEditSection) && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => onEditSection("summary")}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                }}
              >
                {t("profile.editTitleSummary")}
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* 2. Work Experience (Vertical Timeline) */}
      <Paper elevation={0} sx={cardStyle}>
        {renderSectionHeader(
          t("profile.workExperience"),
          <WorkOutlineRoundedIcon sx={{ fontSize: 20 }} />,
          "experience",
          t("profile.editTitleExperience"),
          experiences.length
        )}

        {experiences.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {experiences.map((exp, idx) => {
              const isLast = idx === experiences.length - 1;
              return (
                <Box
                  key={exp.id || idx}
                  sx={{
                    display: "flex",
                    gap: 2.5,
                    position: "relative",
                  }}
                >
                  {/* Timeline Column */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {/* Node Dot */}
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        boxShadow: (theme) => `0 0 0 3.5px ${alpha(theme.palette.primary.main, 0.2)}`,
                        mt: 0.6,
                      }}
                    />
                    {/* Connector Line */}
                    {!isLast && (
                      <Box
                        sx={{
                          width: "2px",
                          bgcolor: "divider",
                          flexGrow: 1,
                          my: 1,
                          minHeight: 28,
                        }}
                      />
                    )}
                  </Box>

                  {/* Content Column */}
                  <Box sx={{ pb: isLast ? 0 : 3.5, flexGrow: 1, minWidth: 0 }}>
                    {/* Role & Period */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1,
                        mb: 0.75,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "1.02rem",
                          color: "text.primary",
                          letterSpacing: "-0.2px",
                        }}
                      >
                        {exp.role}
                      </Typography>

                      {exp.period && (
                        <Chip
                          icon={<CalendarMonthRoundedIcon sx={{ fontSize: "14px !important" }} />}
                          label={exp.period}
                          size="small"
                          sx={{
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                            color: "primary.main",
                            fontWeight: 700,
                            fontSize: "0.76rem",
                            borderRadius: "6px",
                            height: 24,
                          }}
                        />
                      )}
                    </Box>

                    {/* Company & Location */}
                    {(exp.company || exp.location) && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 1.5,
                          mb: 1.5,
                        }}
                      >
                        {exp.company && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <BusinessRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography
                              sx={{
                                color: "text.primary",
                                fontSize: "0.88rem",
                                fontWeight: 700,
                              }}
                            >
                              {exp.company}
                            </Typography>
                          </Box>
                        )}
                        {exp.location && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <LocationOnOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography
                              sx={{
                                color: "text.secondary",
                                fontSize: "0.85rem",
                                fontWeight: 500,
                              }}
                            >
                              {exp.location}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Bullet Points */}
                    {exp.bullets && exp.bullets.length > 0 && (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.85, pl: 0.5 }}>
                        {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                          <Box key={bIdx} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                            <CheckCircleOutlineRoundedIcon
                              sx={{
                                fontSize: 15,
                                color: "primary.main",
                                mt: "3px",
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                color: "text.primary",
                                fontSize: "0.88rem",
                                lineHeight: 1.55,
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
        ) : (
          <Box
            sx={{
              p: 3,
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
                fontSize: "0.9rem",
                mb: 1.5,
              }}
            >
              {t("profile.noExperience")}
            </Typography>
            {!readOnly && Boolean(onEditSection) && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => onEditSection("experience")}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                }}
              >
                {t("profile.addExperience")}
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* 3. Education (Credential Cards) */}
      <Paper elevation={0} sx={cardStyle}>
        {renderSectionHeader(
          t("profile.education"),
          <SchoolOutlinedIcon sx={{ fontSize: 20 }} />,
          "education",
          t("profile.editTitleEducation"),
          educations.length
        )}

        {educations.length > 0 ? (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
            {educations.map((edu, idx) => (
              <Box
                key={edu.id || idx}
                sx={{
                  p: 2.25,
                  borderRadius: "14px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.18s ease",
                  "&:hover": {
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                    bgcolor: "action.hover",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.96rem",
                      color: "text.primary",
                      mb: 0.5,
                      lineHeight: 1.3,
                    }}
                  >
                    {edu.degree}
                  </Typography>
                  {edu.school && (
                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.86rem",
                        fontWeight: 600,
                        mb: 1.5,
                      }}
                    >
                      {edu.school}
                    </Typography>
                  )}
                </Box>

                {edu.period && (
                  <Chip
                    icon={<CalendarMonthRoundedIcon sx={{ fontSize: "14px !important" }} />}
                    label={edu.period}
                    size="small"
                    sx={{
                      alignSelf: "flex-start",
                      bgcolor: "action.hover",
                      color: "text.secondary",
                      fontWeight: 600,
                      fontSize: "0.74rem",
                      borderRadius: "6px",
                      height: 22,
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              p: 3,
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
                fontSize: "0.9rem",
                mb: 1.5,
              }}
            >
              {t("profile.noEducation")}
            </Typography>
            {!readOnly && Boolean(onEditSection) && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => onEditSection("education")}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                }}
              >
                {t("profile.addEducation")}
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* 4. Languages (Proficiency Cards & Progress Meters) */}
      <Paper elevation={0} sx={cardStyle}>
        {renderSectionHeader(
          t("profile.languages"),
          <TranslateRoundedIcon sx={{ fontSize: 20 }} />,
          "languages",
          t("profile.editTitleLanguages"),
          languages.length
        )}

        {languages.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            {languages.map((lang, idx) => {
              const proficiency = getLanguageProficiencyPercent(lang.level);
              return (
                <Box
                  key={lang.id || idx}
                  sx={{
                    p: 2.25,
                    borderRadius: "14px",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    transition: "all 0.18s ease",
                    "&:hover": {
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                      bgcolor: "action.hover",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.25,
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "text.primary" }}>
                      {lang.name}
                    </Typography>
                    <Chip
                      label={lang.level}
                      size="small"
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        borderRadius: "6px",
                        height: 22,
                      }}
                    />
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={proficiency}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "action.hover",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 3,
                        bgcolor: "primary.main",
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box
            sx={{
              p: 3,
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
                fontSize: "0.9rem",
                mb: 1.5,
              }}
            >
              {t("profile.noLanguages")}
            </Typography>
            {!readOnly && Boolean(onEditSection) && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => onEditSection("languages")}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                }}
              >
                {t("profile.addLanguage")}
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ProfileRightCol;
