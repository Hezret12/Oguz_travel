import { Box } from "@mui/material";

const StackedCell = ({ primary, secondary }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.2, lineHeight: 1.25 }}>
    <Box component="span" sx={{ fontSize: "0.84rem", fontWeight: 500, color: "text.primary" }}>
      {primary || "—"}
    </Box>
    {secondary ? (
      <Box component="span" sx={{ fontSize: "0.74rem", color: "text.secondary" }}>
        {secondary}
      </Box>
    ) : null}
  </Box>
);

export default StackedCell;