import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { closeModal, selectModal } from '../store/slices/modalSlice';
import { useTranslation } from 'react-i18next';


const MODAL_TYPE_CONFIRM_COLOR = {
  CONFIRM: 'primary',
  INFO: 'primary',
  FORM: 'primary',
  CUSTOM: 'primary',
  DELETE: 'error',
  WARNING: 'warning',
  SUCCESS: 'success',
};

const ModalFooterButton = ({ btn, index }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!btn.onClick) return;
    const result = btn.onClick();
    if (result instanceof Promise) {
      setLoading(true);
      try {
        await result;
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Button
      key={index}
      variant={btn.variant || 'contained'}
      color={btn.color || 'primary'}
      size={btn.size || 'medium'}
      disabled={btn.disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : btn.startIcon}
      onClick={handleClick}
      sx={{
        borderRadius: '8px',
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '0',
        minWidth: 80,
        px: 3,
        py: 0.75,
        transition: 'all 0.2s ease',
        ...(btn.variant === 'outlined' || btn.color === 'inherit'
          ? {
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }
          : {
              ...(btn.color === 'primary' && {
                backgroundColor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.primary.dark,
                },
              }),
            }),
        '&:active': { transform: 'translateY(1px)' },
        ...btn.sx,
      }}
    >
      {btn.label}
    </Button>
  );
};

const GlobalModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isOpen, modalType, modalProps } = useSelector(selectModal);

  const [activeTab, setActiveTab] = useState(0);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setActiveTab(0);
    }
  }

  if (!isOpen || !modalType) return null;

  const {
    title,
    content,
    children,
    tabs,
    footerButtons,
    confirmLabel,
    cancelLabel,
    okLabel,
    confirmColor,
    onConfirm,
    onCancel,
    onClose: onCloseProp,
    maxWidth = 'sm',
    hideCloseButton = false,
    contentSx = {},
  } = modalProps;

  const resolvedConfirmColor =
    confirmColor || MODAL_TYPE_CONFIRM_COLOR[modalType] || 'primary';

  const handleClose = () => {
    if (onCloseProp) onCloseProp();
    else if (onCancel) onCancel();
    dispatch(closeModal());
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    dispatch(closeModal());
  };

  const resolvedFooterButtons = (() => {
    if (footerButtons && footerButtons.length > 0) return footerButtons;

    if (modalType === 'CONFIRM' || modalType === 'DELETE' || modalType === 'WARNING') {
      return [
        {
          label: cancelLabel || t('common.cancel', 'İptal'),
          variant: 'outlined',
          color: 'inherit',
          onClick: handleClose,
        },
        {
          label: confirmLabel || t('common.confirm', 'Onayla'),
          variant: 'contained',
          color: resolvedConfirmColor,
          onClick: handleConfirm,
        },
      ];
    }

    if (modalType === 'INFO' || modalType === 'SUCCESS') {
      return [
        {
          label: okLabel || t('common.ok', 'Tamam'),
          variant: 'contained',
          color: resolvedConfirmColor,
          onClick: handleClose,
        },
      ];
    }

    return [];
  })();

  const hasTabs = tabs && tabs.length > 0;
  const activeContent = hasTabs ? tabs[activeTab]?.content : children || content;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth
      slots={{ transition: Fade }}
      transitionDuration={200}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)'
                : '0 24px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
            backgroundColor: 'background.paper',
            backgroundImage: 'none',
          },
        },
        backdrop: {
          sx: {
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(2, 6, 23, 0.7)'
                : 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
          },
        },
      }}
    >
      {/* ── HEADER ── */}
      <DialogTitle
        sx={{
          m: 0,
          px: 3,
          py: 2.25,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 64,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: '1.05rem',
            flexGrow: 1,
            color: 'text.primary',
            lineHeight: 1.3,
          }}
        >
          {title || (modalType === 'CONFIRM'
            ? t('common.confirmTitle', 'İşlemi Onayla')
            : t('common.infoTitle', 'Bilgi'))}
        </Typography>

        {!hideCloseButton && (
          <IconButton
            aria-label="close"
            onClick={handleClose}
            size="small"
            sx={{
              color: 'text.secondary',
              width: 32,
              height: 32,
              transition: 'all 0.15s ease',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </DialogTitle>

      {/* No Divider */}

      {hasTabs && (
        <>
          <Box sx={{ px: 3, pt: 1.5, pb: 0 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newVal) => setActiveTab(newVal)}
              sx={{
                minHeight: 36,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : theme.palette.action.hover,
                borderRadius: '8px',
                p: '4px',
                display: 'inline-flex',
                '& .MuiTabs-flexContainer': { gap: '4px' },
                '& .MuiTabs-indicator': { display: 'none' },
                '& .MuiTab-root': {
                  minHeight: 32,
                  borderRadius: '6px',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  px: 2,
                  py: 0.5,
                  color: 'text.secondary',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    color: 'text.primary',
                    fontWeight: 600,
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.09)'
                        : theme.palette.background.paper,
                    boxShadow: (theme) => theme.palette.mode === 'dark' ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
                  },
                  '&:hover:not(.Mui-selected)': {
                    color: 'text.primary',
                  },
                },
              }}
            >
              {tabs.map((tab, i) => (
                <Tab
                  key={i}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                  id={`modal-tab-${i}`}
                  aria-controls={`modal-tabpanel-${i}`}
                />
              ))}
            </Tabs>
          </Box>
          {/* No Divider */}
        </>
      )}

      <DialogContent
        sx={{
          px: 3,
          py: 2.5,
          maxHeight: '60vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'divider',
            borderRadius: 4,
          },
          ...contentSx,
        }}
        role={hasTabs ? 'tabpanel' : undefined}
        id={hasTabs ? `modal-tabpanel-${activeTab}` : undefined}
        aria-labelledby={hasTabs ? `modal-tab-${activeTab}` : undefined}
      >
        {activeContent && typeof activeContent === 'string' ? (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {activeContent}
          </Typography>
        ) : (
          activeContent
        )}
      </DialogContent>

      {resolvedFooterButtons.length > 0 && (
        <>
          {/* No Divider */}
          <DialogActions
            sx={{
              px: 3,
              py: 2,
              gap: 1.25,
              justifyContent: 'flex-end',
            }}
          >
            {resolvedFooterButtons.map((btn, index) => (
              <ModalFooterButton key={index} btn={btn} index={index} />
            ))}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default GlobalModal;
