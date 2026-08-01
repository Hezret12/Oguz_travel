import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  TextField,
  Chip,
  IconButton,
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
import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SendIcon from "@mui/icons-material/Send";
import { Trash2 } from "lucide-react";

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
  const { data: apiComments = [], isLoading: isFetchingComments } = useGet({
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
      toast.success(
        t("notifications.commentAdded") ||
          "Kommentariýa ýazyldy we işgäre bildiriş ugradyldy!"
      );
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
    if (!commentText.trim()) {
      toast.error(t("validation.required"));
      return;
    }

    const payload = {
      employee_guid: employeeGuid,
      position_guid: positionGuid,
      position_name: positionName,
      text: commentText.trim(),
      author: "Dawut Kakabaýew",
      authorRole: "Manager",
    };

    // Immediate UI feedback via Redux
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
    <CustomDialog open={open} close={onClose} widthX={650}>
      <CustomDialogHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ChatBubbleOutlinedIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {employee.fullName} -{t("employee.comments")}
            </Typography>
          </Box>
        }
      />

      <Box sx={{ p: 2.5, pt: 1.5 }}>
        {/* Existing Comments List */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}
        >
          {t("employee.commentHistory")}
          ({positionComments.length})
        </Typography>

        <Box
          sx={{
            maxHeight: 220,
            overflowY: "auto",
            mb: 2.5,
            p: 1,
            borderRadius: "12px",
            backgroundColor: isDark ? "rgba(15, 23, 42, 0.5)" : "#F8FAFC",
            border: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
          }}
        >
          {positionComments.length === 0 ? (
            <Typography
              variant="body2"
              color="text.disabled"
              sx={{ p: 2, textAlign: "center" }}
            >
              Heniz bu wezipe üçin kommentariýa ýazylmady. Ýokarky görnüşde täze
              kommentariýa goşuň.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {positionComments.map((c) => (
                <Paper
                  key={c.id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: "10px",
                    backgroundColor: isDark
                      ? "rgba(30, 41, 59, 0.7)"
                      : "#FFFFFF",
                    border: "1px solid",
                    borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
                    >
                      <PersonIcon
                        sx={{ fontSize: 15, color: "primary.main" }}
                      />
                      <Typography
                        variant="subtitle2"
                        sx={{ fontSize: "0.82rem", fontWeight: 700 }}
                      >
                        {c.author}
                      </Typography>
                      {c.authorRole && (
                        <Chip
                          label={c.authorRole}
                          size="small"
                          sx={{ height: 16, fontSize: "0.62rem", px: 0.3 }}
                        />
                      )}
                    </Box>

                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.4 }}
                      >
                        <AccessTimeIcon
                          sx={{ fontSize: 13, color: "text.disabled" }}
                        />
                        <Typography variant="caption" color="text.disabled">
                          {formatChange(c.createdAt)}
                        </Typography>
                      </Box>

                      <IconButton
                        size="small"
                        onClick={() => handleDeleteComment(c.id)}
                        sx={{
                          color: "error.main",
                          p: 0.4,
                          borderRadius: "6px",
                          "&:hover": {
                            backgroundColor: "rgba(239, 68, 68, 0.12)",
                          },
                        }}
                        title={t("delete") || "Pozmak"}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{ fontSize: "0.82rem", color: "text.primary" }}
                  >
                    {c.text}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>

        {/* Add Comment Form */}
        <Box component="form" onSubmit={handleSubmitComment}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            {t("employee.addComment") ||
              "Täze kommentariýa ýazmak (Notification ugradar)"}
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Işgär barada kommentariýa ýazyň..."
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClose}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {t("cancel") || "Ýatyr"}
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={createMutation.isPending}
              startIcon={createMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {t("employee.sendComment") ||
                "Kommentariýa Ýaz & Notification Ugrat"}
            </Button>
          </Box>
        </Box>
      </Box>
    </CustomDialog>
  );
};

export default EmployeeCommentModal;
