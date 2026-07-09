import { Box } from "@mui/material";
import { useEffect } from "react";
import AppAutocomplete from "../../../components/AppAutocomplete";
import CustomTextField from "../../../components/CustomTextField";
import CustomCheckbox from "../../../components/CustomCheckbox";
import PhoneNumberField from "../../../components/inputs/PhoneNumber";
import { useLocale } from "../../../hooks/useLocale";

const UserInformationTab = ({
  control,
  employees = [],
  watch,
  setValue,
  isEdit,
}) => {
  const { t } = useLocale();
  const selectedEmployeeId = watch("employee_guid");
  const isExternalUser = Boolean(watch("isExternalUser"));

  useEffect(() => {
    if (isExternalUser) {
      setValue("employee_guid", "", { shouldValidate: true, shouldDirty: true });
      return;
    }

    if (selectedEmployeeId) {
      const emp = employees.find((e) => e.id === selectedEmployeeId);
      if (emp?.phoneNumber) {
        const cleanPhone = emp.phoneNumber
          .replace("+993", "")
          .replace(/\s/g, "");
        setValue("phoneNumber", cleanPhone, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else if (!isEdit) {
        setValue("phoneNumber", "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } else if (!isEdit) {
      setValue("phoneNumber", "", { shouldValidate: true, shouldDirty: true });
    }
  }, [selectedEmployeeId, employees, setValue, isEdit, isExternalUser]);

  const employeeOptions = employees.map((emp) => ({
    label: `${emp.fullName} (${emp.position || ""})`,
    value: emp.id,
  }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
      <AppAutocomplete
        name="employee_guid"
        control={control}
        label={t("columns.employee")}
        placeholder={t("pages.users.selectEmployee")}
        options={employeeOptions}
        required={!isExternalUser}
        disabled={isEdit || isExternalUser}
      />

      <PhoneNumberField
        name="phone_number"
        control={control}
        label={t("columns.phoneNumber")}
        placeholder={t("pages.users.phoneNumberPlaceholder")}
        required
        disabled={!isExternalUser}
      />

      <CustomTextField
        name="password"
        control={control}
        type="password"
        label={t("columns.password")}
        placeholder={
          isEdit
            ? (t("pages.users.passwordEditPlaceholder") ??
              "Leave blank to keep current")
            : "******"
        }
        required={!isEdit}
      />

      <Box
        sx={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <CustomCheckbox
          name="isActive"
          control={control}
          label={t("pages.users.statusActive") ?? "Active User"}
        />

        <CustomCheckbox
          name="isExternalUser"
          control={control}
          label={t("pages.users.isExternalUser") ?? "External User"}
        />
      </Box>
    </Box>
  );
};

export default UserInformationTab;

