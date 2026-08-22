import { useState } from "react";
import { Button, Tooltip } from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useLocale } from "../hooks/useLocale";
import GlobalExcelExportModal from "./Dialog/GlobalExcelExportModal";


const ExportExcelButton = ({
  apiFn,
  queryParams = {},
  columns = [],
  fileName = "Export",
  sheetName = "Hasabat",
  titleBanner = null,
  rightHeader = null,
  customFilterFields = null,
  variant = "outlined",
  size = "medium",
  disabled = false,
  tooltip = null,
  sx = {},
  ...props
}) => {
  const { t } = useLocale();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (e) => {
    e?.currentTarget?.blur();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const buttonContent = (
    <Button
      variant={variant}
      size={size}
      onClick={handleOpenModal}
      disabled={disabled}
      startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: "19px !important" }} />}
      sx={{
        borderRadius: "10px",
        textTransform: "none",
        fontWeight: 650,
        fontSize: "0.85rem",
        height: "38px",
        px: 2,
        borderColor: "divider",
        color: (theme) => (theme.palette.mode === "dark" ? "#2DD4BF" : "#0E8584"),
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(20, 184, 166, 0.08)"
            : "rgba(14, 133, 132, 0.05)",
        "&:hover": {
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(20, 184, 166, 0.16)"
              : "rgba(14, 133, 132, 0.12)",
          borderColor: (theme) =>
            theme.palette.mode === "dark" ? "#2DD4BF" : "#0E8584",
        },
        transition: "all 0.2s ease",
        ...sx,
      }}
      {...props}
    >
      {t("common.exportExcel", "Excel")}
    </Button>
  );

  return (
    <>
      {tooltip ? <Tooltip title={tooltip}>{buttonContent}</Tooltip> : buttonContent}

      {isModalOpen && (
        <GlobalExcelExportModal
          open={isModalOpen}
          close={handleCloseModal}
          apiFn={apiFn}
          baseQueryParams={queryParams}
          columns={columns}
          fileName={fileName}
          sheetName={sheetName}
          titleBanner={titleBanner}
          rightHeader={rightHeader}
          customFilterFields={customFilterFields}
        />
      )}
    </>
  );
};

export default ExportExcelButton;
