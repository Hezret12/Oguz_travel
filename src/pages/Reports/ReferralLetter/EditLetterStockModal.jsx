import { useMemo, useEffect } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import CustomTextField from "../../../components/CustomTextField";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { updateReportApi } from "../../../api/queries/patch";

const EditLetterStockModal = ({ table, row }) => {
  const isModalOpen = Boolean(table && row && table.getState().editingRow?.id === row.id);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      batchName: row?.original?.name || row?.original?.batchName || "",
      startNo: row?.original?.start_yh_number || row?.original?.startNo || "",
      endNo: row?.original?.end_yh_number || row?.original?.endNo || "",
      note: row?.original?.note || "",
    },
  });

  useEffect(() => {
    if (row?.original) {
      reset({
        batchName: row.original.name || row.original.batchName || "",
        startNo: String(row.original.start_yh_number ?? row.original.startNo ?? ""),
        endNo: String(row.original.end_yh_number ?? row.original.endNo ?? ""),
        note: row.original.note || "",
      });
    }
  }, [row, reset]);

  const [watchStartNo, watchEndNo] = useWatch({
    control,
    name: ["startNo", "endNo"],
  });

  const calculatedCount = useMemo(() => {
    const start = parseInt(watchStartNo || "0", 10);
    const end = parseInt(watchEndNo || "0", 10);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      return end - start + 1;
    }
    return 1;
  }, [watchStartNo, watchEndNo]);

  const { mutate: updateReport, isPending } = useUpdate({
    apiFn: updateReportApi,
    key: "reports",
    idKey: "guid",
    onSuccessUpdate: () => {
      table?.setEditingRow(null);
    },
  });

  const handleFormSubmit = (data) => {
    updateReport({
      guid: row.original.guid || row.original.id,
      name: data.batchName,
      start_yh_number: Number(data.startNo || 0),
      end_yh_number: Number(data.endNo || 0),
      total_letter: calculatedCount,
      note: data.note || "",
    });
  };

  const handleClose = () => {
    table?.setEditingRow(null);
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={520}>
      <CustomDialogHeader variant="h5" title="Hat stokuny düzeltmek" />
      <CustomForm handleSubmit={handleSubmit(handleFormSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
          {/* Field 1: Partiýanyň ady */}
          <CustomTextField
            name="batchName"
            control={control}
            label="Partiýanyň ady"
            placeholder="Meselem: 2024-nji ýyl hats"
            required
          />

          {/* Field 2 & 3: Başlangyç ÝH № & Soňky ÝH № */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="startNo"
                control={control}
                label="Başlangyç ÝH №"
                placeholder="0000001"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="endNo"
                control={control}
                label="Soňky ÝH №"
                placeholder="0090000"
                required
              />
            </Grid>
          </Grid>

          {/* Field 4: Bellik (Note) */}
          <CustomTextField
            name="note"
            control={control}
            label="Bellik"
            multiline
            rows={2}
          />

          {/* Calculated Quantity Display Box */}
          <Box
            sx={{
              mt: 0.5,
              p: 2,
              borderRadius: "10px",
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.04)"
                  : "#F8FAFC",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.875rem",
              }}
            >
              Umumy mukdary:{" "}
              <strong style={{ color: "text.primary", fontWeight: 700 }}>
                {calculatedCount}
              </strong>{" "}
              sany hat
            </Typography>
          </Box>
        </Box>

        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditLetterStockModal;
