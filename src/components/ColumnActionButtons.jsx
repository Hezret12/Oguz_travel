import { useState } from "react";
import { Box, IconButton } from "@mui/material";
import { CircleDollarSign, PenLine, Trash2 } from "lucide-react";
import { PaymentManagementModal } from "./Dialog/PaymentManagementModal";

const ColumnActionButtons = ({
  row,
  table,
  onDelete,
  onEdit,
  showPayment = false,
  onPaymentClick,
  onPaymentsChanged,
  showDelete = true,
}) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleEdit = (e) => {
    e.stopPropagation();
    e.currentTarget.blur();
    if (onEdit) {
      onEdit(row.original);
    } else {
      table.setEditingRow(row);
    }
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
              border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "#059669",
              transition: "all 0.15s ease",
              "&:hover": {
                borderColor: "#059669",
                transform: "translateY(-1px)",
              },
              "&:active": { transform: "scale(0.95)" },
              ...theme.applyStyles("dark", {
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#34d399",
                "&:hover": {
                  borderColor: "#34d399",
                },
              }),
            })}
          >
            <CircleDollarSign size={15} strokeWidth={2} />
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
            backgroundColor: "rgba(0, 0, 0, 0.03)",
            color: theme.palette.text.secondary,
            transition: "all 0.15s ease",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.07)",
              borderColor: theme.palette.text.primary,
              color: theme.palette.text.primary,
              transform: "translateY(-1px)",
            },
            "&:active": { transform: "scale(0.95)" },
            ...theme.applyStyles("dark", {
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              },
            }),
          })}
        >
          <PenLine size={15} />
        </IconButton>

        {/* Delete button */}
        {showDelete && (
          <IconButton
            onClick={handleDelete}
            size="small"
            title="Pozmak"
            sx={(theme) => ({
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              backgroundColor: "rgba(239, 68, 68, 0.06)",
              color: "#dc2626",
              transition: "all 0.15s ease",
              "&:hover": {
                backgroundColor: "rgba(239, 68, 68, 0.14)",
                borderColor: "#dc2626",
                transform: "translateY(-1px)",
              },
              "&:active": { transform: "scale(0.95)" },
              ...theme.applyStyles("dark", {
                border: "1px solid rgba(239, 68, 68, 0.3)",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "#f87171",
                "&:hover": {
                  backgroundColor: "rgba(239, 68, 68, 0.2)",
                  borderColor: "#f87171",
                },
              }),
            })}
          >
            <Trash2 size={15} />
          </IconButton>
        )}
      </Box>

      {/* Payment Management Modal */}
      {isPaymentOpen && (
        <PaymentManagementModal
          open={isPaymentOpen}
          onClose={(changed) => {
            setIsPaymentOpen(false);
            // Lets the page refresh paid totals / status after payments changed.
            if (changed) onPaymentsChanged?.(row);
          }}
          row={row}
        />
      )}
    </>
  );
};

export default ColumnActionButtons;
