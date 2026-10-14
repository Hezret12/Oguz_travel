import { useRef } from "react";
import { Box } from "@mui/material";

// Takes the submit handler as `handleSubmit` or `onSubmit` (onSubmit wins, as
// it did when it was spread over the form). A submit that comes while the
// previous one is still running — a double click on Save, Enter held down,
// async validation not yet done — is dropped, so a form is never sent twice.
export const CustomForm = ({ handleSubmit, onSubmit, children, ...props }) => {
  const submitting = useRef(false);
  const submit = onSubmit ?? handleSubmit;

  const guardedSubmit = async (event) => {
    if (submitting.current) {
      event?.preventDefault?.();
      return;
    }
    submitting.current = true;
    try {
      await submit(event);
    } finally {
      submitting.current = false;
    }
  };

  return (
    <Box component="form" onSubmit={submit ? guardedSubmit : undefined} {...props}>
      {children}
    </Box>
  );
};
