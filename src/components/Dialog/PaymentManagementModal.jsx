import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Grid,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputAdornment,
  TextField,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { CustomDialog } from "./CustomDialog";

// Helper to format currency
const formatCurrency = (val) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
};

// Helper to format date for Turkmen display (dd.mm.yyyy)
const formatDateToDisplay = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateStr;
};

export const PaymentManagementModal = ({ open, onClose, row }) => {
  const ticket = row?.original;
  const clientName = ticket?.clientId || "Client";

  // Check if payment type is credit
  const isCredit =
    ticket?.payment_types === "credit" ||
    ticket?.payment_status?.toLowerCase() === "kredit";

  // State to manage payments list for this ticket
  const [payments, setPayments] = useState([]);

  // Form states
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("2026-07-11");
  const [method, setMethod] = useState("Nagt");
  const [description, setDescription] = useState("");

  // Initialize mock payments based on ticket ID to match screenshot
  useEffect(() => {
    if (open && ticket) {
      if (ticket.id === "1" || ticket.ticketNo === "TB-001") {
        setPayments([
          {
            id: "p1",
            amount: 200,
            date: "2026-11-26",
            method: "Nagt",
            description: "Ilkinji toleg",
          },
          {
            id: "p2",
            amount: 123,
            date: "2026-07-11",
            method: "Nagt",
            description: "test",
          },
        ]);
      } else if (isCredit) {
        // Default empty or starter payment for other credit tickets
        setPayments([]);
      }
    }
  }, [open, ticket, isCredit]);

  if (!ticket) return null;

  // Calculations
  const salesTotal = Number(ticket.saleFare || 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const remaining = salesTotal - totalPaid;

  const creditLimit = 1000; // Mock limit
  const availableCredit = creditLimit - remaining;

  // Handle adding payment
  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const newPayment = {
      id: `p-${Date.now()}`,
      amount: Number(amount),
      date: paymentDate,
      method: method,
      description: description.trim(),
    };

    setPayments((prev) => [...prev, newPayment]);
    setAmount("");
    setDescription("");
  };

  // Handle deleting payment
  const handleDeletePayment = (id) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <CustomDialog widthX={700} open={open} close={onClose}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Payment for B2B Client: {clientName}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Payment Management Dashboard
          </Typography>
        </Box>
        {isCredit && (
          <Chip
            label="Credit"
            color="error"
            variant="outlined"
            sx={{
              borderRadius: "16px",
              fontWeight: 600,
              fontSize: "0.85rem",
              px: 0.5,
            }}
          />
        )}
      </Box>

      {isCredit ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Summary Cards Section */}
          <Box
            sx={(theme) => ({
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.02)",
              borderRadius: "12px",
              p: 2.5,
              border: `1px solid ${theme.palette.divider}`,
            })}
          >
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Satyş baha (Sales Total)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {formatCurrency(salesTotal)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Jemi tolendi (Total Paid)
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#16a34a", mt: 0.5 }}
                >
                  {formatCurrency(totalPaid)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Galdy (Remaining)
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#ef4444", mt: 0.5 }}
                >
                  {formatCurrency(remaining)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* B2B Credit Details Row */}
          <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Credit Limit
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {formatCurrency(creditLimit)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Available Credit
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: "primary.main" }}>
                {formatCurrency(availableCredit)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Account Status
              </Typography>
              <Box sx={{ mt: 0.25 }}>
                <Chip
                  label="Active"
                  color="success"
                  size="small"
                  sx={{
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    height: "22px",
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Payments History List */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Tolegler (Payments History)
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {payments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                  Toleg ýok (No payments history)
                </Typography>
              ) : (
                payments.map((p) => (
                  <Card
                    key={p.id}
                    variant="outlined"
                    sx={(theme) => ({
                      borderRadius: "8px",
                      borderColor: theme.palette.divider,
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.01)"
                          : "rgba(0,0,0,0.005)",
                    })}
                  >
                    <CardContent
                      sx={{
                        p: "12px 16px !important",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {formatCurrency(p.amount)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {formatDateToDisplay(p.date)} • {p.method}{p.description ? ` • ${p.description}` : ""}
                        </Typography>
                      </Box>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeletePayment(p.id)}
                        sx={{
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                          backgroundColor: "rgba(239, 68, 68, 0.05)",
                          "&:hover": {
                            backgroundColor: "rgba(239, 68, 68, 0.12)",
                            borderColor: "error.main",
                          },
                        }}
                      >
                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Box>

          <Divider />

          {/* Create Payment Form */}
          <Box component="form" onSubmit={handleAddPayment}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Toleg goş (Add Payment)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, fontSize: "0.875rem" }}>
                  Mukdar (Amount)
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "7px",
                      height: "44px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, fontSize: "0.875rem" }}>
                  paymentDate
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarTodayIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "7px",
                      height: "44px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, fontSize: "0.875rem" }}>
                  Usul (Method)
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    sx={{
                      borderRadius: "7px",
                      height: "44px",
                    }}
                  >
                    <MenuItem value="Nagt">Nagt (Cash)</MenuItem>
                    <MenuItem value="Karta">Karta (Card)</MenuItem>
                    <MenuItem value="Hasap">Hasap (Account)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, fontSize: "0.875rem" }}>
                  Bellik (Description)
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Bellik"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "7px",
                      height: "44px",
                    },
                  }}
                />
              </Grid>
            </Grid>

            {/* Bottom Actions */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3.5 }}>
              <Button
                variant="text"
                onClick={onClose}
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  px: 3,
                  textTransform: "none",
                }}
              >
                Ýap (Close)
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={!amount || Number(amount) <= 0}
                sx={{
                  borderRadius: "7px",
                  fontWeight: 600,
                  px: 3,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                  },
                }}
              >
                Toleg goş (Add Payment)
              </Button>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            This ticket is fully paid or not a credit transaction (Payment Status:{" "}
            {ticket.payment_status || "Unknown"}).
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                borderRadius: "7px",
                fontWeight: 600,
                px: 3,
                textTransform: "none",
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      )}
    </CustomDialog>
  );
};
