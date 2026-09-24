import { Box, Typography, IconButton, Button, Avatar, Stack, alpha } from '@mui/material';
import { Bell, X, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // Harmonic bell tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.12, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.38);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.08); // A5
    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.14, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.55);
  } catch {
    // AudioContext blocked by browser policy
  }
};

export const showNotificationToast = ({
  title,
  description,
  sender,
  time,
  onView,
  onMarkRead,
}) => {
  playNotificationChime();

  toast.custom(
    (t) => (
      <Box
        sx={{
          pointerEvents: 'auto',
          width: { xs: 'calc(100vw - 32px)', sm: 380 },
          maxWidth: 420,
          p: 2,
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 12px 28px -8px rgba(0, 0, 0, 0.6)'
              : '0 12px 28px -8px rgba(15, 23, 42, 0.12)',
          position: 'relative',
          overflow: 'hidden',
          animation: t.visible
            ? 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            : 'toastSlideOut 0.22s ease-in forwards',
          '@keyframes toastSlideIn': {
            '0%': { transform: 'translateX(110%) scale(0.95)', opacity: 0 },
            '100%': { transform: 'translateX(0) scale(1)', opacity: 1 },
          },
          '@keyframes toastSlideOut': {
            '0%': { transform: 'translateX(0) scale(1)', opacity: 1 },
            '100%': { transform: 'translateX(110%) scale(0.95)', opacity: 0 },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {/* Avatar / Bell Icon with Pulse Indicator */}
          <Box sx={{ position: 'relative', flexShrink: 0, mt: 0.25 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                bgcolor: 'action.hover',
                color: 'text.secondary',
              }}
            >
              <Bell size={20} />
            </Avatar>
            {/* Pulsing unread badge */}
            <Box
              sx={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: '#3B82F6',
                border: '2px solid',
                borderColor: 'background.paper',
                animation: 'pulseGlow 2s infinite',
                '@keyframes pulseGlow': {
                  '0%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)' },
                  '70%': { boxShadow: '0 0 0 6px rgba(59, 130, 246, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' },
                },
              }}
            />
          </Box>

          {/* Content Area */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {/* Header: Title + Close Button */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: 'text.primary',
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {title}
              </Typography>

              <IconButton
                size="small"
                onClick={() => toast.dismiss(t.id)}
                sx={{
                  p: 0.25,
                  mt: -0.5,
                  mr: -0.5,
                  color: 'text.secondary',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.text.primary, 0.08),
                    color: 'text.primary',
                  },
                }}
              >
                <X size={16} />
              </IconButton>
            </Box>

            {/* Description Text */}
            {description && (
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.815rem',
                  color: 'text.secondary',
                  lineHeight: 1.45,
                  mt: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {description}
              </Typography>
            )}

            {/* Meta & Quick Action Footer */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 1.5,
                pt: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.725rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                  maxWidth: '130px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {sender || time || 'Oguz Travel'}
              </Typography>

              <Stack direction="row" spacing={0.75}>
                {onMarkRead && (
                  <Button
                    size="small"
                    startIcon={<Check size={13} />}
                    onClick={() => {
                      toast.dismiss(t.id);
                      onMarkRead?.();
                    }}
                    sx={{
                      fontSize: '0.725rem',
                      fontWeight: 600,
                      py: 0.4,
                      px: 1,
                      borderRadius: '8px',
                      textTransform: 'none',
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        color: 'text.primary',
                      },
                    }}
                  >
                    Okaldy
                  </Button>
                )}

                <Button
                  size="small"
                  variant="contained"
                  endIcon={<ArrowRight size={13} />}
                  onClick={() => {
                    toast.dismiss(t.id);
                    onView?.();
                  }}
                  sx={{
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    py: 0.4,
                    px: 1.25,
                    borderRadius: '8px',
                    textTransform: 'none',
                    bgcolor: '#2563EB',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#1D4ED8',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Gör
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    ),
    {
      position: 'bottom-right',
      duration: 6500,
    }
  );
};
