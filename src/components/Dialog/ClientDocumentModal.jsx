import { useState, useMemo } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
  Grid,
  Alert,
  Dialog,
  Tooltip,
  Tabs,
  Tab,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LockIcon from "@mui/icons-material/Lock";
import HistoryIcon from "@mui/icons-material/History";
import BadgeIcon from "@mui/icons-material/Badge";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { CustomDialog } from "./CustomDialog";
import { CustomDialogHeader } from "./CustomDialogHeader";
import { FooterButton } from "./FooterButton";
import { useLocale } from "../../hooks/useLocale";
import { useAuth } from "../../context/AuthContext";
import { useDateFormat } from "../../functions/generalHelpers";
import { updatePassportApi } from "../../api/queries/patch";
import { BASE_URL } from "../../api/axiosIntance";
import CustomTextField from "../CustomTextField";
import CustomDatePicker from "../CustomDatePicker";

export const ClientDocumentModal = ({ open, onClose, client, onRefresh }) => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
  const { user } = useAuth();
  const isAdmin = Boolean(user?.role === "admin" || user?.user_is_admin || user?.isAdmin);
  const isVipClient = Boolean(client?.vip === true || client?.vip === "true" || client?.vip === 1);
  const isRestrictedForUser = isVipClient && !isAdmin;

  const [activeTab, setActiveTab] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [prevClientKey, setPrevClientKey] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewModal, setPreviewModal] = useState(null); // { url, name }

  // Sync state during render when client changes without useEffect cascading warnings
  const currentClientKey = open && client ? client.guid : null;
  if (currentClientKey !== prevClientKey) {
    setPrevClientKey(currentClientKey);
    setSelectedFile(null);
    setPreviewModal(null);
    setActiveTab(0);
  }

  const fileUrl = client?.passport_file_url || client?.passportFileUrl || (Array.isArray(client?.images) ? client?.images?.[0] : null);
  const fullUrl = fileUrl ? (fileUrl.startsWith("http") ? fileUrl : `${BASE_URL}${fileUrl}`) : null;
  const fileName = fileUrl ? fileUrl.split("/").pop() : "";
  const isImageFile = Boolean(
    (fileName && /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(fileName)) ||
    (fullUrl && /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(fullUrl))
  );

  const passportHistory = Array.isArray(client?.passportHistory) ? client.passportHistory : [];

  const { control, handleSubmit } = useForm({
    values: {
      passport_number: client?.passport_number || "",
      passportIssueDate: client?.passportIssueDate || client?.passport_issue_date || null,
      passportExpiryDate: client?.passportExpiryDate || null,
      passportCountryOfIssue: client?.passportCountryOfIssue || "",
    },
  });

  // Calculate passport expiry status banner
  const expiryStatus = useMemo(() => {
    const expiryDate = client?.passportExpiryDate;
    if (!expiryDate) return null;

    const today = dayjs().startOf("day");
    const expiry = dayjs(expiryDate).startOf("day");
    const diffDays = expiry.diff(today, "day");

    if (diffDays < 0) {
      return {
        severity: "error",
        icon: <ErrorOutlineRoundedIcon sx={{ fontSize: 20 }} />,
        title: t("clients.passportExpired"),
        message: `${Math.abs(diffDays)} ${t("clients.daysExpired")} (${formatChange(expiryDate, { dateOnly: true })})`,
        color: "error",
      };
    }

    if (diffDays <= 90) {
      return {
        severity: "warning",
        icon: <AccessTimeRoundedIcon sx={{ fontSize: 20 }} />,
        title: t("clients.passportExpiresSoon"),
        message: `${diffDays} ${t("clients.daysRemaining")} (${formatChange(expiryDate, { dateOnly: true })})`,
        color: "warning",
      };
    }

    return {
      severity: "success",
      icon: <CheckCircleOutlineRoundedIcon sx={{ fontSize: 20 }} />,
      title: t("clients.passportValid"),
      message: `${diffDays} ${t("clients.daysRemaining")} (${formatChange(expiryDate, { dateOnly: true })})`,
      color: "success",
    };
  }, [client, t, formatChange]);

  const handleDownload = async (urlToDownload, customName) => {
    if (!urlToDownload) return;
    try {
      const response = await fetch(urlToDownload);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = customName || `${client?.fullName || "Client"}-passport`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success(t("clients.fileDownloaded"));
    } catch (err) {
      console.error(err);
      toast.error(t("clients.fileDownloadError"));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const submitPassportHandler = async (data) => {
    if (!client?.guid) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("guid", client.guid);
      if (data.passport_number) formData.append("passport_number", data.passport_number);
      if (data.passportIssueDate) formData.append("passportIssueDate", data.passportIssueDate);
      if (data.passportExpiryDate) formData.append("passportExpiryDate", data.passportExpiryDate);
      if (data.passportCountryOfIssue) formData.append("passportCountryOfIssue", data.passportCountryOfIssue);

      if (selectedFile) {
        formData.append("images", selectedFile);
      }

      await updatePassportApi(formData);
      toast.success(t("clients.documentUploaded"));
      onRefresh?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error(t("clients.documentUploadError"));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCurrentFile = async () => {
    if (!window.confirm(t("clients.deleteConfirmDocument"))) return;
    try {
      setDeleting(true);
      const formData = new FormData();
      formData.append("guid", client?.guid);
      formData.append("images", "");

      await updatePassportApi(formData);
      toast.success(t("clients.documentDeleted"));
      onRefresh?.();
    } catch (err) {
      console.error(err);
      toast.error(t("clients.documentDeleteError"));
    } finally {
      setDeleting(false);
    }
  };

  const modalTitle = client?.fullName
    ? `${client.fullName} — ${t("clients.passportModalTitle")}`
    : t("clients.passportModalTitle");

  return (
    <CustomDialog widthX={680} open={open} close={onClose}>
      <CustomDialogHeader variant="h5" title={modalTitle} />

      {/* Tabs: Active Passport vs Passport History */}
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", mt: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_, next) => setActiveTab(next)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: "42px",
            "& .MuiTab-root": {
              minHeight: "42px",
              py: 1,
              px: 2,
              fontWeight: 600,
              fontSize: "14px",
              textTransform: "none",
            },
          }}
        >
          <Tab
            icon={<BadgeIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={t("clients.activePassport")}
          />
          <Tab
            icon={<HistoryIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <span>{t("clients.passportHistory")}</span>
                {passportHistory.length > 0 && (
                  <Chip
                    size="small"
                    label={passportHistory.length}
                    sx={{
                      height: "18px",
                      fontSize: "11px",
                      fontWeight: 700,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(0,0,0,0.08)",
                    }}
                  />
                )}
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* VIP Access Restriction Notice */}
      {isRestrictedForUser && (
        <Alert
          severity="warning"
          icon={<LockIcon />}
          sx={{
            borderRadius: "10px",
            my: 2,
            fontWeight: 500,
          }}
        >
          {t("clients.vipFileRestrictedNotice")}
        </Alert>
      )}

      {/* TAB 0: Active Passport & Renewal Form */}
      {activeTab === 0 && !isRestrictedForUser && (
        <Box
          component="form"
          onSubmit={handleSubmit(submitPassportHandler)}
          sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {/* Passport Expiration Status Banner */}
          {expiryStatus && (
            <Alert
              severity={expiryStatus.severity}
              icon={expiryStatus.icon}
              sx={{
                borderRadius: "10px",
                fontWeight: 500,
                alignItems: "center",
                "& .MuiAlert-message": {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: 1,
                  flexWrap: "wrap",
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {expiryStatus.title}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {expiryStatus.message}
              </Typography>
            </Alert>
          )}

          {/* Current Attached Passport Scan */}
          {fullUrl && (
            <Paper
              variant="outlined"
              sx={{
                p: 1.75,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.03)"
                    : "rgba(0, 0, 0, 0.02)",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(37, 99, 235, 0.15)"
                        : "rgba(37, 99, 235, 0.1)",
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                >
                  <InsertDriveFileIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box sx={{ overflow: "hidden" }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                    {t("clients.currentScan")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {fileName}
                  </Typography>
                </Box>
              </Box>

              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isImageFile) {
                      setPreviewModal({ url: fullUrl, name: fileName || t("clients.passportDocument") });
                    } else {
                      window.open(fullUrl, "_blank", "noopener,noreferrer");
                    }
                  }}
                  title={t("clients.viewDocument")}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  color="success"
                  onClick={() => handleDownload(fullUrl, fileName)}
                  title={t("clients.downloadDocument")}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  color="error"
                  onClick={handleDeleteCurrentFile}
                  disabled={deleting}
                  title={t("clients.deleteDocument")}
                >
                  {deleting ? (
                    <CircularProgress size={18} />
                  ) : (
                    <DeleteIcon fontSize="small" />
                  )}
                </IconButton>
              </Stack>
            </Paper>
          )}

          {/* Passport Form Inputs */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="passport_number"
                control={control}
                label={t("columns.passportNumber")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="passportCountryOfIssue"
                control={control}
                label={t("columns.passportCountryOfIssue")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomDatePicker
                name="passportIssueDate"
                control={control}
                label={t("columns.passportIssueDate")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomDatePicker
                name="passportExpiryDate"
                control={control}
                label={t("columns.passportExpiryDate")}
              />
            </Grid>
          </Grid>

          {/* Upload New Passport Scan File Zone */}
          <Paper
            variant="outlined"
            component="label"
            sx={{
              py: 2.25,
              px: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              borderRadius: "12px",
              borderStyle: "dashed",
              borderWidth: 1.5,
              borderColor: selectedFile ? "primary.main" : "divider",
              cursor: "pointer",
              bgcolor: (theme) =>
                selectedFile
                  ? theme.palette.mode === "dark"
                    ? "rgba(37, 99, 235, 0.08)"
                    : "rgba(37, 99, 235, 0.04)"
                  : theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.015)"
                  : "rgba(0, 0, 0, 0.015)",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(37, 99, 235, 0.06)"
                    : "rgba(37, 99, 235, 0.03)",
                "& .upload-icon": {
                  transform: "scale(1.1)",
                  color: "primary.main",
                },
              },
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <input
              type="file"
              hidden
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
            <Box
              className="upload-icon"
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(37, 99, 235, 0.15)"
                    : "rgba(37, 99, 235, 0.08)",
                color: "primary.main",
                transition: "all 0.2s ease",
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                {selectedFile
                  ? selectedFile.name
                  : fullUrl
                  ? t("clients.uploadNewScan")
                  : t("clients.uploadDocument")}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", mt: 0.25, display: "block" }}
              >
                {t("clients.fileTypeHint")}
              </Typography>
            </Box>

            {selectedFile && (
              <Chip
                size="small"
                label={t("clients.uploadNewScan")}
                color="primary"
                variant="outlined"
                onDelete={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                sx={{ mt: 0.5, fontWeight: 600 }}
              />
            )}
          </Paper>

          <FooterButton
            loading={uploading}
            onCancel={onClose}
            saveText={t("clients.updatePassportBtn")}
            sx={{ mt: 1 }}
          />
        </Box>
      )}

      {/* TAB 1: Passport History Archive */}
      {activeTab === 1 && !isRestrictedForUser && (
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5, minHeight: 280 }}>
          {passportHistory.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: "12px",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <HistoryIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.secondary" }}>
                {t("clients.noPassportHistory")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("noDataDesc")}
              </Typography>
            </Paper>
          ) : (
            passportHistory.map((item, idx) => {
              const histImages = Array.isArray(item.images) ? item.images : [];
              const histExpiry = item.passportExpiryDate;
              const isHistExpired = histExpiry ? dayjs(histExpiry).isBefore(dayjs(), "day") : false;

              return (
                <Accordion
                  key={idx}
                  defaultExpanded={idx === 0}
                  variant="outlined"
                  sx={{
                    borderRadius: "12px !important",
                    overflow: "hidden",
                    borderColor: "divider",
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(0,0,0,0.015)",
                      px: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        pr: 1.5,
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {item.passport_number || t("clients.passportDocument")}
                        </Typography>
                        <Chip
                          size="small"
                          label={`#${item.passport_count || idx + 1}`}
                          sx={{ height: "20px", fontSize: "11px", fontWeight: 700 }}
                        />
                        {isHistExpired && (
                          <Chip
                            size="small"
                            label={t("clients.passportExpired")}
                            color="error"
                            variant="outlined"
                            sx={{ height: "20px", fontSize: "11px", fontWeight: 600 }}
                          />
                        )}
                      </Box>
                      {item.archivedAt && (
                        <Typography variant="caption" color="text.secondary">
                          {t("clients.archivedAt")}: {formatChange(item.archivedAt)}
                        </Typography>
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2.5, py: 2 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t("columns.passportNumber")}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.passport_number || "-"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t("columns.passportCountryOfIssue")}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.passportCountryOfIssue || "-"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t("columns.passportIssueDate")}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.passportIssueDate ? formatChange(item.passportIssueDate, { dateOnly: true }) : "-"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t("columns.passportExpiryDate")}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: isHistExpired ? "error.main" : "text.primary" }}>
                          {item.passportExpiryDate ? formatChange(item.passportExpiryDate, { dateOnly: true }) : "-"}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Archived Scans */}
                    {histImages.length > 0 && (
                      <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
                          {t("clients.documents")}:
                        </Typography>
                        <Stack spacing={1}>
                          {histImages.map((imgPath, imgIdx) => {
                            const imgUrl = imgPath.startsWith("http") ? imgPath : `${BASE_URL}${imgPath}`;
                            const imgName = imgPath.split("/").pop() || `Passport_Scan_${imgIdx + 1}`;
                            const isImg = /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(imgName);

                            return (
                              <Paper
                                key={imgIdx}
                                variant="outlined"
                                sx={{
                                  p: 1.25,
                                  px: 1.75,
                                  borderRadius: "8px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  backgroundColor: (theme) =>
                                    theme.palette.mode === "dark"
                                      ? "rgba(255, 255, 255, 0.02)"
                                      : "rgba(0, 0, 0, 0.015)",
                                }}
                              >
                                <Typography variant="caption" noWrap sx={{ fontWeight: 500, maxWidth: 300 }}>
                                  {imgName}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => {
                                      if (isImg) {
                                        setPreviewModal({ url: imgUrl, name: imgName });
                                      } else {
                                        window.open(imgUrl, "_blank", "noopener,noreferrer");
                                      }
                                    }}
                                    title={t("clients.viewDocument")}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleDownload(imgUrl, imgName)}
                                    title={t("clients.downloadDocument")}
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </Paper>
                            );
                          })}
                        </Stack>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}
        </Box>
      )}

      {/* Image Preview Lightbox Modal */}
      <Dialog
        open={Boolean(previewModal)}
        onClose={() => setPreviewModal(null)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              bgcolor: "background.paper",
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              maxWidth: { xs: "96vw", sm: "92vw", md: "1150px" },
              width: "100%",
            },
          },
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(6px)",
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            px: 2.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
            {previewModal?.name || t("clients.passportDocument")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {previewModal?.url && (
              <Tooltip title={t("download")}>
                <IconButton size="small" onClick={() => handleDownload(previewModal.url, previewModal.name)}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" onClick={() => setPreviewModal(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            p: { xs: 1.5, sm: 2.5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(0, 0, 0, 0.45)"
                : "rgba(0, 0, 0, 0.03)",
            minHeight: { xs: 350, sm: 500 },
            maxHeight: "86vh",
            overflow: "auto",
          }}
        >
          {previewModal?.url && (
            <Box
              component="img"
              src={previewModal.url}
              alt={previewModal.name}
              sx={{
                maxWidth: "100%",
                maxHeight: "80vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: "10px",
                boxShadow: "0 12px 36px rgba(0,0,0,0.3)",
              }}
            />
          )}
        </Box>
      </Dialog>
    </CustomDialog>
  );
};

export default ClientDocumentModal;
