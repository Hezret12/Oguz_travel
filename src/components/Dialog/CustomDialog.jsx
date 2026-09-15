import { Box, Dialog, DialogContent, Divider, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export const CustomDialog = ({ open, close, widthX, children, keepMounted = false }) => {
  return (
    <Dialog
      fullScreen={false}
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          close();
        }
      }}
      // Avoids MUI's body scroll-lock measurement (scrollbar width + overflow
      // toggle), which forces a synchronous reflow that's noticeably slower
      // when a large table sits underneath — same fix already applied to FilterDrawer.
      disableScrollLock
      // Opt-in: for heavy forms (many Autocompletes/DatePickers), unmounting on
      // every close means every open pays the full mount cost again (Popper
      // setup, emotion style injection, react-hook-form Controller subscriptions,
      // etc.) — keeping it mounted and just toggling visibility makes every open
      // after the first nearly free. Left off by default so existing callers
      // (which rely on a fresh mount per open) are unaffected.
      keepMounted={keepMounted}
      aria-labelledby="responsive-dialog-title"
      slotProps={{
        paper: {
          sx: {
            width: widthX,
            maxWidth: "90%",
            position: 'relative',
            backgroundColor: 'background.paper',
            backgroundImage: 'none',
            borderRadius: '16px',
            border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 16px 48px rgba(0, 0, 0, 0.45)'
              : '0 16px 48px rgba(0, 0, 0, 0.08)',
            // The large blurred box-shadow above is expensive to repaint every
            // frame during the enter/exit transition — promote the Paper to
            // its own GPU layer so only a cheap composite happens instead.
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
          },
        },
      }}
      fullWidth
    >
      <DialogContent
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          gap: 0,
          height: "100%",
        }}
      >
        <Divider
          sx={{
            top: 57,
            position: "absolute",
            width: "100%",
          }}
        />
        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 5,
            zIndex: 1,
          }}
          onClick={close}
          className=" dialog-cancel-btn"
        >
          <CloseIcon />
        </IconButton>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            px: 3,
            py: 2.5,
          }}
        >
          {children}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
