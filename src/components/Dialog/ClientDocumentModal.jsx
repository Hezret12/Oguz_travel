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
import HistoryIcon from "@mui/icons-material/History";
import BadgeIcon from "@mui/icons-material/Badge";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { CustomDialog } from "./CustomDialog";
import { CustomDialogHeader } from "./CustomDialogHeader";
import { FooterButton } from "./FooterButton";
import { useLocale } from "../../hooks/useLocale";
import { useDateFormat } from "../../functions/generalHelpers";
import { updatePassportApi } from "../../api/queries/patch";
import { BASE_URL } from "../../api/axiosIntance";
import CustomTextField from "../CustomTextField";
import CustomDatePicker from "../CustomDatePicker";

const getFileUrl = (path) => {
  if (!path || typeof path !== "string" || path === "string" || path === "[]" || path === "null") return null;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const rootHost = BASE_URL ? BASE_URL.replace(/\/api\/v1\/?$/, "") : "";
  return `${rootHost}${cleanPath}`;
};

const isImageUrl = (url) => Boolean(url && /\.(jpe?g|png|webp|gif|bmp|svg|avif)(\?.*)?$/i.test(String(url)));
const isPdfUrl = (url) => Boolean(url && /\.pdf(\?.*)?$/i.test(String(url)));
const isPreviewable = (url) => isImageUrl(url) || isPdfUrl(url);

