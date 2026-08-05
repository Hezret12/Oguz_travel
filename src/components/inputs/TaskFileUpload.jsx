import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Chip,
  Paper,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AttachFileIcon from "@mui/icons-material/AttachFile";
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
    mime.includes("spreadsheet") ||
    mime.includes("excel")
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
      return <ImageIcon sx={{ color: "#0EA5E9", fontSize: 22 }} />;
    case "pdf":
      return <PictureAsPdfIcon sx={{ color: "#EF4444", fontSize: 22 }} />;
    case "excel":
      return <TableChartIcon sx={{ color: "#10B981", fontSize: 22 }} />;
    case "word":
      return <DescriptionIcon sx={{ color: "#2563EB", fontSize: 22 }} />;
    default:
      return <InsertDriveFileIcon sx={{ color: "text.secondary", fontSize: 22 }} />;
  }
}

export default function TaskFileUpload({ files = [], onChange, label }) {
  const { t } = useLocale();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState({});

  // Generate object URLs for image preview thumbnails
  useEffect(() => {
    const newPreviews = {};
    files.forEach((file, index) => {
      if (file instanceof File && getFileCategory(file) === "image") {
        newPreviews[index] = URL.createObjectURL(file);
      }
    });
    setPreviews(newPreviews);

    return () => {
      Object.values(newPreviews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

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

  const handleRemoveFile = (indexToRemove) => {
    const updated = files.filter((_, idx) => idx !== indexToRemove);
    onChange?.(updated);
  };

  const isFull = files.length >= MAX_FILES;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header Label & Counter */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.8,
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
            gap: 0.75,
          }}
        >
          <AttachFileIcon sx={{ fontSize: 18, color: "primary.main" }} />
          {label || t("task.attachments", "Goşulýan faýllar")}
        </Typography>

        <Chip
          label={`${files.length} / ${MAX_FILES}`}
          size="small"
          color={files.length === MAX_FILES ? "warning" : "default"}
          sx={{
            height: "22px",
            fontSize: "0.725rem",
            fontWeight: 700,
            borderRadius: "6px",
            bgcolor: (theme) =>
              files.length === MAX_FILES
                ? theme.palette.mode === "dark"
                  ? "rgba(245, 158, 11, 0.2)"
                  : "#FEF3C7"
                : theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.06)",
            color: (theme) =>
              files.length === MAX_FILES
                ? "#D97706"
                : theme.palette.text.secondary,
          }}
        />
      </Box>

      {/* Hidden native input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept={ACCEPT_STRING}
        multiple
        style={{ display: "none" }}
        disabled={isFull}
      />

      {/* Dropzone Area */}
      {!isFull && (
        <Paper
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            p: 2,
            borderRadius: "12px",
            borderStyle: "dashed",
            borderWidth: "1.5px",
            borderColor: isDragging
              ? "primary.main"
              : (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.16)",
            bgcolor: (theme) =>
              isDragging
                ? theme.palette.mode === "dark"
                  ? "rgba(14, 133, 132, 0.12)"
                  : "rgba(14, 133, 132, 0.04)"
                : theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.02)"
                : "rgba(248, 250, 252, 0.8)",
            cursor: "pointer",
            textAlign: "center",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(14, 133, 132, 0.08)"
                  : "rgba(14, 133, 132, 0.03)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(14, 133, 132, 0.15)"
                    : "rgba(14, 133, 132, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
              }}
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>

            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.85rem" }}
              >
                {t(
                  "task.dragOrClickToUpload",
                  "Faýly şu ýere süýräň ýa-da saýlamak üçin basyň"
                )}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontSize: "0.75rem", mt: 0.25, display: "block" }}
              >
                {t(
                  "task.supportedFormatsHint",
                  "Surat (PNG, JPG), PDF, Excel, Word (Maks: 4 faýl, 10MB)"
                )}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Files List Preview */}
      {files.length > 0 && (
        <Stack spacing={1} sx={{ mt: 1.25 }}>
          {files.map((file, idx) => {
            const fileName =
              typeof file === "string"
                ? file.split("/").pop()
                : file?.name || `File ${idx + 1}`;
            const fileSize = file instanceof File ? formatFileSize(file.size) : "";
            const category = getFileCategory(file);
            const previewUrl = previews[idx];

            return (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1,
                  px: 1.5,
                  borderRadius: "10px",
                  border: "1px solid",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.08)",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.03)"
                      : "#FFFFFF",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(240, 247, 255, 0.5)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    minWidth: 0,
                  }}
                >
                  {/* Image thumbnail or Format Icon */}
                  {previewUrl ? (
                    <Box
                      component="img"
                      src={previewUrl}
                      alt={fileName}
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "6px",
                        objectFit: "cover",
                        border: "1px solid",
                        borderColor: "divider",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "8px",
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.06)"
                            : "rgba(0, 0, 0, 0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FileTypeIcon category={category} />
                    </Box>
                  )}

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.825rem",
                        color: "text.primary",
                        maxWidth: { xs: 220, sm: 300 },
                      }}
                    >
                      {fileName}
                    </Typography>
                    {fileSize && (
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", fontSize: "0.725rem" }}
                      >
                        {fileSize}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Tooltip title={t("remove", "Aýyr")}>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(idx)}
                    sx={{
                      color: "text.secondary",
                      "&:hover": {
                        color: "error.main",
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(239, 68, 68, 0.08)",
                      },
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
