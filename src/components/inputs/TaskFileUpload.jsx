import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Grid,
  Chip,
  Paper,
  Dialog,
  LinearProgress,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import { useLocale } from "../../hooks/useLocale";

const MAX_FILES = 4;
const MAX_FILE_SIZE_MB = 10;

const ALLOWED_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "pdf",
  "xls",
  "xlsx",
  "doc",
  "docx",
];

const ACCEPT_STRING =
  "image/png,image/jpeg,image/webp,image/gif,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.png,.jpg,.jpeg,.webp,.gif,.pdf,.xls,.xlsx,.doc,.docx";

function formatFileSize(bytes) {
  if (!bytes || typeof bytes !== "number") return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileCategory(file) {
  const name = typeof file === "string" ? file : file?.name || "";
  const ext = name.split(".").pop()?.toLowerCase();
  const mime = file?.type || "";

  if (
    ["png", "jpg", "jpeg", "webp", "gif"].includes(ext) ||
    mime.startsWith("image/")
  ) {
    return "image";
  }
  if (ext === "pdf" || mime === "application/pdf") {
    return "pdf";
  }
  if (
    ["xls", "xlsx"].includes(ext) ||
    mime.includes("excel") ||
    mime.includes("spreadsheetml")
  ) {
    return "excel";
  }
  if (
    ["doc", "docx"].includes(ext) ||
    mime.includes("word") ||
    mime.includes("wordprocessingml")
  ) {
    return "word";
  }
  return "other";
}

function FileTypeIcon({ category }) {
  switch (category) {
    case "image":
      return <ImageIcon sx={{ color: "#10B981", fontSize: 20 }} />;
    case "pdf":
      return <PictureAsPdfIcon sx={{ color: "#EF4444", fontSize: 20 }} />;
    case "excel":
      return <TableChartIcon sx={{ color: "#059669", fontSize: 20 }} />;
    case "word":
      return <DescriptionIcon sx={{ color: "#2563EB", fontSize: 20 }} />;
    default:
      return <InsertDriveFileIcon sx={{ color: "text.secondary", fontSize: 20 }} />;
  }
}

function FileCategoryBadge({ category }) {
  const configs = {
    image: { label: "IMG", bg: "rgba(16, 185, 129, 0.12)", color: "#059669" },
    pdf: { label: "PDF", bg: "rgba(239, 68, 68, 0.12)", color: "#DC2626" },
    excel: { label: "XLS", bg: "rgba(16, 185, 129, 0.12)", color: "#047857" },
    word: { label: "DOC", bg: "rgba(37, 99, 235, 0.12)", color: "#1D4ED8" },
    other: { label: "FILE", bg: "rgba(100, 116, 139, 0.12)", color: "#475569" },
  };

  const cfg = configs[category] || configs.other;

  return (
    <Box
      component="span"
      sx={{
        px: 0.75,
        py: 0.2,
        borderRadius: "4px",
        fontSize: "0.65rem",
        fontWeight: 700,
        bgcolor: cfg.bg,
        color: cfg.color,
        letterSpacing: "0.5px",
        display: "inline-block",
        flexShrink: 0,
      }}
    >
      {cfg.label}
    </Box>
  );
}

function getFileUrl(fileOrUrl) {
  if (!fileOrUrl) return null;
  if (fileOrUrl instanceof File) {
    return URL.createObjectURL(fileOrUrl);
  }
  if (typeof fileOrUrl === "string") {
    if (fileOrUrl.startsWith("http://") || fileOrUrl.startsWith("https://")) {
      return fileOrUrl;
    }
    const serverBase =
      import.meta.env.VITE_API_MODE === "development"
        ? import.meta.env.VITE_API_LOCAL_BACKEND_URL
        : import.meta.env.VITE_API_PROD_BACKEND_URL;
    try {
      const origin = new URL(serverBase).origin;
      const cleanPath = fileOrUrl.startsWith("/") ? fileOrUrl : `/${fileOrUrl}`;
      return `${origin}${cleanPath}`;
    } catch {
      return `/${fileOrUrl}`;
    }
  }
  return null;
}

async function downloadFile(fileOrUrl, fileName) {
  if (fileOrUrl instanceof File) {
    const url = URL.createObjectURL(fileOrUrl);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileOrUrl.name || fileName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  const url = getFileUrl(fileOrUrl);
  if (!url) return;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName || url.split("/").pop() || "file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Direct download failed, opening link:", err);
    window.open(url, "_blank");
  }
}

