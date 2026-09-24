import { useState, useMemo, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Stack,
  useTheme,
  CircularProgress,
  Chip,
} from "@mui/material";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import CustomTabs from "../../components/CustomTabs";
import PageHeader from "../../components/PageHeader";
import NotificationListItem from "./Contents/NotificationListItem";
import AddNotificationModal from "./Contents/AddNotificationModal";

import { useLocale } from "../../hooks/useLocale";
import { useDebounce } from "../../hooks/useDebounce";
import { useInfiniteGet } from "../../hooks/useInfiniteGet";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { getAllNotificationsApi } from "../../api/queries/getters";
import { markNotificationReadApi } from "../../api/queries/patch";
import { deleteNotificationApi } from "../../api/queries/delete";

import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";

const PAGE_SIZE = 20;

const NotificationPage = () => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 350);
  const [activeTab, setActiveTab] = useState("all");

  const handleSearchChange = useCallback((val) => {
    setSearchQuery(val);
  }, []);

  const handleTabChange = useCallback((_e, val) => {
    setActiveTab(val);
  }, []);

  const queryParams = useMemo(() => {
    const params = {
      limit: PAGE_SIZE,
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
  }, [debouncedSearch, activeTab]);

  const {
    data: apiNotificationsResponse,
    totalItems,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    refetch,
  } = useInfiniteGet({
    apiFn: getAllNotificationsApi,
    key: "notificationsPage",
    params: queryParams,
  });

  const markReadMutation = useUpdate({
    apiFn: markNotificationReadApi,
    key: "notificationsPage",
    idKey: "guid",
    isInfiniteQuery: true,
  });

  const deleteMutation = useDelete({
    deleteFn: deleteNotificationApi,
    queryKey: "notificationsPage",
    idKey: "guid",
    isInfiniteQuery: true,
  });

  // IntersectionObserver to auto-fetch next page on reaching bottom
  const observerRef = useRef(null);
  const lastItemRef = useCallback(
    (node) => {
      if (isLoading || isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage],
  );

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
      } catch (err) {
        console.warn("API mark notification read error:", err);
      }
    },
    [markReadMutation],
  );

  const handleDelete = useCallback(
    async (guid) => {
      try {
        await deleteMutation.mutateAsync(guid);
      } catch (err) {
        console.warn("API delete notification error:", err);
      }
    },
    [deleteMutation],
  );

  const notificationTabs = useMemo(
    () => [
      { value: "all", label: t("notifications.all") },
      { value: "unread", label: t("notifications.unread") },
      { value: "read", label: t("notifications.read") },
    ],
    [t],
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
      {/* Top Page Header with Create Button */}
      <PageHeader
        title={t("notifications.title")}
        pageTitle={t("notifications.title")}
        addButtonText={t("notifications.create")}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      {/* Top Filter & Search Header */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          px: 2,
          borderRadius: "14px",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ flexGrow: 1, maxWidth: { md: 450 } }}>
          <GlobalSearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            onRefetch={refetch}
            isFetching={isFetching}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {totalItems > 0 && (
            <Chip
              size="small"
              label={`${totalItems} ${t("notifications.title")}`}
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                bgcolor: (th) =>
                  th.palette.mode === "dark"
                    ? "rgba(20, 184, 166, 0.16)"
                    : "rgba(14, 133, 132, 0.08)",
                color: "primary.main",
              }}
            />
          )}

          <CustomTabs
            value={activeTab}
            onChange={handleTabChange}
            tabs={notificationTabs}
            variant="pills"
            color="blue"
          />
        </Box>
      </Paper>

      {/* Notifications Infinite Scroll Container */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          pr: 0.5,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: (th) =>
              th.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(0, 0, 0, 0.15)",
            borderRadius: "4px",
          },
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 10,
            }}
          >
            <CircularProgress
              size={32}
              sx={{ color: "primary.main" }}
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
              borderColor: "divider",
              backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "#FFFFFF",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
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
          <Stack spacing={1}>
            {notificationsList.map((item, index) => {
              const isLast = index === notificationsList.length - 1;
              return (
                <Box key={item.id} ref={isLast ? lastItemRef : null}>
                  <NotificationListItem
                    notification={item}
                    onToggleRead={handleToggleRead}
                    onDelete={handleDelete}
                  />
                </Box>
              );
            })}

            {/* Bottom Fetching Indicator */}
            {isFetchingNextPage && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 2,
                  gap: 1,
                }}
              >
                <CircularProgress size={20} sx={{ color: "primary.main" }} />
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                  {t("loading")}
                </Typography>
              </Box>
            )}

            {/* End of list text */}
            {!hasNextPage && notificationsList.length > 5 && (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="caption" sx={{ color: "text.disabled" }}>
                  — {t("notifications.allLoaded")} —
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </Box>

      {/* Global Add Notification Modal */}
      <AddNotificationModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </Box>
  );
};

export default NotificationPage;
