import { Box, Typography } from "@mui/material";

export const CustomDialogHeader = ({
  variant,
  title,
  color,
}) => {
  return (
    <Box sx={{ width: "100%"}}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: color ? color : undefined,
          pr: 4,
          pb: 2.5
        }}
      >
        <Typography variant={variant}>{title}</Typography>
      </Box>
    </Box>
  );
};
