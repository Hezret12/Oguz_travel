import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocale } from "../../../hooks/useLocale";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import { Box } from "@mui/material";
import { useValidSchema } from "../../../functions/useValidShema";
import { yupResolver } from "@hookform/resolvers/yup";
import CustomTextField from "../../../components/CustomTextField";
import CustomSelect from "../../../components/CustomSelect";
import toast from "react-hot-toast";
import PhoneNumberField from "../../../components/inputs/PhoneNumber";

const DEPARTMENT_OPTIONS = [
  { label: "Engineering", value: "Engineering" },
  { label: "Management", value: "Management" },
  { label: "Sales", value: "Sales" },
  { label: "HR", value: "HR" },
  { label: "Finance", value: "Finance" },
  { label: "Marketing", value: "Marketing" },
  { label: "IT", value: "IT" },
];

const POSITIONS_BY_DEPARTMENT = {
  Engineering: [
    { label: "Software Engineer", value: "Software Engineer" },
    { label: "Frontend Developer", value: "Frontend Developer" },
    { label: "Backend Developer", value: "Backend Developer" },
    { label: "DevOps Engineer", value: "DevOps Engineer" },
  ],
  Management: [
    { label: "Project Manager", value: "Project Manager" },
    { label: "Product Owner", value: "Product Owner" },
    { label: "Team Lead", value: "Team Lead" },
  ],
  Sales: [
    { label: "Sales Director", value: "Sales Director" },
    { label: "Account Executive", value: "Account Executive" },
    { label: "Sales Representative", value: "Sales Representative" },
  ],
  HR: [
    { label: "HR Specialist", value: "HR Specialist" },
    { label: "Talent Acquisition", value: "Talent Acquisition" },
    { label: "HR Manager", value: "HR Manager" },
  ],
  Finance: [
    { label: "Accountant", value: "Accountant" },
    { label: "Financial Analyst", value: "Financial Analyst" },
    { label: "Finance Manager", value: "Finance Manager" },
  ],
  Marketing: [
    { label: "Marketing Specialist", value: "Marketing Specialist" },
    { label: "SEO Analyst", value: "SEO Analyst" },
    { label: "Content Manager", value: "Content Manager" },
  ],
  IT: [
    { label: "System Administrator", value: "System Administrator" },
    { label: "Network Engineer", value: "Network Engineer" },
    { label: "IT Support", value: "IT Support" },
  ],
};

const OFFICE_OPTIONS = [
  { label: "Ashgabat", value: "Ashgabat" },
  { label: "Istanbul", value: "Istanbul" },
  { label: "Ankara", value: "Ankara" },
];

const AddEmployee = ({ table }) => {
  const { t } = useLocale();
  const { addEmployee } = useValidSchema();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      gmail: "",
      departmentId: "",
      positionId: "",
      officeId: "",
    },
    resolver: yupResolver(addEmployee),
    mode: "onSubmit",
  });

  const selectedDepartment = watch("departmentId");
  const positionOptions = selectedDepartment
    ? (POSITIONS_BY_DEPARTMENT[selectedDepartment] ?? [])
    : [];

  useEffect(() => {
    if (selectedDepartment) {
      setValue("positionId", "");
    }
  }, [selectedDepartment, setValue]);

  const submitHandler = async (data) => {
    try {
      setLoading(true);
      console.log("Submitting employee data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(t("employee.addSuccess") ?? "Çalışan başarıyla eklendi!");
      closeDialog();
    } catch (err) {
      console.error(err);
      toast.error(t("employee.addError") ?? "Çalışan eklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    if (table) {
      table.setCreatingRow(null);
    }
  };

  return (
    <CustomDialog widthX={700} open={true} close={closeDialog}>
      <CustomDialogHeader
        variant={"h5"}
        title={t("employee.add") ?? "Çalışan Ekle"}
      />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Box
          sx={{
            mt: 3,
            display: "flex",
            flexWrap: "wrap",
            gap: 2.5,
          }}
        >
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomTextField
              name="fullName"
              control={control}
              label={t("employee.columns.fullName") ?? "Full Name"}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <PhoneNumberField
              control={control}
              name="phoneNumber"
              label={t("employee.columns.phoneNumber")}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomTextField
              name="gmail"
              control={control}
              label={t("employee.columns.gmail") ?? "Email"}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomSelect
              name="departmentId"
              control={control}
              label={t("employee.columns.department") ?? "Department"}
              options={DEPARTMENT_OPTIONS}
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomSelect
              name="positionId"
              control={control}
              label={t("employee.columns.position") ?? "Position"}
              options={positionOptions}
              disabled={!selectedDepartment}
              placeholder={
                selectedDepartment
                  ? "Pozisyon seçin..."
                  : "Önce departman seçin..."
              }
            />
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)" } }}>
            <CustomSelect
              name="officeId"
              control={control}
              label={t("employee.columns.office") ?? "Office"}
              options={OFFICE_OPTIONS}
            />
          </Box>
        </Box>

        <FooterButton loading={loading} onCancel={closeDialog} type="submit" />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddEmployee;
