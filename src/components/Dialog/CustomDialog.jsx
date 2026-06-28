import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
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
          },
        },
      }}
      fullWidth
    >
      <DialogContent
        sx={{
          position: "relative",
          padding: 3,
        }}
      >
        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 5,
          }}
          onClick={close}
          className=" dialog-cancel-btn"
        >
          <CloseIcon />
        </IconButton>
        <Box>{children}</Box>
      </DialogContent>
    </Dialog>
  );
};
