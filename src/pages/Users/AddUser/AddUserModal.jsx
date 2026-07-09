import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Tab, Tabs } from "@mui/material";

import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import FooterButton from "../../../components/Dialog/FooterButton";

import { useLocale } from "../../../hooks/useLocale";
import { useValidShema } from "../../../functions/useValidShema";

import UserInformationTab from "./UserInformationTab";
import UserAccessTab from "./UserAccessTab";
import { tabStyles, scrollAreaStyles } from "../shared/modalStyles";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { addUserApi } from "../../../api/queries/post";

const AddUserModal = ({ table }) => {
  const { t } = useLocale();
  const { addUser } = useValidShema();
  const [activeTab, setActiveTab] = useState(0);


  const { mutate: createUser, isLoading } = useCreate({
    apiFn: addUserApi,
    key: "users",
    onSuccess: () => {
      table.setCreatingRow(null);
    },
  });

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      employee_guid: "",
      phone_number: "",
      password: "",
      isActive: true,
      isExternalUser: false,
      permissions: [],
    },
    resolver: yupResolver(addUser),
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    try {
      await createUser(data);
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
          title={t("pages.users.addTitle") ?? "Add User"}
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
                  watch={watch}
                  setValue={setValue}
                  isEdit={false}
                />
              ) : (
                <UserAccessTab control={control} />
              )}
            </Box>

            <FooterButton
              loading={isLoading}
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

export default AddUserModal;