const formatBytes = (bytes) => {
  if (!bytes || typeof bytes !== "number") return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const ClientDocumentModal = ({ open, onClose, client, onRefresh }) => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();

  const [activeTab, setActiveTab] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [prevClientKey, setPrevClientKey] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewModal, setPreviewModal] = useState(null);

  const currentClientKey = open && client ? client.guid : null;
  if (currentClientKey !== prevClientKey) {
    setPrevClientKey(currentClientKey);
    setSelectedFile(null);
    setPreviewModal(null);
    setActiveTab(0);
  }

  const activeImages = useMemo(() => {
    let list = [];
    if (Array.isArray(client?.images)) {
      list = client.images;
    } else if (typeof client?.images === "string" && client.images.trim()) {
      try {
        const parsed = JSON.parse(client.images);
        list = Array.isArray(parsed) ? parsed : [client.images];
      } catch {
        list = [client.images];
      }
    } else if (client?.passport_file_url) {
      list = [client.passport_file_url];
    } else if (client?.passportFileUrl) {
      list = [client.passportFileUrl];
    }
    return list.filter((img) => typeof img === "string" && img.length > 0 && img !== "string" && img !== "[]");
  }, [client]);

  const passportHistory = useMemo(() => {
    if (!client?.passportHistory) return [];
    if (Array.isArray(client.passportHistory)) return client.passportHistory;
    if (typeof client.passportHistory === "string") {
      try {
        const parsed = JSON.parse(client.passportHistory);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [client]);

  const selectedFilePreviewUrl = useMemo(() => {
    if (!selectedFile) return null;
    if (selectedFile.type?.startsWith("image/")) {
      return URL.createObjectURL(selectedFile);
    }
    return null;
  }, [selectedFile]);

  const { control, handleSubmit } = useForm({
    values: {
      passport_number: client?.passport_number || "",
      passportIssueDate: client?.passportIssueDate || client?.passport_issue_date || null,
      passportExpiryDate: client?.passportExpiryDate || null,
      passportCountryOfIssue: client?.passportCountryOfIssue || "",
    },
  });

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
      };
    }

    if (diffDays <= 90) {
      return {
        severity: "warning",
        icon: <AccessTimeRoundedIcon sx={{ fontSize: 20 }} />,
        title: t("clients.passportExpiresSoon"),
        message: `${diffDays} ${t("clients.daysRemaining")} (${formatChange(expiryDate, { dateOnly: true })})`,
      };
    }

    return {
      severity: "success",
      icon: <CheckCircleOutlineRoundedIcon sx={{ fontSize: 20 }} />,
      title: t("clients.passportValid"),
      message: `${diffDays} ${t("clients.daysRemaining")} (${formatChange(expiryDate, { dateOnly: true })})`,
    };
  }, [client, t, formatChange]);

  const handleDownload = async (urlToDownload, customName) => {
    if (!urlToDownload) return;
    try {
      const response = await fetch(urlToDownload);
      if (!response.ok) throw new Error("Network response was not ok");
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
    } catch {
      window.open(urlToDownload, "_blank", "noopener,noreferrer");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Faýl göwrümi 10MB-den uly bolmaly däl");
        return;
      }
      setSelectedFile(file);
    }
  };

  const formatDatePayload = (val) => {
    if (!val) return "";
    const d = dayjs(val);
    return d.isValid() ? d.format("YYYY-MM-DD") : String(val);
  };

  const submitPassportHandler = async (data) => {
    if (!client?.guid) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("guid", client.guid);
      if (data.passport_number) formData.append("passport_number", data.passport_number.trim());
      if (data.passportIssueDate) formData.append("passportIssueDate", formatDatePayload(data.passportIssueDate));
      if (data.passportExpiryDate) formData.append("passportExpiryDate", formatDatePayload(data.passportExpiryDate));
      if (data.passportCountryOfIssue) formData.append("passportCountryOfIssue", data.passportCountryOfIssue.trim());

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

  const parseHistoryImages = (histItem) => {
    if (!histItem?.images) return [];
    if (Array.isArray(histItem.images)) {
      return histItem.images.filter((i) => typeof i === "string" && i !== "string" && i.length > 0 && i !== "[]");
    }
    if (typeof histItem.images === "string" && histItem.images.trim() && histItem.images !== "string" && histItem.images !== "[]") {
      try {
        const parsed = JSON.parse(histItem.images);
        return Array.isArray(parsed) ? parsed.filter((i) => typeof i === "string" && i !== "string") : [histItem.images];
      } catch {
        return [histItem.images];
      }
    }
    return [];
  };

  const modalTitle = client?.fullName
    ? `${client.fullName} — ${t("clients.passportModalTitle")}`
    : t("clients.passportModalTitle");

  return (
    <>
      <CustomDialog widthX={740} open={open} close={onClose}>
        <CustomDialogHeader variant="h5" title={modalTitle} />

        <Box sx={{ borderBottom: "1px solid", borderColor: "divider", mt: 0.5 }}>
          <Tabs
            value={activeTab}
            onChange={(_, next) => setActiveTab(next)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              minHeight: "44px",
              "& .MuiTab-root": {
                minHeight: "44px",
                py: 1,
                px: 2.25,
                fontWeight: 600,
                fontSize: "14px",
                textTransform: "none",
              },
            }}
          >
            <Tab
              icon={<BadgeIcon sx={{ fontSize: 19 }} />}
              iconPosition="start"
              label={t("clients.activePassport")}
            />
            <Tab
              icon={<HistoryIcon sx={{ fontSize: 19 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <span>{t("clients.passportHistory")}</span>
                  {passportHistory.length > 0 && (
                    <Chip
                      size="small"
                      label={passportHistory.length}
                      sx={{
                        height: "20px",
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

        <Box
          sx={{
            height: "560px",
            overflowY: "auto",
            pr: 0.5,
            pt: 2,
            display: "flex",
            flexDirection: "column",
            "&::-webkit-scrollbar": {
              width: "5px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.15)"
                  : "rgba(0, 0, 0, 0.15)",
              borderRadius: "4px",
            },
          }}
        >
          {activeTab === 0 && (
            <Box
              component="form"
              onSubmit={handleSubmit(submitPassportHandler)}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2.25,
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
                {expiryStatus && (
                  <Alert
                    severity={expiryStatus.severity}
                    icon={expiryStatus.icon}
                    sx={{
                      borderRadius: "12px",
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

                {activeImages.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        color: "text.secondary",
                        mb: 1,
                        display: "block",
                      }}
                    >
                      {t("clients.currentScan")} ({activeImages.length})
                    </Typography>
                    <Stack spacing={1}>
                      {activeImages.map((rawPath, imgIdx) => {
                        const fullUrl = getFileUrl(rawPath);
                        const fileName = rawPath.split("/").pop() || `Passport_Scan_${imgIdx + 1}`;
                        const isImg = isImageUrl(fullUrl || rawPath);
                        const isPdf = isPdfUrl(fullUrl || rawPath);

                        return (
                          <Paper
                            key={imgIdx}
                            variant="outlined"
                            sx={{
                              p: 1.25,
                              px: 1.75,
                              borderRadius: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              backgroundColor: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "rgba(255, 255, 255, 0.03)"
                                  : "rgba(0, 0, 0, 0.02)",
                              borderColor: "divider",
                              transition: "border-color 0.15s ease",
                              "&:hover": {
                                borderColor: "primary.main",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                overflow: "hidden",
                                minWidth: 0,
                                flex: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: "8px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: isPdf
                                    ? "rgba(239, 68, 68, 0.12)"
                                    : "rgba(37, 99, 235, 0.1)",
                                  color: isPdf ? "#EF4444" : "primary.main",
                                  flexShrink: 0,
                                }}
                              >
                                {isPdf ? (
                                  <PictureAsPdfIcon sx={{ fontSize: 22 }} />
                                ) : isImg ? (
                                  <ImageIcon sx={{ fontSize: 22 }} />
                                ) : (
                                  <InsertDriveFileIcon sx={{ fontSize: 22 }} />
                                )}
                              </Box>
                              <Box sx={{ overflow: "hidden", minWidth: 0 }}>
                                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                  {fileName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                                  {client?.passport_number ? `${t("columns.passportNumber")}: ${client.passport_number}` : t("clients.passportDocument")}
                                </Typography>
                              </Box>
                            </Box>

                            <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
                              {isPreviewable(fullUrl || rawPath) && (
                                <Tooltip title={t("clients.viewDocument")}>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (fullUrl) {
                                        setPreviewModal({
                                          url: fullUrl,
                                          name: fileName,
                                          isPdf: isPdfUrl(fullUrl || rawPath),
                                        });
                                      }
                                    }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              <Tooltip title={t("clients.downloadDocument")}>
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleDownload(fullUrl, fileName)}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title={t("clients.deleteDocument")}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={handleDeleteCurrentFile}
                                  disabled={deleting}
                                >
                                  {deleting ? (
                                    <CircularProgress size={16} />
                                  ) : (
                                    <DeleteIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Box>
                )}

                {selectedFile && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        color: "primary.main",
                        mb: 1,
                        display: "block",
                      }}
                    >
                      {t("clients.uploadNewScan")}
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.25,
                        px: 1.75,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(37, 99, 235, 0.08)"
                            : "rgba(37, 99, 235, 0.04)",
                        borderColor: "primary.main",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1 }}>
                        {selectedFilePreviewUrl ? (
                          <Box
                            component="img"
                            src={selectedFilePreviewUrl}
                            alt={selectedFile.name}
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: "8px",
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "rgba(37, 99, 235, 0.15)",
                              color: "primary.main",
                              flexShrink: 0,
                            }}
                          >
                            <CloudUploadIcon sx={{ fontSize: 22 }} />
                          </Box>
                        )}
                        <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                            {selectedFile.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatBytes(selectedFile.size)}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setSelectedFile(null)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  </Box>
                )}

                {!selectedFile && (
                  <Paper
                    variant="outlined"
                    component="label"
                    sx={{
                      py: 2,
                      px: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.75,
                      borderRadius: "12px",
                      borderStyle: "dashed",
                      borderWidth: 1.5,
                      borderColor: "divider",
                      cursor: "pointer",
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
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
                        width: 38,
                        height: 38,
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
                      <CloudUploadIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {activeImages.length > 0
                          ? t("clients.uploadNewScan")
                          : t("clients.uploadDocument")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                        {t("clients.fileTypeHint")}
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </Box>

              <Box sx={{ pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
                <FooterButton
                  loading={uploading}
                  onCancel={onClose}
                  saveText={t("clients.updatePassportBtn")}
                />
              </Box>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minHeight: 280 }}>
              {passportHistory.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 6,
                    textAlign: "center",
                    borderRadius: "16px",
                    borderColor: "divider",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.02)"
                        : "rgba(0, 0, 0, 0.01)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    my: "auto",
                  }}
                >
                  <HistoryIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.secondary" }}>
                    {t("clients.noPassportHistory")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {t("noDataDesc")}
                  </Typography>
                </Paper>
              ) : (
                passportHistory.map((item, idx) => {
                  const histImages = parseHistoryImages(item);
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

                        {histImages.length > 0 && (
                          <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
                              {t("clients.documents")} ({histImages.length}):
                            </Typography>
                            <Stack spacing={1}>
                              {histImages.map((imgPath, imgIdx) => {
                                const imgUrl = getFileUrl(imgPath);
                                const imgName = imgPath.split("/").pop() || `Passport_Scan_${imgIdx + 1}`;
                                const isPdf = isPdfUrl(imgUrl || imgPath);
                                const isImg = isImageUrl(imgUrl || imgPath);

                                return (
                                  <Paper
                                    key={imgIdx}
                                    variant="outlined"
                                    sx={{
                                      p: 1.25,
                                      px: 1.75,
                                      borderRadius: "10px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      backgroundColor: (theme) =>
                                        theme.palette.mode === "dark"
                                          ? "rgba(255, 255, 255, 0.02)"
                                          : "rgba(0, 0, 0, 0.015)",
                                      borderColor: "divider",
                                    }}
                                  >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, flex: 1 }}>
                                      <Box
                                        sx={{
                                          width: 32,
                                          height: 32,
                                          borderRadius: "6px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          bgcolor: isPdf
                                            ? "rgba(239, 68, 68, 0.12)"
                                            : "rgba(37, 99, 235, 0.1)",
                                          color: isPdf ? "#EF4444" : "primary.main",
                                          flexShrink: 0,
                                        }}
                                      >
                                        {isPdf ? (
                                          <PictureAsPdfIcon sx={{ fontSize: 18 }} />
                                        ) : isImg ? (
                                          <ImageIcon sx={{ fontSize: 18 }} />
                                        ) : (
                                          <InsertDriveFileIcon sx={{ fontSize: 18 }} />
                                        )}
                                      </Box>
                                      <Typography variant="caption" noWrap sx={{ fontWeight: 600, maxWidth: 320 }}>
                                        {imgName}
                                      </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
                                      {isPreviewable(imgUrl || imgPath) && (
                                        <Tooltip title={t("clients.viewDocument")}>
                                          <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => {
                                              if (imgUrl) {
                                                setPreviewModal({
                                                  url: imgUrl,
                                                  name: imgName,
                                                  isPdf: isPdfUrl(imgUrl || imgPath),
                                                });
                                              }
                                            }}
                                          >
                                            <VisibilityIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                      <Tooltip title={t("clients.downloadDocument")}>
                                        <IconButton
                                          size="small"
                                          color="success"
                                          onClick={() => handleDownload(imgUrl, imgName)}
                                        >
                                          <DownloadIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
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
        </Box>
      </CustomDialog>

      <Dialog
        open={Boolean(previewModal)}
        onClose={() => setPreviewModal(null)}
        maxWidth="lg"
        fullWidth
        sx={{ zIndex: 1600 }}
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
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(8px)",
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
              <>
                <Tooltip title={t("openInNewTab") || "Open in new tab"}>
                  <IconButton
                    size="small"
                    onClick={() => window.open(previewModal.url, "_blank", "noopener,noreferrer")}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("download")}>
                  <IconButton size="small" onClick={() => handleDownload(previewModal.url, previewModal.name)}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <IconButton size="small" onClick={() => setPreviewModal(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            p: previewModal?.isPdf ? 0 : { xs: 1.5, sm: 2.5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(0, 0, 0, 0.45)"
                : "rgba(0, 0, 0, 0.03)",
            minHeight: previewModal?.isPdf ? { xs: 450, sm: 600 } : { xs: 350, sm: 500 },
            height: previewModal?.isPdf ? { xs: "75vh", sm: "80vh" } : "auto",
            maxHeight: "86vh",
            overflow: "hidden",
          }}
        >
          {previewModal?.url && (
            previewModal.isPdf ? (
              <Box
                component="iframe"
                src={`${previewModal.url}#toolbar=1`}
                title={previewModal.name}
                sx={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  bgcolor: "background.paper",
                }}
              />
            ) : (
              <Box
                component="img"
                src={previewModal.url}
                alt={previewModal.name}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
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
            )
          )}
        </Box>
      </Dialog>
    </>
  );
};

export default ClientDocumentModal;
