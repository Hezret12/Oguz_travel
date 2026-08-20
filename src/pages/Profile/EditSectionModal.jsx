import { useState, useRef } from "react";
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
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import CustomTextField from "../../components/CustomTextField";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import { FooterButton } from "../../components/Dialog/FooterButton";
import { useLocale } from "../../hooks/useLocale";
import { getFileUrl } from "../../functions/generalHelpers";

const formatPlainString = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val.tk || val.en || val.ru || val.fullName || val.name || val.title || "";
  }
  return String(val);
};

const EditSectionModal = ({ open, onClose, sectionKey, profileData, onSave, isSaving = false }) => {
  const { t } = useLocale();
  const fileInputRef = useRef(null);

  const contact = profileData?.contact || {};

  const { control, handleSubmit, setValue } = useForm({
    values: {
      full_name: formatPlainString(profileData?.full_name || profileData?.fullName),
      role: formatPlainString(profileData?.role),
      status: formatPlainString(profileData?.status),
      avatar_url: formatPlainString(profileData?.avatar_url || profileData?.avatarUrl),
      email: formatPlainString(contact.email),
      phone: formatPlainString(contact.phone),
      location: formatPlainString(contact.location),
      website: formatPlainString(contact.website),
      linkedin: formatPlainString(contact.linkedin),
      personal_summary: formatPlainString(profileData?.personal_summary || profileData?.personalSummary),
      new_skill: "",
      work_experience: (Array.isArray(profileData?.work_experience)
        ? profileData.work_experience
        : Array.isArray(profileData?.workExperience)
        ? profileData.workExperience
        : []
      ).map((exp, idx) => ({
        id: exp?.id || `exp-${idx}`,
        role: formatPlainString(exp?.role),
        company: formatPlainString(exp?.company),
        location: formatPlainString(exp?.location),
        period: formatPlainString(exp?.period),
        bullets: Array.isArray(exp?.bullets)
          ? exp.bullets.join("\n")
          : formatPlainString(exp?.bullets),
      })),
      education: (Array.isArray(profileData?.education)
        ? profileData.education
        : []
      ).map((edu, idx) => ({
        id: edu?.id || `edu-${idx}`,
        degree: formatPlainString(edu?.degree),
        school: formatPlainString(edu?.school),
        period: formatPlainString(edu?.period),
      })),
      languages: (Array.isArray(profileData?.languages)
        ? profileData.languages
        : []
      ).map((lang, idx) => ({
        id: lang?.id || `lang-${idx}`,
        name: formatPlainString(lang?.name),
        level: formatPlainString(lang?.level),
      })),
    },
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({ control, name: "work_experience" });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({ control, name: "education" });

  const {
    fields: languageFields,
    append: appendLanguage,
    remove: removeLanguage,
  } = useFieldArray({ control, name: "languages" });

  const watchedAvatarUrl = useWatch({ control, name: "avatar_url" });
  const watchedFullName = useWatch({ control, name: "full_name" });
  const watchedNewSkill = useWatch({ control, name: "new_skill" });

  const [skillsList, setSkillsList] = useState([]);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const [prevModalKey, setPrevModalKey] = useState(null);
  const currentModalKey = open ? `${sectionKey}_${profileData?.updatedAt || profileData?.guid || "open"}` : null;
  if (currentModalKey !== prevModalKey) {
    setPrevModalKey(currentModalKey);
    setSkillsList([...(profileData?.skills || [])]);
    setSelectedImageFile(null);
  }

  if (!open) return null;

  const processImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Diňe surat faýllary (PNG, JPG, WEBP) kabul edilýär");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("profile.photoHint"));
      return;
    }

    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setValue("avatar_url", dataUrl, { shouldDirty: true });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    processImageFile(file);
  };

  const handleRemovePhoto = () => {
    setSelectedImageFile(null);
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
      case "languages":
        return t("profile.editTitleLanguages");
      default:
        return t("edit");
    }
  };

  const handleFormSubmit = (data) => {
    let updated = {
      ...profileData,
      full_name: formatPlainString(profileData.full_name || profileData.fullName),
      role: formatPlainString(profileData.role),
      status: formatPlainString(profileData.status),
      avatar_url: formatPlainString(profileData.avatar_url || profileData.avatarUrl),
      contact: { ...(profileData.contact || {}) },
      skills: [...skillsList],
      personal_summary: formatPlainString(profileData.personal_summary || profileData.personalSummary),
      work_experience: Array.isArray(profileData.work_experience || profileData.workExperience)
        ? [...(profileData.work_experience || profileData.workExperience)]
        : [],
      education: Array.isArray(profileData.education) ? [...profileData.education] : [],
      languages: Array.isArray(profileData.languages) ? [...profileData.languages] : [],
    };

    if (sectionKey === "basic") {
      updated.full_name = formatPlainString(data.full_name);
      updated.avatar_url = data.avatar_url;
      if (selectedImageFile) {
        updated.avatar_file = selectedImageFile;
      }
    } else if (sectionKey === "contact") {
      updated.contact = {
        email: formatPlainString(data.email),
        phone: formatPlainString(data.phone),
        location: formatPlainString(data.location),
        website: formatPlainString(data.website),
        linkedin: formatPlainString(data.linkedin),
      };
    } else if (sectionKey === "summary") {
      updated.personal_summary = formatPlainString(data.personal_summary);
    } else if (sectionKey === "skills") {
      updated.skills = skillsList;
    } else if (sectionKey === "experience") {
      updated.work_experience = (data.work_experience || []).map((exp) => ({
        id: exp.id || `exp-${Date.now()}`,
        role: formatPlainString(exp.role),
        company: formatPlainString(exp.company),
        location: formatPlainString(exp.location),
        period: formatPlainString(exp.period),
        bullets: typeof exp.bullets === "string" ? exp.bullets.split("\n").filter(Boolean) : (exp.bullets || []),
      }));
    } else if (sectionKey === "education") {
      updated.education = (data.education || []).map((edu) => ({
        id: edu.id || `edu-${Date.now()}`,
        degree: formatPlainString(edu.degree),
        school: formatPlainString(edu.school),
        period: formatPlainString(edu.period),
      }));
    } else if (sectionKey === "languages") {
      updated.languages = (data.languages || []).map((lang) => ({
        id: lang.id || `lang-${Date.now()}`,
        name: formatPlainString(lang.name),
        level: formatPlainString(lang.level),
      }));
    }

    onSave(updated);
    onClose();
  };

  // Skill Add / Remove
  const handleAddSkill = () => {
    const trimmed = (watchedNewSkill || "").trim();
    if (!trimmed) return;
    if (skillsList.includes(trimmed)) return;
    setSkillsList((prev) => [...prev, trimmed]);
    setValue("new_skill", "");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsList((prev) => prev.filter((s) => s !== skillToRemove));
  };

  return (
    <CustomDialog
      open={open}
      close={onClose}
      widthX={sectionKey === "experience" || sectionKey === "education" ? 640 : 520}
    >
      <CustomDialogHeader variant="h6" title={getSectionTitle()} />

      <CustomForm
        onSubmit={handleSubmit(handleFormSubmit)}
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(85vh - 70px)",
          overflow: "hidden",
        }}
      >
        {/* Scrollable Body */}
        <Box
          sx={{
            p: 3,
            overflowY: "auto",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "divider",
              borderRadius: "3px",
            },
          }}
        >
          {/* 1. Basic Info (Avatar & Full Name) */}
          {sectionKey === "basic" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Instagram-Style Minimal Avatar Container */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                pt: 1,
              }}
            >
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                style={{ display: "none" }}
              />

              {/* Clickable Avatar with Smooth Overlay */}
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  position: "relative",
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  cursor: "pointer",
                  overflow: "hidden",
                  "&:hover .instagram-avatar-overlay": {
                    opacity: 1,
                  },
                }}
              >
                <Avatar
                  src={getFileUrl(watchedAvatarUrl)}
                  alt={watchedFullName}
                  sx={{
                    width: 96,
                    height: 96,
                    border: "3px solid",
                    borderColor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "#e2e8f0",
                    bgcolor: "#0E8584",
                    color: "#ffffff",
                    fontSize: "2.2rem",
                    fontWeight: 800,
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                  }}
                >
                  {watchedFullName?.charAt(0) || "U"}
                </Avatar>

                {/* Dark Glassmorphic Hover Camera Icon */}
                <Box
                  className="instagram-avatar-overlay"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    backgroundColor: "rgba(0, 0, 0, 0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    opacity: 0,
                    transition: "opacity 0.2s ease",
                  }}
                >
                  <PhotoCameraRoundedIcon sx={{ fontSize: 28 }} />
                </Box>
              </Box>

              {/* Instagram-Style Action Links */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color: "#0E8584",
                    p: 0,
                    minWidth: "auto",
                    "&:hover": {
                      color: "#0C7776",
                      backgroundColor: "transparent",
                      textDecoration: "underline",
                    },
                  }}
                >
                  {watchedAvatarUrl
                    ? t("profile.changePhoto") || "Suraty çalyş"
                    : t("profile.uploadPhoto") || "Surat ýükle"}
                </Button>

                {watchedAvatarUrl && (
                  <>
                    <Typography sx={{ color: "text.disabled", fontSize: "0.8rem", userSelect: "none" }}>
                      •
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={handleRemovePhoto}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "error.main",
                        p: 0,
                        minWidth: "auto",
                        "&:hover": {
                          color: "error.dark",
                          backgroundColor: "transparent",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {t("profile.removePhoto") || "Suraty aýyr"}
                    </Button>
                  </>
                )}
              </Box>
            </Box>

            {/* Name Input */}
            <Box sx={{ width: "100%", mt: 1 }}>
              <CustomTextField
                name="full_name"
                control={control}
                label={t("profile.fullName")}
                required
              />
            </Box>
          </Box>
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
                <CustomTextField
                  name="new_skill"
                  control={control}
                  label={t("profile.addSkill")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
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
                  color: "#ffffff",
                  whiteSpace: "nowrap",
                  mb: "2px",
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
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(14, 133, 132, 0.2)" : "rgba(14, 133, 132, 0.1)",
                      color: "#0E8584",
                      border: "1px solid",
                      borderColor: "rgba(14, 133, 132, 0.3)",
                      "& .MuiChip-deleteIcon": {
                        color: "#0E8584",
                        "&:hover": { color: "error.main" },
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {experienceFields.map((fieldItem, idx) => (
              <Box
                key={fieldItem.id}
                sx={{
                  p: 1.75,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "8px",
                  backgroundColor: "background.paper",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0c8a7b", fontSize: "0.82rem" }}>
                    #{idx + 1}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => removeExperience(idx)} sx={{ p: 0.5 }}>
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </Box>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      name={`work_experience.${idx}.role`}
                      control={control}
                      label={t("profile.roleLabel")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      name={`work_experience.${idx}.company`}
                      control={control}
                      label={t("profile.company")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      name={`work_experience.${idx}.location`}
                      control={control}
                      label={t("profile.location")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      name={`work_experience.${idx}.period`}
                      control={control}
                      label={t("profile.period")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      name={`work_experience.${idx}.bullets`}
                      control={control}
                      label={t("profile.bullets")}
                      multiline
                      rows={2.5}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              variant="outlined"
              size="small"
              startIcon={<AddRoundedIcon />}
              onClick={() => appendExperience({ role: "", company: "", location: "", period: "", bullets: "" })}
              sx={{
                borderRadius: "7px",
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#0c8a7b",
                color: "#0c8a7b",
                py: 0.75,
                "&:hover": { borderColor: "#096e62", backgroundColor: "rgba(12, 138, 123, 0.04)" },
              }}
            >
              {t("profile.addExperience")}
            </Button>
          </Box>
        )}

        {/* 6. Education */}
        {sectionKey === "education" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {educationFields.map((fieldItem, idx) => (
              <Box
                key={fieldItem.id}
                sx={{
                  p: 1.75,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "8px",
                  backgroundColor: "background.paper",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0c8a7b", fontSize: "0.82rem" }}>
                    #{idx + 1}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => removeEducation(idx)} sx={{ p: 0.5 }}>
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </Box>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      name={`education.${idx}.degree`}
                      control={control}
                      label={t("profile.degree")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      name={`education.${idx}.school`}
                      control={control}
                      label={t("profile.school")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      name={`education.${idx}.period`}
                      control={control}
                      label={t("profile.period")}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              variant="outlined"
              size="small"
              startIcon={<AddRoundedIcon />}
              onClick={() => appendEducation({ degree: "", school: "", period: "" })}
              sx={{
                borderRadius: "7px",
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#0c8a7b",
                color: "#0c8a7b",
                py: 0.75,
                "&:hover": { borderColor: "#096e62", backgroundColor: "rgba(12, 138, 123, 0.04)" },
              }}
            >
              {t("profile.addEducation")}
            </Button>
          </Box>
        )}

        {/* 7. Languages */}
        {sectionKey === "languages" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {languageFields.map((fieldItem, idx) => (
              <Box
                key={fieldItem.id}
                sx={{
                  display: "flex",
                  gap: 1.25,
                  alignItems: "flex-start",
                  p: 1.25,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "8px",
                  backgroundColor: "background.paper",
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <CustomTextField
                    name={`languages.${idx}.name`}
                    control={control}
                    label={t("profile.languageName")}
                  />
                </Box>
                <Box sx={{ width: 160 }}>
                  <CustomTextField
                    name={`languages.${idx}.level`}
                    control={control}
                    label={t("profile.languageLevel")}
                  />
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeLanguage(idx)}
                  sx={{ mt: 3, p: 0.5 }}
                >
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Box>
            ))}

            <Button
              variant="outlined"
              size="small"
              startIcon={<AddRoundedIcon />}
              onClick={() => appendLanguage({ name: "", level: "" })}
              sx={{
                borderRadius: "7px",
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#0c8a7b",
                color: "#0c8a7b",
                py: 0.75,
                "&:hover": { borderColor: "#096e62", backgroundColor: "rgba(12, 138, 123, 0.04)" },
              }}
            >
              {t("profile.addLanguage")}
            </Button>
          </Box>
        )}
        </Box>

        {/* Fixed Pinned Footer */}
        <Box
          sx={{
            p: 1.5,
            px: 2.5,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <FooterButton
            onCancel={onClose}
            loading={isSaving}
            saveText={t("save")}
            sx={{ mt: 0 }}
          />
        </Box>
      </CustomForm>
    </CustomDialog>
  );
};

export default EditSectionModal;
