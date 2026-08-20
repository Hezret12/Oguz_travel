import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

const ProfileRightCol = ({ profile, onEditSection }) => {
  const experiences = profile.workExperience || [];
  const educations = profile.education || [];
  const certifications = profile.certifications || [];
  const languages = profile.languages || [];
  const references = profile.references || [];

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
            Personal Summary
          </Typography>
          <Tooltip title="Düşündirişi üýtget" placement="top">
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
            color: "text.primary",
            fontSize: "0.92rem",
            lineHeight: 1.65,
          }}
        >
          {profile.personalSummary || "Gysgaça maglumat ýok."}
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
            Work Experience
          </Typography>
          <Tooltip title="Iş tejribesini üýtget" placement="top">
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
            Education
          </Typography>
          <Tooltip title="Bilimi üýtget" placement="top">
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
      </Paper>

      {/* 4. Certifications & Awards */}
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
            Certifications & Awards
          </Typography>
          <Tooltip title="Sertifikatlary üýtget" placement="top">
            <IconButton
              size="small"
              onClick={() => onEditSection("certifications")}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "#0c8a7b", backgroundColor: "rgba(12, 138, 123, 0.08)" },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {certifications.map((cert, idx) => (
            <Box key={cert.id || idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary" }}>
                {cert.title}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", fontWeight: 600 }}>
                {cert.year}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* 5. Languages */}
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
            Languages
          </Typography>
          <Tooltip title="Dilleri üýtget" placement="top">
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
      </Paper>

      {/* 6. References */}
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
            References
          </Typography>
          <Tooltip title="Maslahatçylary üýtget" placement="top">
            <IconButton
              size="small"
              onClick={() => onEditSection("references")}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "#0c8a7b", backgroundColor: "rgba(12, 138, 123, 0.08)" },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {references.map((ref, idx) => (
            <Typography key={ref.id || idx} sx={{ color: "text.primary", fontSize: "0.88rem" }}>
              {ref.text}
            </Typography>
          ))}

          <Button
            size="small"
            startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={() => onEditSection("references")}
            sx={{
              alignSelf: "flex-start",
              textTransform: "none",
              fontWeight: 700,
              color: "#0c8a7b",
              p: 0,
              mt: 1,
              "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
            }}
          >
            Add reference
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfileRightCol;
