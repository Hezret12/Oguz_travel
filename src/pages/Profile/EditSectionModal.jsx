import { useState, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  Grid,
  Avatar,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
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

  const handleDownloadPhoto = async () => {
    if (selectedImageFile instanceof File) {
      const url = URL.createObjectURL(selectedImageFile);
      const link = document.createElement("a");
      link.href = url;
      link.download = selectedImageFile.name || `${(watchedFullName || "profile").trim().replace(/\s+/g, "_")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(t("profile.photoDownloaded") || "Surat üstünlikli ýüklendi");
      return;
    }

    const fullUrl = getFileUrl(watchedAvatarUrl);
    if (!fullUrl) return;

    try {
      const fileName = `${(watchedFullName || "profile").trim().replace(/\s+/g, "_")}_avatar.jpg`;
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success(t("profile.photoDownloaded") || "Surat üstünlikli ýüklendi");
    } catch {
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    }
  };

  const getSectionMetadata = () => {
    switch (sectionKey) {
      case "basic":
        return {
          title: t("profile.editTitleBasic"),
          icon: <AccountCircleOutlinedIcon sx={{ fontSize: 20 }} />,
        };
      case "contact":
        return {
          title: t("profile.editTitleContact"),
          icon: <ContactMailOutlinedIcon sx={{ fontSize: 20 }} />,
        };
      case "skills":
        return {
          title: t("profile.editTitleSkills"),
          icon: <PsychologyOutlinedIcon sx={{ fontSize: 20 }} />,
        };
      case "summary":
        return {
          title: t("profile.editTitleSummary"),
          icon: <FormatQuoteOutlinedIcon sx={{ fontSize: 20 }} />,
        };
      case "experience":
        return {
          title: t("profile.editTitleExperience"),
          icon: <WorkOutlineRoundedIcon sx={{ fontSize: 20 }} />,
        };
      case "education":
        return {
          title: t("profile.editTitleEducation"),
          icon: <SchoolOutlinedIcon sx={{ fontSize: 20 }} />,
        };
      case "languages":
        return {
          title: t("profile.editTitleLanguages"),
          icon: <TranslateRoundedIcon sx={{ fontSize: 20 }} />,
        };
      default:
        return {
          title: t("edit"),
          icon: null,
        };
    }
  };

  const { title: sectionTitle, icon: sectionIcon } = getSectionMetadata();

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
      widthX={sectionKey === "experience" || sectionKey === "education" ? 680 : 540}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 3, pt: 2.5, pb: 1.5 }}>
        {sectionIcon && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
            }}
          >
            {sectionIcon}
          </Box>
        )}
        <CustomDialogHeader
          variant="h6"
          title={sectionTitle}
          sx={{ p: 0, border: "none", flexGrow: 1 }}
        />
      </Box>

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
            p: { xs: 2.5, sm: 3 },
            pt: 1,
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
              {/* Avatar Uploader Card */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  p: 3,
                  borderRadius: "16px",
                  border: "1px dashed",
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
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

                {/* Avatar with Smooth Hover Camera Effect */}
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    position: "relative",
                    width: 108,
                    height: 108,
                    borderRadius: "50%",
                    p: "3.5px",
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(
                        theme.palette.primary.main,
                        0.3
                      )})`,
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                    "&:hover .avatar-modal-overlay": {
                      opacity: 1,
                    },
                  }}
                >
                  <Avatar
                    src={getFileUrl(watchedAvatarUrl)}
                    alt={watchedFullName}
                    sx={{
                      width: "100%",
                      height: "100%",
                      border: "3px solid",
                      borderColor: "background.paper",
                      bgcolor: "primary.main",
                      color: "#ffffff",
                      fontSize: "2.3rem",
                      fontWeight: 800,
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    {watchedFullName?.charAt(0) || "U"}
                  </Avatar>

                  {/* Dark Glassmorphic Hover Camera Overlay */}
                  <Box
                    className="avatar-modal-overlay"
                    sx={{
                      position: "absolute",
                      inset: "3.5px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(0, 0, 0, 0.48)",
                      backdropFilter: "blur(2px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    <PhotoCameraRoundedIcon sx={{ fontSize: 26 }} />
                  </Box>
                </Box>

                {/* Pill Action Buttons */}
                <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 650,
                      fontSize: "0.82rem",
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.35),
                      color: "primary.main",
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                      },
                    }}
                  >
                    {watchedAvatarUrl
                      ? t("profile.changePhoto") || "Suraty çalyş"
                      : t("profile.uploadPhoto") || "Surat ýükle"}
                  </Button>

                  {watchedAvatarUrl && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                        onClick={handleDownloadPhoto}
                        sx={{
                          borderRadius: "8px",
                          textTransform: "none",
                          fontWeight: 650,
                          fontSize: "0.82rem",
                          borderColor: "divider",
                          color: "text.primary",
                          bgcolor: "background.paper",
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        {t("profile.downloadPhoto") || "Suraty ýükläp al"}
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                        onClick={handleRemovePhoto}
                        sx={{
                          borderRadius: "8px",
                          textTransform: "none",
                          fontWeight: 650,
                          fontSize: "0.82rem",
                          borderColor: (theme) => alpha(theme.palette.error.main, 0.3),
                          color: "error.main",
                          bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
                          "&:hover": {
                            borderColor: "error.main",
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
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
              <Box sx={{ width: "100%" }}>
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
                  rows={6}
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
                  startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    height: "44px",
                    px: 3,
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(
                        theme.palette.primary.main,
                        0.85
                      )} 100%)`,
                    color: "#ffffff",
                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                    whiteSpace: "nowrap",
                    mb: "2px",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
                    },
                  }}
                >
                  {t("profile.addSkill")}
                </Button>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, mb: 1.25, display: "block", fontSize: "0.82rem" }}>
                  {t("profile.currentSkills")} ({skillsList.length}):
                </Typography>
                {skillsList.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {skillsList.map((skill, idx) => (
                      <Chip
                        key={idx}
                        label={skill}
                        onDelete={() => handleRemoveSkill(skill)}
                        sx={{
                          borderRadius: "8px",
                          fontWeight: 650,
                          fontSize: "0.82rem",
                          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                          color: "primary.main",
                          border: "1px solid",
                          borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
                          "& .MuiChip-deleteIcon": {
                            color: "primary.main",
                            "&:hover": { color: "error.main" },
                          },
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: "10px",
                      border: "1px dashed",
                      borderColor: "divider",
                      textAlign: "center",
                      bgcolor: "action.hover",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", fontSize: "0.85rem" }}>
                      {t("profile.noSkills")}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* 5. Work Experience */}
          {sectionKey === "experience" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {experienceFields.map((fieldItem, idx) => (
                <Box
                  key={fieldItem.id}
                  sx={{
                    p: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "14px",
                    backgroundColor: "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={`#${idx + 1}`}
                        size="small"
                        sx={{
                          height: 22,
                          fontWeight: 800,
                          fontSize: "0.75rem",
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                        }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.9rem" }}>
                        {t("profile.workExperience")}
                      </Typography>
                    </Box>

                    <Tooltip title={t("delete") || "Poz"}>
                      <IconButton
                        size="small"
                        onClick={() => removeExperience(idx)}
                        sx={{
                          color: "text.secondary",
                          borderRadius: "8px",
                          "&:hover": {
                            color: "error.main",
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                          },
                        }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Grid container spacing={2}>
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
                        rows={3}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={() => appendExperience({ role: "", company: "", location: "", period: "", bullets: "" })}
                sx={{
                  borderRadius: "12px",
                  borderStyle: "dashed",
                  borderWidth: "1.5px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                  color: "primary.main",
                  py: 1.25,
                  "&:hover": {
                    borderStyle: "dashed",
                    borderWidth: "1.5px",
                    borderColor: "primary.main",
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              >
                {t("profile.addExperience")}
              </Button>
            </Box>
          )}

          {/* 6. Education */}
          {sectionKey === "education" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {educationFields.map((fieldItem, idx) => (
                <Box
                  key={fieldItem.id}
                  sx={{
                    p: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "14px",
                    backgroundColor: "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={`#${idx + 1}`}
                        size="small"
                        sx={{
                          height: 22,
                          fontWeight: 800,
                          fontSize: "0.75rem",
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                        }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.9rem" }}>
                        {t("profile.education")}
                      </Typography>
                    </Box>

                    <Tooltip title={t("delete") || "Poz"}>
                      <IconButton
                        size="small"
                        onClick={() => removeEducation(idx)}
                        sx={{
                          color: "text.secondary",
                          borderRadius: "8px",
                          "&:hover": {
                            color: "error.main",
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                          },
                        }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Grid container spacing={2}>
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
                startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={() => appendEducation({ degree: "", school: "", period: "" })}
                sx={{
                  borderRadius: "12px",
                  borderStyle: "dashed",
                  borderWidth: "1.5px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                  color: "primary.main",
                  py: 1.25,
                  "&:hover": {
                    borderStyle: "dashed",
                    borderWidth: "1.5px",
                    borderColor: "primary.main",
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              >
                {t("profile.addEducation")}
              </Button>
            </Box>
          )}

          {/* 7. Languages */}
          {sectionKey === "languages" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {languageFields.map((fieldItem, idx) => (
                <Box
                  key={fieldItem.id}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    alignItems: "center",
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "12px",
                    backgroundColor: "background.paper",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <CustomTextField
                      name={`languages.${idx}.name`}
                      control={control}
                      label={t("profile.languageName")}
                    />
                  </Box>
                  <Box sx={{ width: { xs: 130, sm: 180 } }}>
                    <CustomTextField
                      name={`languages.${idx}.level`}
                      control={control}
                      label={t("profile.languageLevel")}
                    />
                  </Box>
                  <Tooltip title={t("delete") || "Poz"}>
                    <IconButton
                      size="small"
                      onClick={() => removeLanguage(idx)}
                      sx={{
                        color: "text.secondary",
                        borderRadius: "8px",
                        "&:hover": {
                          color: "error.main",
                          bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                        },
                      }}
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={() => appendLanguage({ name: "", level: "" })}
                sx={{
                  borderRadius: "12px",
                  borderStyle: "dashed",
                  borderWidth: "1.5px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                  color: "primary.main",
                  py: 1.25,
                  "&:hover": {
                    borderStyle: "dashed",
                    borderWidth: "1.5px",
                    borderColor: "primary.main",
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.06),
                  },
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
            px: 3,
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
