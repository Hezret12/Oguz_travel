import { useState } from "react";
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

  // Map API shape → shape expected by UserInformationTab
  const employees = rawEmployees.map((emp) => ({
    id: emp.guid,
    fullName: emp.fullName,
    officeName: selectedLang(emp.office?.fullName) ?? "",
    phoneNumber: emp.phone_number ?? "",
  }));

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      guid: row?.original?.guid || row?.original?.user_guid || "",
      employee_guid: row?.original?.employee_guid || row?.original?.employee?.guid || "",
      phone_number: row?.original?.phoneNumber
        ? (row.original.phoneNumber.startsWith("+993")
          ? row.original.phoneNumber
          : `+993${row.original.phoneNumber.replace(/\s/g, "")}`)
        : "",
      isActive: row?.original?.isActive ?? true,
      isExternalUser: row?.original?.isExternalUser ?? !Boolean(row?.original?.employee_guid || row?.original?.employee?.guid),
      isAdmin: Boolean(row?.original?.isAdmin || row?.original?.user_is_admin || row?.original?.role === "admin"),
      permissions: row?.original?.permissions || [],
    },
    resolver: yupResolver(editUser),
    mode: "onSubmit",
  });

  const { mutate: updateUser, isLoading: submitLoading } = useUpdate({
    apiFn: updateUserApi,
    key: "users",
    idKey: "user_guid",
    onSuccessUpdate: () => {
      table.setEditingRow(null);
    },
  });

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
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
