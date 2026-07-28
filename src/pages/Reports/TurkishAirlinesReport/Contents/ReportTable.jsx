import { memo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  useTheme,
} from "@mui/material";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import { useLocale } from "../../../../hooks/useLocale";

const ReportTable = ({
  isLoading,
  offices,
  rows,
  footer,
  grandTotal,
  findFooter,
  formatNumber,
  daysInMonth,
  teal,
  accent,
  green,
  orange,
  borderCol,
  paperSx,
  headerCellSx,
  bodyCellSx,
  footerCellSx,
  bgHeader,
  bgSticky,
}) => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Paper sx={paperSx}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2.5,
          py: 2,
          borderBottom: `1px solid ${borderCol}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <AccountBalanceWalletRoundedIcon sx={{ color: green, fontSize: 22 }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: isDark ? "#FFF" : "#0F172A" }}
          >
            {t("report.turkishAirlines.dailyReportTable")}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748B" }}
        >
          {daysInMonth} {t("report.turkishAirlines.daysData")}
        </Typography>
      </Box>

      <TableContainer sx={{ overflowX: "auto" }}>
        {isLoading ? (
          <Box sx={{ p: 3 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={38}
                sx={{ mb: 1, borderRadius: 1 }}
              />
            ))}
          </Box>
        ) : (
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    ...headerCellSx,
                    position: "sticky",
                    left: 0,
                    zIndex: 3,
                    backgroundColor: bgHeader,
                    width: 48,
                    minWidth: 48,
                    px: 1,
                  }}
                >
                  {t("report.turkishAirlines.day")}
                </TableCell>
                {offices.map(({ short, full }) => (
                  <TableCell
                    key={short}
                    align="center"
                    sx={{ ...headerCellSx, minWidth: 95 }}
                  >
                    {full || short}
                  </TableCell>
                ))}
                <TableCell
                  align="right"
                  sx={{
                    ...headerCellSx,
                    color: green,
                    position: "sticky",
                    right: 0,
                    zIndex: 3,
                    backgroundColor: bgHeader,
                    minWidth: 110,
                  }}
                >
                  {t("report.turkishAirlines.total")}
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {offices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={offices.length + 2} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748B", fontWeight: 600 }}>
                      {t("noData")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow
                    key={row.day}
                    sx={{
                      backgroundColor:
                        idx % 2 === 1
                          ? isDark
                            ? "rgba(255,255,255,0.015)"
                            : "#F8FAFC"
                          : "transparent",
                      "&:hover": {
                        backgroundColor: isDark
                          ? "rgba(20,184,166,0.08)"
                          : "rgba(14,133,132,0.05)",
                      },
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <TableCell
                      align="center"
                      sx={{
                        ...bodyCellSx,
                        fontWeight: 700,
                        color: teal,
                        fontSize: 13.5,
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        width: 48,
                        minWidth: 48,
                        px: 1,
                        backgroundColor:
                          idx % 2 === 1
                            ? isDark
                              ? "#021721"
                              : "#F8FAFC"
                            : bgSticky,
                      }}
                    >
                      {row.day}
                    </TableCell>
                    {offices.map(({ short }) => {
                      const cellVal = row[short];
                      if (!cellVal) {
                        return (
                          <TableCell key={short} align="center" sx={bodyCellSx}>
                            —
                          </TableCell>
                        );
                      }
                      const quoted = typeof cellVal === "object" ? cellVal.quoted : Number(cellVal) || 0;
                      const base = typeof cellVal === "object" ? cellVal.base : 0;

                      return (
                        <TableCell key={short} align="center" sx={bodyCellSx}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "baseline",
                              justifyContent: "center",
                              gap: 0.6,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}
                            >
                              {quoted > 0 ? formatNumber(quoted) : "0"}
                            </Typography>
                            {base > 0 && (
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: 11,
                                  color: isDark ? "rgba(255,255,255,0.45)" : "#64748B",
                                  fontWeight: 500,
                                }}
                              >
                                ({formatNumber(base)})
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      );
                    })}
                    <TableCell
                      align="right"
                      sx={{
                        ...bodyCellSx,
                        fontWeight: 700,
                        color:
                          row.total > 0
                            ? green
                            : isDark
                              ? "rgba(255,255,255,0.2)"
                              : "#CBD5E1",
                        fontSize: 13.5,
                        position: "sticky",
                        right: 0,
                        zIndex: 1,
                        backgroundColor:
                          idx % 2 === 1
                            ? isDark
                              ? "#021721"
                              : "#F8FAFC"
                            : bgSticky,
                      }}
                    >
                      {row.total > 0 ? formatNumber(row.total) : "0"}
                    </TableCell>
                  </TableRow>
                ))
              )}

              {/* ── Summary Footer Rows ── */}
              {footer.length > 0 && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={offices.length + 2}
                      sx={{
                        py: 1,
                        borderBottom: "none",
                        backgroundColor: isDark
                          ? "rgba(20,184,166,0.04)"
                          : "#F1F5F9",
                      }}
                    >
                      <Typography
                        variant="overline"
                        sx={{
                          fontWeight: 800,
                          color: teal,
                          letterSpacing: "0.08em",
                          px: 1,
                        }}
                      >
                        {t("report.turkishAirlines.totalSummary")}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  {/* Base Fare */}
                  <TableRow>
                    <TableCell
                      sx={{
                        ...footerCellSx,
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        backgroundColor: isDark ? "#042533" : "#F0FDF4",
                      }}
                    >
                      {t("report.turkishAirlines.baseFare")}
                    </TableCell>
                    {offices.map(({ short }) => {
                      const f = findFooter(short);
                      return (
                        <TableCell key={short} align="center" sx={footerCellSx}>
                          {f ? formatNumber(f.total_base) : "—"}
                        </TableCell>
                      );
                    })}
                    <TableCell
                      align="right"
                      sx={{
                        ...footerCellSx,
                        color: green,
                        position: "sticky",
                        right: 0,
                        zIndex: 1,
                        backgroundColor: isDark ? "#042533" : "#F0FDF4",
                      }}
                    >
                      {formatNumber(grandTotal.month_total_base)}
                    </TableCell>
                  </TableRow>

                  {/* Quoted Price */}
                  <TableRow>
                    <TableCell
                      sx={{
                        ...footerCellSx,
                        borderTop: "none",
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        backgroundColor: isDark ? "#042533" : "#F0FDF4",
                      }}
                    >
                      {t("report.turkishAirlines.quotedPrice")}
                    </TableCell>
                    {offices.map(({ short }) => {
                      const f = findFooter(short);
                      return (
                        <TableCell
                          key={short}
                          align="center"
                          sx={{ ...footerCellSx, borderTop: "none" }}
                        >
                          {f ? formatNumber(f.total_quoted) : "—"}
                        </TableCell>
                      );
                    })}
                    <TableCell
                      align="right"
                      sx={{
                        ...footerCellSx,
                        borderTop: "none",
                        color: green,
                        position: "sticky",
                        right: 0,
                        zIndex: 1,
                        backgroundColor: isDark ? "#042533" : "#F0FDF4",
                      }}
                    >
                      {formatNumber(grandTotal.month_total_quoted)}
                    </TableCell>
                  </TableRow>

                  {/* Profit */}
                  <TableRow>
                    <TableCell
                      sx={{
                        ...footerCellSx,
                        borderTop: "none",
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        backgroundColor: isDark ? "#042533" : "#F0FDF4",
                      }}
                    >
                      {t("report.turkishAirlines.profit")}
                    </TableCell>
                    {offices.map(({ short }) => {
                      const f = findFooter(short);
                      return (
                        <TableCell
                          key={short}
                          align="center"
                          sx={{
                            ...footerCellSx,
                            borderTop: "none",
                            color: orange,
                          }}
                        >
                          {f ? formatNumber(f.profit) : "—"}
                        </TableCell>
                      );
                    })}
                    <TableCell
                      align="right"
                      sx={{
                        ...footerCellSx,
                        borderTop: "none",
                        color: green,
                        fontSize: 14,
                        position: "sticky",
                        right: 0,
                        zIndex: 1,
                        backgroundColor: isDark ? "#042533" : "#F0FDF4",
                      }}
                    >
                      {formatNumber(grandTotal.month_profit)}
                    </TableCell>
                  </TableRow>

                  {/* Percentage */}
                  <TableRow>
                    <TableCell
                      sx={{
                        ...footerCellSx,
                        borderTop: "none",
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        backgroundColor: isDark ? "#042533" : "#F0FDF4",
                      }}
                    >
                      {t("report.turkishAirlines.percentage")}
                    </TableCell>
                    {offices.map(({ short }) => {
                      const f = findFooter(short);
                      return (
                        <TableCell
                          key={short}
                          align="center"
                          sx={{
                            ...footerCellSx,
                            borderTop: "none",
                            color: accent,
                            fontSize: 12,
                          }}
                        >
                          {f ? f.percentage : "—"}
                        </TableCell>
                      );
                    })}
                    <TableCell
                      align="right"
                      sx={{
                        ...footerCellSx,
                        borderTop: "none",
                        position: "sticky",
                        right: 0,
                        zIndex: 1,
                        backgroundColor: isDark ? "#042533" : "#F0FDF4",
                      }}
                    >
                      {grandTotal.working_days_count != null && (
                        <Typography
                          component="span"
                          sx={{
                            fontSize: 11.5,
                            color: isDark
                              ? "rgba(255,255,255,0.6)"
                              : "#475569",
                            fontWeight: 600,
                          }}
                        >
                          {t("report.turkishAirlines.workingDays")}:
                          {grandTotal.working_days_count}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Paper>
  );
};

export default memo(ReportTable);
