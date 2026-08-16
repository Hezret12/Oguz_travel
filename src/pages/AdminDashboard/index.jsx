import { Box } from "@mui/material";

import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const AdminDashboard = () => {
  const { t } = useTranslation();
  useDocumentTitle(`${t("sidebar.adminDashboard")} | Oguz Travel`);

  return (
    <Box sx={{ py: 2 }}>
      {/* Welcome Header */}
    </Box>
  );
};

export default AdminDashboard;
