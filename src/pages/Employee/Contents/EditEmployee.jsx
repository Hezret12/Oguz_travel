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
import { updateEmployeeApi } from "../../../api/queries/patch";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { useGet } from "../../../hooks/CRUD/useGet";
import {
  getAllDepartmentApi,
  getAllOfficeApi,
  getAllPositionApi,
} from "../../../api/queries/getters";

const EditEmployee = ({ table, row }) => {
  const { t, selectedLang } = useLocale();
  const { addEmployee } = useValidShema();

  const { mutate: updateEmployee, isPending: loading } = useUpdate({
    apiFn: updateEmployeeApi,
    key: "employees",
    idKey: "guid",
    onSuccessUpdate: () => {
      table.setEditingRow(null);
    },
  });

  const {
    data: department,
    isLoading: isDepartmentLoading,
    isError: isDepartmentError,
  } = useGet({
    apiFn: getAllDepartmentApi,
    key: "department",
  });

  const {
    data: office,
    isLoading: isOfficeLoading,
    isError: isOfficeError,
  } = useGet({
    apiFn: getAllOfficeApi,
    key: "office",
  });

  const {
    data: position,
    isLoading: isPositionLoading,
    isError: isPositionError,
  } = useGet({
    apiFn: getAllPositionApi,
    key: "position",
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      guid: row?.original?.guid || '',
      fullName: row.original.fullName || "",
      phone_number: row.original.phone_number || "",
      gmail: row.original.gmail || "",
      department_guid: row.original.department_guid || "",
      position_guid: row.original.position_guid || "",
      office_guid: row.original.office_guid || "",
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
      <CustomDialogHeader variant={"h5"} title={t("pages.employee.aedit")} />
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
              name="phone_number"
              label={t("columns.phone_number")}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomTextField
              name="gmail"
              control={control}
              label={t("columns.gmail")}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomSelect
              name="department_guid"
              control={control}
              label={t("columns.department") ?? "Department"}
              options={department}
              isLoading={isDepartmentLoading}
              isError={isDepartmentError}
              getRowId={(item) => item.guid}
              getRowLabel={(item) => selectedLang(item.name)}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomSelect
              name="position_guid"
              control={control}
              label={t("columns.position")}
              options={position}
              isLoading={isPositionLoading}
              isError={isPositionError}
              getRowId={(item) => item.guid}
              getRowLabel={(item) => selectedLang(item.name)}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomSelect
              name="office_guid"
              control={control}
              label={t("columns.office")}
              options={office}
              isLoading={isOfficeLoading}
              isError={isOfficeError}
              getRowId={(item) => item.guid}
              getRowLabel={(item) => selectedLang(item.fullName)}
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
