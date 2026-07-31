import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Avatar,
  Paper,
  Button,
  TextField,
  Alert,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import FooterButton from "../../../components/Dialog/FooterButton";
import { useLocale } from "../../../hooks/useLocale";
import { useDateFormat } from "../../../functions/generalHelpers";
import { useDispatch, useSelector } from "react-redux";
import { addCommentAndNotification } from "../../../store/slices/notificationSlice";
import toast from "react-hot-toast";
import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SendIcon from "@mui/icons-material/Send";
import WorkIcon from "@mui/icons-material/Work";

const EmployeeCommentModal = ({ open, onClose, employee }) => {
  const { t, selectedLang } = useLocale();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { formatChange } = useDateFormat();
  const isDark = theme.palette.mode === "dark";

  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redux Comments
  const allComments = useSelector((state) => state.notifications.comments);

  // Position and Employee info
  const positionName = selectedLang(employee?.position?.name) || employee?.position_name || "Agent";
  const positionGuid = employee?.position_guid || employee?.position?.guid || "pos-agent-1";
  const employeeGuid = employee?.guid;

  // Filter comments associated with this position / employee
  const positionComments = useMemo(() => {
    return allComments.filter(
      (c) =>
        c.position_guid === positionGuid ||
        c.position_name?.toLowerCase() === positionName?.toLowerCase() ||
        c.employee_guid === employeeGuid
    );
  }, [allComments, positionGuid, positionName, employeeGuid]);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error(t("validation.required") || "Kommentariýa tekstini giriziň!");
      return;
    }

    setIsSubmitting(true);

    try {
      dispatch(
        addCommentAndNotification({
          employee,
          author: "Dawut Kakabaýew",
          authorRole: "Manager",
          commentText: commentText.trim(),
        })
      );

      toast.success(
        t("notifications.commentAdded") ||
          "Kommentariýa ýazyldy we işgäre bildiriş ugradyldy!"
      );
      setCommentText("");
    } catch (err) {
      console.error(err);
      toast.error("Error adding comment");
    } finally {
      setIsSubmitting(false);
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
              {employee.fullName} — {t("employee.comments") || "Kommentariýalar"}
            </Typography>
          </Box>
        }
      />

      <Box sx={{ p: 2.5, pt: 1.5 }}>
        {/* Business Rule Position Continuity Notice */}
        <Alert
          severity="info"
          icon={<WorkIcon fontSize="inherit" />}
          sx={{
            mb: 2.5,
            borderRadius: "12px",
            fontSize: "0.80rem",
            fontWeight: 500,
            border: "1px solid",
            borderColor: isDark ? "rgba(20,184,166,0.3)" : "rgba(14,133,132,0.2)",
            backgroundColor: isDark ? "rgba(20,184,166,0.08)" : "rgba(14,133,132,0.05)",
          }}
        >
          <strong>{positionName}</strong> wezipesine degişli taryhy kommentariýalar: Işgär üýtgese-de, bu wezipä täze gelen işgär öňki kommentariýalary we bildirişleri görüp biler.
        </Alert>

        {/* Employee Position Badge */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              color: "primary.main",
              fontWeight: 700,
            }}
          >
            {(employee.fullName || "E").charAt(0).toUpperCase()}
          </Avatar>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {employee.fullName}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.3 }}>
              <Chip
                label={positionName}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
              />
              {employee.office && (
                <Chip
                  label={selectedLang(employee.office.fullName)}
                  size="small"
                  sx={{ height: 20, fontSize: "0.68rem" }}
                />
              )}
            </Stack>
          </Box>
        </Box>

        {/* Existing Comments List */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>
          {t("employee.commentHistory") || "Wezipe boýunça kommentariýalar sanawy"} ({positionComments.length})
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
            <Typography variant="body2" color="text.disabled" sx={{ p: 2, textAlign: "center" }}>
              Heniz bu wezipe üçin kommentariýa ýazylmady. Ýokarky görnüşde täze kommentariýa goşuň.
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
                    backgroundColor: isDark ? "rgba(30, 41, 59, 0.7)" : "#FFFFFF",
                    border: "1px solid",
                    borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <PersonIcon sx={{ fontSize: 15, color: "primary.main" }} />
                      <Typography variant="subtitle2" sx={{ fontSize: "0.82rem", fontWeight: 700 }}>
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

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                      <AccessTimeIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                      <Typography variant="caption" color="text.disabled">
                        {formatChange(c.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ fontSize: "0.82rem", color: "text.primary" }}>
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
            {t("employee.addComment") || "Täze kommentariýa ýazmak (Notification ugradar)"}
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
              sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
            >
              {t("cancel") || "Ýatyr"}
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={<SendIcon />}
              sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
            >
              {t("employee.sendComment") || "Kommentariýa Ýaz & Notification Ugrat"}
            </Button>
          </Box>
        </Box>
      </Box>
    </CustomDialog>
  );
};

export default EmployeeCommentModal;
