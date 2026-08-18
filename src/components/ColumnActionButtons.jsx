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
    table.setEditingRow(row);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
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
              if (onPaymentClick) {
                onPaymentClick(row);
              } else {
                setIsPaymentOpen(true);
              }
            }}
            size="small"
            title="Tölegler"
            sx={(theme) => ({
              borderRadius: "7px",
              border:
                theme.palette.mode === "dark"
                  ? "1px solid rgba(251, 191, 36, 0.35)"
                  : "1px solid rgba(217, 119, 6, 0.32)",
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.09) 100%)"
                  : "linear-gradient(135deg, rgba(251, 191, 36, 0.16) 0%, rgba(217, 119, 6, 0.08) 100%)",
              color: theme.palette.mode === "dark" ? "#fbbf24" : "#b45309",
              transition: "all 0.15s ease",
              "&:hover": {
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, rgba(245, 158, 11, 0.28) 0%, rgba(217, 119, 6, 0.18) 100%)"
                    : "linear-gradient(135deg, rgba(251, 191, 36, 0.28) 0%, rgba(217, 119, 6, 0.18) 100%)",
                borderColor:
                  theme.palette.mode === "dark" ? "#fbbf24" : "#d97706",
                transform: "translateY(-1px)",
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 2px 10px rgba(245, 158, 11, 0.32)"
                    : "0 2px 8px rgba(217, 119, 6, 0.25)",
              },
              "&:active": { transform: "scale(0.95)" },
            })}
          >
            <CircleDollarSign size={16} strokeWidth={2.2} />
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
              borderRadius: "7px",
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(20,184,166,0.12)"
                  : "rgba(14,133,132,0.08)",
              color: theme.palette.mode === "dark" ? "#14B8A6" : "#0E8584",
              transition: "all 0.15s ease",
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(20,184,166,0.22)"
                    : "rgba(14,133,132,0.18)",
                borderColor: theme.palette.mode === "dark" ? "#14B8A6" : "#0E8584",
                transform: "translateY(-1px)",
              },
              "&:active": { transform: "scale(0.95)" },
            })}
          >
            <ChatBubbleOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}

        {/* Edit button */}
        <IconButton
          onClick={handleEdit}
          size="small"
          title="Üýtgetmek"
          sx={(theme) => ({
            borderRadius: "7px",
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.04)",
            color: theme.palette.text.secondary,
            transition: "all 0.15s ease",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.10)"
                  : "rgba(0,0,0,0.09)",
              borderColor: theme.palette.text.secondary,
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
          sx={{
            borderRadius: "7px",
            border: "1px solid rgba(239,68,68,0.35)",
            backgroundColor: "rgba(239,68,68,0.07)",
            color: "#ef4444",
            transition: "all 0.15s ease",
            "&:hover": {
              backgroundColor: "rgba(239,68,68,0.15)",
              borderColor: "#ef4444",
              transform: "translateY(-1px)",
              boxShadow: "0 2px 8px rgba(239,68,68,0.25)",
            },
            "&:active": { transform: "scale(0.95)" },
          }}
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
