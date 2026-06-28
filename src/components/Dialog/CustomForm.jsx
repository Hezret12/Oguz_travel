import { Box } from "@mui/material";

export const CustomForm = ({ handleSubmit, children, sx, ...props }) => {
  return (
    <Box component="form" onSubmit={handleSubmit} sx={sx} {...props}>
      {children}
    </Box>
  );
};
