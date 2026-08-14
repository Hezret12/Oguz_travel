import { memo, useMemo, useCallback, useRef, useState, useEffect } from "react";
import { ButtonBase, Box, Tooltip, useColorScheme } from "@mui/material";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import { useTranslation } from "react-i18next";

const SIZES = {
  header: buildSizes(30),
  login: buildSizes(32),
};

function buildSizes(height) {
  const width = height * 2;
  const trackPad = 3;
  const thumbSize = height - trackPad * 2;
  const thumbTravel = width - thumbSize - trackPad * 2;
  const iconSize = Math.round(thumbSize * 0.58);
  return { height, width, trackPad, thumbSize, thumbTravel, iconSize };
}

const PALETTE = {
  track: {
    light: "linear-gradient(180deg, #fdf6ec 0%, #f3e4c8 100%)",
    dark: "linear-gradient(180deg, #2a2f3d 0%, #14161f 100%)",
  },
  trackBorder: {
    light: "rgba(120,90,30,0.15)",
    dark: "rgba(255,255,255,0.08)",
  },
  trackShadow: {
    light:
      "inset 0 1px 2px rgba(120,90,30,0.12), inset 0 -1px 1px rgba(255,255,255,0.6), 0 1px 2px rgba(120,90,30,0.08)",
    dark: "inset 0 1px 2px rgba(0,0,0,0.6), inset 0 -1px 1px rgba(255,255,255,0.03), 0 1px 2px rgba(0,0,0,0.2)",
  },
  thumb: {
    light: "linear-gradient(160deg, #ffffff 0%, #fff3dc 100%)",
    dark: "linear-gradient(160deg, #4a5578 0%, #2b3348 100%)",
  },
  thumbShadow: {
    light:
      "0 2px 4px rgba(180,130,20,0.25), 0 4px 8px rgba(180,130,20,0.12), inset 0 1px 1px rgba(255,255,255,0.9)",
    dark: "0 2px 4px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.12)",
  },
  sunActive: "#c8880f",
  sunDim: "rgba(120,90,30,0.25)",
  moonActive: "#a5b4d8",
  moonDim: "rgba(255,255,255,0.18)",
  sunThumbIcon: "#d97b06",
  moonThumbIcon: "#e2e8f5",
};

const TOGGLE_COOLDOWN = 220;

const ThemeToggle = memo(({ variant = "header" }) => {
  const { t } = useTranslation();
  const { mode, setMode } = useColorScheme();
  const isDark = mode === "dark";

  const [isAnimating, setIsAnimating] = useState(false);
  const cooldownRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const toggleTheme = useCallback(() => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setIsAnimating(true);

    // MUI'nin setMode'u functional updater desteklemiyor - direkt string bekliyor.
    // isDark'i closure'dan direkt okuyup hedef degeri elle yaziyoruz.
    setMode(isDark ? "light" : "dark");

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      cooldownRef.current = false;
      setIsAnimating(false);
    }, TOGGLE_COOLDOWN);
  }, [setMode, isDark]);

  const { height, width, trackPad, thumbSize, thumbTravel, iconSize } =
    SIZES[variant] ?? SIZES.header;

  const trackSx = useMemo(
    () => ({
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      width,
      height,
      borderRadius: `${height / 2}px`,
      flexShrink: 0,
      background: isDark ? PALETTE.track.dark : PALETTE.track.light,
      border: "1px solid",
      borderColor: isDark
        ? PALETTE.trackBorder.dark
        : PALETTE.trackBorder.light,
      boxShadow: isDark ? PALETTE.trackShadow.dark : PALETTE.trackShadow.light,
      transition: "background 0.45s ease, border-color 0.45s ease",
      cursor: "pointer",
    }),
    [isDark, width, height],
  );

  const bgIconsSx = useMemo(
    () => ({
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      px: `${trackPad + 4}px`,
      pointerEvents: "none",
    }),
    [trackPad],
  );

  const sunBgSx = useMemo(
    () => ({
      fontSize: iconSize - 1,
      color: isDark ? PALETTE.moonDim : PALETTE.sunActive,
      transition: "color 0.35s ease",
    }),
    [isDark, iconSize],
  );

  const moonBgSx = useMemo(
    () => ({
      fontSize: iconSize - 1,
      color: isDark ? PALETTE.moonActive : PALETTE.sunDim,
      transition: "color 0.35s ease",
    }),
    [isDark, iconSize],
  );

  const thumbSx = useMemo(
    () => ({
      position: "absolute",
      top: "50%",
      left: trackPad,
      width: thumbSize,
      height: thumbSize,
      borderRadius: "50%",
      // Thumb kendisi flex container - icindeki ikon wrapper'i tam ortalar
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: isDark ? PALETTE.thumb.dark : PALETTE.thumb.light,
      boxShadow: isDark ? PALETTE.thumbShadow.dark : PALETTE.thumbShadow.light,
      transform: `translate3d(${isDark ? thumbTravel : 0}px, -50%, 0)`,
      transition:
        "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.45s ease",
      willChange: isAnimating ? "transform" : "auto",
    }),
    [isDark, trackPad, thumbSize, thumbTravel, isAnimating],
  );

  // Iki ikonu üst üste bindirmek icin ayri bir "inset" wrapper -
  // bu wrapper thumb'in flex-center'inda oturuyor, ikonlar da bunun icinde
  // position:absolute + inset:0 ile tam ust uste biniyor
  const iconStackSx = useMemo(
    () => ({
      position: "relative",
      width: iconSize,
      height: iconSize,
    }),
    [iconSize],
  );

  const sunThumbSx = useMemo(
    () => ({
      position: "absolute",
      inset: 0,
      fontSize: iconSize,
      color: PALETTE.sunThumbIcon,
      opacity: isDark ? 0 : 1,
      transform: isDark ? "rotate(90deg) scale(0.5)" : "rotate(0deg) scale(1)",
      transition:
        "opacity 0.25s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    }),
    [isDark, iconSize],
  );

  const moonThumbSx = useMemo(
    () => ({
      position: "absolute",
      inset: 0,
      fontSize: iconSize,
      color: PALETTE.moonThumbIcon,
      opacity: isDark ? 1 : 0,
      transform: isDark ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)",
      transition:
        "opacity 0.25s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    }),
    [isDark, iconSize],
  );

  const tooltipTitle = isDark
    ? t("header.themeTooltipLight")
    : t("header.themeTooltipDark");

  return (
    <Tooltip title={tooltipTitle} enterDelay={300} leaveDelay={0}>
      <ButtonBase
        onClick={toggleTheme}
        disableRipple
        aria-label={tooltipTitle}
        sx={trackSx}
      >
        <Box sx={bgIconsSx}>
          <LightModeRoundedIcon sx={sunBgSx} />
          <DarkModeRoundedIcon sx={moonBgSx} />
        </Box>

        <Box sx={thumbSx}>
          <Box sx={iconStackSx}>
            <LightModeRoundedIcon sx={sunThumbSx} />
            <DarkModeRoundedIcon sx={moonThumbSx} />
          </Box>
        </Box>
      </ButtonBase>
    </Tooltip>
  );
});

ThemeToggle.displayName = "ThemeToggle";

export default ThemeToggle;
