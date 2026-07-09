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
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { addEmployeeApi } from "../../../api/queries/post";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getAllDepartmentApi, getAllPositionApi } from "../../../api/queries/getters";

const AddEmployee = ({ table }) => {
  const { t } = useLocale();
  const { addEmployee } = useValidShema();

  const { mutate: createEmployee } = useCreate({
    apiFn: addEmployeeApi,
    key: "employee",
    onSuccess: () => {
      table.setCreatingRow(null);
    },
  });

  const { data: department, isLoading: isDepartmentLoading, isError: isDepartmentError } = useGet({
    apiFn: getAllDepartmentApi,
    key: "department",
  });

  const { data: position, isLoading: isPositionLoading, isError: isPositionError } = useGet({
    apiFn: getAllPositionApi,
    key: "position",
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      fullName: "",
      phone_number: "",
      gmail: "",
      department_guid: "",
      position_guid: "",
      office_guid: "",
      address: "",
    },
    resolver: yupResolver(addEmployee),
    mode: "onSubmit",
  });

  const submitHandler = async (data) => {
    try {
      await createEmployee(data);
    } catch (err) {
      console.error(err);
    }
  };

  const closeDialog = () => {
    if (table) {
      table.setCreatingRow(null);
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
              options={department}
              loading={isDepartmentLoading}
              error={isDepartmentError}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomSelect
              name="positionId"
              control={control}
              label={t("columns.position") ?? "Position"}
              options={position}
              loading={isPositionLoading}
              error={isPositionError}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomSelect
              name="officeId"
              control={control}
              label={t("columns.office") ?? "Office"}
              options={[]}
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

        <FooterButton onCancel={closeDialog} type="submit" />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddEmployee;
