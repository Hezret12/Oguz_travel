import { memo } from "react";
import {
  Paper,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { CheckSquare, MessageSquareText } from "lucide-react";
import StatusChip from "../../../components/StatusChip";
import { NOTIFICATION_STATUS_CONFIG } from "../../../functions/statusChipConfigs";
import { useDateFormat } from "../../../functions/generalHelpers";
import { useLocale } from "../../../hooks/useLocale";

const getTypeIcon = (isMessage) =>
  isMessage ? <MessageSquareText size={18} /> : <CheckSquare size={18} />;

const getPriorityChipProps = (priority) => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return { label: "Urgent", bg: "#FEE2E2", textColor: "#DC2626" };
    case "medium":
      return { label: "Medium", bg: "#DBEAFE", textColor: "#2563EB" };
    default:
      return null;
  }
};

const NotificationListItem = ({ notification, onToggleRead, onDelete }) => {
  const { t } = useLocale();
  const theme = useTheme();
  const { formatChange } = useDateFormat();
  const isDark = theme.palette.mode === "dark";

  const {
    id,
    title,
    description,
    sender,
    senderRole,
    avatarBg,
    date,
    isRead,
    isMessage,
    priority,
  } = notification;

  const priorityProps = getPriorityChipProps(priority);

  return (
    <Paper
      elevation={0}
      sx={{
        py: 1.25,
        px: 2,
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        gap: 1.75,
        position: "relative",
        transition: "all 0.15s ease-in-out",
        border: "1px solid",
        borderColor: isRead
          ? isDark
            ? "rgba(255,255,255,0.06)"
            : "#E2E8F0"
          : isDark
            ? "rgba(20, 184, 166, 0.25)"
            : "rgba(14, 133, 132, 0.2)",
        backgroundColor: isRead
          ? isDark
            ? "rgba(15, 23, 42, 0.35)"
            : "#FFFFFF"
          : isDark
            ? "rgba(20, 184, 166, 0.05)"
            : "rgba(14, 133, 132, 0.03)",
        borderLeft: "3px solid",
        borderLeftColor: isRead
          ? isDark
            ? "rgba(255,255,255,0.06)"
            : "#E2E8F0"
          : isDark
            ? "#14B8A6"
            : "#0E8584",
        "&:hover": {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(248, 250, 252, 0.9)",
          borderColor: isDark ? "rgba(20, 184, 166, 0.4)" : "#0E8584",
        },
      }}
    >
      {/* Type Avatar */}
      <Avatar
        sx={{
          width: 36,
          height: 36,
          backgroundColor: alpha(avatarBg || "#0E8584", isDark ? 0.2 : 0.12),
          color: avatarBg || (isDark ? "#14B8A6" : "#0E8584"),
          borderRadius: "8px",
          flexShrink: 0,
        }}
      >
        {getTypeIcon(isMessage)}
      </Avatar>

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
        }}
      >
        {/* Top Header Line */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            minWidth: 0,
          }}
        >
          {/* Title & Badges (with fixed Unread Dot slot) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {/* Always rendered fixed 8px slot so text position never shifts when isRead changes */}
            <Box
              sx={{
                width: 8,
                height: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: isRead
                    ? "transparent"
                    : isDark
                      ? "#14B8A6"
                      : "#0E8584",
                  transition: "background-color 0.2s ease",
                }}
              />
            </Box>

            <Typography
              variant="body2"
              sx={{
                fontWeight: isRead ? 600 : 750,
                fontSize: "0.875rem",
                color: isDark ? "#F8FAFC" : "#0F172A",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </Typography>

            {priorityProps && (
              <Chip
                label={priorityProps.label}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  backgroundColor: isDark
                    ? alpha(priorityProps.textColor, 0.2)
                    : priorityProps.bg,
                  color: priorityProps.textColor,
                  borderRadius: "4px",
                  flexShrink: 0,
                }}
              />
            )}
          </Box>

          {/* Meta Info (Sender, Date & Status Chip with fixed slot widths) */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            {/* Sender Column */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                minWidth: 110,
                justifyContent: "flex-end",
              }}
            >
              <PersonIcon
                sx={{ fontSize: 14, color: isDark ? "#64748B" : "#94A3B8" }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: isDark ? "#CBD5E1" : "#475569",
                  fontSize: "0.75rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {sender}
              </Typography>
              {senderRole && (
                <Chip
                  label={senderRole}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.05)",
                    color: isDark ? "#94A3B8" : "#64748B",
                    borderRadius: "4px",
                    flexShrink: 0,
                  }}
                />
              )}
            </Box>

            {/* Date Column (fixed width slot) */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 0.4,
                minWidth: 105,
              }}
            >
              <AccessTimeIcon
                sx={{ fontSize: 13, color: isDark ? "#64748B" : "#94A3B8" }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.725rem",
                  color: isDark ? "#94A3B8" : "#64748B",
                  fontWeight: 500,
                }}
              >
                {formatChange(date, { smartToday: true })}
              </Typography>
            </Box>

            {/* Status Chip Column (fixed width slot so Okalan vs Okalmandan doesn't shift alignment) */}
            <Box
              sx={{
                width: 120,
                display: "flex",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <StatusChip
                status={isRead ? "TRUE" : "FALSE"}
                config={NOTIFICATION_STATUS_CONFIG}
                size="small"
              />
            </Box>
          </Box>
        </Box>

        {/* Description Line */}
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.8125rem",
            color: isDark ? "#94A3B8" : "#64748B",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.4,
          }}
        >
          {description}
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}
      >
        <Tooltip
          title={
            isRead
              ? t("notifications.markAsUnread")
              : t("notifications.markAsRead")
          }
        >
          <IconButton
            size="small"
            onClick={() => onToggleRead(id)}
            sx={{
              width: 30,
              height: 30,
              color: isRead
                ? isDark
                  ? "#64748B"
                  : "#94A3B8"
                : isDark
                  ? "#14B8A6"
                  : "#0E8584",
              backgroundColor: !isRead
                ? isDark
                  ? "rgba(20, 184, 166, 0.12)"
                  : "rgba(14, 133, 132, 0.08)"
                : "transparent",
              "&:hover": {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.06)",
              },
            }}
          >
            {isRead ? (
              <CheckCircleIcon sx={{ fontSize: 18 }} />
            ) : (
              <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title={t("delete") || "Poz"}>
          <IconButton
            size="small"
            onClick={() => onDelete(id)}
            sx={{
              width: 30,
              height: 30,
              color: isDark ? "#64748B" : "#94A3B8",
              "&:hover": {
                color: "error.main",
                backgroundColor: isDark
                  ? "rgba(239, 68, 68, 0.15)"
                  : "rgba(239, 68, 68, 0.08)",
              },
            }}
          >
            <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default memo(NotificationListItem);
