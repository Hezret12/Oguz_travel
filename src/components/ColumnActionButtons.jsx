import { useState } from "react";
import { Box, IconButton } from "@mui/material";
import { CircleDollarSign, PenLine, Trash2 } from "lucide-react";
import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";
import { PaymentManagementModal } from "./Dialog/PaymentManagementModal";

const ColumnActionButtons = ({
  row,
  table,
  onDelete,
  showPayment = false,
  onPaymentClick,
  showComment = false,
  onCommentClick,
}) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleEdit = (e) => {
    e.stopPropagation();
    e.currentTarget.blur();
    table.setEditingRow(row);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    e.currentTarget.blur();
    if (onDelete) {
      onDelete(row.original);
    } else {
      console.log("TODO: delete", row.original);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        {/* Payment button */}
        {showPayment && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.blur();
              if (onPaymentClick) {
                onPaymentClick(row);
              } else {
                setIsPaymentOpen(true);
              }
            }}
            size="small"
            title="Tölegler"
            sx={(theme) => ({
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              border:
                theme.palette.mode === "dark"
                  ? "1px solid rgba(16, 185, 129, 0.3)"
                  : "1px solid rgba(16, 185, 129, 0.25)",
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(16, 185, 129, 0.07)",
              color: theme.palette.mode === "dark" ? "#34d399" : "#059669",
              transition: "all 0.15s ease",
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(16, 185, 129, 0.2)"
                    : "rgba(16, 185, 129, 0.15)",
                borderColor:
                  theme.palette.mode === "dark" ? "#34d399" : "#059669",
                transform: "translateY(-1px)",
              },
              "&:active": { transform: "scale(0.95)" },
            })}
          >
            <CircleDollarSign size={15} strokeWidth={2} />
          </IconButton>
        )}

        {/* Comment / Notification button */}
        {showComment && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              if (onCommentClick) {
                onCommentClick(row.original);
              }
            }}
            size="small"
            title="Kommentariýa Ýaz / Gör"
            sx={(theme) => ({
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              border:
                theme.palette.mode === "dark"
                  ? "1px solid rgba(99, 102, 241, 0.3)"
                  : "1px solid rgba(99, 102, 241, 0.25)",
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(99, 102, 241, 0.1)"
                  : "rgba(99, 102, 241, 0.07)",
              color: theme.palette.mode === "dark" ? "#818cf8" : "#4f46e5",
              transition: "all 0.15s ease",
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(99, 102, 241, 0.2)"
                    : "rgba(99, 102, 241, 0.15)",
                borderColor:
                  theme.palette.mode === "dark" ? "#818cf8" : "#4f46e5",
                transform: "translateY(-1px)",
              },
              "&:active": { transform: "scale(0.95)" },
            })}
          >
            <ChatBubbleOutlinedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        )}

        {/* Edit button */}
        <IconButton
          onClick={handleEdit}
          size="small"
          title="Üýtgetmek"
          sx={(theme) => ({
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.04)"
                : "rgba(0, 0, 0, 0.03)",
            color: theme.palette.text.secondary,
            transition: "all 0.15s ease",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.07)",
              borderColor: theme.palette.text.primary,
              color: theme.palette.text.primary,
              transform: "translateY(-1px)",
            },
            "&:active": { transform: "scale(0.95)" },
          })}
        >
          <PenLine size={15} />
        </IconButton>

        {/* Delete button */}
        <IconButton
          onClick={handleDelete}
          size="small"
          title="Pozmak"
          sx={(theme) => ({
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            border:
              theme.palette.mode === "dark"
                ? "1px solid rgba(239, 68, 68, 0.3)"
                : "1px solid rgba(239, 68, 68, 0.25)",
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(239, 68, 68, 0.06)",
            color: theme.palette.mode === "dark" ? "#f87171" : "#dc2626",
            transition: "all 0.15s ease",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(239, 68, 68, 0.2)"
                  : "rgba(239, 68, 68, 0.14)",
              borderColor:
                theme.palette.mode === "dark" ? "#f87171" : "#dc2626",
              transform: "translateY(-1px)",
            },
            "&:active": { transform: "scale(0.95)" },
          })}
        >
          <Trash2 size={15} />
        </IconButton>
      </Box>

      {/* Payment Management Modal */}
      {isPaymentOpen && (
        <PaymentManagementModal
          open={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          row={row}
        />
      )}
    </>
  );
};

export default ColumnActionButtons;
