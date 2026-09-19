import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { FileSpreadsheet, UploadCloud } from "lucide-react";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import FooterButton from "../../../../components/Dialog/FooterButton";
import { useLocale } from "../../../../hooks/useLocale";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { useDateFormat } from "../../../../functions/generalHelpers";
import { getAllCategoriesApi } from "../../../../api/queries/getters";
import { importTotalCalculationsApi } from "../../../../api/queries/post";
import { parseKassaExcel } from "../functions/parseKassaExcel";
import { fmtMoney } from "../functions/cashFlowHelpers";

// Small enough to stay under the API's default 100kb JSON body limit.
const BATCH_SIZE = 200;

const ImportKassaExcelModal = ({ open, close }) => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
  const queryClient = useQueryClient();
  const inputRef = useRef(null);

  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total }
  const [result, setResult] = useState(null); // { inserted, skipped, categoriesCreated }
  const [error, setError] = useState("");

  const isImporting = Boolean(progress) && !result && !error;

  const { data: categories = [] } = useGet({
    apiFn: getAllCategoriesApi,
    key: "categories",
    options: { enabled: Boolean(open) },
  });

  const newCategories = useMemo(() => {
    if (!parsed) return [];
    const known = new Set();
    (Array.isArray(categories) ? categories : []).forEach((c) =>
      Object.values(c.name || {}).forEach((n) => known.add(String(n).trim().toLowerCase())),
    );
    return parsed.categories.filter((c) => !known.has(c.toLowerCase()));
  }, [parsed, categories]);

  const resetState = () => {
    setFileName("");
    setParsed(null);
    setProgress(null);
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    if (isImporting) return;
    resetState();
    close?.();
  };

  const handleFile = async (file) => {
    if (!file) return;
    resetState();
    setFileName(file.name);
    setIsParsing(true);
    try {
      const res = await parseKassaExcel(await file.arrayBuffer());
      if (!res.rows.length) setError(t("finance.cashBook.importNoRows"));
      setParsed(res);
    } catch (e) {
      console.error(e);
      setError(t("finance.cashBook.importParseError"));
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    if (!parsed?.rows.length || isImporting || result) return;
    const { rows } = parsed;
    const totals = { inserted: 0, skipped: 0, categoriesCreated: 0 };
    setError("");
    setProgress({ done: 0, total: rows.length });

    try {
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const res = await importTotalCalculationsApi(batch);
        const data = res?.data?.data || {};
        totals.inserted += Number(data.inserted || 0);
        totals.skipped += Number(data.skipped || 0);
        totals.categoriesCreated += Number(data.categoriesCreated || 0);
        setProgress({ done: Math.min(i + BATCH_SIZE, rows.length), total: rows.length });
      }
      setResult(totals);
    } catch (e) {
      console.error(e);
      setError(
        e?.response?.data?.errorMessage ||
          e?.response?.data?.message ||
          t("finance.cashBook.importFailed"),
      );
    } finally {
      queryClient.invalidateQueries({ queryKey: ["totalCalculations"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    }
  };

  const currencies = parsed ? Object.entries(parsed.totals) : [];
  const skippedByReason = useMemo(() => {
    const m = {};
    (parsed?.skipped || []).forEach((s) => (m[s.reason] = (m[s.reason] || 0) + 1));
    return Object.entries(m);
  }, [parsed]);

  return (
    <CustomDialog open={Boolean(open)} close={handleClose} widthX={720}>
      <CustomDialogHeader variant="h6" title={t("finance.cashBook.importTitle")} />
      <CustomForm
        onSubmit={(e) => {
          e.preventDefault();
          if (result) handleClose();
          else handleImport();
        }}
      >
        <Stack spacing={2.5}>
          {/* File picker */}
          <Box
            component="label"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (!isImporting) handleFile(e.dataTransfer.files?.[0]);
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2.5,
              borderRadius: "12px",
              border: "1.5px dashed",
              borderColor: fileName ? "primary.main" : "divider",
              bgcolor: "action.hover",
              cursor: isImporting ? "default" : "pointer",
              transition: "border-color .15s ease",
              "&:hover": { borderColor: "primary.main" },
            }}
          >
            <input
              ref={inputRef}
              type="file"
              hidden
              accept=".xlsx,.xls"
              disabled={isImporting}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <Box sx={{ color: "primary.main", display: "flex" }}>
              {fileName ? <FileSpreadsheet size={32} /> : <UploadCloud size={32} />}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, wordBreak: "break-all" }}>
                {fileName || t("finance.cashBook.importPick")}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {t("finance.cashBook.importHint")}
              </Typography>
            </Box>
            {isParsing && <CircularProgress size={22} sx={{ ml: "auto" }} />}
          </Box>

          {/* Preview */}
          {parsed && parsed.rows.length > 0 && (
            <>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                {parsed.sheets.map((s) => (
                  <Chip
                    key={s.name}
                    size="small"
                    label={`${s.name}: ${s.count}`}
                    color={s.type === "INCOME" ? "success" : "error"}
                    variant="outlined"
                  />
                ))}
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${formatChange(parsed.dateFrom, { dateOnly: true })} — ${formatChange(parsed.dateTo, { dateOnly: true })}`}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={t("finance.cashBook.importRowCount", { count: parsed.rows.length })}
                />
              </Stack>

              <Table size="small" sx={{ "& td, & th": { borderColor: "divider" } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>{t("currency")}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{t("finance.income")}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{t("finance.expense")}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{t("finance.cashBook.balance")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currencies.map(([cur, v]) => (
                    <TableRow key={cur}>
                      <TableCell sx={{ fontWeight: 600 }}>{cur}</TableCell>
                      <TableCell align="right" sx={{ color: "#16a34a", fontWeight: 600 }}>
                        +{fmtMoney(v.INCOME, cur)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#dc2626", fontWeight: 600 }}>
                        -{fmtMoney(v.EXPENSE, cur)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {fmtMoney(v.INCOME - v.EXPENSE, cur)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {newCategories.length > 0 && (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    {t("finance.cashBook.importNewCategories", { count: newCategories.length })}
                  </Typography>
                  <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75 }}>
                    {newCategories.map((c) => (
                      <Chip key={c} size="small" label={c} />
                    ))}
                  </Stack>
                </Box>
              )}

              {skippedByReason.length > 0 && (
                <Alert severity="info" variant="outlined">
                  {t("finance.cashBook.importSkippedRows", { count: parsed.skipped.length })}{" "}
                  ({skippedByReason.map(([r, n]) => `${t(`finance.cashBook.skipReason.${r}`)}: ${n}`).join(", ")})
                </Alert>
              )}

              <Alert severity="warning" variant="outlined">
                {t("finance.cashBook.importDedupeNote")}
              </Alert>
            </>
          )}

          {progress && (
            <Box>
              <LinearProgress
                variant="determinate"
                value={(progress.done / progress.total) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" sx={{ mt: 0.75, color: "text.secondary" }}>
                {progress.done} / {progress.total}
              </Typography>
            </Box>
          )}

          {result && (
            <Alert severity="success">
              {t("finance.cashBook.importDone", {
                inserted: result.inserted,
                skipped: result.skipped,
                categories: result.categoriesCreated,
              })}
            </Alert>
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>

        <FooterButton
          loading={isImporting}
          onCancel={handleClose}
          disabled={!result && (!parsed?.rows.length || isParsing)}
          saveText={result ? t("finance.cashBook.close") : t("finance.cashBook.importStart")}
          icon={result ? null : <UploadCloud size={18} />}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default ImportKassaExcelModal;
