import { memo } from "react";
import { Tabs, Tab, Box, Chip, useTheme, alpha } from "@mui/material";

/**
 * CustomTabs - Global reusable Tabs component
 *
 * @param {Object} props
 * @param {string|number} props.value - Active tab value
 * @param {Function} props.onChange - Tab change event handler (event, newValue)
 * @param {Array<{value: string|number, label: React.ReactNode, icon?: React.ReactNode, badge?: string|number, disabled?: boolean}>} [props.tabs] - Array of tab items
 * @param {'line' | 'pills'} [props.variant='line'] - Visual style of tabs: 'line' (bottom indicator) or 'pills' (rounded button style)
 * @param {'small' | 'medium'} [props.size='medium'] - Size of the tabs
 * @param {boolean} [props.fullWidth=false] - Whether tabs should take full width
 * @param {Object} [props.sx] - Custom styles for Tabs wrapper
 * @param {Object} [props.tabSx] - Custom styles for individual Tab items
 * @param {React.ReactNode} [props.children] - Custom Tab children if not using tabs array
 */
const CustomTabs = ({
  value,
  onChange,
  tabs = [],
  variant = "line",
  size = "medium",
  fullWidth = false,
  color,
  sx = {},
  tabSx = {},
  children,
  ...rest
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const primaryColor =
    color === "blue"
      ? isDark
        ? "#3B82F6"
        : "#2563EB"
      : color || theme.palette.primary.main;

  // Sizes configuration
  const minHeight = size === "small" ? 34 : 38;
  const fontSize = size === "small" ? "0.775rem" : "0.825rem";

  const isPills = variant === "pills";

  const defaultTabsSx = isPills
    ? {
        minHeight,
        p: 0.5,
        borderRadius: "12px",
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F1F5F9",
        border: "1px solid",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
        "& .MuiTabs-flexContainer": { gap: 0.5 },
        "& .MuiTabs-indicator": { display: "none" },
        ...sx,
      }
    : {
        minHeight,
        "& .MuiTabs-indicator": {
          height: 3,
          borderRadius: "3px",
          backgroundColor: primaryColor,
        },
        ...sx,
      };

  const defaultTabSx = isPills
    ? {
        minHeight,
        height: minHeight,
        borderRadius: "8px",
        textTransform: "none",
        fontWeight: 600,
        fontSize,
        color: isDark ? "#94A3B8" : "#64748B",
        transition: "all 0.2s ease",
        px: 2,
        "&.Mui-selected": {
          color: "#FFFFFF",
          backgroundColor: primaryColor,
          boxShadow: isDark
            ? "none"
            : `0 4px 12px ${alpha(primaryColor, 0.35)}`,
          fontWeight: 700,
        },
        "&:hover:not(.Mui-selected)": {
          color: isDark ? "#F8FAFC" : "#0F172A",
          backgroundColor: isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.04)",
        },
        ...tabSx,
      }
    : {
        minHeight,
        textTransform: "none",
        fontWeight: 700,
        fontSize,
        color: isDark ? "#94A3B8" : "#64748B",
        px: 2,
        "&.Mui-selected": {
          color: primaryColor,
        },
        "&:hover:not(.Mui-selected)": {
          color: isDark ? "#F8FAFC" : "#0F172A",
        },
        ...tabSx,
      };

  return (
    <Tabs
      value={value}
      onChange={onChange}
      variant={fullWidth ? "fullWidth" : "standard"}
      sx={defaultTabsSx}
      {...rest}
    >
      {children
        ? children
        : tabs.map((tab) => {
            const { value: tabVal, label, icon, badge, disabled } = tab;

            const tabLabel = badge !== undefined && badge !== null ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span>{label}</span>
                <Chip
                  label={badge}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    borderRadius: "6px",
                    backgroundColor:
                      value === tabVal
                        ? isPills
                          ? "rgba(255,255,255,0.25)"
                          : alpha(primaryColor, 0.15)
                        : isDark
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(0,0,0,0.06)",
                    color:
                      value === tabVal
                        ? isPills
                          ? "#FFFFFF"
                          : primaryColor
                        : "text.secondary",
                  }}
                />
              </Box>
            ) : (
              label
            );

            return (
              <Tab
                key={tabVal}
                value={tabVal}
                label={tabLabel}
                icon={icon}
                iconPosition="start"
                disabled={disabled}
                sx={defaultTabSx}
              />
            );
          })}
    </Tabs>
  );
};

export default memo(CustomTabs);
