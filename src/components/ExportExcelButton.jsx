import { useState } from "react";
import { Button, Tooltip } from "@mui/material";
import { useLocale } from "../hooks/useLocale";
import GlobalExcelExportModal from "./Dialog/GlobalExcelExportModal";

export const ExcelIcon = ({ size = 18, style = {}, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0, ...style }}
    {...props}
  >
    <rect x="2.5" y="2.5" width="19" height="19" rx="3.5" fill="#107C41" />
    <path
      d="M7.8 17L10.4 12L8.1 7.5H10.3L11.7 10.4C11.8 10.6 11.9 10.9 12 11.2H12.05C12.15 10.9 12.25 10.6 12.35 10.4L13.7 7.5H15.8L13.5 12L16.1 17H13.9L12.4 13.6C12.3 13.4 12.2 13.1 12.15 12.85H12.1C12.05 13.1 11.95 13.4 11.85 13.6L10.3 17H7.8Z"
      fill="#FFFFFF"
    />
  </svg>
);

const ExportExcelButton = ({
  apiFn,
  queryParams = {},
  columns = [],
  fileName = "Export",
  sheetName = "Hasabat",
  titleBanner = null,
  rightHeader = null,
  defaultValues = {},
  customFilterFields = null,
  transformPayload = null,
  variant = "outlined",
  size = "medium",
  disabled = false,
  tooltip = null,
  label = null,
  children,
  onClick,
  sx = {},
  ...props
}) => {
  const { t } = useLocale();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleButtonClick = (e) => {
    e?.currentTarget?.blur();
    if (onClick) {
      onClick(e);
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const isSmall = size === "small";

  const buttonContent = (
    <Button
      variant={variant}
      size={size}
      onClick={handleButtonClick}
      disabled={disabled}
      startIcon={<ExcelIcon size={isSmall ? 15 : 18} />}
      sx={{
        height: isSmall ? "32px" : "40px",
        px: isSmall ? 1.5 : 2,
        borderRadius: isSmall ? "8px" : "10px",
        textTransform: "none",
        fontWeight: 600,
        fontSize: isSmall ? "12.5px" : "14px",
        letterSpacing: "0.1px",
        borderColor: "divider",
        color: "text.primary",
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.04)"
            : "rgba(0, 0, 0, 0.02)",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 2px 8px rgba(0, 0, 0, 0.32)"
            : "0 2px 8px rgba(16, 124, 65, 0.12)",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(16, 185, 129, 0.1)"
              : "rgba(16, 185, 129, 0.06)",
          borderColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(16, 185, 129, 0.45)"
              : "rgba(16, 185, 129, 0.4)",
          color: (theme) =>
            theme.palette.mode === "dark" ? "#34d399" : "#059669",
          transform: "translateY(-1px)",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 4px 14px rgba(16, 185, 129, 0.28)"
              : "0 4px 14px rgba(16, 124, 65, 0.22)",
        },
        "&:active": {
          transform: "scale(0.98)",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 1px 4px rgba(0, 0, 0, 0.24)"
              : "0 1px 4px rgba(16, 124, 65, 0.14)",
        },
        ...sx,
      }}
      {...props}
    >
      {children || label || t("common.exportExcel", "Excel")}
    </Button>
  );

  return (
    <>
      {tooltip ? <Tooltip title={tooltip}>{buttonContent}</Tooltip> : buttonContent}

      {isModalOpen && !onClick && (
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
          defaultValues={defaultValues}
          customFilterFields={customFilterFields}
          transformPayload={transformPayload}
        />
      )}
    </>
  );
};

export default ExportExcelButton;
