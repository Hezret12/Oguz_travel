import { useForm } from "react-hook-form";
import { useLocale } from "../../../hooks/useLocale";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import { Box } from "@mui/material";
import { useValidShema } from "../../../functions/useValidShema";
import { yupResolver } from "@hookform/resolvers/yup";
import CustomTextField from "../../../components/CustomTextField";
import CustomSelect from "../../../components/CustomSelect";
import PhoneNumberField from "../../../components/inputs/PhoneNumber";
import { updateEmployeeApi } from "../../../api/queries/put";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";

const DEPARTMENT_OPTIONS = [
  { label: "Engineering", value: "Engineering" },
  { label: "Management", value: "Management" },
  { label: "Sales", value: "Sales" },
  { label: "HR", value: "HR" },
  { label: "Finance", value: "Finance" },
  { label: "Marketing", value: "Marketing" },
  { label: "IT", value: "IT" },
];

const OFFICE_OPTIONS = [
  { label: "Ashgabat", value: "Ashgabat" },
  { label: "Istanbul", value: "Istanbul" },
  { label: "Ankara", value: "Ankara" },
];

const EditEmployee = ({ table, row }) => {
  const { t } = useLocale();
  const { addEmployee } = useValidShema();

  const { mutate: updateEmployee, isPending: loading } = useUpdate({
    apiFn: updateEmployeeApi,
    key: "employee",
    idKey: "empl_guid",
    onSuccessUpdate: () => {
      table.setEditingRow(null);
    },
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      fullName: row.original.fullName || "",
      phoneNumber: row.original.phoneNumber || "",
      gmail: row.original.gmail || "",
      departmentId: row.original.departmentId || "",
      positionId: row.original.positionId || "",
      officeId: row.original.officeId || "",
      address: row.original.address || "",
    },
    resolver: yupResolver(addEmployee),
    mode: "onSubmit",
  });

  const submitHandler = async (data) => {
    try {
      await updateEmployee(data);
    } catch (err) {
      console.error(err);
    }
  };

  const closeDialog = () => {
    if (table) {
      table.setEditingRow(null);
    }
  };

  return (
    <CustomDialog widthX={700} open={true} close={closeDialog}>
      <CustomDialogHeader variant={"h5"} title={t("pages.employee.add")} />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2.5,
          }}
        >
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomTextField
              name="fullName"
              control={control}
              label={t("columns.fullName")}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <PhoneNumberField
              control={control}
              name="phoneNumber"
              label={t("columns.phoneNumber")}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomTextField
              name="gmail"
              control={control}
              label={t("columns.gmail") ?? "Email"}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomSelect
              name="departmentId"
              control={control}
              label={t("columns.department") ?? "Department"}
              options={DEPARTMENT_OPTIONS}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomSelect
              name="positionId"
              control={control}
              label={t("columns.position") ?? "Position"}
              options={[]}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomSelect
              name="officeId"
              control={control}
              label={t("columns.office") ?? "Office"}
              options={OFFICE_OPTIONS}
            />
          </Box>

          <Box sx={{ width: "48%" }}>
            <CustomTextField
              name="address"
              control={control}
              label={t("columns.address")}
            />
          </Box>
        </Box>

        <FooterButton loading={loading} onCancel={closeDialog} type="submit" />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditEmployee;
