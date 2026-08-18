import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Tab, Tabs } from "@mui/material";

import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import FooterButton from "../../../components/Dialog/FooterButton";

import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getAllEmployeeApi } from "../../../api/queries/getters";
import { useValidShema } from "../../../functions/useValidShema";

import UserInformationTab from "../AddUser/UserInformationTab";
import UserAccessTab from "../AddUser/UserAccessTab";
import { tabStyles, scrollAreaStyles } from "../shared/modalStyles";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { updateUserApi } from "../../../api/queries/patch";

const EditUserModal = ({ table, row }) => {
  const { t, selectedLang } = useLocale();
  const { editUser } = useValidShema();
  const [activeTab, setActiveTab] = useState(0);

  const { data: rawEmployees = [] } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const rowData = row?.original;
  const rowEmp = rowData?.employee;

  const employees = useMemo(() => {
    const list = (rawEmployees || []).map((emp) => ({
      id: emp.guid,
      fullName: emp.fullName,
      officeName: selectedLang(emp.office?.fullName) ?? "",
      phoneNumber: emp.phone_number ?? "",
    }));

    if (rowEmp && rowEmp.guid && !list.some((e) => e.id === rowEmp.guid)) {
      list.unshift({
        id: rowEmp.guid,
        fullName: rowEmp.fullName,
        officeName: selectedLang(rowEmp.office?.fullName) ?? "",
        phoneNumber: rowEmp.phone_number ?? "",
      });
    }

    return list;
  }, [rawEmployees, rowEmp, selectedLang]);

  const isEmp = Boolean(rowData?.employee_guid || rowEmp?.guid);
  const rawPhone = rowData?.phone_number || rowData?.phoneNumber || rowEmp?.phone_number || "";
  const formattedPhone = rawPhone
    ? (rawPhone.startsWith("+993") ? rawPhone : `+993${rawPhone.replace(/\s/g, "")}`)
    : "";

  const initialValues = useMemo(() => {
    return {
      guid: rowData?.guid || rowData?.user_guid || "",
      employee_guid: rowData?.employee_guid || rowEmp?.guid || "",
      phone_number: formattedPhone,
      isActive: rowData?.isActive ?? true,
      isExternalUser: rowData?.isExternalUser ?? !isEmp,
      isAdmin: Boolean(rowData?.isAdmin),
      permissions: Array.isArray(rowData?.permissions) ? rowData.permissions : [],
    };
  }, [rowData, rowEmp, isEmp, formattedPhone]);

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: initialValues,
    values: initialValues,
    resolver: yupResolver(editUser),
    mode: "onSubmit",
  });

  const { mutate: updateUser, isPending: submitLoading } = useUpdate({
    apiFn: updateUserApi,
    key: "users",
    idKey: "guid",
    onSuccessUpdate: () => {
      table?.setEditingRow(null);
    },
  });

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        guid: rowData?.guid || data.guid,
        user_guid: rowData?.guid || data.guid,
        isAdmin: Boolean(data.isAdmin),
        user_is_admin: Boolean(data.isAdmin),
        role: data.isAdmin ? "admin" : "user",
        phone_number: data.phone_number
          ? (data.phone_number.startsWith("+993")
            ? data.phone_number
            : `+993${data.phone_number}`)
          : "",
      };
      if (!formattedData.password) {
        delete formattedData.password;
      }
      await updateUser(formattedData);
    } catch (err) {
      console.error(err);
    }
  };

  const closeDialog = () => {
    if (table) {
      table.setEditingRow(null);
    }
  };

  const isDialogOpen = Boolean(row);

  return (
    <CustomDialog widthX={560} open={isDialogOpen} close={closeDialog}>
      <Box
        key={row?.original?.guid || "edit-user"}
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          height: "100%",
        }}
      >
        <CustomDialogHeader
          variant="h5"
          title={t("users.editTitle")}
        />

        <CustomForm handleSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="fullWidth"
              sx={tabStyles}
            >
              <Tab label={t("users.tabs.information")} />
              <Tab label={t("users.tabs.access")} />
            </Tabs>

            <Box sx={scrollAreaStyles}>
              {activeTab === 0 ? (
                <UserInformationTab
                  control={control}
                  employees={employees}
                  watch={watch}
                  setValue={setValue}
                  isEdit={true}
                />
              ) : (
                <UserAccessTab control={control} />
              )}
            </Box>

            <FooterButton
              loading={submitLoading}
              onCancel={closeDialog}
              type="submit"
              sx={{ mt: "auto" }}
            />
          </Box>
        </CustomForm>
      </Box>
    </CustomDialog>
  );
};

export default EditUserModal;
