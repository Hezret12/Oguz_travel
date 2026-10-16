import { useRef, useState, useEffect, useLayoutEffect, useCallback, memo } from "react";
import { Tooltip, Typography } from "@mui/material";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * OverflowTooltipTypography
 * Automatically measures if text is truncated (overflowing with ellipsis)
 * and displays a Tooltip ONLY when the text is actually clipped.
 */
const OverflowTooltipTypography = ({
  text,
  children,
  placement = "top",
  enterDelay = 200,
  tooltipSx = {},
  sx = {},
  ...typographyProps
}) => {
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = textRef.current;
    if (el) {
      // Compare scrollWidth with clientWidth to detect truncation
      const hasOverflow = el.scrollWidth > el.clientWidth + 1;
      setIsOverflowing(hasOverflow);
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    checkOverflow();
  }, [checkOverflow, text]);

  useEffect(() => {
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [checkOverflow]);

  const rawTitle =
    typeof text === "string"
      ? text
      : typeof children === "string"
      ? children
      : "";

  return (
    <Tooltip
      title={isOverflowing && rawTitle ? rawTitle : ""}
      disableHoverListener={!isOverflowing || !rawTitle}
      arrow
      placement={placement}
      enterDelay={enterDelay}
      slotProps={{
        tooltip: {
          sx: {
            fontSize: "0.8125rem",
            maxWidth: 420,
            wordBreak: "break-word",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 4px 16px rgba(0, 0, 0, 0.6)"
                : "0 4px 14px rgba(0, 0, 0, 0.15)",
            ...tooltipSx,
          },
        },
      }}
    >
      <Typography
        ref={textRef}
        onMouseEnter={checkOverflow}
        noWrap
        sx={{
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          ...sx,
        }}
        {...typographyProps}
      >
        {children ?? text}
      </Typography>
    </Tooltip>
  );
};

export default memo(OverflowTooltipTypography);
