import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  Grid,
  Avatar,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import CustomTextField from "../../components/CustomTextField";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import { FooterButton } from "../../components/Dialog/FooterButton";
import { useLocale } from "../../hooks/useLocale";

const EditSectionModal = ({ open, onClose, sectionKey, profileData, onSave, isSaving = false }) => {
  const { t } = useLocale();
  const fileInputRef = useRef(null);

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      full_name: "",
      role: "",
      status: "",
      avatar_url: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      personal_summary: "",
      references_text: "",
    },
  });

  const watchedAvatarUrl = useWatch({ control, name: "avatar_url" });
  const watchedFullName = useWatch({ control, name: "full_name" });

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
      const refText =
        profileData.references_text ||
        (profileData.references || []).map((r) => r.text || "").join("\n");

      reset({
        full_name: profileData.full_name || profileData.fullName || "",
        role: profileData.role || "",
        status: profileData.status || "",
        avatar_url: profileData.avatar_url || profileData.avatarUrl || "",
        email: contact.email || "",
        phone: contact.phone || "",
        location: contact.location || "",
        website: contact.website || "",
        linkedin: contact.linkedin || "",
        personal_summary: profileData.personal_summary || profileData.personalSummary || "",
        references_text: refText || "",
      });

      setSkillsList([...(profileData.skills || [])]);
      setExperienceList(
        JSON.parse(
          JSON.stringify(profileData.work_experience || profileData.workExperience || [])
        )
      );
      setEducationList(JSON.parse(JSON.stringify(profileData.education || [])));
      setCertificationsList(JSON.parse(JSON.stringify(profileData.certifications || [])));
      setLanguagesList(JSON.parse(JSON.stringify(profileData.languages || [])));
      setNewSkillInput("");
    }
  }, [open, profileData, reset]);

  if (!open) return null;

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("profile.photoHint"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setValue("avatar_url", dataUrl, { shouldDirty: true });
        toast.success(t("profile.saveSuccess"));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setValue("avatar_url", "", { shouldDirty: true });
  };

  const getSectionTitle = () => {
    switch (sectionKey) {
      case "basic":
        return t("profile.editTitleBasic");
      case "contact":
        return t("profile.editTitleContact");
      case "skills":
        return t("profile.editTitleSkills");
      case "summary":
        return t("profile.editTitleSummary");
      case "experience":
        return t("profile.editTitleExperience");
      case "education":
        return t("profile.editTitleEducation");
      case "certifications":
        return t("profile.editTitleCertifications");
      case "languages":
        return t("profile.editTitleLanguages");
      case "references":
        return t("profile.editTitleReferences");
      default:
        return t("edit");
    }
  };

  const handleFormSubmit = (data) => {
    let updated = {
      ...profileData,
      full_name: profileData.full_name || profileData.fullName,
      role: profileData.role,
      status: profileData.status,
      avatar_url: profileData.avatar_url || profileData.avatarUrl,
      contact: { ...(profileData.contact || {}) },
      skills: [...skillsList],
      personal_summary: profileData.personal_summary || profileData.personalSummary,
      work_experience: [...experienceList],
      education: [...educationList],
      certifications: [...certificationsList],
      languages: [...languagesList],
      references: (data.references_text || "")
        .split("\n")
        .filter(Boolean)
        .map((text) => ({ id: `ref-${Math.random()}`, text })),
      references_text: data.references_text || "",
    };

    if (sectionKey === "basic") {
      updated.full_name = data.full_name;
      updated.role = data.role;
      updated.status = data.status;
      updated.avatar_url = data.avatar_url;
    } else if (sectionKey === "contact") {
      updated.contact = {
        email: data.email,
        phone: data.phone,
        location: data.location,
        website: data.website,
        linkedin: data.linkedin,
      };
    } else if (sectionKey === "summary") {
      updated.personal_summary = data.personal_summary;
    } else if (sectionKey === "skills") {
      updated.skills = skillsList;
    } else if (sectionKey === "experience") {
      updated.work_experience = experienceList;
    } else if (sectionKey === "education") {
      updated.education = educationList;
    } else if (sectionKey === "certifications") {
      updated.certifications = certificationsList;
    } else if (sectionKey === "languages") {
      updated.languages = languagesList;
    } else if (sectionKey === "references") {
      updated.references_text = data.references_text;
      updated.references = (data.references_text || "")
        .split("\n")
        .filter(Boolean)
        .map((text) => ({ id: `ref-${Math.random()}`, text }));
    }

    onSave(updated);
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
    <CustomDialog open={open} close={onClose} widthX={660}>
      <CustomDialogHeader variant="h5" title={getSectionTitle()} />
      <CustomForm handleSubmit={handleSubmit(handleFormSubmit)}>
        {/* 1. Basic Info & Photo Upload */}
        {sectionKey === "basic" && (
          <Grid container spacing={2.25}>
            {/* Interactive Avatar Upload Box */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: "12px",
                  border: "1px dashed",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(255,255,255,0.18)" : "#cbd5e1",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  flexWrap: "wrap",
                }}
              >
                <Avatar
                  src={watchedAvatarUrl}
                  alt={watchedFullName}
                  sx={{
                    width: 76,
                    height: 76,
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
                    border: "2px solid #0E8584",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    bgcolor: "#0E8584",
                  }}
                >
                  {watchedFullName?.charAt(0) || "U"}
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {t("profile.avatarUrl")}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
                    {t("profile.photoHint")}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/png, image/jpeg, image/webp"
                      style={{ display: "none" }}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => fileInputRef.current?.click()}
                      startIcon={<PhotoCameraRoundedIcon sx={{ fontSize: 17 }} />}
                      sx={{
                        borderRadius: "7px",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        bgcolor: "#0E8584",
                        border: "0.5px solid #2CA7A6",
                        color: "#ffffff",
                        "&:hover": { bgcolor: "#0C7776" },
                      }}
                    >
                      {watchedAvatarUrl ? t("profile.changePhoto") : t("profile.uploadPhoto")}
                    </Button>

                    {watchedAvatarUrl && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleRemovePhoto}
                        startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />}
                        sx={{
                          borderRadius: "7px",
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          borderColor: "error.main",
                          color: "error.main",
                          "&:hover": {
                            borderColor: "error.dark",
                            backgroundColor: "rgba(239, 68, 68, 0.08)",
                          },
                        }}
                      >
                        {t("profile.removePhoto")}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="full_name"
                control={control}
                label={t("profile.fullName")}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="role"
                control={control}
                label={t("profile.role")}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="status"
                control={control}
                label={t("profile.status")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="avatar_url"
                control={control}
                label="Image URL (Alternative)"
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
                label={t("profile.email")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="phone"
                control={control}
                label={t("profile.phone")}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                name="location"
                control={control}
                label={t("profile.location")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="website"
                control={control}
                label={t("profile.website")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="linkedin"
                control={control}
                label={t("profile.linkedin")}
              />
            </Grid>
          </Grid>
        )}

        {/* 3. Personal Summary */}
        {sectionKey === "summary" && (
          <Grid container spacing={2.25}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                name="personal_summary"
                control={control}
                label={t("profile.personalSummary")}
                multiline
                rows={5}
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
                  {t("profile.addSkill")}
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
                {t("profile.addSkill")}
              </Button>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mb: 1, display: "block" }}>
                {t("profile.currentSkills")} ({skillsList.length}):
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
                    #{idx + 1}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => handleRemoveExperience(idx)}>
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                      {t("profile.roleLabel")}
                    </Typography>
                    <input
                      type="text"
                      value={exp.role || ""}
                      onChange={(e) => handleUpdateExperience(idx, "role", e.target.value)}
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
                      {t("profile.company")}
                    </Typography>
                    <input
                      type="text"
                      value={exp.company || ""}
                      onChange={(e) => handleUpdateExperience(idx, "company", e.target.value)}
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
                      {t("profile.location")}
                    </Typography>
                    <input
                      type="text"
                      value={exp.location || ""}
                      onChange={(e) => handleUpdateExperience(idx, "location", e.target.value)}
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
                      {t("profile.period")}
                    </Typography>
                    <input
                      type="text"
                      value={exp.period || ""}
                      onChange={(e) => handleUpdateExperience(idx, "period", e.target.value)}
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
                      {t("profile.bullets")}
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
              {t("profile.addExperience")}
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
                    #{idx + 1}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => handleRemoveEducation(idx)}>
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                      {t("profile.degree")}
                    </Typography>
                    <input
                      type="text"
                      value={edu.degree || ""}
                      onChange={(e) => handleUpdateEducation(idx, "degree", e.target.value)}
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
                      {t("profile.school")}
                    </Typography>
                    <input
                      type="text"
                      value={edu.school || ""}
                      onChange={(e) => handleUpdateEducation(idx, "school", e.target.value)}
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
                      {t("profile.period")}
                    </Typography>
                    <input
                      type="text"
                      value={edu.period || ""}
                      onChange={(e) => handleUpdateEducation(idx, "period", e.target.value)}
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
              {t("profile.addEducation")}
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
                  placeholder={t("profile.certTitle")}
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
                  placeholder={t("profile.year")}
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
              {t("profile.addCertification")}
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
                  placeholder={t("profile.languageName")}
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
                  placeholder={t("profile.languageLevel")}
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
              {t("profile.addLanguage")}
            </Button>
          </Box>
        )}

        {/* 9. References */}
        {sectionKey === "references" && (
          <Grid container spacing={2.25}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                name="references_text"
                control={control}
                label={t("profile.references")}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        )}

        {/* Standard Project Footer Buttons */}
        <FooterButton onCancel={onClose} loading={isSaving} saveText={t("save")} />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditSectionModal;
