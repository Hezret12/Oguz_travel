import { Box } from "@mui/material";
import { useWatch } from "react-hook-form";
import AppAutocomplete from "../../../components/AppAutocomplete";
import CustomTextField from "../../../components/CustomTextField";
import CustomCheckbox from "../../../components/CustomCheckbox";
import PhoneNumberField from "../../../components/inputs/PhoneNumber";
import { useLocale } from "../../../hooks/useLocale";

const UserInformationTab = ({
  control,
  employees = [],
  setValue,
  isEdit,
}) => {
  const { t } = useLocale();
  const [rawIsExternalUser] = useWatch({
    control,
    name: ["isExternalUser"],
  });
  const isExternalUser = Boolean(rawIsExternalUser);

  const employeeOptions = employees.map((emp) => ({
    label: emp.officeName ? `${emp.fullName}   (${emp.officeName})` : emp.fullName,
    value: emp.id,
  }));

  const handleEmployeeChange = (employeeId) => {
    if (!isEdit && employeeId) {
      const emp = employees.find((e) => e.id === employeeId);
      if (emp?.phoneNumber) {
        const rawPhone = emp.phoneNumber.replace(/\s/g, "");
        const formattedPhone = rawPhone.startsWith("+993") ? rawPhone : `+993${rawPhone}`;
        setValue("phone_number", formattedPhone, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        setValue("phone_number", "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } else if (!isEdit && !employeeId) {
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
      <AppAutocomplete
        name="employee_guid"
        control={control}
        label={t("columns.employee")}
        placeholder={t("users.selectEmployee")}
        options={employeeOptions}
        required={!isExternalUser}
        disabled={isEdit || isExternalUser}
        onValueChange={handleEmployeeChange}
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
            ? (t("users.passwordEditPlaceholder"))
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
          label={t("users.isAdmin") || "Admin (isAdmin)"}
        />
      </Box>
    </Box>
  );
};

export default UserInformationTab;
