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
            Günlük Detaylı Hasabat Jedveli
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: isDark ? "rgba(255,255,255,0.4)" : "#64748B" }}
        >
          {daysInMonth} Günlük Veri
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
                  sx={{
                    ...headerCellSx,
                    position: "sticky",
                    left: 0,
                    zIndex: 3,
                    backgroundColor: bgHeader,
                    minWidth: 60,
                  }}
                >
                  {t("report.turkishAirlines.day")}
                </TableCell>
                {offices.map(({ short }) => (
                  <TableCell
                    key={short}
                    align="center"
                    sx={{ ...headerCellSx, minWidth: 90 }}
                  >
                    {short}
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
              {rows.map((row, idx) => (
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
                    sx={{
                      ...bodyCellSx,
                      fontWeight: 700,
                      color: teal,
                      fontSize: 13.5,
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
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
                  {offices.map(({ short }) => (
                    <TableCell
                      key={short}
                      align="center"
                      sx={{
                        ...bodyCellSx,
                        color:
                          row[short] !== null
                            ? isDark
                              ? "rgba(255,255,255,0.9)"
                              : "#1E293B"
                            : isDark
                            ? "rgba(255,255,255,0.18)"
                            : "#CBD5E1",
                      }}
                    >
                      {row[short] !== null ? formatNumber(row[short]) : "—"}
                    </TableCell>
                  ))}
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
              ))}

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
                        JEMI JEMLEME
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
                          {t("report.turkishAirlines.workingDays")}:{" "}
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
