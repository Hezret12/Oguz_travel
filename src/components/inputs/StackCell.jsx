import { Box } from "@mui/material";

const StackedCell = ({ primary, secondary }) => (
  <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
    <Box component="span" sx={{ fontSize: 14, fontWeight: 500 }}>
      {primary || "-"}
    </Box>
    {secondary ? (
      <Box component="span" sx={{ fontSize: 12, color: "text.secondary" }}>
        {secondary}
      </Box>
    ) : null}
  </Box>
);

export default StackedCell;