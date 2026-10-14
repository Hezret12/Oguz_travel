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

  const { mutate: createUser, isPending } = useCreate({
    apiFn: addUserApi,
    key: "users",
    // The list is paginated server side, so the new record is fetched back
    // rather than pushed into the cached page (which would leave a wrong count).
    isPaginated: true,
    onSuccess: () => {
      table.setCreatingRow(null);
    },
  });


  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      employee_guid: "",
      phone_number: "",
      password: "",
      isActive: true,
      isExternalUser: false,
      isAdmin: false,
      permissions: [],
    },
    resolver: yupResolver(addUser),
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    try {
      // Backend stores admin status only in `role` ("Admin" | "User").
      const { isAdmin, ...rest } = data;
      const formattedData = {
        ...rest,
        role: isAdmin ? "Admin" : "User",
        phone_number: data.phone_number
          ? (data.phone_number.startsWith("+993")
            ? data.phone_number
            : `+993${data.phone_number}`)
          : "",
      };
      await createUser(formattedData);
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
          title={t("users.addTitle") ?? "Add User"}
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
                  setValue={setValue}
                  isEdit={false}
                />
              ) : (
                <UserAccessTab control={control} />
              )}
            </Box>

            <FooterButton
              loading={isPending}
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
