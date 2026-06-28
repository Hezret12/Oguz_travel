import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Tab, Tabs } from "@mui/material";
import toast from "react-hot-toast";

import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import FooterButton from "../../../components/Dialog/FooterButton";

import { useLocale } from "../../../hooks/useLocale";
import { useEmployeeSearch } from "../../../hooks/useEmployeeSearch";
import { getValidationSchema } from "./validation";
import { getDefaultValues } from "./defaultValues";

import UserInformationTab from "./UserInformationTab";
import UserAccessTab from "./UserAccessTab";

const AddUserModalContent = ({
  isEdit,
  loading,
  employees,
  control,
  handleSubmit,
  onSubmit,
  onClose,
  watch,
  setValue,
  t,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabStyles = {
    minHeight: 52,
    p: 0.75,
    borderRadius: "14px",
    backgroundColor: (theme) =>
      theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "#f8fafc",
    border: (theme) =>
      `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
    display: "flex",
    "& .MuiTabs-flexContainer": {
      gap: 1,
    },
    "& .MuiTabs-indicator": {
      display: "none",
    },
    "& .MuiTab-root": {
      minHeight: 38,
      flex: 1,
      borderRadius: "10px",
      textTransform: "none",
      fontWeight: 600,
      fontSize: "14px",
      color: "text.secondary",
      transition: "all 0.2s ease",
      "&.Mui-selected": {
        color: "text.primary",
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#ffffff",
        boxShadow: (theme) =>
          theme.palette.mode === "dark" ? "none" : "0 1px 4px rgba(15,23,42,0.08)",
      },
      "&:hover:not(.Mui-selected)": {
        color: "text.primary",
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
      },
    },
  };

  const scrollAreaStyles = {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    overflowX: "hidden",
    pr: 1,
    mr: -1,
    pb: 0.5,
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(148, 163, 184, 0.7) transparent",
    "&::-webkit-scrollbar": {
      width: 6,
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "divider",
      borderRadius: 999,
    },
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, height: "100%" }}>
      <CustomDialogHeader
        variant="h5"
        title={
          isEdit
            ? (t("users.editTitle") ?? "Edit User")
            : (t("users.addTitle") ?? "Add User")
        }
      />

      <CustomForm
        handleSubmit={handleSubmit(onSubmit)}
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          mt: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={tabStyles}
          >
            <Tab label={t("users.tabs.information") ?? "Information"} />
            <Tab label={t("users.tabs.access") ?? "Access"} />
          </Tabs>

          <Box sx={scrollAreaStyles}>
            {activeTab === 0 ? (
              <UserInformationTab
                control={control}
                employees={employees}
                watch={watch}
                setValue={setValue}
                isEdit={isEdit}
              />
            ) : (
              <UserAccessTab control={control} />
            )}
          </Box>

          <FooterButton loading={loading} onCancel={onClose} type="submit" sx={{ mt: "auto" }} />
        </Box>
      </CustomForm>
    </Box>
  );
};

const AddUserModal = ({ open, onClose, onSave, user = null }) => {
  const { t } = useLocale();
  const isEdit = Boolean(user);
  const [loading, setLoading] = useState(false);

  const defaultValues = useMemo(() => getDefaultValues(user), [user]);
  const modalSessionKey = useMemo(
    () => `${open ? "open" : "closed"}-${user?.id ?? "new"}`,
    [open, user?.id]
  );

  const { data: employees = [] } = useEmployeeSearch();

  const { control, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues,
    resolver: yupResolver(getValidationSchema(isEdit, t)),
    mode: "onSubmit",
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const selectedEmp = employees.find((e) => e.id === data.employeeId);
      const payload = {
        ...data,
        id: isEdit ? user.id : String(Date.now()),
        fullName: selectedEmp ? selectedEmp.fullName : (user?.fullName || "Unknown"),
      };

      if (onSave) {
        onSave(payload);
      }

      toast.success(
        isEdit
          ? (t("users.updateSuccess") ?? "User updated successfully!")
          : (t("users.addSuccess") ?? "User added successfully!")
      );
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(t("users.submitError") ?? "An error occurred while saving user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog
      widthX={700}
      open={open}
      close={onClose}
      paperSx={{
        height: "min(860px, calc(100vh - 48px))",
        maxHeight: "calc(100vh - 48px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      contentSx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <AddUserModalContent
        key={modalSessionKey}
        isEdit={isEdit}
        loading={loading}
        employees={employees}
        control={control}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        onClose={onClose}
        watch={watch}
        setValue={setValue}
        t={t}
      />
    </CustomDialog>
  );
};

export default AddUserModal;
