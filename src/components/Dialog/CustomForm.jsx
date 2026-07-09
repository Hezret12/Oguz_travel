import { Box } from "@mui/material";

export const CustomForm = ({ handleSubmit, children, ...props }) => {
  return (
    <Box component="form" onSubmit={handleSubmit} {...props}>
      {children}
    </Box>
  );
};
