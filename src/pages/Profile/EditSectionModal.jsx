import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Chip,
  InputAdornment,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import toast from "react-hot-toast";

const EditSectionModal = ({ open, onClose, sectionKey, profileData, onSave }) => {
  const [formData, setFormData] = useState({});
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (open && profileData) {
      if (sectionKey === "basic") {
        setFormData({
          fullName: profileData.fullName || "",
          role: profileData.role || "",
          status: profileData.status || "",
          avatarUrl: profileData.avatarUrl || "",
        });
      } else if (sectionKey === "contact") {
        setFormData({ ...(profileData.contact || {}) });
      } else if (sectionKey === "skills") {
        setFormData({ skills: [...(profileData.skills || [])] });
      } else if (sectionKey === "summary") {
        setFormData({ personalSummary: profileData.personalSummary || "" });
      } else if (sectionKey === "experience") {
        setFormData({
          workExperience: JSON.parse(JSON.stringify(profileData.workExperience || [])),
        });
      } else if (sectionKey === "education") {
        setFormData({
          education: JSON.parse(JSON.stringify(profileData.education || [])),
        });
      } else if (sectionKey === "certifications") {
        setFormData({
          certifications: JSON.parse(JSON.stringify(profileData.certifications || [])),
        });
      } else if (sectionKey === "languages") {
        setFormData({
          languages: JSON.parse(JSON.stringify(profileData.languages || [])),
        });
      } else if (sectionKey === "references") {
        setFormData({
          references: JSON.parse(JSON.stringify(profileData.references || [])),
        });
      }
    }
  }, [open, sectionKey, profileData]);

  if (!open) return null;

  const handleSave = () => {
    let updated = { ...profileData };
    if (sectionKey === "basic") {
      updated = { ...updated, ...formData };
    } else if (sectionKey === "contact") {
      updated.contact = { ...formData };
    } else if (sectionKey === "skills") {
      updated.skills = formData.skills || [];
    } else if (sectionKey === "summary") {
      updated.personalSummary = formData.personalSummary || "";
    } else if (sectionKey === "experience") {
      updated.workExperience = formData.workExperience || [];
    } else if (sectionKey === "education") {
      updated.education = formData.education || [];
    } else if (sectionKey === "certifications") {
      updated.certifications = formData.certifications || [];
    } else if (sectionKey === "languages") {
      updated.languages = formData.languages || [];
    } else if (sectionKey === "references") {
      updated.references = formData.references || [];
    }
    onSave(updated);
    toast.success("Maglumatlar üstünlikli täzelendi!");
    onClose();
  };

  // Skill Add / Remove
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if ((formData.skills || []).includes(trimmed)) return;
    setFormData((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), trimmed],
    }));
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skillToRemove),
    }));
  };

  // Work Experience Helpers
  const handleAddExperience = () => {
    setFormData((prev) => ({
      ...prev,
      workExperience: [
        ...(prev.workExperience || []),
        {
          id: `exp-${Date.now()}`,
          role: "",
          company: "",
          location: "",
          period: "",
          bullets: [""],
        },
      ],
    }));
  };

  const handleUpdateExperience = (idx, field, val) => {
    setFormData((prev) => {
      const list = [...(prev.workExperience || [])];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, workExperience: list };
    });
  };

  const handleRemoveExperience = (idx) => {
    setFormData((prev) => ({
      ...prev,
      workExperience: (prev.workExperience || []).filter((_, i) => i !== idx),
    }));
  };

  // Education Helpers
  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...(prev.education || []),
        {
          id: `edu-${Date.now()}`,
          degree: "",
          school: "",
          period: "",
        },
      ],
    }));
  };

  // Language Helpers
  const handleAddLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      languages: [
        ...(prev.languages || []),
        {
          id: `lang-${Date.now()}`,
          name: "",
          level: "Fluent",
        },
      ],
    }));
  };

  // Certification Helpers
  const handleAddCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        {
          id: `cert-${Date.now()}`,
          title: "",
          year: new Date().getFullYear().toString(),
        },
      ],
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            p: 1,
            maxHeight: "85vh",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {sectionKey === "basic" && "Esasy Maglumatlary Üýtgetmek"}
          {sectionKey === "contact" && "Habarlaşmak Maglumatlary"}
          {sectionKey === "skills" && "Ukyplar we Tejribeler (Skills)"}
          {sectionKey === "summary" && "Gysgaça Maglumat (Personal Summary)"}
          {sectionKey === "experience" && "Iş Tejribesi (Work Experience)"}
          {sectionKey === "education" && "Bilimi (Education)"}
          {sectionKey === "certifications" && "Sertifikatlar we Sylaglar"}
          {sectionKey === "languages" && "Diller (Languages)"}
          {sectionKey === "references" && "Maslahatçylar (References)"}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2.5 }}>
        {/* 1. Basic Info */}
        {sectionKey === "basic" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Doly Adyňyz"
              fullWidth
              size="small"
              value={formData.fullName || ""}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <TextField
              label="Wezipäňiz / Hünäriňiz"
              fullWidth
              size="small"
              value={formData.role || ""}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
            <TextField
              label="Ýagdaýy (Status, meselem: Available for hire)"
              fullWidth
              size="small"
              value={formData.status || ""}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
            <TextField
              label="Avatar / Surat URL"
              fullWidth
              size="small"
              value={formData.avatarUrl || ""}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
            />
          </Box>
        )}

        {/* 2. Contact Info */}
        {sectionKey === "contact" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email"
              fullWidth
              size="small"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Telefon belgisi"
              fullWidth
              size="small"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              label="Salgy / Ýerleşýän ýeri"
              fullWidth
              size="small"
              value={formData.location || ""}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <TextField
              label="Web sahypa / Portfolio"
              fullWidth
              size="small"
              value={formData.website || ""}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
            <TextField
              label="LinkedIn Profil"
              fullWidth
              size="small"
              value={formData.linkedin || ""}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            />
          </Box>
        )}

        {/* 3. Skills */}
        {sectionKey === "skills" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Täze ukyp ýazyň"
                fullWidth
                size="small"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddSkill}
                sx={{ borderRadius: "8px", textTransform: "none", bgcolor: "#0c8a7b" }}
              >
                Goş
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              {(formData.skills || []).map((skill, idx) => (
                <Chip
                  key={idx}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                  sx={{ borderRadius: "8px", fontWeight: 600 }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* 4. Summary */}
        {sectionKey === "summary" && (
          <TextField
            label="Gysgaça terjimehalyňyz"
            fullWidth
            multiline
            rows={5}
            value={formData.personalSummary || ""}
            onChange={(e) => setFormData({ ...formData, personalSummary: e.target.value })}
          />
        )}

        {/* 5. Work Experience */}
        {sectionKey === "experience" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {(formData.workExperience || []).map((exp, idx) => (
              <Box
                key={exp.id || idx}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  position: "relative",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Wezipe #{idx + 1}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => handleRemoveExperience(idx)}>
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
                <TextField
                  label="Wezipe (Role)"
                  size="small"
                  fullWidth
                  value={exp.role || ""}
                  onChange={(e) => handleUpdateExperience(idx, "role", e.target.value)}
                />
                <TextField
                  label="Kompaniýa (Company)"
                  size="small"
                  fullWidth
                  value={exp.company || ""}
                  onChange={(e) => handleUpdateExperience(idx, "company", e.target.value)}
                />
                <TextField
                  label="Ýerleşýän ýeri (Location)"
                  size="small"
                  fullWidth
                  value={exp.location || ""}
                  onChange={(e) => handleUpdateExperience(idx, "location", e.target.value)}
                />
                <TextField
                  label="Döwri (Meselem: Jan 2021 - Present)"
                  size="small"
                  fullWidth
                  value={exp.period || ""}
                  onChange={(e) => handleUpdateExperience(idx, "period", e.target.value)}
                />
                <TextField
                  label="Açyklama / Ýeten netijeleriňiz (Her setire bir punkt)"
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  value={(exp.bullets || []).join("\n")}
                  onChange={(e) =>
                    handleUpdateExperience(idx, "bullets", e.target.value.split("\n"))
                  }
                />
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddExperience}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
            >
              Täze iş tejribesini goş
            </Button>
          </Box>
        )}

        {/* 6. Education */}
        {sectionKey === "education" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {(formData.education || []).map((edu, idx) => (
              <Box
                key={edu.id || idx}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <TextField
                  label="Hünäri / Derejesi (Degree)"
                  size="small"
                  fullWidth
                  value={edu.degree || ""}
                  onChange={(e) => {
                    const list = [...(formData.education || [])];
                    list[idx].degree = e.target.value;
                    setFormData({ ...formData, education: list });
                  }}
                />
                <TextField
                  label="Okuw jaýy (University / School)"
                  size="small"
                  fullWidth
                  value={edu.school || ""}
                  onChange={(e) => {
                    const list = [...(formData.education || [])];
                    list[idx].school = e.target.value;
                    setFormData({ ...formData, education: list });
                  }}
                />
                <TextField
                  label="Gutarylan ýyly / Maglumat"
                  size="small"
                  fullWidth
                  value={edu.period || ""}
                  onChange={(e) => {
                    const list = [...(formData.education || [])];
                    list[idx].period = e.target.value;
                    setFormData({ ...formData, education: list });
                  }}
                />
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddEducation}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
            >
              Täze bilim goş
            </Button>
          </Box>
        )}

        {/* 7. Certifications */}
        {sectionKey === "certifications" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {(formData.certifications || []).map((cert, idx) => (
              <Box key={cert.id || idx} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <TextField
                  label="Sertifikat ady"
                  size="small"
                  fullWidth
                  value={cert.title || ""}
                  onChange={(e) => {
                    const list = [...(formData.certifications || [])];
                    list[idx].title = e.target.value;
                    setFormData({ ...formData, certifications: list });
                  }}
                />
                <TextField
                  label="Ýyly"
                  size="small"
                  sx={{ width: 120 }}
                  value={cert.year || ""}
                  onChange={(e) => {
                    const list = [...(formData.certifications || [])];
                    list[idx].year = e.target.value;
                    setFormData({ ...formData, certifications: list });
                  }}
                />
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddCertification}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
            >
              Sertifikat goş
            </Button>
          </Box>
        )}

        {/* 8. Languages */}
        {sectionKey === "languages" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {(formData.languages || []).map((lang, idx) => (
              <Box key={lang.id || idx} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <TextField
                  label="Dil ady"
                  size="small"
                  fullWidth
                  value={lang.name || ""}
                  onChange={(e) => {
                    const list = [...(formData.languages || [])];
                    list[idx].name = e.target.value;
                    setFormData({ ...formData, languages: list });
                  }}
                />
                <TextField
                  label="Derejesi (Meselem: Native, Fluent, Intermediate)"
                  size="small"
                  fullWidth
                  value={lang.level || ""}
                  onChange={(e) => {
                    const list = [...(formData.languages || [])];
                    list[idx].level = e.target.value;
                    setFormData({ ...formData, languages: list });
                  }}
                />
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddLanguage}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
            >
              Dil goş
            </Button>
          </Box>
        )}

        {/* 9. References */}
        {sectionKey === "references" && (
          <TextField
            label="Maslahatçylar (References)"
            fullWidth
            multiline
            rows={3}
            value={
              (formData.references || []).map((r) => r.text || "").join("\n") || ""
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                references: e.target.value.split("\n").map((t) => ({ id: `ref-${Math.random()}`, text: t })),
              })
            }
          />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ borderRadius: "8px", textTransform: "none", color: "text.secondary" }}
        >
          Ýatyrmak
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 700,
            bgcolor: "#0c8a7b",
            "&:hover": { bgcolor: "#096e62" },
          }}
        >
          Ýatda sakla
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditSectionModal;
