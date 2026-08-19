import { useRef, useState, useEffect, useCallback } from "react";
import { Box, Typography, Tooltip } from "@mui/material";

/**
 * A label component that only shows a Tooltip when the text overflows (truncated).
 * Drop-in replacement for the Tooltip + Typography label pattern used in form inputs.
 */
const OverflowTooltipLabel = ({
  label,
  required = false,
  fontSize = "0.875rem",
  sx = {},
}) => {
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = textRef.current;
    if (el) {
      setIsOverflowing(el.scrollWidth > el.clientWidth + 1);
    }
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [checkOverflow, label]);

  return (
    <Tooltip
      title={isOverflowing ? label : ""}
      arrow
      placement="top-start"
      disableHoverListener={!isOverflowing}
    >
      <Typography
        ref={textRef}
        variant="body2"
        component="div"
        noWrap
        sx={{
          height: "20px",
          lineHeight: "20px",
          display: "flex",
          alignItems: "center",
          mb: 0.75,
          fontWeight: 600,
          fontSize,
          color: "text.primary",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          cursor: "default",
          ...sx,
        }}
      >
        <span>{label}</span>
        {required && (
          <Box
            component="span"
            sx={{
              color: "#ef4444",
              ml: "4px",
              fontSize: "15px",
              lineHeight: 1,
              display: "inline-flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            *
          </Box>
        )}
      </Typography>
    </Tooltip>
  );
};

export default OverflowTooltipLabel;
