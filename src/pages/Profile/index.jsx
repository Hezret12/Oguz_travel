import { useState, useMemo } from "react";
import {
  Box,
  Grid,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../hooks/useLocale";
import { useGet } from "../../hooks/CRUD/useGet";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { getUserProfileApi } from "../../api/queries/getters";
import { updateUserProfileApi } from "../../api/queries/patch";
import ProfileLeftCol from "./ProfileLeftCol";
import ProfileRightCol from "./ProfileRightCol";
import EditSectionModal from "./EditSectionModal";
import CVPrintPreviewModal from "./CVPrintPreviewModal";
import { EMPTY_PROFILE } from "./constants";

const extractPlainString = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val.tk || val.en || val.ru || val.fullName || val.name || val.title || "";
  }
  return String(val);
};

const ProfilePage = () => {
  const { user, refetchUser } = useAuth();
  const { t } = useLocale();

  const [activeModalSection, setActiveModalSection] = useState(null);
  const [cvPrintOpen, setCvPrintOpen] = useState(false);

  const { data: serverProfileData, refetch: refetchProfile } = useGet({
    apiFn: getUserProfileApi,
    key: "userProfile",
  });

  const profile = useMemo(() => {
    const serverData =
      serverProfileData && typeof serverProfileData === "object"
        ? serverProfileData
        : {};
    const contact = serverData.contact || {};

    return {
      ...EMPTY_PROFILE,
      ...serverData,
      guid: serverData.guid || user?.guid || "",
      full_name: extractPlainString(
        serverData.full_name ||
        serverData.fullName ||
        user?.name ||
        user?.fullName
      ),
      role: extractPlainString(
        serverData.role ||
        user?.position ||
        user?.position_name
      ),
      avatar_url: extractPlainString(
        serverData.avatar_url || serverData.avatarUrl || user?.avatar_url
      ),
      contact: {
        email: extractPlainString(contact.email || user?.email),
        phone: extractPlainString(contact.phone || user?.phone_number),
        location: extractPlainString(contact.location),
        website: extractPlainString(contact.website),
        linkedin: extractPlainString(contact.linkedin),
      },
      skills: Array.isArray(serverData.skills) ? serverData.skills : [],
      personal_summary: extractPlainString(
        serverData.personal_summary ||
        serverData.personalSummary
      ),
      work_experience: Array.isArray(
        serverData.work_experience || serverData.workExperience
      )
        ? serverData.work_experience || serverData.workExperience
        : [],
      education: Array.isArray(serverData.education)
        ? serverData.education
        : [],
      languages: Array.isArray(serverData.languages)
        ? serverData.languages
        : [],
    };
  }, [serverProfileData, user]);

  const { mutate: mutateUpdateProfile, isPending: isUpdating } = useUpdate({
    apiFn: updateUserProfileApi,
    key: "userProfile",
    idKey: "guid",
    invalidateQueries: ["userProfile", "authUser"],
    onSuccessUpdate: () => {
      refetchProfile();
      refetchUser?.();
    },
  });

  const sanitizeProfilePayload = (profileData) => ({
    guid: profileData.guid || user?.guid || "",
    full_name: extractPlainString(profileData.full_name || profileData.fullName),
    role: extractPlainString(profileData.role),
    status: extractPlainString(profileData.status),
    avatar_url: extractPlainString(profileData.avatar_url || profileData.avatarUrl),
    avatar_file: profileData.avatar_file instanceof File ? profileData.avatar_file : undefined,
    contact: {
      email: extractPlainString(profileData.contact?.email),
      phone: extractPlainString(profileData.contact?.phone),
      location: extractPlainString(profileData.contact?.location),
      website: extractPlainString(profileData.contact?.website),
      linkedin: extractPlainString(profileData.contact?.linkedin),
    },
    skills: Array.isArray(profileData.skills) ? profileData.skills : [],
    personal_summary: extractPlainString(profileData.personal_summary || profileData.personalSummary),
    work_experience: Array.isArray(profileData.work_experience || profileData.workExperience)
      ? (profileData.work_experience || profileData.workExperience).map((exp) => ({
          id: exp.id || `exp-${Date.now()}`,
          role: extractPlainString(exp.role),
          company: extractPlainString(exp.company),
          location: extractPlainString(exp.location),
          period: extractPlainString(exp.period),
          bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
        }))
      : [],
    education: Array.isArray(profileData.education)
      ? profileData.education.map((edu) => ({
          id: edu.id || `edu-${Date.now()}`,
          degree: extractPlainString(edu.degree),
          school: extractPlainString(edu.school),
          period: extractPlainString(edu.period),
        }))
      : [],
    languages: Array.isArray(profileData.languages)
      ? profileData.languages.map((lang) => ({
          id: lang.id || `lang-${Date.now()}`,
          name: extractPlainString(lang.name),
          level: extractPlainString(lang.level),
        }))
      : [],
  });

  const handleUpdateProfile = (updatedProfile) => {
    const payload = sanitizeProfilePayload(updatedProfile);
    mutateUpdateProfile(payload);
  };

  return (
    <Box
      id="profile-cv-page-container"
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        pb: 6,
        pt: { xs: 1.5, sm: 2 },
      }}
    >
      <Helmet>
        <title>{`${t("profile.title")} | Oguz Travel`}</title>
      </Helmet>

      {/* Main Grid: Left Column (Identity & Contacts & Skills & Print CV) + Right Column (Summary & Experience & Education & Languages) */}
      <Grid container spacing={3.5} sx={{ px: { xs: 0.5, sm: 1 } }}>
        <Grid size={{ xs: 12, md: 4.2, lg: 3.8 }}>
          <ProfileLeftCol
            profile={profile}
            onEditSection={(section) => setActiveModalSection(section)}
            onAvatarChange={(newAvatarUrl, file) => {
              handleUpdateProfile({ ...profile, avatar_url: newAvatarUrl, avatar_file: file });
            }}
            onPrintCv={() => setCvPrintOpen(true)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 7.8, lg: 8.2 }}>
          <ProfileRightCol
            profile={profile}
            onEditSection={(section) => setActiveModalSection(section)}
          />
        </Grid>
      </Grid>

      {/* Edit Section Modal */}
      <EditSectionModal
        open={Boolean(activeModalSection)}
        sectionKey={activeModalSection}
        profileData={profile}
        isSaving={isUpdating}
        onClose={() => setActiveModalSection(null)}
        onSave={handleUpdateProfile}
      />

      {/* CV Print Preview Modal */}
      <CVPrintPreviewModal
        open={cvPrintOpen}
        onClose={() => setCvPrintOpen(false)}
        profile={profile}
      />
    </Box>
  );
};

export default ProfilePage;
