import { Box, Checkbox, FormControlLabel, Typography, useTheme } from "@mui/material";
import { Controller } from "react-hook-form";
import { useEffect } from "react";
import AppAutocomplete from "../../../components/AppAutocomplete";
import CustomTextField from "../../../components/CustomTextField";
import { useLocale } from "../../../hooks/useLocale";

const UserInformationTab = ({ control, employees = [], watch, setValue, isEdit }) => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Watch selected employeeId to autofill phoneNumber if not in edit mode
  const selectedEmployeeId = watch("employeeId");

  useEffect(() => {
    if (selectedEmployeeId && !isEdit) {
      const emp = employees.find((e) => e.id === selectedEmployeeId);
      if (emp && emp.phoneNumber) {
        // Strip country code "+993" for the 8-digit input
        let cleanPhone = emp.phoneNumber.replace("+993", "").replace(/\s/g, "");
        setValue("phoneNumber", cleanPhone);
      }
    }
  }, [selectedEmployeeId, employees, setValue, isEdit]);

  const employeeOptions = employees.map((emp) => ({
    label: `${emp.fullName} (${emp.position || ""})`,
    value: emp.id,
  }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 2 }}>
      {/* Employee Autocomplete */}
      <AppAutocomplete
        name="employeeId"
        control={control}
        label={t("users.columns.employee") ?? "Employee"}
        placeholder={t("users.selectEmployee") ?? "Select Employee..."}
        options={employeeOptions}
        required
        disabled={isEdit} // Disable changing employee during edit
      />

      {/* Phone Number */}
      <CustomTextField
        name="phoneNumber"
        control={control}
        label={t("users.columns.phoneNumber") ?? "Phone Number"}
        placeholder={t("users.phoneNumberPlaceholder") ?? "61 123456"}
        required
        startIcon={<Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>+993</Typography>}
      />

      {/* Password */}
      <CustomTextField
        name="password"
        control={control}
        type="password"
        label={t("users.columns.password") ?? "Password"}
        placeholder={isEdit ? (t("users.passwordEditPlaceholder") ?? "Leave blank to keep current") : "••••••"}
        required={!isEdit}
      />

      {/* Status Checkbox */}
      <Controller
        name="isActive"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(field.value)}
                onChange={(e) => field.onChange(e.target.checked)}
                sx={{
                  color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
                  "&.Mui-checked": {
                    color: "#2563eb",
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {t("users.statusActive") ?? "Active User"}
              </Typography>
            }
          />
        )}
      />
    </Box>
  );
};

export default UserInformationTab;
