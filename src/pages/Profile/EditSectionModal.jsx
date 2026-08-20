import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  Grid,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import CustomTextField from "../../components/CustomTextField";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import { FooterButton } from "../../components/Dialog/FooterButton";
import { useLocale } from "../../hooks/useLocale";

const EditSectionModal = ({ open, onClose, sectionKey, profileData, onSave }) => {
  const { t } = useLocale();

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      fullName: "",
      role: "",
      status: "",
      avatarUrl: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      personalSummary: "",
      referencesText: "",
    },
  });

  // Dynamic Array States for Skills, Experience, Education, Certifications, Languages
  const [skillsList, setSkillsList] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [experienceList, setExperienceList] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [certificationsList, setCertificationsList] = useState([]);
  const [languagesList, setLanguagesList] = useState([]);

  useEffect(() => {
    if (open && profileData) {
      const contact = profileData.contact || {};
      reset({
        fullName: profileData.fullName || "",
        role: profileData.role || "",
        status: profileData.status || "",
        avatarUrl: profileData.avatarUrl || "",
        email: contact.email || "",
        phone: contact.phone || "",
        location: contact.location || "",
        website: contact.website || "",
        linkedin: contact.linkedin || "",
        personalSummary: profileData.personalSummary || "",
        referencesText: (profileData.references || []).map((r) => r.text || "").join("\n"),
      });

      setSkillsList([...(profileData.skills || [])]);
      setExperienceList(JSON.parse(JSON.stringify(profileData.workExperience || [])));
      setEducationList(JSON.parse(JSON.stringify(profileData.education || [])));
      setCertificationsList(JSON.parse(JSON.stringify(profileData.certifications || [])));
      setLanguagesList(JSON.parse(JSON.stringify(profileData.languages || [])));
      setNewSkillInput("");
    }
  }, [open, profileData, reset]);

  if (!open) return null;

  const getSectionTitle = () => {
    switch (sectionKey) {
      case "basic":
        return "Esasy Maglumatlary Üýtgetmek";
      case "contact":
        return "Habarlaşmak Maglumatlary";
      case "skills":
        return "Ukyplar we Tejribeler (Skills)";
      case "summary":
        return "Gysgaça Maglumat (Personal Summary)";
      case "experience":
        return "Iş Tejribesi (Work Experience)";
      case "education":
        return "Bilimi (Education)";
      case "certifications":
        return "Sertifikatlar we Sylaglar";
      case "languages":
        return "Diller (Languages)";
      case "references":
        return "Maslahatçylar (References)";
      default:
        return "Maglumatlary Üýtgetmek";
    }
  };

  const handleFormSubmit = (data) => {
    let updated = { ...profileData };

    if (sectionKey === "basic") {
      updated.fullName = data.fullName;
      updated.role = data.role;
      updated.status = data.status;
      updated.avatarUrl = data.avatarUrl;
    } else if (sectionKey === "contact") {
      updated.contact = {
        email: data.email,
        phone: data.phone,
        location: data.location,
        website: data.website,
        linkedin: data.linkedin,
      };
    } else if (sectionKey === "summary") {
      updated.personalSummary = data.personalSummary;
    } else if (sectionKey === "skills") {
      updated.skills = skillsList;
    } else if (sectionKey === "experience") {
      updated.workExperience = experienceList;
    } else if (sectionKey === "education") {
      updated.education = educationList;
    } else if (sectionKey === "certifications") {
      updated.certifications = certificationsList;
    } else if (sectionKey === "languages") {
      updated.languages = languagesList;
    } else if (sectionKey === "references") {
      updated.references = (data.referencesText || "")
        .split("\n")
        .filter(Boolean)
        .map((text) => ({ id: `ref-${Math.random()}`, text }));
    }

    onSave(updated);
    toast.success("Maglumatlar üstünlikli ýatda saklandy!");
    onClose();
  };

  // Skill Add / Remove
  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (skillsList.includes(trimmed)) return;
    setSkillsList((prev) => [...prev, trimmed]);
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsList((prev) => prev.filter((s) => s !== skillToRemove));
  };

  // Experience Helpers
  const handleAddExperience = () => {
    setExperienceList((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}`,
        role: "",
        company: "",
        location: "",
        period: "",
        bullets: [""],
      },
    ]);
  };

  const handleUpdateExperience = (idx, field, val) => {
    setExperienceList((prev) => {
      const list = [...prev];
      list[idx] = { ...list[idx], [field]: val };
      return list;
    });
  };

  const handleRemoveExperience = (idx) => {
    setExperienceList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Education Helpers
  const handleAddEducation = () => {
    setEducationList((prev) => [
      ...prev,
      {
        id: `edu-${Date.now()}`,
        degree: "",
        school: "",
        period: "",
      },
    ]);
  };

  const handleUpdateEducation = (idx, field, val) => {
    setEducationList((prev) => {
      const list = [...prev];
      list[idx] = { ...list[idx], [field]: val };
      return list;
    });
  };

  const handleRemoveEducation = (idx) => {
    setEducationList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Certification Helpers
  const handleAddCertification = () => {
    setCertificationsList((prev) => [
      ...prev,
      {
        id: `cert-${Date.now()}`,
        title: "",
        year: new Date().getFullYear().toString(),
      },
    ]);
  };

  const handleUpdateCertification = (idx, field, val) => {
    setCertificationsList((prev) => {
      const list = [...prev];
      list[idx] = { ...list[idx], [field]: val };
      return list;
    });
  };

  const handleRemoveCertification = (idx) => {
    setCertificationsList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Language Helpers
  const handleAddLanguage = () => {
    setLanguagesList((prev) => [
      ...prev,
      {
        id: `lang-${Date.now()}`,
        name: "",
        level: "Fluent",
      },
    ]);
  };

  const handleUpdateLanguage = (idx, field, val) => {
    setLanguagesList((prev) => {
      const list = [...prev];
      list[idx] = { ...list[idx], [field]: val };
      return list;
    });
  };

  const handleRemoveLanguage = (idx) => {
    setLanguagesList((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <CustomDialog open={open} close={onClose} widthX={640}>
      <CustomDialogHeader variant="h5" title={getSectionTitle()} />
      <CustomForm handleSubmit={handleSubmit(handleFormSubmit)}>
        {/* 1. Basic Info */}
        {sectionKey === "basic" && (
          <Grid container spacing={2.25}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="fullName"
                control={control}
                label="Doly Adyňyz"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="role"
                control={control}
                label="Wezipäňiz / Hünäriňiz"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="status"
                control={control}
                label="Ýagdaýy / Status"
                placeholder="Meselem: Available for hire"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="avatarUrl"
                control={control}
                label="Avatar / Surat URL"
                placeholder="https://..."
              />
            </Grid>
          </Grid>
        )}

        {/* 2. Contact Info */}
        {sectionKey === "contact" && (
          <Grid container spacing={2.25}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="email"
                control={control}
                label="Email"
                placeholder="hello@example.com"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="phone"
                control={control}
                label="Telefon belgisi"
                placeholder="+993 (65) 12-34-56"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                name="location"
                control={control}
                label="Salgy / Ýerleşýän ýeri"
                placeholder="Aşgabat, Türkmenistan"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="website"
                control={control}
                label="Web sahypa / Portfolio"
                placeholder="mysite.design"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="linkedin"
                control={control}
                label="LinkedIn Profil"
                placeholder="linkedin.com/in/user"
              />
            </Grid>
          </Grid>
        )}

        {/* 3. Personal Summary */}
        {sectionKey === "summary" && (
          <Grid container spacing={2.25}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                name="personalSummary"
                control={control}
                label="Gysgaça terjimehalyňyz"
                multiline
                rows={5}
                placeholder="Tejribäňiz we hünär başarnyklaryňyz barada gysgaça beýan..."
              />
            </Grid>
          </Grid>
        )}

        {/* 4. Skills */}
        {sectionKey === "skills" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", mb: 0.75 }}>
                  Täze ukyp goşmak
                </Typography>
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Meselem: Amadeus, Figma, React..."
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 14px",
                    borderRadius: "7px",
                    border: "1px solid rgba(0, 0, 0, 0.23)",
                    fontSize: "0.875rem",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "transparent",
                    color: "inherit",
                  }}
                />
              </Box>
              <Button
                variant="contained"
                onClick={handleAddSkill}
                sx={{
                  height: "44px",
                  px: 3,
                  borderRadius: "7px",
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: "#0E8584",
                  border: "0.5px solid #2CA7A6",
                  color: "#ffffff",
                  "&:hover": { bgcolor: "#0C7776" },
                }}
              >
                Goş
              </Button>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mb: 1, display: "block" }}>
                Häzirki ukyplar ({skillsList.length}):
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {skillsList.map((skill, idx) => (
                  <Chip
                    key={idx}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                    sx={{
                      borderRadius: "7px",
                      fontWeight: 600,
                      backgroundColor: "rgba(14, 133, 132, 0.12)",
                      color: "#0E8584",
                      "& .MuiChip-deleteIcon": {
                        color: "#0E8584",
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* 5. Work Experience */}
        {sectionKey === "experience" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {experienceList.map((exp, idx) => (
              <Box
                key={exp.id || idx}
                sx={{
                  p: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "10px",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.02)" : "#fafafa",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0E8584" }}>
                    Wezipe #{idx + 1}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => handleRemoveExperience(idx)}>
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                      Wezipe (Role)
                    </Typography>
                    <input
                      type="text"
                      value={exp.role || ""}
                      onChange={(e) => handleUpdateExperience(idx, "role", e.target.value)}
                      placeholder="Senior Product Designer"
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 12px",
                        borderRadius: "7px",
                        border: "1px solid rgba(0, 0, 0, 0.2)",
                        fontSize: "0.875rem",
                        boxSizing: "border-box",
                        backgroundColor: "transparent",
                        color: "inherit",
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                      Kompaniýa (Company)
                    </Typography>
                    <input
                      type="text"
                      value={exp.company || ""}
                      onChange={(e) => handleUpdateExperience(idx, "company", e.target.value)}
                      placeholder="Oguz Travel"
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 12px",
                        borderRadius: "7px",
                        border: "1px solid rgba(0, 0, 0, 0.2)",
                        fontSize: "0.875rem",
                        boxSizing: "border-box",
                        backgroundColor: "transparent",
                        color: "inherit",
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                      Ýerleşýän ýeri (Location)
                    </Typography>
                    <input
                      type="text"
                      value={exp.location || ""}
                      onChange={(e) => handleUpdateExperience(idx, "location", e.target.value)}
                      placeholder="Ashgabat / Remote"
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 12px",
                        borderRadius: "7px",
                        border: "1px solid rgba(0, 0, 0, 0.2)",
                        fontSize: "0.875rem",
                        boxSizing: "border-box",
                        backgroundColor: "transparent",
                        color: "inherit",
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                      Döwri (Period)
                    </Typography>
                    <input
                      type="text"
                      value={exp.period || ""}
                      onChange={(e) => handleUpdateExperience(idx, "period", e.target.value)}
                      placeholder="Jan 2021 - Present"
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 12px",
                        borderRadius: "7px",
                        border: "1px solid rgba(0, 0, 0, 0.2)",
                        fontSize: "0.875rem",
                        boxSizing: "border-box",
                        backgroundColor: "transparent",
                        color: "inherit",
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                      Açyklama / Ýeten netijeleriňiz (Her setire bir punkt)
                    </Typography>
                    <textarea
                      rows={3}
                      value={(exp.bullets || []).join("\n")}
                      onChange={(e) => handleUpdateExperience(idx, "bullets", e.target.value.split("\n"))}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "7px",
                        border: "1px solid rgba(0, 0, 0, 0.2)",
                        fontSize: "0.875rem",
                        boxSizing: "border-box",
                        backgroundColor: "transparent",
                        color: "inherit",
                        fontFamily: "inherit",
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddExperience}
              sx={{
                borderRadius: "7px",
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#0E8584",
                color: "#0E8584",
                "&:hover": { borderColor: "#0C7776", backgroundColor: "rgba(14, 133, 132, 0.04)" },
              }}
            >
              Täze iş tejribesini goş
            </Button>
          </Box>
        )}

        {/* 6. Education */}
        {sectionKey === "education" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {educationList.map((edu, idx) => (
              <Box
                key={edu.id || idx}
                sx={{
                  p: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "10px",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.02)" : "#fafafa",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0E8584" }}>
                    Bilim #{idx + 1}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => handleRemoveEducation(idx)}>
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                      Hünäri / Derejesi (Degree)
                    </Typography>
                    <input
                      type="text"
                      value={edu.degree || ""}
                      onChange={(e) => handleUpdateEducation(idx, "degree", e.target.value)}
                      placeholder="Bachelor of Science in CS"
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 12px",
                        borderRadius: "7px",
                        border: "1px solid rgba(0, 0, 0, 0.2)",
                        fontSize: "0.875rem",
                        boxSizing: "border-box",
                        backgroundColor: "transparent",
                        color: "inherit",
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                      Okuw jaýy (University)
                    </Typography>
                    <input
                      type="text"
                      value={edu.school || ""}
                      onChange={(e) => handleUpdateEducation(idx, "school", e.target.value)}
                      placeholder="Magtymguly adyndaky TDU"
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 12px",
                        borderRadius: "7px",
                        border: "1px solid rgba(0, 0, 0, 0.2)",
                        fontSize: "0.875rem",
                        boxSizing: "border-box",
                        backgroundColor: "transparent",
                        color: "inherit",
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                      Gutarylan senesi / Maglumat
                    </Typography>
                    <input
                      type="text"
                      value={edu.period || ""}
                      onChange={(e) => handleUpdateEducation(idx, "period", e.target.value)}
                      placeholder="Graduated: 2020 • GPA: 3.8"
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 12px",
                        borderRadius: "7px",
                        border: "1px solid rgba(0, 0, 0, 0.2)",
                        fontSize: "0.875rem",
                        boxSizing: "border-box",
                        backgroundColor: "transparent",
                        color: "inherit",
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddEducation}
              sx={{
                borderRadius: "7px",
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#0E8584",
                color: "#0E8584",
                "&:hover": { borderColor: "#0C7776", backgroundColor: "rgba(14, 133, 132, 0.04)" },
              }}
            >
              Täze bilim goş
            </Button>
          </Box>
        )}

        {/* 7. Certifications */}
        {sectionKey === "certifications" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {certificationsList.map((cert, idx) => (
              <Box key={cert.id || idx} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <input
                  type="text"
                  value={cert.title || ""}
                  onChange={(e) => handleUpdateCertification(idx, "title", e.target.value)}
                  placeholder="Sertifikat ady"
                  style={{
                    flex: 1,
                    height: "40px",
                    padding: "0 12px",
                    borderRadius: "7px",
                    border: "1px solid rgba(0, 0, 0, 0.2)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                    backgroundColor: "transparent",
                    color: "inherit",
                  }}
                />
                <input
                  type="text"
                  value={cert.year || ""}
                  onChange={(e) => handleUpdateCertification(idx, "year", e.target.value)}
                  placeholder="Ýyly"
                  style={{
                    width: "110px",
                    height: "40px",
                    padding: "0 12px",
                    borderRadius: "7px",
                    border: "1px solid rgba(0, 0, 0, 0.2)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                    backgroundColor: "transparent",
                    color: "inherit",
                  }}
                />
                <IconButton size="small" color="error" onClick={() => handleRemoveCertification(idx)}>
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddCertification}
              sx={{
                borderRadius: "7px",
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#0E8584",
                color: "#0E8584",
                "&:hover": { borderColor: "#0C7776", backgroundColor: "rgba(14, 133, 132, 0.04)" },
              }}
            >
              Sertifikat goş
            </Button>
          </Box>
        )}

        {/* 8. Languages */}
        {sectionKey === "languages" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {languagesList.map((lang, idx) => (
              <Box key={lang.id || idx} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <input
                  type="text"
                  value={lang.name || ""}
                  onChange={(e) => handleUpdateLanguage(idx, "name", e.target.value)}
                  placeholder="Dil ady (meselem: English)"
                  style={{
                    flex: 1,
                    height: "40px",
                    padding: "0 12px",
                    borderRadius: "7px",
                    border: "1px solid rgba(0, 0, 0, 0.2)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                    backgroundColor: "transparent",
                    color: "inherit",
                  }}
                />
                <input
                  type="text"
                  value={lang.level || ""}
                  onChange={(e) => handleUpdateLanguage(idx, "level", e.target.value)}
                  placeholder="Derejesi (Native / Fluent)"
                  style={{
                    width: "140px",
                    height: "40px",
                    padding: "0 12px",
                    borderRadius: "7px",
                    border: "1px solid rgba(0, 0, 0, 0.2)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                    backgroundColor: "transparent",
                    color: "inherit",
                  }}
                />
                <IconButton size="small" color="error" onClick={() => handleRemoveLanguage(idx)}>
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddLanguage}
              sx={{
                borderRadius: "7px",
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#0E8584",
                color: "#0E8584",
                "&:hover": { borderColor: "#0C7776", backgroundColor: "rgba(14, 133, 132, 0.04)" },
              }}
            >
              Dil goş
            </Button>
          </Box>
        )}

        {/* 9. References */}
        {sectionKey === "references" && (
          <Grid container spacing={2.25}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                name="referencesText"
                control={control}
                label="Maslahatçylar (References - her setire biri)"
                multiline
                rows={4}
                placeholder="Available upon request."
              />
            </Grid>
          </Grid>
        )}

        {/* Standard Project Footer Buttons */}
        <FooterButton onCancel={onClose} saveText={t("save") || "Ýatda sakla"} />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditSectionModal;
