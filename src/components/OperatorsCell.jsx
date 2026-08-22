import { memo } from "react";
import { Box } from "@mui/material";
import { useLocale } from "../hooks/useLocale";

/**
 * Reusable Operators Cell for Table rows.
 * Renders assignment (Tabşyryjy) and receiver (Kabul ediji) operators
 * cleanly in a single unified column without visual clutter.
 */
const OperatorsCell = ({
  assignmentOperator,
  receiverOperator,
  op1: op1Prop,
  op2: op2Prop,
  op1Office: op1OfficeProp,
  op2Office: op2OfficeProp,
}) => {
  const { selectedLang } = useLocale();

  const op1 =
    op1Prop ||
    assignmentOperator?.fullName ||
    (typeof assignmentOperator === "string" ? assignmentOperator : "");

  const op2 =
    op2Prop ||
    receiverOperator?.fullName ||
    (typeof receiverOperator === "string" ? receiverOperator : "");

  const op1Office =
    op1OfficeProp ||
    (assignmentOperator?.office
      ? selectedLang(
          assignmentOperator.office.shortName ||
            assignmentOperator.office.fullName,
        )
      : "");

  const op2Office =
    op2OfficeProp ||
    (receiverOperator?.office
      ? selectedLang(
          receiverOperator.office.shortName || receiverOperator.office.fullName,
        )
      : "");

  if (!op1 && !op2) {
    return (
      <Box
        component="span"
        sx={{ color: "text.disabled", fontSize: "0.85rem" }}
      >
        —
      </Box>
    );
  }

  if (op1 && op2 && op1 === op2) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
        <Box
          sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.primary" }}
        >
          {op1}
        </Box>
        {op1Office && (
          <Box sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
            {op1Office}
          </Box>
        )}
      </Box>
    );
  }

  if (op1 && op2) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.35,
          lineHeight: 1.2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <Box
            component="span"
            sx={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "primary.main",
              width: "14px",
              flexShrink: 0,
            }}
          >
            T:
          </Box>
          <Box
            sx={{
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {op1} {op1Office ? `(${op1Office})` : ""}
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <Box
            component="span"
            sx={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "text.secondary",
              width: "14px",
              flexShrink: 0,
            }}
          >
            K:
          </Box>
          <Box
            sx={{
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {op2} {op2Office ? `(${op2Office})` : ""}
          </Box>
        </Box>
      </Box>
    );
  }

  const singleName = op1 || op2;
  const singleRole = op1 ? "T" : "K";
  const singleOffice = op1 ? op1Office : op2Office;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.6,
        lineHeight: 1.25,
      }}
    >
      <Box
        component="span"
        sx={{
          fontSize: "0.68rem",
          fontWeight: 700,
          color: op1 ? "primary.main" : "text.secondary",
          width: "14px",
          flexShrink: 0,
        }}
      >
        {singleRole}:
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={{ fontSize: "0.82rem", fontWeight: 500, color: "text.primary" }}
        >
          {singleName}
        </Box>
        {singleOffice && (
          <Box sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
            {singleOffice}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default memo(OperatorsCell);