export function TaskFileList({
  files = [],
  onChange,
  disabled = false,
  isSubmitting = false,
}) {
  const { t } = useLocale();
  const [previewModal, setPreviewModal] = useState(null);

  const previews = useMemo(() => {
    const map = {};
    files.forEach((file, index) => {
      if (getFileCategory(file) === "image") {
        map[index] = getFileUrl(file);
      }
    });
    return map;
  }, [files]);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previews]);

  const handleRemoveFile = (indexToRemove) => {
    const updated = files.filter((_, idx) => idx !== indexToRemove);
    onChange?.(updated);
  };

  if (!files || files.length === 0) return null;

  return (
    <Box sx={{ width: "100%" }}>
      <Grid
        container
        spacing={1}
        sx={{
          mt: 0.5,
          maxHeight: "120px",
          overflowY: "auto",
          pr: 0.5,
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(100, 116, 139, 0.2)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(100, 116, 139, 0.4)",
          },
        }}
      >
        {files.map((file, idx) => {
          const fileName =
            typeof file === "string"
              ? file.split("/").pop()
              : file?.name || `File ${idx + 1}`;
          const fileSize = file instanceof File ? formatFileSize(file.size) : "";
          const category = getFileCategory(file);
          const previewUrl = previews[idx];

          return (
            <Grid size={{ xs: 12, sm: 6 }} key={idx}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 0.75,
                  px: 1.25,
                  height: "48px",
                  boxSizing: "border-box",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                  transition: "all 0.15s ease-in-out",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  {previewUrl ? (
                    <Tooltip title={t("preview", "Uly görmek")}>
                      <Box
                        component="img"
                        src={previewUrl}
                        alt={fileName}
                        onClick={() =>
                          setPreviewModal({ url: previewUrl, name: fileName, file })
                        }
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "6px",
                          objectFit: "cover",
                          border: "1px solid",
                          borderColor: "divider",
                          flexShrink: 0,
                          cursor: "pointer",
                          transition:
                            "transform 0.15s ease, border-color 0.15s ease",
                          "&:hover": {
                            transform: "scale(1.08)",
                            borderColor: "primary.main",
                          },
                        }}
                      />
                    </Tooltip>
                  ) : (
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "6px",
                        bgcolor: "action.hover",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FileTypeIcon category={category} />
                    </Box>
                  )}

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          color: "text.primary",
                          minWidth: 0,
                          flexShrink: 1,
                        }}
                      >
                        {fileName}
                      </Typography>
                      <FileCategoryBadge category={category} />
                    </Box>

                    {fileSize && (
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{ color: "text.secondary", fontSize: "0.675rem", display: "block" }}
                      >
                        {fileSize}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.2, flexShrink: 0 }}>
                  {previewUrl && (
                    <Tooltip title={t("preview", "Uly görmek")}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setPreviewModal({ url: previewUrl, name: fileName, file })
                        }
                        sx={{
                          p: 0.35,
                          color: "text.secondary",
                          "&:hover": {
                            color: "primary.main",
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title={t("download", "Ýükläp al")}>
                    <IconButton
                      size="small"
                      onClick={() => downloadFile(file, fileName)}
                      sx={{
                        p: 0.35,
                        color: "text.secondary",
                        "&:hover": {
                          color: "primary.main",
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <DownloadIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={t("remove", "Aýyr")}>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFile(idx)}
                      disabled={disabled || isSubmitting}
                      sx={{
                        p: 0.35,
                        color: "text.secondary",
                        "&:hover": {
                          color: "error.main",
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <DeleteOutlinedIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Image Preview Lightbox Modal */}
      <Dialog
        open={Boolean(previewModal)}
        onClose={() => setPreviewModal(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              bgcolor: "background.paper",
              overflow: "hidden",
              boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
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
            {previewModal?.name || t("task.imagePreview", "Surat syny")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {previewModal && (
              <Tooltip title={t("download", "Ýükläp al")}>
                <IconButton
                  size="small"
                  onClick={() =>
                    downloadFile(previewModal.file || previewModal.url, previewModal.name)
                  }
                >
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
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
            minHeight: 300,
            maxHeight: "75vh",
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
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            />
          )}
        </Box>
      </Dialog>
    </Box>
  );
}

export default function TaskFileUpload({
  files = [],
  onChange,
  label,
  disabled = false,
  isSubmitting = false,
  hideList = false,
}) {
  const { t } = useLocale();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback(
    (newFiles) => {
      const validFiles = [];
      const currentCount = files.length;

      if (currentCount >= MAX_FILES) {
        toast.error(
          t(
            "task.maxFilesReached",
            `Maksimum ${MAX_FILES} faýl ýükläp bilersiňiz.`
          )
        );
        return;
      }

      for (const file of newFiles) {
        if (validFiles.length + currentCount >= MAX_FILES) {
          toast.error(
            t(
              "task.maxFilesLimitExceeded",
              `Maksimum ${MAX_FILES} faýl çäklendirmesi sebäpli käbir faýllar goşulmady.`
            )
          );
          break;
        }

        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
          toast.error(
            t(
              "task.unsupportedFileType",
              `"${file.name}" goldanmaýan faýl görnüşi. Diňe Surat, PDF, Excel we Word kabul edilýär.`
            )
          );
          continue;
        }

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          toast.error(
            t(
              "task.fileTooLarge",
              `"${file.name}" faýl ölçegi ${MAX_FILE_SIZE_MB}MB-dan uly bolmaly däl.`
            )
          );
          continue;
        }

        // Duplicate file validation
        const newName = file.name;
        const newSize = file.size;

        const isDuplicateInExisting = files.some((existing) => {
          if (existing instanceof File) {
            return existing.name === newName && existing.size === newSize;
          }
          if (typeof existing === "string") {
            const existingName = existing.split("/").pop();
            return existingName === newName;
          }
          return false;
        });

        const isDuplicateInValid = validFiles.some(
          (added) => added.name === newName && added.size === newSize
        );

        if (isDuplicateInExisting || isDuplicateInValid) {
          toast.error(
            t(
              "task.duplicateFile",
              `"${newName}" faýly eýýäm goşuldy.`
            )
          );
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        onChange?.([...files, ...validFiles]);
      }
    },
    [files, onChange, t]
  );

  const handleInputChange = (e) => {
    const fileList = Array.from(e.target.files || []);
    processFiles(fileList);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (files.length < MAX_FILES) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    processFiles(droppedFiles);
  };

  const isFull = files.length >= MAX_FILES;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header Label & Tooltip */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0.75,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: "0.875rem",
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {label || t("task.attachments")}
          <Tooltip
            title={t("task.fileUploadTooltip")}
            arrow
            placement="top"
            slotProps={{
              tooltip: {
                sx: {
                  fontSize: "0.825rem",
                  fontWeight: 500,
                  py: 0.75,
                  px: 1.25,
                  borderRadius: "8px",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                },
              },
            }}
          >
            <HelpOutlineRoundedIcon
              sx={{
                fontSize: 17,
                color: "text.secondary",
                cursor: "pointer",
                transition: "color 0.15s ease, transform 0.15s ease",
                "&:hover": {
                  color: "primary.main",
                  transform: "scale(1.1)",
                },
              }}
            />
          </Tooltip>
        </Typography>
      </Box>

      {/* Loading bar when submitting */}
      {isSubmitting && (
        <Box sx={{ mb: 1, width: "100%" }}>
          <LinearProgress
            sx={{
              borderRadius: "4px",
              height: 4,
              bgcolor: "action.hover",
            }}
          />
        </Box>
      )}

      {/* Hidden native input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept={ACCEPT_STRING}
        multiple
        style={{ display: "none" }}
        disabled={isFull || disabled || isSubmitting}
      />

      {/* 44px Input Field matching CustomSelect & CustomTextField 100% */}
      <Paper
        variant="outlined"
        onClick={() => {
          if (!disabled && !isSubmitting && !isFull) {
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          if (!disabled && !isSubmitting && !isFull) handleDragOver(e);
        }}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          if (!disabled && !isSubmitting && !isFull) handleDrop(e);
        }}
        sx={{
          minHeight: "44px",
          height: "44px",
          borderRadius: "7px",
          px: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: disabled || isSubmitting ? 0.6 : 1,
          pointerEvents: disabled || isSubmitting ? "none" : "auto",
          cursor: disabled || isSubmitting || isFull ? "not-allowed" : "pointer",
          borderColor: isDragging ? "primary.main" : "divider",
          boxSizing: "border-box",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
            flex: 1,
            overflow: "hidden",
          }}
        >
          <CloudUploadOutlinedIcon
            sx={{
              fontSize: 18,
              color: "text.secondary",
              flexShrink: 0,
            }}
          />
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontSize: "0.875rem",
              fontWeight: 400,
              color: files.length > 0 ? "text.primary" : "text.secondary",
            }}
          >
            {files.length > 0
              ? `${files.length} ${t("task.filesSelected", "resminama birikdirildi")}`
              : t("task.dragOrClickToUpload", "Resminamany saýlaň ýa-da süýräň...")}
          </Typography>
        </Box>

        <Chip
          label={`${files.length} / ${MAX_FILES}`}
          size="small"
          color={files.length === MAX_FILES ? "warning" : "default"}
          sx={{
            height: "20px",
            fontSize: "0.675rem",
            fontWeight: 700,
            borderRadius: "4px",
            flexShrink: 0,
            ml: 1,
            bgcolor: files.length === MAX_FILES ? "warning.main" : "action.hover",
          }}
        />
      </Paper>

      {/* Fallback inline file list if hideList is false */}
      {!hideList && (
        <TaskFileList
          files={files}
          onChange={onChange}
          disabled={disabled}
          isSubmitting={isSubmitting}
        />
      )}
    </Box>
  );
}
