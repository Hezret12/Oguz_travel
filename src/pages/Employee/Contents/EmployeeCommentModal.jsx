import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Avatar,
  TextField,
  IconButton,
  Divider,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { useLocale } from "../../../hooks/useLocale";
import { useDateFormat } from "../../../functions/generalHelpers";
import { useDispatch, useSelector } from "react-redux";
import { addCommentAndNotification, deleteComment } from "../../../store/slices/notificationSlice";
import { useGet } from "../../../hooks/CRUD/useGet";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { getEmployeeCommentsApi } from "../../../api/queries/getters";
import { addEmployeeCommentApi } from "../../../api/queries/post";
import { deleteEmployeeCommentApi } from "../../../api/queries/delete";
import toast from "react-hot-toast";
import { MessageSquare, Send, Trash2 } from "lucide-react";

const EmployeeCommentModal = ({ open, onClose, employee }) => {
  const { t, selectedLang } = useLocale();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { formatChange } = useDateFormat();
  const isDark = theme.palette.mode === "dark";

  const [commentText, setCommentText] = useState("");

  // Redux Comments
  const allComments = useSelector((state) => state.notifications.comments);

  // Position and Employee info
  const positionName = selectedLang(employee?.position?.name);
  const positionGuid = employee?.position_guid || employee?.position?.guid;
  const employeeGuid = employee?.guid;

  // 1. GET API Query
  const { data: apiComments = [] } = useGet({
    apiFn: getEmployeeCommentsApi,
    key: ["employeeComments", employeeGuid],
    params: { employee_guid: employeeGuid, position_guid: positionGuid },
    options: { enabled: Boolean(open && employeeGuid) },
  });

  // 2. CREATE API Mutation
  const createMutation = useCreate({
    apiFn: addEmployeeCommentApi,
    key: ["employeeComments", employeeGuid],
    onSuccess: () => {
      toast.success(t("notifications.commentAdded") || "Kommentariýa ýazyldy!");
      setCommentText("");
    },
  });

  // 3. DELETE API Mutation
  const deleteMutation = useDelete({
    deleteFn: deleteEmployeeCommentApi,
    queryKey: ["employeeComments", employeeGuid],
    idKey: "guid",
  });

  // Combine API comments + Redux comments
  const positionComments = useMemo(() => {
    const rawApi = Array.isArray(apiComments) ? apiComments : [];
    const combined = [...rawApi, ...allComments];
    const unique = [];
    const seen = new Set();

    for (const c of combined) {
      const id = c.guid || c.id;
      if (id && !seen.has(id)) {
        seen.add(id);
        if (
          c.position_guid === positionGuid ||
          c.position_name?.toLowerCase() === positionName?.toLowerCase() ||
          c.employee_guid === employeeGuid
        ) {
          unique.push({ ...c, id });
        }
      }
    }
    return unique;
  }, [apiComments, allComments, positionGuid, positionName, employeeGuid]);

  const handleDeleteComment = async (commentId) => {
    dispatch(deleteComment(commentId));

    try {
      await deleteMutation.mutateAsync(commentId);
      toast.success(t("delete") || "Pozuldy");
    } catch (err) {
      console.warn("API delete fallback to local state:", err);
      toast.success(t("delete") || "Pozuldy");
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const payload = {
      employee_guid: employeeGuid,
      position_guid: positionGuid,
      position_name: positionName,
      text: commentText.trim(),
      author: "Hezret Meretgylyjov",
      authorRole: "Manager",
    };

    dispatch(
      addCommentAndNotification({
        employee,
        author: payload.author,
        authorRole: payload.authorRole,
        commentText: payload.text,
      })
    );
    setCommentText("");

    try {
      await createMutation.mutateAsync(payload);
    } catch (err) {
      console.warn("API add comment fallback to local state:", err);
    }
  };

  if (!employee) return null;

  return (
    <CustomDialog open={open} close={onClose} widthX={520}>
      {/* CustomDialogHeader integrates seamlessly with CustomDialog built-in divider and close button */}
      <CustomDialogHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, width: "100%" }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "10px",
                backgroundColor: isDark ? "rgba(20,184,166,0.15)" : "rgba(14,133,132,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isDark ? "#2DD4BF" : "#0D9488",
              }}
            >
              <MessageSquare size={18} strokeWidth={2} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  lineHeight: 1.2,
                  fontFamily: "'Inter', sans-serif",
                  color: isDark ? "#ffffff" : "#0F172A",
                }}
              >
                {t("employee.comments") || "Kommentariýalar"}
              </Typography>
            </Box>
          </Box>
        }
      />

      {/* Body */}
      <Box sx={{ pt: 1 }}>
        {/* Comment List */}
        <Box
          sx={{
            maxHeight: 280,
            overflowY: "auto",
            pr: 0.5,
            mb: 2,
            "&::-webkit-scrollbar": { width: 5 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "#CBD5E1",
              borderRadius: 3,
            },
          }}
        >
          {positionComments.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 4, textAlign: "center" }}
            >
              Komment ýazylmady.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {positionComments.map((c) => {
                const initial = c.author ? c.author.charAt(0).toUpperCase() : "H";
                return (
                  <Box key={c.id} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                    {/* User Avatar */}
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                        color: isDark ? "#ffffff" : "#1E293B",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                      }}
                    >
                      {initial}
                    </Avatar>

                    {/* Speech Bubble & Date */}
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          position: "relative",
                          p: "10px 14px",
                          borderRadius: "14px",
                          backgroundColor: isDark ? "rgba(30, 41, 59, 0.7)" : "#F3F4F6",
                          border: "1px solid",
                          borderColor: isDark ? "rgba(255,255,255,0.06)" : "transparent",
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.88rem",
                              color: isDark ? "#ffffff" : "#0F172A",
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {c.author}
                          </Typography>

                          <IconButton
                            size="small"
                            onClick={() => handleDeleteComment(c.id)}
                            sx={{
                              color: "error.main",
                              p: 0.3,
                              opacity: 0.7,
                              "&:hover": { opacity: 1, backgroundColor: "rgba(239,68,68,0.1)" },
                            }}
                            title={t("delete") || "Pozmak"}
                          >
                            <Trash2 size={13} />
                          </IconButton>
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.84rem",
                            color: isDark ? "#E2E8F0" : "#334155",
                            mt: 0.3,
                            wordBreak: "break-word",
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {c.text}
                        </Typography>
                      </Box>

                      {/* Date Timestamp */}
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mt: 0.4,
                          ml: 1,
                          fontSize: "0.72rem",
                          color: isDark ? "rgba(255,255,255,0.4)" : "#94A3B8",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {formatChange(c.createdAt, { dateTime: true })}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        <Divider sx={{ mb: 2, borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0" }} />

        {/* Input & Send Form */}
        <Box
          component="form"
          onSubmit={handleSubmitComment}
          sx={{ display: "flex", gap: 1.2, alignItems: "flex-end" }}
        >
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t("employee.commentPlaceholder") || "Komment ýaz..."}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "#FFFFFF",
                fontSize: "0.9rem",
                padding: "10px 14px",
                borderColor: isDark ? "rgba(255,255,255,0.15)" : "#E2E8F0",
                "&:hover fieldset": {
                  borderColor: isDark ? "#2DD4BF" : "#0D9488",
                },
                "&.Mui-focused fieldset": {
                  borderColor: isDark ? "#2DD4BF" : "#0D9488",
                },
              },
            }}
          />

          <IconButton
            type="submit"
            disabled={createMutation.isPending || !commentText.trim()}
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              backgroundColor: isDark ? "#0D9488" : "#71717A",
              color: "#ffffff",
              flexShrink: 0,
              mb: "2px",
              "&:hover": {
                backgroundColor: isDark ? "#0F766E" : "#52525B",
              },
              "&.Mui-disabled": {
                backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                color: isDark ? "rgba(255,255,255,0.3)" : "#94A3B8",
              },
            }}
          >
            {createMutation.isPending ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Send size={18} />
            )}
          </IconButton>
        </Box>
      </Box>
    </CustomDialog>
  );
};

export default EmployeeCommentModal;
