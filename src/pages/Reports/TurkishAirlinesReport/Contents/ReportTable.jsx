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
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import { useLocale } from "../../../../hooks/useLocale";
import ExportExcelButton from "../../../../components/ExportExcelButton";

const ReportTable = ({
  isLoading,
  offices = [],
  rows = [],
  footer = [],
  grandTotal = {},
  findFooter,
  formatNumber,
  daysInMonth,
  onExportExcel,
  teal,
  accent,
  green,
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

  const stickyShadow = isDark
    ? "inset 4px 0 6px -4px rgba(0,0,0,0.5)"
    : "inset 4px 0 6px -4px rgba(0,0,0,0.1)";
  const stickyShadowRight = isDark
    ? "inset -4px 0 6px -4px rgba(0,0,0,0.5)"
    : "inset -4px 0 6px -4px rgba(0,0,0,0.1)";

  return (
    <Paper sx={{ ...paperSx, p: 0, overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2.5,
          py: 2,
          borderBottom: `1px solid ${borderCol}`,
          background: isDark
            ? "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, transparent 100%)"
            : "linear-gradient(135deg, rgba(16,185,129,0.04) 0%, transparent 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              backgroundColor: alpha(green, 0.12),
              color: green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${alpha(green, 0.15)}`,
            }}
          >
            <AccountBalanceWalletRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: isDark ? "#FFF" : "#0F172A" }}
          >
            {t("report.turkishAirlines.dailyReportTable")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: isDark ? "rgba(255,255,255,0.4)" : "#64748B",
              fontWeight: 600,
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9",
            }}
          >
            {daysInMonth} {t("report.turkishAirlines.daysData")}
          </Typography>

          {onExportExcel && (
            <ExportExcelButton
              size="small"
              onClick={onExportExcel}
            />
          )}
        </Box>
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
                    boxShadow: stickyShadow,
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
                    boxShadow: stickyShadowRight,
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
                    <Typography
                      variant="body2"
                      sx={{
                        color: isDark ? "rgba(255,255,255,0.5)" : "#64748B",
                        fontWeight: 600,
                      }}
                    >
                      {t("noData")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => {
                  const isEven = idx % 2 === 1;
                  const rowBg = isEven
                    ? isDark
                      ? "rgba(255,255,255,0.015)"
                      : "#F8FAFC"
                    : "transparent";
                  const stickyBg = isEven
                    ? isDark
                      ? "#021721"
                      : "#F8FAFC"
                    : bgSticky;

                  return (
                    <TableRow
                      key={row.day}
                      sx={{
                        backgroundColor: rowBg,
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
                          backgroundColor: stickyBg,
                          boxShadow: stickyShadow,
                        }}
                      >
                        {row.day}
                      </TableCell>
                      {offices.map(({ short }) => {
                        const cellVal = row[short];
                        if (!cellVal) {
                          return (
                            <TableCell key={short} align="center" sx={bodyCellSx}>
                              <Typography
                                component="span"
                                sx={{
                                  color: isDark
                                    ? "rgba(255,255,255,0.15)"
                                    : "#CBD5E1",
                                }}
                              >
                                —
                              </Typography>
                            </TableCell>
                          );
                        }
                        const quoted =
                          typeof cellVal === "object"
                            ? cellVal.quoted
                            : Number(cellVal) || 0;
                        const base =
                          typeof cellVal === "object" ? cellVal.base : 0;

                        return (
                          <TableCell key={short} align="center" sx={bodyCellSx}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 0.5,
                                whiteSpace: "nowrap",
                              }}
                            >
                              <Typography
                                component="span"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: 13,
                                  lineHeight: 1.2,
                                  color: isDark ? "rgba(255,255,255,0.9)" : "#1E293B",
                                }}
                              >
                                {quoted > 0 ? formatNumber(quoted) : "0"}
                              </Typography>
                              {base > 0 && (
                                <>
                                  <Typography
                                    component="span"
                                    sx={{
                                      fontSize: 11,
                                      color: isDark
                                        ? "rgba(255,255,255,0.2)"
                                        : "#CBD5E1",
                                      fontWeight: 400,
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    |
                                  </Typography>
                                  <Typography
                                    component="span"
                                    sx={{
                                      fontSize: 12,
                                      color: "#EF4444",
                                      fontWeight: 600,
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {formatNumber(base)}
                                  </Typography>
                                </>
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
                          backgroundColor: stickyBg,
                          boxShadow: stickyShadowRight,
                        }}
                      >
                        {row.total > 0 ? formatNumber(row.total) : "0"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}

              {footer.length > 0 && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={offices.length + 2}
                      sx={{
                        py: 1.2,
                        borderBottom: "none",
                        backgroundColor: isDark
                          ? "rgba(20,184,166,0.06)"
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
                        boxShadow: stickyShadow,
                      }}
                    >
                      {t("report.turkishAirlines.baseFare")}
                    </TableCell>
                    {offices.map(({ short }) => {
                      const f = findFooter(short);
                      return (
                        <TableCell
                          key={short}
                          align="center"
                          sx={{ ...footerCellSx, color: "#EF4444" }}
                        >
                          {f ? formatNumber(f.total_base) : "—"}
                        </TableCell>
                      );
                    })}
                    <TableCell
                      align="right"
                      sx={{
                        ...footerCellSx,
                        color: "#EF4444",
                        position: "sticky",
                        right: 0,
                        zIndex: 1,
                        backgroundColor: isDark ? "#042533" : "#F0FDF4",
                        boxShadow: stickyShadowRight,
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
                        boxShadow: stickyShadow,
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
                        boxShadow: stickyShadowRight,
                      }}
                    >
                      {formatNumber(grandTotal.month_total_quoted)}
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
                        boxShadow: stickyShadow,
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
                        color: green,
                        fontWeight: 700,
                        fontSize: 13.5,
                        position: "sticky",
                        right: 0,
                        zIndex: 1,
                        backgroundColor: isDark ? "#042533" : "#F0FDF4",
                        boxShadow: stickyShadowRight,
                      }}
                    >
                      100%
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
