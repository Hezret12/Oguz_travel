import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Paper,
  IconButton,
  Tooltip,
  Grid,
  Tabs,
  Tab,
  useTheme,
  alpha,
} from "@mui/material";
import PageHeader from "../../components/PageHeader";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import FilterDrawer from "../../components/FilterDrawer";
import Pagination from "../../components/Pagination";
import NotificationFilter from "./Contents/NotificationFilter";
import AddNotificationModal from "./AddNotificationModal";
import StatusChip from "../../components/StatusChip";
import { NOTIFICATION_STATUS_CONFIG } from "../../functions/statusChipConfigs";
import { useLocale } from "../../hooks/useLocale";
import { useDateFormat } from "../../functions/generalHelpers";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleNotificationRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  addCustomNotification,
} from "../../store/slices/notificationSlice";
import dayjs from "dayjs";

import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FilterListIcon from "@mui/icons-material/FilterList";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

const getTypeIcon = (type) => {
  switch (type) {
    case "comment":
      return <ChatBubbleOutlinedIcon sx={{ fontSize: 22 }} />;
    case "task":
    default:
      return <AssignmentIcon sx={{ fontSize: 22 }} />;
  }
};

const NotificationPage = () => {
  const { t } = useLocale();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { formatChange } = useDateFormat();
  const isDark = theme.palette.mode === "dark";

  // Data from Redux
  const notifications = useSelector(
    (state) => state.notifications.notifications,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unread' | 'read'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filter Drawer State
  const [appliedFilters, setAppliedFilters] = useState({
    status: "all",
    type: "all",
    startDate: null,
    endDate: null,
    sender: "",
  });

  // Calculate unread & total count
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  // Filter logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesSender = item.sender.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSender) return false;
      }

      // Tab Status
      if (activeTab === "unread" && item.isRead) return false;
      if (activeTab === "read" && !item.isRead) return false;

      // Drawer Status Filter
      if (appliedFilters.status === "unread" && item.isRead) return false;
      if (appliedFilters.status === "read" && !item.isRead) return false;

      // Type Filter
      if (appliedFilters.type !== "all" && item.type !== appliedFilters.type)
        return false;

      // Sender Filter
      if (
        appliedFilters.sender &&
        !item.sender.toLowerCase().includes(appliedFilters.sender.toLowerCase())
      ) {
        return false;
      }

      // Date Range Filter
      if (appliedFilters.startDate) {
        const itemDate = dayjs(item.date);
        if (itemDate.isBefore(dayjs(appliedFilters.startDate), "day"))
          return false;
      }
      if (appliedFilters.endDate) {
        const itemDate = dayjs(item.date);
        if (itemDate.isAfter(dayjs(appliedFilters.endDate), "day"))
          return false;
      }

      return true;
    });
  }, [notifications, searchQuery, activeTab, appliedFilters]);

  // Paginated notifications
  const paginatedNotifications = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredNotifications.slice(startIndex, startIndex + limit);
  }, [filteredNotifications, page, limit]);

  // Handlers
  const handleToggleRead = (id) => {
    dispatch(toggleNotificationRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  const handleAddNotification = (newNotif) => {
    dispatch(addCustomNotification(newNotif));
  };

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    setIsDrawerOpen(false);
    setPage(1);
  };

  const handleResetFilters = () => {
    setAppliedFilters({
      status: "all",
      type: "all",
      startDate: null,
      endDate: null,
      sender: "",
    });
    setPage(1);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: 2,
        overflow: "hidden",
      }}
    >
      {/* Page Header */}
      <PageHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <NotificationsActiveIcon
              sx={{ color: isDark ? "#14B8A6" : "#0E8584" }}
            />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {t("notifications.title") || "Bildirişler Ulgamy"}
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} ${t("notifications.new") || "täze"}`}
                size="small"
                color="error"
                sx={{ fontWeight: 700, borderRadius: "8px", height: 24 }}
              />
            )}
          </Box>
        }
        addButtonText={
          t("notifications.createNotification") || "Täze Bildiriş Döret"
        }
        onAddClick={() => setIsAddModalOpen(true)}
      >
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllAsRead}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              height: 40,
            }}
          >
            {t("notifications.markAllAsRead") || "Ählisini okaldy etmek"}
          </Button>
        )}

        {notifications.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={handleClearAll}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              height: 40,
            }}
          >
            {t("notifications.clearAll")}
          </Button>
        )}
      </PageHeader>

      {/* Control Bar: GlobalSearchInput, FilterDrawer Button, and Tabs */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
          backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Search & Filter Button Group */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ maxWidth: { sm: 400 } }}>
            <GlobalSearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setPage(1);
              }}
            />
          </Box>

          <Button
            variant="outlined"
            onClick={() => setIsDrawerOpen(true)}
            startIcon={<FilterListIcon />}
            sx={{
              borderRadius: "10px",
              height: 40,
              px: 2,
              borderColor: isDark
                ? "rgba(255,255,255,0.15)"
                : "rgba(0,0,0,0.12)",
              color: isDark ? "#F1F5F9" : "#334155",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {t("filter")}
          </Button>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(e, val) => {
            setActiveTab(val);
            setPage(1);
          }}
          sx={{
            minHeight: 40,
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px",
            },
          }}
        >
          <Tab
            value="all"
            label={`${t("notifications.all")} (${notifications.length})`}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              minHeight: 40,
            }}
          />
          <Tab
            value="unread"
            label={`${t("notifications.unread")} (${unreadCount})`}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              minHeight: 40,
            }}
          />
          <Tab
            value="read"
            label={`${t("notifications.read")} (${notifications.length - unreadCount})`}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              minHeight: 40,
            }}
          />
        </Tabs>
      </Paper>

      <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 0.5 }}>
        {filteredNotifications.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              py: 8,
              px: 3,
              borderRadius: "16px",
              border: "1px solid",
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
              backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "#FFFFFF",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Avatar
              sx={{
                width: 72,
                height: 72,
                mb: 2,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.04)",
                color: "text.disabled",
              }}
            >
              <NotificationsOffOutlinedIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "text.secondary", mb: 0.8 }}
            >
              {t("notifications.empty")}
            </Typography>
            <Typography
              variant="body2"
              color="text.disabled"
              sx={{ maxWidth: 420 }}
            >
              {t("notifications.emptyDesc")}
            </Typography>
          </Paper>
        ) : (
          /* Notifications Grid Cards */
          <Grid container spacing={2}>
            {paginatedNotifications.map((item) => {
              const {
                id,
                title,
                description,
                sender,
                senderRole,
                avatarBg,
                date,
                isRead,
                type,
              } = item;

              return (
                <Grid key={id} size={{ xs: 12, md: 6, lg: 6 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.2,
                      borderRadius: "16px",
                      position: "relative",
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      border: "1px solid",
                      borderColor: isRead
                        ? isDark
                          ? "rgba(255,255,255,0.08)"
                          : "#E2E8F0"
                        : isDark
                          ? "rgba(20, 184, 166, 0.25)"
                          : "rgba(14, 133, 132, 0.2)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: isDark
                          ? "0 12px 24px rgba(0,0,0,0.4)"
                          : "0 10px 20px rgba(0,0,0,0.06)",
                        borderColor: isDark
                          ? "rgba(20, 184, 166, 0.4)"
                          : "#0E8584",
                      },
                    }}
                  >
                    <Box
                      sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                    >
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          backgroundColor: alpha(avatarBg || "#0E8584", 0.15),
                          color: avatarBg || "#0E8584",
                          borderRadius: "12px",
                          flexShrink: 0,
                        }}
                      >
                        {getTypeIcon(type)}
                      </Avatar>

                      {/* Content Area */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        {/* Title & Status Chip Header */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justify: "space-between",
                            gap: 1,
                            mb: 0.8,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: isRead ? 600 : 700,
                              fontSize: "0.95rem",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {!isRead && (
                              <Box
                                component="span"
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: isDark
                                    ? "#14B8A6"
                                    : "#0E8584",
                                  display: "inline-block",
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            {title}
                          </Typography>

                          <StatusChip
                            status={isRead ? "TRUE" : "FALSE"}
                            config={NOTIFICATION_STATUS_CONFIG}
                            size="small"
                          />
                        </Box>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.84rem",
                            color: isDark
                              ? "rgba(255,255,255,0.75)"
                              : "#475569",
                            lineHeight: 1.5,
                            mb: 1.8,
                          }}
                        >
                          {description}
                        </Typography>

                        {/* Metadata Footer: Sender, Role & Date */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justify: "space-between",
                            flexWrap: "wrap",
                            gap: 1,
                            pt: 1,
                            borderTop: "1px dashed",
                            borderColor: isDark
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(0,0,0,0.06)",
                          }}
                        >
                          {/* Sender Info */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.8,
                            }}
                          >
                            <PersonIcon
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                color: isDark ? "#CBD5E1" : "#334155",
                              }}
                            >
                              {sender}
                            </Typography>
                            {senderRole && (
                              <Chip
                                label={senderRole}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.65rem",
                                  fontWeight: 600,
                                  backgroundColor: isDark
                                    ? "rgba(255,255,255,0.1)"
                                    : "rgba(0,0,0,0.06)",
                                  color: "text.secondary",
                                  borderRadius: "4px",
                                }}
                              />
                            )}
                          </Box>

                          {/* Date & Actions */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <AccessTimeIcon
                                sx={{ fontSize: 14, color: "text.disabled" }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.disabled",
                                  fontWeight: 500,
                                }}
                              >
                                {formatChange(date)}
                              </Typography>
                            </Box>

                            {/* Mark Read/Unread Action Button */}
                            <Tooltip
                              title={isRead ? t("notifications.markAsUnread") : t("notifications.markAsRead")
                              }>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleRead(id)}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  color: isRead
                                    ? "text.disabled"
                                    : isDark
                                      ? "#14B8A6"
                                      : "#0E8584",
                                  backgroundColor: !isRead
                                    ? alpha(theme.palette.primary.main, 0.12)
                                    : "transparent",
                                  "&:hover": {
                                    backgroundColor: isDark
                                      ? "rgba(255,255,255,0.12)"
                                      : "rgba(0,0,0,0.06)",
                                  },
                                }}
                              >
                                {isRead ? (
                                  <CheckCircleIcon sx={{ fontSize: 20 }} />
                                ) : (
                                  <CheckCircleOutlinedIcon
                                    sx={{ fontSize: 20 }}
                                  />
                                )}
                              </IconButton>
                            </Tooltip>

                            {/* Delete Action Button */}
                            <Tooltip title={t("delete")}>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(id)}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  color: "text.disabled",
                                  "&:hover": {
                                    color: "error.main",
                                    backgroundColor: alpha(
                                      theme.palette.error.main,
                                      0.12,
                                    ),
                                  },
                                }}
                              >
                                <DeleteOutlinedIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Pagination Footer */}
      {filteredNotifications.length > 0 && (
        <Pagination
          totalItems={filteredNotifications.length}
          page={page}
          limit={limit}
          setPage={setPage}
          setPageSize={setLimit}
        />
      )}

      {/* Filter Drawer */}
      <FilterDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      >
        <NotificationFilter
          appliedFilters={appliedFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </FilterDrawer>

      {/* Add Notification Modal */}
      <AddNotificationModal
        open={isAddModalOpen}
        close={() => setIsAddModalOpen(false)}
        onAdd={handleAddNotification}
      />
    </Box>
  );
};

export default NotificationPage;
