import { memo, useCallback } from "react";
import { flushSync } from "react-dom";
import { IconButton, Box, Tooltip, useColorScheme } from "@mui/material";
import { Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";

const ThemeToggle = memo(({ variant = "header" }) => {
  const { t } = useTranslation();
  const { mode, setMode } = useColorScheme();
  const isDark = mode === "dark";
  const isLogin = variant === "login";

  const toggleTheme = useCallback(
    (event) => {
      const nextMode = isDark ? "light" : "dark";

      const isAppearanceTransition =
        typeof document.startViewTransition === "function" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!isAppearanceTransition) {
        setMode(nextMode);
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX || rect.left + rect.width / 2;
      const y = event.clientY || rect.top + rect.height / 2;

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setMode(nextMode);
        });
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 480,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    },
    [setMode, isDark]
  );

  const tooltipTitle = isDark
    ? t("header.themeTooltipLight")
    : t("header.themeTooltipDark");

  return (
    <Tooltip title={tooltipTitle} enterDelay={300} leaveDelay={0}>
      <IconButton
        onClick={toggleTheme}
        aria-label={tooltipTitle}
        sx={(theme) => ({
          width: isLogin ? 36 : 38,
          height: isLogin ? 36 : 38,
          borderRadius: "10px",
          border: "1px solid",
          borderColor: isLogin
            ? "rgba(255, 255, 255, 0.18)"
            : "divider",
          backgroundColor: isLogin
            ? "rgba(255, 255, 255, 0.10)"
            : theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.04)"
              : "rgba(0, 0, 0, 0.02)",
          backdropFilter: isLogin ? "blur(8px)" : undefined,
          color: "text.primary",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          "&:hover": {
            borderColor: isLogin ? "rgba(255, 255, 255, 0.35)" : "primary.main",
            backgroundColor: isLogin
              ? "rgba(255, 255, 255, 0.18)"
              : theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.05)",
            "& .theme-icon-wrapper": {
              transform: isDark ? "rotate(-14deg) scale(1.06)" : "rotate(16deg) scale(1.06)",
            },
          },
          "&:active": {
            transform: "scale(0.92)",
          },
        })}
      >
        <Box
          className="theme-icon-wrapper"
          sx={{
            position: "relative",
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Sun icon (Light mode) */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f59e0b",
              opacity: isDark ? 0 : 1,
              transform: isDark
                ? "rotate(90deg) scale(0)"
                : "rotate(0deg) scale(1)",
              transition:
                "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
              pointerEvents: "none",
            }}
          >
            <Sun size={20} strokeWidth={2.2} />
          </Box>

          {/* Moon icon (Dark mode) */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isLogin ? "#a5b4fc" : "#818cf8",
              opacity: isDark ? 1 : 0,
              transform: isDark
                ? "rotate(0deg) scale(1)"
                : "rotate(-90deg) scale(0)",
              transition:
                "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
              pointerEvents: "none",
            }}
          >
            <Moon size={19} strokeWidth={2.2} />
          </Box>
        </Box>
      </IconButton>
    </Tooltip>
  );
});

ThemeToggle.displayName = "ThemeToggle";

export default ThemeToggle;
