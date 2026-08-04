import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import FlightRoundedIcon from "@mui/icons-material/FlightRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ConnectingAirportsRoundedIcon from "@mui/icons-material/ConnectingAirportsRounded";
import FamilyRestroomRoundedIcon from "@mui/icons-material/FamilyRestroomRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

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
  TRUE: { label: "Gyssagly", color: "#e11d48", icon: BoltRoundedIcon },
  FALSE: { label: "Adaty", color: "#0284c7", icon: ScheduleRoundedIcon },
  "0": { label: "Gaýtaryldy", color: "#ea580c", icon: ReplayRoundedIcon },
  0: { label: "Gaýtaryldy", color: "#ea580c", icon: ReplayRoundedIcon },
};

export const VISA_CATEGORY_CONFIG = {
  TOURISM: { label: "Tourism", color: "#0891b2", icon: FlightRoundedIcon },
  BUSINESS: { label: "Business", color: "#7c3aed", icon: BusinessCenterRoundedIcon },
  STUDENT: { label: "Student", color: "#2563eb", icon: SchoolRoundedIcon },
  TRANSIT: { label: "Transit", color: "#64748b", icon: ConnectingAirportsRoundedIcon },
  FAMILY: { label: "Family", color: "#db2777", icon: FamilyRestroomRoundedIcon },
  WORK: { label: "Work", color: "#ea580c", icon: WorkRoundedIcon },
  MEDICAL: { label: "Medical", color: "#16a34a", icon: LocalHospitalRoundedIcon },
  "PV-1": { label: "PV-1", color: "#0284c7", icon: ScheduleRoundedIcon },
};

export const PROCESSED_STATUS_CONFIG = {
  TRUE: { label: "Işlenen", color: "#16a34a", icon: CheckCircleRoundedIcon },
  FALSE: { label: "Işlenmedik", color: "#dc2626", icon: CancelRoundedIcon },
};

export const TASK_STATUS_CONFIG = {
  1: { label: "To Do", color: "#64748b", icon: ScheduleRoundedIcon },
  2: { label: "In Progress", color: "#2563eb", icon: AutorenewRoundedIcon },
  3: { label: "Completed", color: "#16a34a", icon: CheckCircleRoundedIcon },
};

export const NOTIFICATION_STATUS_CONFIG = {
  TRUE: { label: "Okaldy", color: "#16a34a", icon: CheckCircleRoundedIcon },
  FALSE: { label: "Okalmadyk", color: "#d97706", icon: ScheduleRoundedIcon },
};

export const REFERRAL_REPORT_STATUS_CONFIG = {
  SATYLDY: { label: "Satyldy", color: "#16a34a", icon: CheckCircleRoundedIcon },
  "ZYÝAN ÝETEN": { label: "Zyýan ýeten", color: "#ea580c", icon: ScheduleRoundedIcon },
  ÝITIRILEN: { label: "Ýitirilen", color: "#dc2626", icon: CancelRoundedIcon },
  // Compatibility aliases
  "SATIS YAPILDI": { label: "Satyldy", color: "#16a34a", icon: CheckCircleRoundedIcon },
  "TÖLEG EDILDI": { label: "Satyldy", color: "#16a34a", icon: CheckCircleRoundedIcon },
  "GARAŞYLÝAR": { label: "Zyýan ýeten", color: "#ea580c", icon: ScheduleRoundedIcon },
  "ÝATYRYLDY": { label: "Ýitirilen", color: "#dc2626", icon: CancelRoundedIcon },
};