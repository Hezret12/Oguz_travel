import { useForm } from "react-hook-form";
import { useLocale } from "../../../hooks/useLocale";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import { Grid } from "@mui/material";
import { useValidShema } from "../../../functions/useValidShema";
import { yupResolver } from "@hookform/resolvers/yup";
import CustomTextField from "../../../components/CustomTextField";
import CustomSelect from "../../../components/CustomSelect";
import PhoneNumberField from "../../../components/inputs/PhoneNumber";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { addEmployeeApi } from "../../../api/queries/post";
import { useGet } from "../../../hooks/CRUD/useGet";
import {
  getAllDepartmentApi,
  getAllOfficeApi,
  getAllPositionApi,
} from "../../../api/queries/getters";

const AddEmployee = ({ table }) => {
  const { t, selectedLang } = useLocale();
  const { addEmployee } = useValidShema();

  const { mutate: createEmployee, isLoading: isSubmit } = useCreate({
    apiFn: addEmployeeApi,
    key: "employees",
    // The list is paginated server side, so the new record is fetched back
    // rather than pushed into the cached page (which would leave a wrong count).
    isPaginated: true,
    onSuccess: () => {
      table.setCreatingRow(null);
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
      fullName: "",
      phone_number: "",
      gmail: "",
      department_guid: "",
      position_guid: [],
      office_guid: "",
      address: "",
      loan: "",
    },
    resolver: yupResolver(addEmployee),
    mode: "onSubmit",
  });

  const submitHandler = async (data) => {
    try {
      const rawPhone = (data.phone_number || "").replace(/\s/g, "");
      const formattedPhone = rawPhone.startsWith("+993")
        ? rawPhone
        : `+993${rawPhone}`;

      const payload = {
        fullName: data.fullName,
        phone_number: formattedPhone,
        position_guid: data.position_guid,
        office_guid: data.office_guid,
      };

      if (data.department_guid) payload.department_guid = data.department_guid;
      if (data.gmail) payload.gmail = data.gmail;
      if (data.address) payload.address = data.address;
      if (data.loan !== undefined && data.loan !== "") {
        payload.loan = Number(data.loan);
      }

      await createEmployee(payload);
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
      <CustomDialogHeader variant={"h5"} title={t("employee.add")} />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="fullName"
              control={control}
              label={t("columns.fullName")}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <PhoneNumberField
              control={control}
              name="phone_number"
              label={t("columns.phoneNumber")}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="gmail"
              control={control}
              label={t("columns.gmail")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              name="position_guid"
              control={control}
              label={t("columns.position")}
              options={position}
              isLoading={isPositionLoading}
              isError={isPositionError}
              getRowId={(item) => item.guid}
              getRowLabel={(item) => selectedLang(item.name)}
              multiple
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              name="office_guid"
              control={control}
              label={t("columns.office")}
              options={office}
              isLoading={isOfficeLoading}
              isError={isOfficeError}
              getRowId={(item) => item.guid}
              getRowLabel={(item) => selectedLang(item.fullName)}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              name="department_guid"
              control={control}
              label={t("columns.department")}
              options={department}
              isLoading={isDepartmentLoading}
              isError={isDepartmentError}
              getRowId={(item) => item.guid}
              getRowLabel={(item) => selectedLang(item.name)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="address"
              control={control}
              label={t("columns.address")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="loan"
              control={control}
              type="number"
              label={t("employee.loan")}
              placeholder="0.00"
              allowNegative={false}
            />
          </Grid>
        </Grid>

        <FooterButton loading={isSubmit} onCancel={closeDialog} type="submit" />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddEmployee;
