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
import { Download } from "lucide-react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import { useLocale } from "../../hooks/useLocale";

const DEFAULT_MAX_FILES = 10;
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
  maxFiles = DEFAULT_MAX_FILES,
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

  const handleClearAll = () => {
    onChange?.([]);
  };

  if (!files || files.length === 0) return null;

  const isLimitReached = files.length >= maxFiles;

  return (
    <Box sx={{ width: "100%", mt: 0.5 }}>
      {/* List Header: File Count & Clear All */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0.75,
          px: 0.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "0.72rem",
            }}
          >
            {t("task.uploadedFiles", "Birikdirilen faýllar")}
          </Typography>
          <Chip
            label={`${files.length} / ${maxFiles}`}
            size="small"
            color={isLimitReached ? "warning" : "default"}
            sx={{
              height: "20px",
              fontSize: "0.68rem",
              fontWeight: 700,
              borderRadius: "5px",
              bgcolor: isLimitReached ? "warning.main" : "action.hover",
              color: isLimitReached ? "warning.contrastText" : "text.secondary",
            }}
          />
        </Box>

        {files.length > 1 && !disabled && !isSubmitting && (
          <Typography
            variant="caption"
            onClick={handleClearAll}
            sx={{
              color: "error.main",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.72rem",
              userSelect: "none",
              transition: "opacity 0.15s ease",
              "&:hover": {
                opacity: 0.8,
                textDecoration: "underline",
              },
            }}
          >
            {t("clearAll", "Hemmesini arassala")}
          </Typography>
        )}
      </Box>

      {/* Grid of File Cards with Responsive Scroll Container */}
      <Box
        sx={{
          maxHeight: files.length > 4 ? "230px" : "auto",
          overflowY: files.length > 4 ? "auto" : "visible",
          pr: files.length > 4 ? 0.5 : 0,
          "&::-webkit-scrollbar": {
            width: "5px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "divider",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "text.disabled",
          },
        }}
      >
        <Grid container spacing={1}>
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
                    px: 1,
                    height: "50px",
                    boxSizing: "border-box",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  {/* Left: Thumbnail or Icon + Info */}
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
                      <Tooltip title={t("task.imagePreview", "Uly görmek")} arrow placement="top">
                        <Box
                          component="img"
                          src={previewUrl}
                          alt={fileName}
                          onClick={() =>
                            setPreviewModal({ url: previewUrl, name: fileName, file })
                          }
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: "6px",
                            objectFit: "cover",
                            border: "1px solid",
                            borderColor: "divider",
                            flexShrink: 0,
                            cursor: "pointer",
                            transition: "transform 0.15s ease, border-color 0.15s ease",
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
                          width: 34,
                          height: 34,
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
                        <Tooltip title={fileName} placement="top" arrow>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.8rem",
                              color: "text.primary",
                              minWidth: 0,
                              flexShrink: 1,
                              cursor: "default",
                            }}
                          >
                            {fileName}
                          </Typography>
                        </Tooltip>
                        <FileCategoryBadge category={category} />
                      </Box>

                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.675rem",
                          display: "block",
                          lineHeight: 1.2,
                        }}
                      >
                        {fileSize || (typeof file === "string" ? t("task.serverFile", "Serwer faýly") : "")}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right Actions */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.2, flexShrink: 0, ml: 0.5 }}>
                    {previewUrl && (
                      <Tooltip title={t("task.imagePreview", "Uly görmek")} arrow placement="top">
                        <IconButton
                          size="small"
                          onClick={() =>
                            setPreviewModal({ url: previewUrl, name: fileName, file })
                          }
                          sx={{
                            p: 0.4,
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

                    <Tooltip title={t("download", "Ýükläp al")} arrow placement="top">
                      <IconButton
                        size="small"
                        onClick={() => downloadFile(file, fileName)}
                        sx={{
                          p: 0.4,
                          color: "text.secondary",
                          "&:hover": {
                            color: "primary.main",
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <Download size={16} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={t("remove", "Aýyr")} arrow placement="top">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(idx)}
                        disabled={disabled || isSubmitting}
                        sx={{
                          p: 0.4,
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
      </Box>

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
                  <Download size={18} />
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
                transition: "transform 0.2s ease",
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
  maxFiles = DEFAULT_MAX_FILES,
}) {
  const { t } = useLocale();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback(
    (newFiles) => {
      const validFiles = [];
      const currentCount = files.length;

      if (currentCount >= maxFiles) {
        toast.error(
          t(
            "task.maxFilesReached",
            { count: maxFiles },
            `Maksimum ${maxFiles} faýl ýükläp bilersiňiz.`
          )
        );
        return;
      }

      for (const file of newFiles) {
        if (validFiles.length + currentCount >= maxFiles) {
          toast.error(
            t(
              "task.maxFilesLimitExceeded",
              { count: maxFiles },
              `Maksimum ${maxFiles} faýl çäklendirmesi sebäpli käbir faýllar goşulmady.`
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
    [files, maxFiles, onChange, t]
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
    if (files.length < maxFiles) {
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

  const isFull = files.length >= maxFiles;

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
            title={t(
              "task.fileUploadTooltip",
              { count: maxFiles },
              `Maksimum ${maxFiles} faýl | Ölçeg çägi: 10MB | Goldanýanlar: PNG, JPG, PDF, XLS, DOC`
            )}
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
          borderColor: isDragging ? "primary.main" : isFull ? "divider" : "divider",
          boxSizing: "border-box",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            borderColor: disabled || isSubmitting || isFull ? "divider" : "primary.main",
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
            overflow: "hidden",
          }}
        >
          <CloudUploadOutlinedIcon
            sx={{
              fontSize: 18,
              color: isFull ? "warning.main" : "text.secondary",
              flexShrink: 0,
            }}
          />
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontSize: "0.875rem",
              fontWeight: 400,
              color: isFull ? "text.secondary" : files.length > 0 ? "text.primary" : "text.secondary",
            }}
          >
            {isFull
              ? `${files.length} / ${maxFiles} ${t("task.filesSelectedMax", "resminama birikdirildi (Maksimum)")}`
              : files.length > 0
              ? `${files.length} ${t("task.filesSelected", "resminama birikdirildi")}`
              : t("task.dragOrClickToUpload", "Resminamany saýlaň ýa-da süýräň...")}
          </Typography>
        </Box>

        <Chip
          label={`${files.length} / ${maxFiles}`}
          size="small"
          color={isFull ? "warning" : "default"}
          sx={{
            height: "20px",
            fontSize: "0.675rem",
            fontWeight: 700,
            borderRadius: "4px",
            flexShrink: 0,
            ml: 1,
            bgcolor: isFull ? "warning.main" : "action.hover",
            color: isFull ? "warning.contrastText" : "text.secondary",
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
          maxFiles={maxFiles}
        />
      )}
    </Box>
  );
}
