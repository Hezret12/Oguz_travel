import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useLocale } from "../../hooks/useLocale";

const ProfileRightCol = ({ profile, onEditSection }) => {
  const { t } = useLocale();
  const experiences = profile.work_experience || profile.workExperience || [];
  const educations = profile.education || [];
  const languages = profile.languages || [];
  const summary = profile.personal_summary || profile.personalSummary;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 1. Personal Summary */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          p: 3.5,
          position: "relative",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "#0c8a7b",
              fontSize: "1rem",
            }}
          >
            {t("profile.personalSummary")}
          </Typography>
          <Tooltip title={t("profile.editTitleSummary")} placement="top">
            <IconButton
              size="small"
              onClick={() => onEditSection("summary")}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "#0c8a7b", backgroundColor: "rgba(12, 138, 123, 0.08)" },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography
          variant="body1"
          sx={{
            color: summary ? "text.primary" : "text.secondary",
            fontSize: "0.92rem",
            lineHeight: 1.65,
            fontStyle: summary ? "normal" : "italic",
          }}
        >
          {summary || t("profile.noSummary")}
        </Typography>
      </Paper>

      {/* 2. Work Experience */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          p: 3.5,
          position: "relative",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "#0c8a7b",
              fontSize: "1rem",
            }}
          >
            {t("profile.workExperience")}
          </Typography>
          <Tooltip title={t("profile.editTitleExperience")} placement="top">
            <IconButton
              size="small"
              onClick={() => onEditSection("experience")}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "#0c8a7b", backgroundColor: "rgba(12, 138, 123, 0.08)" },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {experiences.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {experiences.map((exp, idx) => (
              <Box key={exp.id || idx}>
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
                  <Typography sx={{ fontWeight: 800, fontSize: "0.98rem", color: "text.primary" }}>
                    {exp.role}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.82rem", fontWeight: 500 }}>
                    {exp.period}
                  </Typography>
                </Box>

                {(exp.company || exp.location) && (
                  <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", fontWeight: 600, mb: 1 }}>
                    {exp.company} {exp.location ? `• ${exp.location}` : ""}
                  </Typography>
                )}

                {exp.bullets && exp.bullets.length > 0 && (
                  <Box component="ul" sx={{ pl: 2.5, m: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
                    {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                      <Typography
                        key={bIdx}
                        component="li"
                        sx={{ color: "text.primary", fontSize: "0.88rem", lineHeight: 1.5 }}
                      >
                        {bullet}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.88rem",
              fontStyle: "italic",
            }}
          >
            {t("profile.noExperience")}
          </Typography>
        )}
      </Paper>

      {/* 3. Education */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          p: 3.5,
          position: "relative",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "#0c8a7b",
              fontSize: "1rem",
            }}
          >
            {t("profile.education")}
          </Typography>
          <Tooltip title={t("profile.editTitleEducation")} placement="top">
            <IconButton
              size="small"
              onClick={() => onEditSection("education")}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "#0c8a7b", backgroundColor: "rgba(12, 138, 123, 0.08)" },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {educations.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {educations.map((edu, idx) => (
              <Box key={edu.id || idx}>
                <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "text.primary" }}>
                  {edu.degree}
                </Typography>
                {edu.school && (
                  <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", fontWeight: 500 }}>
                    {edu.school}
                  </Typography>
                )}
                {edu.period && (
                  <Typography sx={{ color: "text.secondary", fontSize: "0.82rem", fontWeight: 500, mt: 0.25 }}>
                    {edu.period}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.88rem",
              fontStyle: "italic",
            }}
          >
            {t("profile.noEducation")}
          </Typography>
        )}
      </Paper>

      {/* 4. Languages */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          p: 3.5,
          position: "relative",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "#0c8a7b",
              fontSize: "1rem",
            }}
          >
            {t("profile.languages")}
          </Typography>
          <Tooltip title={t("profile.editTitleLanguages")} placement="top">
            <IconButton
              size="small"
              onClick={() => onEditSection("languages")}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "#0c8a7b", backgroundColor: "rgba(12, 138, 123, 0.08)" },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {languages.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {languages.map((lang, idx) => (
              <Box key={lang.id || idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary" }}>
                  {lang.name}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", fontWeight: 500 }}>
                  {lang.level}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.88rem",
              fontStyle: "italic",
            }}
          >
            {t("profile.noLanguages")}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ProfileRightCol;
