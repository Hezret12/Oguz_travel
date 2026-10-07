import { useMemo } from "react";
import { Alert, Box, Chip, CircularProgress, Typography } from "@mui/material";
import { Package, TriangleAlert } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import CustomTextField from "../../../../components/CustomTextField";
import StatusChip from "../../../../components/StatusChip";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { useLocale } from "../../../../hooks/useLocale";
import { useDateFormat } from "../../../../functions/generalHelpers";
import { fetchAllPaginatedData } from "../../../../functions/excelExportHelper";
import { REFERRAL_REPORT_STATUS_CONFIG } from "../../../../functions/statusChipConfigs";
import { getAllReportsApi, getLettersByDocumentRangeApi } from "../../../../api/queries/getters";
import { completeYhNumber } from "../../../../functions/yhNumber";
import {
  STOCK_LETTERS_KEY,
  YH_INPUT_PROPS,
  formatYhNumber,
  formatYhRange,
  getLetterCount,
  getLetterRange,
  getStockRange,
  isYhNumber,
  normalizeYhNumber,
  resolveLetterStatus,
} from "../functions/stockLetters";

// Not "reports": useCreate/useUpdate patch every "reports" query as a paginated page.
const ALL_BATCHES_KEY = "stockBatchesAll";

const InfoRow = ({ label, children }) => (
  <Box sx={{ display: "flex", gap: 1.5, py: 0.6, alignItems: "baseline" }}>
    <Typography variant="body2" sx={{ color: "text.secondary", minWidth: 110, flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography component="div" variant="body2" sx={{ fontWeight: 600, minWidth: 0 }}>
      {children}
    </Typography>
  </Box>
);

const Section = ({ children }) => (
  <Box
    sx={{
      px: 2,
      py: 1.25,
      borderRadius: "10px",
      border: "1px solid",
      borderColor: "divider",
      backgroundColor: "action.hover",
    }}
  >
    {children}
  </Box>
);

/**
 * Looks up one ÝH number: the batch (partiýa) it belongs to and what happened to it —
 * sold / damaged / lost, used by a referral letter, or still unused.
 */
const SerialLookupModal = ({ open, close }) => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();

  const { control, setValue } = useForm({ defaultValues: { number: "" } });
  const value = useWatch({ control, name: "number" });
  const isValid = isYhNumber(value);
  const number = isValid ? Number(normalizeYhNumber(value)) : null;

  // The backend search only matches text, so the batch holding a number is found here.
  const {
    data: batches = [],
    isLoading: isBatchesLoading,
    isError: isBatchesError,
  } = useQuery({
    queryKey: [ALL_BATCHES_KEY],
    queryFn: () => fetchAllPaginatedData(getAllReportsApi),
    enabled: open,
    staleTime: 30_000,
  });

  const {
    data: letters = [],
    isLoading: isLettersLoading,
    isError: isLettersError,
  } = useGet({
    apiFn: getLettersByDocumentRangeApi,
    key: STOCK_LETTERS_KEY,
    params: { start_number: number, end_number: number, page: 1, limit: 10 },
    options: { enabled: open && isValid, staleTime: 30_000 },
  });

  const matchingBatches = useMemo(() => {
    if (number == null) return [];
    return batches.filter((batch) => {
      const range = getStockRange(batch);
      return range && number >= range.start && number <= range.end;
    });
  }, [batches, number]);

  const matchingLetters = Array.isArray(letters) ? letters : [];
  const isLoading = isValid && (isBatchesLoading || isLettersLoading);
  const isError = isBatchesError || isLettersError;

  const renderLetter = (letter) => {
    const range = getLetterRange(letter);
    const isRange = range.end !== range.start;
    return (
      <Section key={letter.guid}>
        <InfoRow label={t("columns.status")}>
          {letter.isRefferal ? (
            <Chip
              label={t("sidebar.referalLetters")}
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: "0.72rem", borderRadius: "6px" }}
            />
          ) : (
            <StatusChip
              status={resolveLetterStatus(letter.status)}
              config={REFERRAL_REPORT_STATUS_CONFIG}
            />
          )}
        </InfoRow>
        {isRange && (
          <InfoRow label={t("referralLetter.lookup.record")}>
            {t("referralLetter.lookup.rangeRecord", {
              range: formatYhRange(range),
              count: getLetterCount(letter),
            })}
          </InfoRow>
        )}
        <InfoRow label={t("columns.date")}>
          {formatChange(letter.isRefferal ? letter.createdAt : letter.date_time, { dateOnly: true })}
        </InfoRow>
        {letter.isRefferal ? (
          <>
            {letter.refferalCountry?.name?.tk && (
              <InfoRow label={t("columns.destinationCountry")}>
                {letter.refferalCountry.name.tk}
              </InfoRow>
            )}
            {letter.departure_date && (
              <InfoRow label={t("columns.departureDate")}>
                {formatChange(letter.departure_date, { dateOnly: true })}
              </InfoRow>
            )}
          </>
        ) : (
          <>
            {letter.refferaloperator?.fullName && (
              <InfoRow label={t("referralLetter.submittedBy")}>
                {letter.refferaloperator.fullName}
              </InfoRow>
            )}
            {letter.accepted_by && (
              <InfoRow label={t("referralLetter.receivedBy")}>{letter.accepted_by}</InfoRow>
            )}
            {letter.note && <InfoRow label={t("columns.note")}>{letter.note}</InfoRow>}
          </>
        )}
      </Section>
    );
  };

  const renderResult = () => {
    if (!isValid) {
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("referralLetter.lookup.hint")}
        </Typography>
      );
    }
    if (isLoading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={26} />
        </Box>
      );
    }
    if (isError) return <Alert severity="error">{t("errorOccurred")}</Alert>;

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {t("referralLetter.export.batch")}
        </Typography>
        {matchingBatches.length === 0 ? (
          <Alert severity="warning">{t("referralLetter.lookup.noBatch")}</Alert>
        ) : (
          <>
            {matchingBatches.length > 1 && (
              <Alert severity="warning">{t("referralLetter.lookup.manyBatches")}</Alert>
            )}
            {matchingBatches.map((batch) => (
              <Section key={batch.guid}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Package size={18} style={{ opacity: 0.7, flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                      {batch.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatYhNumber(batch.start_yh_number)} - {formatYhNumber(batch.end_yh_number)}
                      {" • "}
                      {batch.total_letter} {t("referralLetter.letterUnit")}
                    </Typography>
                  </Box>
                </Box>
              </Section>
            ))}
          </>
        )}

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>
          {t("columns.status")}
        </Typography>
        {matchingLetters.length === 0 ? (
          <Section>
            <InfoRow label={t("columns.status")}>
              <Box component="span" sx={{ color: "success.main" }}>
                {t("referralLetter.export.unused")}
              </Box>
            </InfoRow>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t("referralLetter.lookup.unusedHint")}
            </Typography>
          </Section>
        ) : (
          <>
            {matchingLetters.length > 1 && (
              <Alert severity="error" icon={<TriangleAlert size={18} />}>
                {t("referralLetter.export.duplicate")}
              </Alert>
            )}
            {matchingLetters.map(renderLetter)}
          </>
        )}
      </Box>
    );
  };

  return (
    <CustomDialog open={open} close={close} widthX={560}>
      <CustomDialogHeader variant="h5" title={t("referralLetter.lookup.title")} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pb: 1 }}>
        <CustomTextField
          name="number"
          control={control}
          label={t("referralLetter.letterNo")}
          placeholder="0369420"
          InputProps={YH_INPUT_PROPS}
          autoFocus
          // A pasted number is complete, so it is taken whole (the 7-character limit would cut
          // "00000013" short) and brought to the 7-digit form; so is a short one on Enter or blur.
          onPaste={(event) => {
            event.preventDefault();
            setValue("number", completeYhNumber(event.clipboardData.getData("text")));
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && value) setValue("number", completeYhNumber(value));
          }}
          onBlur={() => {
            if (value) setValue("number", completeYhNumber(value));
          }}
        />
        {renderResult()}
      </Box>
    </CustomDialog>
  );
};

export default SerialLookupModal;
