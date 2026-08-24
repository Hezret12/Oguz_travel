import { Box, Grid, Typography, ButtonBase, alpha } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";

import { useLocale } from "../../hooks/useLocale";
import { useValidShema } from "../../functions/useValidShema";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import CustomTextField from "../../components/CustomTextField";
import CustomDatePicker from "../../components/CustomDatePicker";
import FooterButton from "../../components/Dialog/FooterButton";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { addCafeteriaTransactionApi } from "../../api/queries/post";

const AddCafeteriaModal = ({ table }) => {
  const { t } = useLocale();
  const { addCafeteriaTransaction } = useValidShema();

  const { mutate: createTransaction, isPending } = useCreate({
    apiFn: addCafeteriaTransactionApi,
    key: "cafeteriaTransactions",
    invalidateQueries: [["cafeteria-summary"]],
    onSuccess: () => {
      table.setCreatingRow(null);
    },
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      date: dayjs().toISOString(),
      type: false,
      amount: "",
      description: "",
    },
    resolver: yupResolver(addCafeteriaTransaction),
    mode: "onSubmit",
  });

  const closeDialog = () => {
    table.setCreatingRow(null);
  };

  const submitHandler = (values) => {
    const payload = {
      ...values,
      type: Boolean(values.type),
      amount: Number(values.amount || 0),
      date: dayjs(values.date).format("YYYY-MM-DD"),
    };
    createTransaction(payload);
  };

  return (
    <CustomDialog widthX={580} open={true} close={closeDialog}>
      <CustomDialogHeader
        variant="h5"
        title={t("cafeteria.addTransaction")}
      />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          {/* Type Selector (Segmented Radio Buttons) */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => {
                const isIncome = field.value === true;
                const isExpense = field.value === false;

                return (
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, fontWeight: 600, color: "text.primary", fontSize: "13px" }}
                    >
                      {t("cafeteria.type")} *
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1.5,
                      }}
                    >
                      {/* INCOME Button (true) */}
                      <ButtonBase
                        type="button"
                        onClick={() => field.onChange(true)}
                        sx={{
                          py: 1.25,
                          px: 2,
                          borderRadius: "10px",
                          border: "2px solid",
                          borderColor: isIncome ? "success.main" : "divider",
                          backgroundColor: isIncome
                            ? (theme) => alpha(theme.palette.success.main, 0.1)
                            : "background.paper",
                          color: isIncome ? "success.main" : "text.secondary",
                          fontWeight: 700,
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          transition: "all 0.15s ease",
                          "&:hover": {
                            borderColor: "success.main",
                            backgroundColor: (theme) =>
                              alpha(theme.palette.success.main, 0.06),
                          },
                        }}
                      >
                        <TrendingUpRoundedIcon sx={{ fontSize: 20 }} />
                        {t("cafeteria.types.income")}
                      </ButtonBase>

                      {/* EXPENSE Button (false) */}
                      <ButtonBase
                        type="button"
                        onClick={() => field.onChange(false)}
                        sx={{
                          py: 1.25,
                          px: 2,
                          borderRadius: "10px",
                          border: "2px solid",
                          borderColor: isExpense ? "error.main" : "divider",
                          backgroundColor: isExpense
                            ? (theme) => alpha(theme.palette.error.main, 0.1)
                            : "background.paper",
                          color: isExpense ? "error.main" : "text.secondary",
                          fontWeight: 700,
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          transition: "all 0.15s ease",
                          "&:hover": {
                            borderColor: "error.main",
                            backgroundColor: (theme) =>
                              alpha(theme.palette.error.main, 0.06),
                          },
                        }}
                      >
                        <TrendingDownRoundedIcon sx={{ fontSize: 20 }} />
                        {t("cafeteria.types.expense")}
                      </ButtonBase>
                    </Box>
                  </Box>
                );
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomDatePicker
              name="date"
              control={control}
              label={t("cafeteria.date")}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="amount"
              control={control}
              type="number"
              label={t("cafeteria.amount")}
              endIcon="TMT"
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomTextField
              name="description"
              control={control}
              label={t("cafeteria.description")}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <FooterButton loading={isPending} onCancel={closeDialog} type="submit" />
        </Box>
      </CustomForm>
    </CustomDialog>
  );
};

export default AddCafeteriaModal;
