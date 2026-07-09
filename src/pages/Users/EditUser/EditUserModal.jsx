import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Tab, Tabs } from "@mui/material";

import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import FooterButton from "../../../components/Dialog/FooterButton";

import { useLocale } from "../../../hooks/useLocale";
import { useEmployeeSearch } from "../../../hooks/useEmployeeSearch";
import { useValidShema } from "../../../functions/useValidShema";

import UserInformationTab from "../AddUser/UserInformationTab";
import UserAccessTab from "../AddUser/UserAccessTab";
import { tabStyles, scrollAreaStyles } from "../shared/modalStyles";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { updateUserApi } from "../../../api/queries/put";

const EditUserModal = ({ table, row }) => {
  const { t } = useLocale();
  const { addUser } = useValidShema();
  const [activeTab, setActiveTab] = useState(0);

  const { data: employees = [] } = useEmployeeSearch();

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      employee_guid: row?.original?.employee_guid || "",
      phone_number: row?.original?.phoneNumber || "",
      is_active: row?.original.isActive || true,
      isExternalUser: row?.original?.isExternalUser || true,
      permissions: row?.original?.permissions || [],
    },
    resolver: yupResolver(addUser),
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
      await updateUser(data);
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
    <CustomDialog widthX={560} open={open} close={closeDialog}>
      <Box
        key={String(open)}
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          height: "100%",
        }}
      >
        <CustomDialogHeader
          variant="h5"
          title={t("pages.users.editTitle")}
        />

        <CustomForm handleSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="fullWidth"
              sx={tabStyles}
            >
              <Tab label={t("pages.users.tabs.information")} />
              <Tab label={t("pages.users.tabs.access")} />
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
