import { useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Stack,
  useTheme,
  CircularProgress,
} from "@mui/material";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import CustomTabs from "../../components/CustomTabs";
import Pagination from "../../components/Pagination";
import NotificationListItem from "./Contents/NotificationListItem";

import { useLocale } from "../../hooks/useLocale";
import { useDebounce } from "../../hooks/useDebounce";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { getAllNotificationsApi } from "../../api/queries/getters";
import { markNotificationReadApi } from "../../api/queries/patch";
import { deleteNotificationApi } from "../../api/queries/delete";

import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";

const NotificationPage = () => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unread' | 'read'

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearchChange = useCallback((val) => {
    setSearchQuery(val);
    setPage(1);
  }, []);

  const handleTabChange = useCallback((e, val) => {
    setActiveTab(val);
    setPage(1);
  }, []);

  // Build params for API query: page, limit, search, isRead
  const queryParams = useMemo(() => {
    const params = {
      page,
      limit,
    };

    if (debouncedSearch && debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }

    if (activeTab === "unread") {
      params.isRead = false;
    } else if (activeTab === "read") {
      params.isRead = true;
    }

    return params;
  }, [page, limit, debouncedSearch, activeTab]);

  // Server-side paginated GET request for notifications
  const {
    data: apiNotificationsResponse,
    totalItems,
    refetch,
    isLoading,
  } = usePagginationGet({
    apiFn: getAllNotificationsApi,
    key: "notificationsPage",
    params: queryParams,
  });

  // Mutation hooks for updating & deleting notifications
  const markReadMutation = useUpdate({
    apiFn: markNotificationReadApi,
    key: "notificationsPage",
    idKey: "guid",
  });

  const deleteMutation = useDelete({
    deleteFn: deleteNotificationApi,
    queryKey: "notificationsPage",
    idKey: "guid",
  });

  const notificationsList = useMemo(() => {
    return apiNotificationsResponse.map((item) => {
      const id = item.guid;
      const title =
        item.title ||
        (item.isMessage
          ? t("notifications.message")
          : t("notifications.task"));
      const description = item.description || "";
      const isRead = item.isRead ?? item.empltaskAssignee?.[0]?.isRead ?? false;

      const sender =
        item.admuser?.employee?.fullName ||
        item.admuser?.phone_number ||
        "Admin";

      const senderRole = item.admuser?.role || "";
      const date = item.createdAt || item.due_date;
      const avatarBg =
        item.priority === "urgent"
          ? "#DC2626"
          : item.isMessage
            ? "#10B981"
            : "#0E8584";

      return {
        id,
        guid: id,
        title,
        description,
        sender,
        senderRole,
        avatarBg,
        date,
        isRead,
        isMessage: item.isMessage,
        priority: item.priority,
      };
    });
  }, [apiNotificationsResponse, t]);

  const handleToggleRead = useCallback(
    async (id) => {
      try {
        await markReadMutation.mutateAsync({ task_guids: [id], guid: id, isRead: true });
        refetch();
      } catch (err) {
        console.warn("API mark notification read error:", err);
      }
    },
    [markReadMutation, refetch],
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        await deleteMutation.mutateAsync({ guid: id });
        refetch();
      } catch (err) {
        console.warn("API delete notification error:", err);
      }
    },
    [deleteMutation, refetch],
  );

  const notificationTabs = useMemo(
    () => [
      { value: "all", label: t("notifications.all") },
      { value: "unread", label: t("notifications.unread") },
      { value: "read", label: t("notifications.read") },
    ],
    [t]
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: 1.75,
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          px: 2,
          borderRadius: "14px",
          border: "1px solid",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
          backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justify: "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ flexGrow: 1, maxWidth: { md: 450 } }}>
          <GlobalSearchInput
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </Box>

        <CustomTabs
          value={activeTab}
          onChange={handleTabChange}
          tabs={notificationTabs}
        />
      </Paper>

      {/* Notifications Compact Vertical List */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 0.5 }}>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress
              size={32}
              sx={{ color: isDark ? "#14B8A6" : "#0E8584" }}
            />
          </Box>
        ) : notificationsList.length === 0 ? (
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
          /* Compact Vertical List Rows */
          <Stack spacing={1}>
            {notificationsList.map((item) => (
              <NotificationListItem
                key={item.id}
                notification={item}
                onToggleRead={handleToggleRead}
                onDelete={handleDelete}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <Pagination
          totalItems={totalItems}
          page={page}
          limit={limit}
          setPage={setPage}
          setPageSize={setLimit}
        />
      )}
    </Box>
  );
};

export default NotificationPage;
