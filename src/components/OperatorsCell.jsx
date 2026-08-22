import { memo } from "react";
import { Box } from "@mui/material";
import { useLocale } from "../hooks/useLocale";

/**
 * Reusable Operators Cell for Table rows.
 * Renders assignment (Tabşyryjy) and receiver (Kabul ediji) operators
 * with clean, mature, pure typography — no chips or badges.
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

  // Same operator for both roles
  if (op1 && op2 && op1 === op2) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
        <Box sx={{ fontSize: "0.90rem", fontWeight: 500, color: "text.primary" }}>
          {op1}
          {op1Office && (
            <Box
              component="span"
              sx={{ color: "text.primary", opacity: 0.85, fontSize: "0.82rem", fontWeight: 400 }}
            >
              , {op1Office}
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // Both operators exist and are different
  if (op1 && op2) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
          lineHeight: 1.25,
        }}
      >
        {/* Assignment Operator (Tabşyryjy) */}
        <Box
          sx={{
            fontSize: "0.84rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: "0.76rem",
              fontWeight: 700,
              color: "text.primary",
              mr: 0.6,
            }}
          >
            T:
          </Box>
          <Box
            component="span"
            sx={{ fontWeight: 500, color: "text.primary" }}
          >
            {op1}
          </Box>
          {op1Office && (
            <Box
              component="span"
              sx={{ color: "text.primary", opacity: 0.85, fontSize: "0.78rem", fontWeight: 400 }}
            >
              , {op1Office}
            </Box>
          )}
        </Box>

        {/* Receiver Operator (Kabul ediji) */}
        <Box
          sx={{
            fontSize: "0.84rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: "0.76rem",
              fontWeight: 700,
              color: "text.primary",
              mr: 0.6,
            }}
          >
            K:
          </Box>
          <Box
            component="span"
            sx={{ fontWeight: 500, color: "text.primary" }}
          >
            {op2}
          </Box>
          {op2Office && (
            <Box
              component="span"
              sx={{ color: "text.primary", opacity: 0.85, fontSize: "0.78rem", fontWeight: 400 }}
            >
              , {op2Office}
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // Single operator
  const singleName = op1 || op2;
  const singleOffice = op1 ? op1Office : op2Office;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
      <Box
        sx={{
          fontSize: "0.90rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        <Box
          component="span"
          sx={{ fontWeight: 500, color: "text.primary" }}
        >
          {singleName}
        </Box>
        {singleOffice && (
          <Box
            component="span"
            sx={{ color: "text.primary", opacity: 0.85, fontSize: "0.82rem", fontWeight: 400 }}
          >
            , {singleOffice}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default memo(OperatorsCell);


