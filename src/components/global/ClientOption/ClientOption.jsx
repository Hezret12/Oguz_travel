import { Box, Typography } from "@mui/material";
import OverflowTooltipTypography from "../../OverflowTooltipTypography";

const ClientOption = ({ client, dense = false, isHeader = false }) => {
  const columnStyles = {
    name: { flex: "1 1 35%", minWidth: 0 },
    id: { flex: "1 1 15%" },
    passport: { flex: "1 1 25%" },
    phone: { flex: "1 1 25%" },
  };

  const textStyles = {
    fontSize: dense ? "0.8rem" : "0.85rem",
    color: isHeader ? "text.secondary" : "text.primary",
    fontWeight: isHeader ? 700 : 500,
    textTransform: isHeader ? "uppercase" : "none",
    letterSpacing: isHeader ? "0.5px" : "normal",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        py: dense ? 0.2 : 0.5,
        gap: 2,
      }}
    >
      {/* Sütun 1: İsim */}
      <Box sx={columnStyles.name}>
        {isHeader ? (
          <Typography sx={{ ...textStyles, fontWeight: 700 }}>
            Client Name
          </Typography>
        ) : (
          <OverflowTooltipTypography
            text={client?.fullName || ""}
            sx={{ ...textStyles, fontWeight: 600 }}
          >
            {client?.fullName}
          </OverflowTooltipTypography>
        )}
      </Box>

      {/* Sütun 2: ID */}
      <Box sx={columnStyles.id}>
        <Typography
          sx={{
            ...textStyles,
            color: isHeader ? "text.secondary" : "primary.main",
          }}
        >
          {isHeader ? "ID" : client.clientId}
        </Typography>
      </Box>

      {/* Sütun 3: Pasaport */}
      <Box sx={columnStyles.passport}>
        <Typography sx={textStyles}>
          {isHeader ? "Passport" : client.passportNumber || "-"}
        </Typography>
      </Box>

      {/* Sütun 4: Telefon */}
      <Box sx={columnStyles.phone}>
        <Typography sx={textStyles}>
          {isHeader ? "Phone" : `+993 ${client.phoneNumber}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default ClientOption;
