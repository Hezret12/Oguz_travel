import { Box } from "@mui/material";

import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const AdminDashboard = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ py: 2 }}>
      <Helmet>
        <title>
          {t("pages.admin.title") || "Admin Dashboard"} | Oguz Travel
        </title>
      </Helmet>
      {/* Welcome Header */}
    </Box>
  );
};

export default AdminDashboard;
