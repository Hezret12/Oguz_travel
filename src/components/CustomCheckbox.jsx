import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { Controller } from "react-hook-form";

const CustomCheckbox = ({
  name,
  control,
  label,
  disabled = false,
  labelSx = {},
  sx = {},
  onValueChange,
}) => {

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Box sx={sx}>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(field.value)}
                disabled={disabled}
                onChange={(event) => {
                  const checked = event.target.checked;
                  field.onChange(checked);
                  onValueChange?.(checked);
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 500, ...labelSx }}>
                {label}
              </Typography>
            }
          />
        </Box>
      )}
    />
  );
};

export default CustomCheckbox;