import { Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

const ColumnActionButtons = ({ row, table, onDelete }) => {
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
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
      }}
    >
      {/* Edit button */}
      <Box
        component="button"
        onClick={handleEdit}
        sx={(theme) => ({
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 30,
          height: 30,
          borderRadius: "7px",
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.04)",
          color: theme.palette.text.secondary,
          cursor: "pointer",
          transition: "all 0.15s ease",
          outline: "none",
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
        <EditIcon sx={{ fontSize: 14 }} />
      </Box>

      {/* Delete button */}
      <Box
        component="button"
        onClick={handleDelete}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 30,
          height: 30,
          borderRadius: "7px",
          border: "1px solid rgba(239,68,68,0.35)",
          backgroundColor: "rgba(239,68,68,0.07)",
          color: "#ef4444",
          cursor: "pointer",
          transition: "all 0.15s ease",
          outline: "none",
          "&:hover": {
            backgroundColor: "rgba(239,68,68,0.15)",
            borderColor: "#ef4444",
            transform: "translateY(-1px)",
            boxShadow: "0 2px 8px rgba(239,68,68,0.25)",
          },
          "&:active": { transform: "scale(0.95)" },
        }}
      >
        <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
      </Box>
    </Box>
  );
};

export default ColumnActionButtons;
