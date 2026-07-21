import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";

export const SALE_STATUS_CONFIG = {
  SALE: { label: "Sale", color: "#16a34a", icon: CheckCircleRoundedIcon },
  REISSUE: { label: "Reissue", color: "#2563eb", icon: AutorenewRoundedIcon },
  REFUND: { label: "Refund", color: "#dc2626", icon: ReplayRoundedIcon },
};

export const PAYMENT_STATUS_CONFIG = {
  TOLENDI: { label: "Tolendi", color: "#16a34a", icon: PaymentsRoundedIcon },
  KREDIT: { label: "Kredit", color: "#d97706", icon: CreditCardRoundedIcon },
};

export const TRANSLATION_STATUS_CONFIG = {
  TRUE: { label: "Gyssagly", color: "#dc2626", icon: BoltRoundedIcon },
  FALSE: { label: "Adaty", color: "#2563eb", icon: ScheduleRoundedIcon },
  "0": { label: "Gaýtaryldy", color: "#d97706", icon: ReplayRoundedIcon },
  0: { label: "Gaýtaryldy", color: "#d97706", icon: ReplayRoundedIcon },
};