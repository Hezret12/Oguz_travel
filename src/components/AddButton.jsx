import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const SIZES = {
  small: { height: "34px", px: 1.75, fontSize: "13px", iconSize: "16px" },
  medium: { height: "40px", px: 2.5, fontSize: "14px", iconSize: "18px" },
};

/**
 * AddButton - the app's primary "add / create" button (brand teal).
 *
 * @param {Object} props
 * @param {Function} props.onClick - Click handler (focus is blurred before it runs)
 * @param {React.ReactNode} props.children - Button label
 * @param {'small' | 'medium'} [props.size='medium']
 * @param {boolean} [props.disabled=false]
 * @param {React.ReactNode} [props.icon] - Overrides the default "+" icon
 * @param {Object} [props.sx] - Extra styles merged over the defaults
 */
const AddButton = ({
  onClick,
  children,
  size = "medium",
  disabled = false,
  icon,
  sx = {},
  ...rest
}) => {
  const s = SIZES[size] ?? SIZES.medium;

  return (
    <Button
      variant="contained"
      startIcon={icon ?? <AddIcon sx={{ fontSize: `${s.iconSize} !important` }} />}
      onClick={(e) => {
        e.currentTarget.blur();
        onClick?.(e);
      }}
      disabled={disabled}
      disableElevation
      sx={{
        height: s.height,
        px: s.px,
        borderRadius: "10px",
        textTransform: "none",
        fontWeight: 600,
        fontSize: s.fontSize,
        letterSpacing: "0.1px",
        whiteSpace: "nowrap",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)"
            : "#0E8584",
        border: "0.5px solid #2CA7A6",
        color: "#ffffff",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 2px 8px rgba(0, 0, 0, 0.32)"
            : "0 2px 8px rgba(14, 133, 132, 0.30)",

        transition:
          "background-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",

        "&:hover": {
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #0B7F74 0%, #0891B2 100%)"
              : "#0C7776",
          transform: "translateY(-1px)",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 4px 14px rgba(0, 0, 0, 0.38)"
              : "0 4px 14px rgba(14, 133, 132, 0.36)",
        },

        "&:active": {
          transform: "scale(0.98)",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 1px 4px rgba(0, 0, 0, 0.28)"
              : "0 1px 4px rgba(14, 133, 132, 0.24)",
        },

        "&.Mui-disabled": {
          background: "none",
          backgroundColor: "action.disabledBackground",
          borderColor: "transparent",
          color: "action.disabled",
          boxShadow: "none",
        },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default AddButton;
