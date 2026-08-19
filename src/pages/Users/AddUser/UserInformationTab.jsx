import { Box } from "@mui/material";
import { useWatch } from "react-hook-form";
import GlobalEmployeeAutocomplete from "../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import CustomTextField from "../../../components/CustomTextField";
import CustomCheckbox from "../../../components/CustomCheckbox";
import PhoneNumberField from "../../../components/inputs/PhoneNumber";
import { useLocale } from "../../../hooks/useLocale";

const UserInformationTab = ({
  control,
  setValue,
  isEdit,
  initialEmployee = null,
}) => {
  const { t } = useLocale();
  const [rawIsExternalUser] = useWatch({
    control,
    name: ["isExternalUser"],
  });
  const isExternalUser = Boolean(rawIsExternalUser);

  const handleEmployeeChange = (employee) => {
    if (!isEdit && employee) {
      const rawPhone = employee.phone_number || "";
      const formattedPhone = rawPhone
        ? rawPhone.startsWith("+993")
          ? rawPhone
          : `+993${rawPhone.replace(/\s/g, "")}`
        : "";
      setValue("phone_number", formattedPhone, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else if (!isEdit && !employee) {
      setValue("phone_number", "", { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleExternalUserChange = (checked) => {
    if (checked) {
      setValue("employee_guid", "", { shouldValidate: true, shouldDirty: true });
      if (!isEdit) {
        setValue("phone_number", "", { shouldValidate: true, shouldDirty: true });
      }
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
      <GlobalEmployeeAutocomplete
        name="employee_guid"
        control={control}
        label={t("columns.employee")}
        required={!isExternalUser}
        disabled={isEdit || isExternalUser}
        initialEmployee={initialEmployee}
        onEmployeeChange={handleEmployeeChange}
      />

      <PhoneNumberField
        name="phone_number"
        control={control}
        label={t("columns.phoneNumber")}
        placeholder={t("users.phoneNumberPlaceholder")}
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
            ? t("users.passwordEditPlaceholder")
            : "******"
        }
        required={!isEdit}
      />

      <Box
        sx={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        <CustomCheckbox
          name="isActive"
          control={control}
          label={t("users.statusActive")}
        />

        <CustomCheckbox
          name="isExternalUser"
          control={control}
          label={t("users.isExternalUser")}
          onValueChange={handleExternalUserChange}
        />

        <CustomCheckbox
          name="isAdmin"
          control={control}
          label={t("users.isAdmin")}
        />
      </Box>
    </Box>
  );
};

export default UserInformationTab;
