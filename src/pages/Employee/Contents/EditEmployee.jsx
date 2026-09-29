import { useForm } from "react-hook-form";
import { useLocale } from "../../../hooks/useLocale";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import CustomCheckbox from "../../../components/CustomCheckbox";
import { Grid } from "@mui/material";
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
  const { editEmployee } = useValidShema();

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
      guid: row?.original?.guid || "",
      fullName: row?.original?.fullName || "",
      phone_number: row?.original?.phone_number
        ? row.original.phone_number.startsWith("+993")
          ? row.original.phone_number
          : `+993${row.original.phone_number.replace(/\s/g, "")}`
        : "",
      gmail: row?.original?.gmail || "",
      department_guid: row?.original?.department?.guid || "",
      position_guids: Array.isArray(row?.original?.positions) ? row.original.positions.map((p) => p.guid) : [],
      office_guid: row?.original?.office?.guid || "",
      address: row?.original?.address || "",
      loan:
        row?.original?.loan !== undefined && row?.original?.loan !== null
          ? String(row.original.loan)
          : "",
      is_active: row?.original?.is_active !== false,
    },
    resolver: yupResolver(editEmployee),
    mode: "onSubmit",
  });

  const submitHandler = async (data) => {
    try {
      const rawPhone = (data.phone_number || "").replace(/\s/g, "");
      const formattedPhone = rawPhone.startsWith("+993")
        ? rawPhone
        : `+993${rawPhone}`;

      const payload = {
        guid: row?.original?.guid,
        fullName: data.fullName,
        phone_number: formattedPhone,
        position_guids: data.position_guids,
        office_guid: data.office_guid,
        is_active: Boolean(data.is_active),
      };

      if (data.department_guid) payload.department_guid = data.department_guid;
      if (data.gmail) payload.gmail = data.gmail;
      if (data.address) payload.address = data.address;
      if (data.loan !== undefined && data.loan !== "") {
        payload.loan = Number(data.loan);
      } else {
        payload.loan = 0;
      }

      await updateEmployee(payload);
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
      <CustomDialogHeader variant={"h5"} title={t("employee.edit")} />
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
              name="position_guids"
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

          <Grid size={{ xs: 12 }} sx={{ display: "flex", alignItems: "center", pt: 1 }}>
            <CustomCheckbox
              name="is_active"
              control={control}
              label={t("employee.isActive")}
            />
          </Grid>
        </Grid>

        <FooterButton loading={loading} onCancel={closeDialog} type="submit" />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditEmployee;
