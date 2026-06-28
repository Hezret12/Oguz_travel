import { Button, CircularProgress } from '@mui/material';


const CustomButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  sx = {},
  ...props
}) => {

  const getShadowColor = (themeColor) => {
    switch (themeColor) {
      case 'primary': return 'rgba(37, 99, 235, 0.2)';
      case 'secondary': return 'rgba(100, 116, 139, 0.2)';
      case 'success': return 'rgba(16, 185, 129, 0.2)';
      case 'error': return 'rgba(239, 68, 68, 0.2)';
      case 'warning': return 'rgba(245, 158, 11, 0.2)';
      case 'info': return 'rgba(6, 182, 212, 0.2)';
      default: return 'rgba(0, 0, 0, 0.08)';
    }
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      variant={variant}
      color={color}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      startIcon={
        loading ? (
          <CircularProgress size={18} color="inherit" />
        ) : (
          startIcon
        )
      }
      endIcon={!loading ? endIcon : undefined}
      sx={{
        borderRadius: '10px',
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '0.3px',
        padding: size === 'large' ? '12px 28px' : size === 'small' ? '6px 16px' : '9px 22px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: variant === 'contained' ? `0px 4px 14px ${getShadowColor(color)}` : 'none',
        
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: variant === 'contained' ? `0px 6px 20px ${getShadowColor(color)}` : 'none',
          backgroundColor: (theme) => {
            if (variant === 'contained') return undefined;
            return theme.palette[color]?.lighter || 'rgba(37, 99, 235, 0.04)';
          }
        },
        
        '&:active': {
          transform: 'translateY(1px)',
        },
        
        '&.Mui-disabled': {
          transform: 'none',
          boxShadow: 'none',
          backgroundColor: variant === 'contained' ? 'rgba(0, 0, 0, 0.12)' : 'transparent',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
