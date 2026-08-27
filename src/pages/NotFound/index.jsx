import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import { useLocale } from "../../hooks/useLocale";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useLocale();

  useDocumentTitle(`${t("notFound.title", "404 - Sahypa Tapylmady")} | Oguz Travel`);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 6 },
          maxWidth: 540,
          width: "100%",
          textAlign: "center",
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 16px 40px rgba(0,0,0,0.4)"
              : "0 16px 40px rgba(0,0,0,0.04)",
        }}
      >
        {/* Subtle Warning Icon Badge */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(245, 158, 11, 0.14)"
                : "rgba(245, 158, 11, 0.08)",
            border: "1px solid",
            borderColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(245, 158, 11, 0.25)"
                : "rgba(245, 158, 11, 0.2)",
            color: "#F59E0B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2.5,
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 34 }} />
        </Box>


        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "20px", sm: "23px" },
            color: "text.primary",
            mb: 1.2,
            letterSpacing: "-0.3px",
          }}
        >
          {t("notFound.title")}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontSize: { xs: "14.5px", sm: "15.5px" },
            lineHeight: 1.6,
            maxWidth: 440,
            mb: 4,
          }}
        >
          {t("notFound.desc")}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackRoundedIcon />}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "14px",
              textTransform: "none",
              borderColor: "divider",
              color: "text.primary",
              "&:hover": {
                borderColor: "text.secondary",
                bgcolor: "action.hover",
              },
            }}
          >
            {t("notFound.goBack", "Yza gaýt")}
          </Button>

          <Button
            variant="contained"
            onClick={() => navigate("/")}
            startIcon={<HomeRoundedIcon />}
            sx={{
              px: 3.5,
              py: 1.2,
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "14px",
              textTransform: "none",
            }}
          >
            {t("notFound.goHome", "Baş Sahypa")}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotFound;
