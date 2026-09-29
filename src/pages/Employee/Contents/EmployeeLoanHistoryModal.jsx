import { useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  Calendar,
  CreditCard,
  History,
  PenLine,
  Receipt,
  User,
  Wallet,
} from "lucide-react";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getEmployeeLoanDetailsApi } from "../../../api/queries/getters";
import {
  formatMoney,
  formatMonthTk,
} from "../../Finance/Salary/functions/salaryUtils";
import { useDateFormat } from "../../../functions/generalHelpers";

const StatCard = ({ title, value, icon: Icon, color = "primary", subtitle }) => (
  <Paper
    elevation={0}
    sx={(theme) => ({
      p: 2,
      borderRadius: "10px",
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: "background.paper",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: `${color}.main`,
        boxShadow: (t) =>
          t.palette.mode === "dark"
            ? "0 4px 20px rgba(0,0,0,0.4)"
            : "0 4px 14px rgba(0,0,0,0.06)",
      },
    })}
  >
    <Box>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          mt: 0.5,
          fontVariantNumeric: "tabular-nums",
          color:
            color === "warning"
              ? "#d97706"
              : color === "success"
              ? "success.main"
              : "text.primary",
        }}
      >
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.25, display: "block" }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    <Box
      sx={(theme) => ({
        width: 44,
        height: 44,
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor:
          color === "warning"
            ? theme.palette.mode === "dark"
              ? "rgba(245, 158, 11, 0.18)"
              : "rgba(245, 158, 11, 0.12)"
            : color === "success"
            ? theme.palette.mode === "dark"
              ? "rgba(16, 185, 129, 0.18)"
              : "rgba(16, 185, 129, 0.12)"
            : theme.palette.mode === "dark"
            ? "rgba(20, 184, 166, 0.18)"
            : "rgba(14, 133, 132, 0.12)",
        color:
          color === "warning"
            ? "#f59e0b"
            : color === "success"
            ? "success.main"
            : "primary.main",
      })}
    >
      <Icon size={22} />
    </Box>
  </Paper>
);

const EmployeeLoanHistoryModal = ({ open, close, employee, onEditEmployee }) => {
  const { t, selectedLang } = useLocale();
  const { formatChange } = useDateFormat();

  const employeeGuid = employee?.guid;

  const { data: loanResponse, isLoading, isError, refetch } = useGet({
    apiFn: getEmployeeLoanDetailsApi,
    key: "employeeLoanDetails",
    params: { employee_guid: employeeGuid },
    options: { enabled: Boolean(open && employeeGuid) },
  });

  const details =
    loanResponse?.employee_guid || loanResponse?.empl_loan !== undefined
      ? loanResponse
      : loanResponse?.data ?? loanResponse ?? {};

  const empl_loan = Number(
    details.empl_loan ?? employee?.empl_loan ?? employee?.loan ?? 0
  );
  const salary_loans_total = Number(
    details.salary_loans_total ?? employee?.salary_loans_total ?? 0
  );
  const remaining_loan = Number(
    details.remaining_loan !== undefined
      ? details.remaining_loan
      : Math.round((empl_loan - salary_loans_total) * 100) / 100
  );

  const loanRecords = useMemo(() => {
    const rawList = Array.isArray(details.loans)
      ? details.loans
      : Array.isArray(loanResponse?.loans)
      ? loanResponse.loans
      : Array.isArray(details)
      ? details
      : [];
    return [...rawList].sort((a, b) => (b.month || "").localeCompare(a.month || ""));
  }, [details, loanResponse]);

  return (
    <CustomDialog open={Boolean(open)} close={close} widthX={860}>
      <CustomDialogHeader
        variant="h5"
        title={t("employee.loanHistory")}
      />

      <DialogContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* Employee Info Header Bar */}
        <Box
          sx={(theme) => ({
            p: 1.75,
            borderRadius: "10px",
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: "action.hover",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
          })}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              {employee?.fullName ? employee.fullName.charAt(0).toUpperCase() : <User size={20} />}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {employee?.fullName || details.fullName || "-"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {employee?.phone_number || "-"}
                {employee?.department?.name
                  ? ` • ${selectedLang(employee.department.name)}`
                  : ""}
                {employee?.office?.fullName
                  ? ` • ${selectedLang(employee.office.fullName)}`
                  : ""}
              </Typography>
            </Box>
          </Box>

          {onEditEmployee && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<PenLine size={14} />}
              onClick={() => {
                close?.();
                onEditEmployee(employee);
              }}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
              }}
            >
              {t("employee.edit")}
            </Button>
          )}
        </Box>

        {/* 3 Metric Summary Cards */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title={t("employee.remainingLoan")}
              value={`${formatMoney(remaining_loan, { dashZero: false })} TMT`}
              subtitle={
                remaining_loan <= 0 && empl_loan > 0
                  ? t("employee.fullyPaid")
                  : t("columns.status")
              }
              icon={Wallet}
              color={remaining_loan > 0 ? "warning" : "success"}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title={t("employee.initialLoan")}
              value={`${formatMoney(empl_loan, { dashZero: false })} TMT`}
              subtitle={t("employee.loan")}
              icon={Receipt}
              color="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title={t("employee.totalLoanDeducted")}
              value={`${formatMoney(salary_loans_total, { dashZero: false })} TMT`}
              subtitle={`${loanRecords.length} ${t("employee.loanMonthsCount")}`}
              icon={Calendar}
              color="success"
            />
          </Grid>
        </Grid>

        {/* Table of Monthly Deductions */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, mb: 1, color: "text.primary", display: "flex", alignItems: "center", gap: 1 }}
          >
            <History size={16} />
            {t("employee.loanHistory")} ({loanRecords.length})
          </Typography>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={(theme) => ({
              maxHeight: 340,
              borderRadius: "8px",
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: "background.paper",
            })}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: 50 }}>№</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>
                    {t("employee.monthYear")}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem" }}>
                    {t("employee.loanAmount")}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.75rem" }}>
                    {t("columns.status")}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.75rem" }}>
                    {t("employee.paidDate")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={30} />
                      <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                        {t("loading")}...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="error">
                        {t("errorOccurred")}
                      </Typography>
                      <Button size="small" onClick={() => refetch()} sx={{ mt: 1 }}>
                        {t("refresh")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : loanRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          color: "text.secondary",
                        }}
                      >
                        <CreditCard size={36} strokeWidth={1.5} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {t("employee.noLoanHistory")}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  loanRecords.map((record, idx) => {
                    const isPaid = Boolean(record.paid_date);
                    return (
                      <TableRow
                        key={record.guid || record.id || `${record.month}-${idx}`}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          transition: "background-color 0.15s ease",
                        }}
                      >
                        <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>{idx + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {formatMonthTk(record.month) || record.month}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            fontVariantNumeric: "tabular-nums",
                            color: "#d97706",
                          }}
                        >
                          {formatMoney(record.loan, { dashZero: false })} TMT
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={isPaid ? t("employee.active") : t("employee.inactive")}
                            color={isPaid ? "success" : "default"}
                            variant={isPaid ? "filled" : "outlined"}
                            sx={{
                              height: 22,
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              borderRadius: "6px",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                          {record.paid_date
                            ? formatChange(record.paid_date, { dateOnly: true })
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Button
          onClick={close}
          variant="outlined"
          color="inherit"
          sx={{
            borderRadius: "7px",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          {t("close")}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default EmployeeLoanHistoryModal;
