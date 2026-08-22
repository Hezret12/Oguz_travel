import { memo } from "react";
import { Box } from "@mui/material";

/**
 * Reusable Client Cell for Table rows.
 * Renders client full name and phone number / passport number
 * with clean hierarchy and tabular-nums.
 */
const ClientCell = ({ client, name: nameProp, secondary: secondaryProp }) => {
  const name =
    nameProp ||
    client?.fullName ||
    (typeof client === "string" ? client : "");

  const secondary =
    secondaryProp ||
    client?.phone_number ||
    client?.phoneNumber ||
    client?.passport_number ||
    "";

  if (!name) {
    return (
      <Box
        component="span"
        sx={{ color: "text.disabled", fontSize: "0.85rem" }}
      >
        —
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.25,
        lineHeight: 1.25,
      }}
    >
      <Box
        sx={{ fontSize: "0.84rem", fontWeight: 600, color: "text.primary" }}
      >
        {name}
      </Box>
      {secondary && (
        <Box
          sx={{
            fontSize: "0.74rem",
            color: "text.secondary",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {secondary}
        </Box>
      )}
    </Box>
  );
};

export default memo(ClientCell);
