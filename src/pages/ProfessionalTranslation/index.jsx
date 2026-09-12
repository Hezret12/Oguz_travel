import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

const ProfessionalTranslationLayout = () => {
  return (
    <Box sx={{ width: "100%" }}>
      <Outlet />
    </Box>
  );
};

export default ProfessionalTranslationLayout;
