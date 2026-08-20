import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

const DocumentPreviewModal = ({ open, onClose, document }) => {
  if (!document) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            p: 1,
            maxHeight: "90vh",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DescriptionOutlinedIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {document.title || "Dokument Önizleme"}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4, bgcolor: "background.paper" }}>
        {/* Document Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", mb: 1 }}>
            {document.title}
          </Typography>
          {document.country && (
            <Typography variant="subtitle1" sx={{ color: "text.secondary", fontWeight: 600 }}>
              {document.country}
            </Typography>
          )}
        </Box>

        {/* Tables */}
        {(document.tables || []).map((table, tIdx) => (
          <Box key={table.id || tIdx} sx={{ mb: 4 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "text.secondary",
                letterSpacing: "0.5px",
                mb: 1.5,
                textTransform: "uppercase",
              }}
            >
              {table.title || `TABLISA ${tIdx + 1}`}
            </Typography>

            <Box
              sx={{
                width: "100%",
                overflowX: "auto",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                mb: 1.5,
              }}
            >
              <Box
                component="table"
                sx={{
                  width: "100%",
                  borderCollapse: "collapse",
                  "& td, & th": {
                    border: "1px solid",
                    borderColor: "divider",
                    p: 1.5,
                    fontSize: "0.9rem",
                  },
                }}
              >
                <tbody>
                  {(table.rows || []).map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => {
                        if (cell.isMerged) return null;
                        return (
                          <td
                            key={cell.id || `${rIdx}-${cIdx}`}
                            colSpan={cell.colSpan || 1}
                            rowSpan={cell.rowSpan || 1}
                            style={{
                              fontWeight: rIdx === 0 ? 600 : 400,
                              backgroundColor: rIdx === 0 ? "rgba(0,0,0,0.02)" : "transparent",
                            }}
                          >
                            {cell.text || "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Box>

            {table.note && (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontStyle: "italic",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "#fafaf9",
                  p: 1.5,
                  borderRadius: "8px",
                  borderLeft: "3px solid #f59e0b",
                }}
              >
                <strong>Bellik:</strong> {table.note}
              </Typography>
            )}
          </Box>
        ))}

        {/* Global Note */}
        {document.generalNote && (
          <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>
              Umumy Bellik
            </Typography>
            <Typography variant="body2" sx={{ color: "text.primary", whiteSpace: "pre-wrap" }}>
              {document.generalNote}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          startIcon={<PrintRoundedIcon />}
          onClick={handlePrint}
          sx={{ borderRadius: "8px", textTransform: "none" }}
        >
          Çap et (Print)
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ borderRadius: "8px", textTransform: "none", bgcolor: "#0c8a7b", "&:hover": { bgcolor: "#096e62" } }}
        >
          Ýap
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentPreviewModal;
