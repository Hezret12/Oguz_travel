import { Box, Dialog, DialogContent, Divider, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export const CustomDialog = ({ open, close, widthX, children }) => {
  return (
    <Dialog
      fullScreen={false}
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          close();
        }
      }}
      aria-labelledby="responsive-dialog-title"
      slotProps={{
        paper: {
          sx: {
            width: widthX,
            maxWidth: "90%",
            position: 'relative'
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
