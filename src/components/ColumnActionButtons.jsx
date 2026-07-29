import { useState } from "react";
import { Box, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import { PaymentManagementModal } from "./Dialog/PaymentManagementModal";

const ColumnActionButtons = ({ row, table, onDelete, showPayment = false, onPaymentClick }) => {
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
            sx={(theme) => ({
              borderRadius: "7px",
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.04)",
              color: "primary.main",
              transition: "all 0.15s ease",
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.10)"
                    : "rgba(0,0,0,0.09)",
                borderColor: "primary.main",
                transform: "translateY(-1px)",
              },
              "&:active": { transform: "scale(0.95)" },
            })}
          >
            <PaymentsRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}

        {/* Edit button */}
        <IconButton
          onClick={handleEdit}
          size="small"
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
          <EditIcon sx={{ fontSize: 16 }} />
        </IconButton>

        {/* Delete button */}
        <IconButton
          onClick={handleDelete}
          size="small"
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
          <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
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
