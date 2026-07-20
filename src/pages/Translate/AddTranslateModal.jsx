import { useMemo, useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";

import { useLocale } from "../../hooks/useLocale";
import { useValidShema } from "../../functions/useValidShema";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import FooterButton from "../../components/Dialog/FooterButton";
import GlobalClientAutocomplete from "../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import { useGet } from "../../hooks/CRUD/useGet";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import {
  getAllTranslatorsApi,
  getAllEmployeeApi,
  getAllStatusApi,
} from "../../api/queries/getters";
import { addTranslationApi, addTranslatorApi } from "../../api/queries/post";
import { updateTranslatorApi } from "../../api/queries/patch";
import CustomDatePicker from "../../components/CustomDatePicker";

const AddTranslateModal = ({ table }) => {
  const { t, selectedLang } = useLocale();
  const { addTranslation } = useValidShema();
  const queryClient = useQueryClient();

  // Translator dialog state
  const [translatorDialogOpen, setTranslatorDialogOpen] = useState(false);
  const [translatorDialogMode, setTranslatorDialogMode] = useState("add"); // "add" | "edit"
  const [translatorInputValue, setTranslatorInputValue] = useState("");
  const [translatorInputError, setTranslatorInputError] = useState("");

  // Fetch Dropdown Data
  const { data: employees = [] } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const { data: translators = [] } = useGet({
    apiFn: getAllTranslatorsApi,
    key: "translators",
  });


  // react-hook-form setup
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(addTranslation),
    defaultValues: {
      received_day: dayjs().format("YYYY-MM-DD"),
      received_time: dayjs().format("HH:mm"),
      opr_guid: null,
      page_count: null,
      client_guid: null,
      source_to_target: null,
      completed_time: null,
      status_guid: false,
      completed_page_count: null,
      completed_day: null,
      translator_guid: null,
      correction_status: null,
      price: 0,
      note: null,
      is_paid: true,
    },
  });

  const { mutate: createTranslation } = useCreate({
    createFn: addTranslationApi,
    queryKey: "translations",
    onSuccess: () => {
      table.setCreatingRow(null);
    },
  });

  const selectedTranslatorGuid = useWatch({ control, name: "translator_guid" });

  const { mutate: createTranslator, isPending: isCreatingTranslator } =
    useCreate({
      createFn: addTranslatorApi,
      queryKey: "translators",
      onSuccess: (res) => {
        // Invalidate query to refetch translators list
        queryClient.invalidateQueries({ queryKey: ["translators"] });
        // Set value of newly created translator in main form
        const newGuid = res?.data?.guid;
        if (newGuid) {
          setValue("translator_guid", newGuid);
        }
        setTranslatorDialogOpen(false);
        setTranslatorInputValue("");
      },
    });

  const { mutate: updateTranslator, isPending: isUpdatingTranslator } =
    useUpdate({
      apiFn: updateTranslatorApi,
      key: "translators",
      idKey: "guid",
      onSuccessUpdate: () => {
        // Invalidate query to refetch translators list
        queryClient.invalidateQueries({ queryKey: ["translators"] });
        setTranslatorDialogOpen(false);
        setTranslatorInputValue("");
      },
    });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      received_day: data.received_day
        ? dayjs(data.received_day).format("YYYY-MM-DD")
        : null,
      completed_day: data.completed_day
        ? dayjs(data.completed_day).format("YYYY-MM-DD")
        : null,
      page_count: Number(data.page_count || 0),
      completed_page_count: Number(data.completed_page_count || 0),
      price: Number(data.price || 0),
      is_paid: data.is_paid === 0 || data.is_paid === "0"
        ? 0
        : (data.is_paid === true || data.is_paid === "true"),
    };
    createTranslation(payload);
  };

  const openAddTranslator = () => {
    setTranslatorDialogMode("add");
    setTranslatorInputValue("");
    setTranslatorInputError("");
    setTranslatorDialogOpen(true);
  };

  const openEditTranslator = () => {
    const selectedTranslator = translators.find(
      (t) => t.guid === selectedTranslatorGuid,
    );
    if (selectedTranslator) {
      setTranslatorDialogMode("edit");
      setTranslatorInputValue(selectedTranslator.fullName);
      setTranslatorInputError("");
      setTranslatorDialogOpen(true);
    }
  };

  const handleSaveTranslator = () => {
    const val = translatorInputValue.trim();
    if (!val) {
      setTranslatorInputError(t("validation.required") || "Required");
      return;
    }
    if (translatorDialogMode === "edit") {
      updateTranslator({ guid: selectedTranslatorGuid, fullName: val });
    } else {
      createTranslator({ fullName: val });
    }
  };

  const employeeOptions = useMemo(
    () =>
      (employees || []).map((emp) => {
        const officeShort = emp.office?.shortName
          ? selectedLang(emp.office.shortName) ||
          selectedLang(emp.office.fullName) ||
          ""
          : "";
        const label = officeShort
          ? `${emp.fullName} (${officeShort})`
          : emp.fullName;
        return { label, value: emp.guid };
      }),
    [employees, selectedLang]
  );

  const translatorOptions = useMemo(
    () =>
      (translators || []).map((tr) => ({ value: tr.guid, label: tr.fullName })),
    [translators],
  );

  const statusOptions = useMemo(
    () => [
      { value: false, label: t("statusNormal") || "Adaty" },
      { value: true, label: t("statusUrgent") || "Gyssagly" },
    ],
    [t],
  );

  const paymentOptions = useMemo(
    () => [
      { label: t("paymentPaid") || "Tölendi", value: true },
      { label: t("paymentCredit") || "Kredit", value: false },
      { label: t("paymentRefunded") || "Gaýtaryldy", value: 0 },
    ],
    [t],
  );

  return (
    <>
      <CustomDialog
        open={true}
        close={() => table.setCreatingRow(null)}
        widthX={700}
      >
        <CustomDialogHeader
          variant="h5"
          title={t("addTranslation") || "Terjime goşmak"}
        />
        <CustomForm onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <GlobalClientAutocomplete
                name="client_guid"
                control={control}
                columns={["fullName", "phone_number"]}
                required
              />
            </Grid>

            <Grid size={4}>
              <CustomDatePicker
                name="received_day"
                control={control}
                label={t("columns.receivedDay") || "Alnan güni"}
                required
              />
            </Grid>

            <Grid size={4}>
              <CustomTextField
                name="received_time"
                control={control}
                label={t("columns.receivedTime") || "Alnan wagty"}
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={4}>
              <CustomSelect
                name="status_guid"
                control={control}
                label={t("columns.status") || "Ýagdaýy"}
                options={statusOptions}
                required
              />
            </Grid>

            <Grid size={6}>
              <CustomSelect
                name="opr_guid"
                control={control}
                label={t("columns.operator") || "Operator"}
                options={employeeOptions}
                required
              />
            </Grid>

            <Grid size={6}>
              <Typography
                variant="body2"
                sx={{
                  mb: 0.75,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                {t("columns.translator")}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <CustomSelect
                    name="translator_guid"
                    control={control}
                    options={translatorOptions}
                  />
                </Box>
                <IconButton
                  onClick={openAddTranslator}
                  color="primary"
                  sx={{
                    height: "40px",
                    width: "40px",
                    borderRadius: "7px",
                    border: (theme) =>
                      theme.palette.mode === "dark"
                        ? "1px solid rgba(255, 255, 255, 0.12)"
                        : "1px solid rgba(0, 0, 0, 0.23)",
                    "&:hover": {
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={openEditTranslator}
                  disabled={!selectedTranslatorGuid}
                  color="primary"
                  sx={{
                    height: "40px",
                    width: "40px",
                    borderRadius: "7px",
                    border: (theme) =>
                      theme.palette.mode === "dark"
                        ? "1px solid rgba(255, 255, 255, 0.12)"
                        : "1px solid rgba(0, 0, 0, 0.23)",
                    "&.Mui-disabled": {
                      borderColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.06)"
                          : "rgba(0, 0, 0, 0.12)",
                    },
                    "&:hover": {
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>

            <Grid size={4}>
              <CustomTextField
                name="source_to_target"
                control={control}
                label={t("columns.direction") || "Ugur (Meselem: TK -> RU)"}
              />
            </Grid>

            {/* Page Count */}
            <Grid size={4}>
              <CustomTextField
                name="page_count"
                control={control}
                type="number"
                label={t("columns.pageCount") || "Sahypa sany"}
                required
              />
            </Grid>

            {/* Price */}
            <Grid size={4}>
              <CustomTextField
                name="price"
                control={control}
                type="number"
                label={t("columns.price") || "Baha"}
                endIcon="TMT"
                required
              />
            </Grid>

            <Grid size={4}>
              <CustomSelect
                name="is_paid"
                control={control}
                label={t("columns.paymentStatus") || "Töleg görnüşi"}
                options={paymentOptions}
              />
            </Grid>

            <Grid size={4}>
              <CustomDatePicker
                name="completed_day"
                control={control}
                label={t("columns.completedDay") || "Tabşyrylan güni"}
              />
            </Grid>

            <Grid size={4}>
              <CustomTextField
                name="completed_time"
                control={control}
                label={t("columns.completedTime") || "Tabşyrylan wagty"}
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={4}>
              <CustomTextField
                name="completed_page_count"
                control={control}
                type="number"
                label={
                  t("columns.completedPageCount") || "Tabşyrylan sahypa sany"
                }
              />
            </Grid>

            {/* Correction Status */}
            <Grid size={4}>
              <CustomTextField
                name="correction_status"
                control={control}
                label={t("columns.correctionStatus") || "Düzeliş ýagdaýy"}
              />
            </Grid>

            {/* Note */}
            <Grid size={12}>
              <CustomTextField
                name="note"
                control={control}
                label={t("columns.note") || "Bellik"}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>

          <FooterButton
            loading={isSubmitting}
            onCancel={() => table.setCreatingRow(null)}
            type="submit"
            sx={{ mt: 3 }}
          />
        </CustomForm>
      </CustomDialog>

      <CustomDialog
        open={translatorDialogOpen}
        close={() => setTranslatorDialogOpen(false)}
        widthX={400}
      >
        <CustomDialogHeader
          variant="h6"
          title={
            translatorDialogMode === "edit"
              ? t("editTranslator") || "Terjimeçini düzeltmek"
              : t("addTranslator") || "Täze terjimeçi goşmak"
          }
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1.5 }}>
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="body2"
              sx={{
                mb: 0.75,
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              {t("columns.fullName") || "Doly ady"}
              <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder={t("columns.fullName") || "Doly ady"}
              value={translatorInputValue}
              onChange={(e) => {
                setTranslatorInputValue(e.target.value);
                if (e.target.value.trim()) setTranslatorInputError("");
              }}
              error={Boolean(translatorInputError)}
              helperText={translatorInputError}
              autoFocus
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "7px",
                  minHeight: "44px",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.03)"
                      : "#ffffff",
                },
              }}
            />
          </Box>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
          >
            <Button
              onClick={() => setTranslatorDialogOpen(false)}
              variant="outlined"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSaveTranslator}
              variant="contained"
              color="primary"
              disabled={isCreatingTranslator || isUpdatingTranslator}
            >
              {t("save")}
            </Button>
          </Box>
        </Box>
      </CustomDialog>
    </>
  );
};

export default AddTranslateModal;
