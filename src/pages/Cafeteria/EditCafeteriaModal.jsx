import { Box, Grid, Typography, ButtonBase, alpha } from "@mui/material";
import { useForm, Controller, useWatch } from "react-hook-form";
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
import CurrencyAmount from "../../components/inputs/CurrencyAmount";
import CustomDatePicker from "../../components/CustomDatePicker";
import FooterButton from "../../components/Dialog/FooterButton";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { updateCafeteriaTransactionApi } from "../../api/queries/patch";

const EditCafeteriaModal = ({ table, row }) => {
  const { t } = useLocale();
  const { addCafeteriaTransaction } = useValidShema();

  const { mutate: updateTransaction, isPending } = useUpdate({
    apiFn: updateCafeteriaTransactionApi,
    key: "cafeteriaTransactions",
    idKey: "guid",
    invalidateQueries: [["cafeteria-summary"]],
    onSuccessUpdate: () => {
      table.setEditingRow(null);
    },
  });

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      guid: row?.original?.guid || row?.original?.id || null,
      date: row?.original?.date || dayjs().toISOString(),
      type:
        row?.original?.type === true ||
        row?.original?.type === 1 ||
        String(row?.original?.type) === "true",
      amount: row?.original?.amount != null ? Number(row.original.amount) : "",
      currency: row?.original?.currency || "TMT",
      description: row?.original?.description || "",
    },
    resolver: yupResolver(addCafeteriaTransaction),
    mode: "onSubmit",
  });

  const closeDialog = () => {
    table.setEditingRow(null);
  };

  const [selectedCurrency] = useWatch({
    control,
    name: ["currency"],
  });

  const submitHandler = (values) => {
    const payload = {
      ...values,
      type: Boolean(values.type),
      amount: Number(values.amount || 0),
      currency: values.currency || "TMT",
      date: dayjs(values.date).format("YYYY-MM-DD"),
    };
    updateTransaction(payload);
  };

  return (
    <CustomDialog widthX={580} open={true} close={closeDialog}>
      <CustomDialogHeader
        variant="h5"
        title={t("cafeteria.editTransaction")}
      />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
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
              validateFormat
              control={control}
              label={t("cafeteria.date")}
              showTime
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CurrencyAmount
              name="amount"
              control={control}
              label={t("cafeteria.amount")}
              currency={selectedCurrency}
              onCurrencyChange={(curr) => setValue("currency", curr)}
              placeholder=""
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

export default EditCafeteriaModal;
