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
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import AlarmOffRoundedIcon from "@mui/icons-material/AlarmOffRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import HotelRoundedIcon from "@mui/icons-material/HotelRounded";
import AltRouteRoundedIcon from "@mui/icons-material/AltRouteRounded";

export const SALE_STATUS_CONFIG = {
  SALE: { label: "Sale", color: "#16a34a", icon: CheckCircleRoundedIcon },
  REISSUE: { label: "Reissue", color: "#2563eb", icon: AutorenewRoundedIcon },
  REFUND: { label: "Refund", color: "#dc2626", icon: ReplayRoundedIcon },
};

export const PAYMENT_STATUS_CONFIG = {
  TOLENDI: { label: "Tolendi", color: "#16a34a", icon: PaymentsRoundedIcon },
  KREDIT: { label: "Kredit", color: "#d97706", icon: CreditCardRoundedIcon },
  TRUE: { label: "Tölendi", color: "#16a34a", icon: PaymentsRoundedIcon },
  FALSE: { label: "Kredit", color: "#d97706", icon: CreditCardRoundedIcon },
};

export const OUTBOUND_PAYMENT_STATUS_CONFIG = {
  1: { label: "Tölendi", color: "#16a34a", icon: CheckCircleRoundedIcon },
  2: { label: "Kredit", color: "#d97706", icon: CreditCardRoundedIcon },
  3: { label: "Gaýtaryldy", color: "#dc2626", icon: ReplayRoundedIcon },
  TOLENDI: { label: "Tölendi", color: "#16a34a", icon: CheckCircleRoundedIcon },
  KREDIT: { label: "Kredit", color: "#d97706", icon: CreditCardRoundedIcon },
  GAYTARYLDY: { label: "Gaýtaryldy", color: "#dc2626", icon: ReplayRoundedIcon },
  TRUE: { label: "Tölendi", color: "#16a34a", icon: CheckCircleRoundedIcon },
  FALSE: { label: "Kredit", color: "#d97706", icon: CreditCardRoundedIcon },
};

export const TRANSLATION_STATUS_CONFIG = {
  TRUE: { label: "Gyssagly", color: "#e11d48", icon: BoltRoundedIcon },
  FALSE: { label: "Adaty", color: "#0284c7", icon: ScheduleRoundedIcon },
  "0": { label: "Gaýtaryldy", color: "#ea580c", icon: ReplayRoundedIcon },
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

export const VISA_STATUS_CONFIG = {
  PENDING: { label: "Garaşylýar", color: "#d97706", icon: ScheduleRoundedIcon },
  IN_PROGRESS: { label: "Işlenýär", color: "#2563eb", icon: AutorenewRoundedIcon },
  APPROVED: { label: "Kabul edildi", color: "#16a34a", icon: CheckCircleRoundedIcon },
  REJECTED: { label: "Ret edildi", color: "#dc2626", icon: CancelRoundedIcon },
  CANCELLED: { label: "Ýatyryldy", color: "#64748b", icon: BlockRoundedIcon },
  COMPLETED: { label: "Tamamlandy", color: "#0d9488", icon: VerifiedRoundedIcon },
};

export const CAFETERIA_TYPE_CONFIG = {
  INCOME: { label: "Girdeji", color: "#16a34a", icon: TrendingUpRoundedIcon },
  EXPENSE: { label: "Çykdajy", color: "#dc2626", icon: TrendingDownRoundedIcon },
  TRUE: { label: "Girdeji", color: "#16a34a", icon: TrendingUpRoundedIcon },
  FALSE: { label: "Çykdajy", color: "#dc2626", icon: TrendingDownRoundedIcon },
  "1": { label: "Girdeji", color: "#16a34a", icon: TrendingUpRoundedIcon },
  "0": { label: "Çykdajy", color: "#dc2626", icon: TrendingDownRoundedIcon },
};

export const PURCHASE_LOT_STATUS_CONFIG = {
  ACTIVE: { label: "Işjeň", color: "#16a34a", icon: Inventory2RoundedIcon },
  EXHAUSTED: { label: "Gutarýan / Gutardy", color: "#64748b", icon: DoneAllRoundedIcon },
  EXPIRED: { label: "Möhleti geçen", color: "#dc2626", icon: AlarmOffRoundedIcon },
  CANCELLED: { label: "Ýatyryldy", color: "#94a3b8", icon: CancelRoundedIcon },
};

export const FINANCE_TRANSACTION_TYPE_CONFIG = {
  INCOME: { label: "Girdeji", color: "#16a34a", icon: TrendingUpRoundedIcon },
  EXPENSE: { label: "Çykdajy", color: "#dc2626", icon: TrendingDownRoundedIcon },
  SUPPLIER_PAYMENT: { label: "Üpjün edijä töleg", color: "#2563eb", icon: CreditCardRoundedIcon },
  CLIENT_PAYMENT: { label: "Müşderi tölegi", color: "#0891b2", icon: PaymentsRoundedIcon },
  TRANSFER: { label: "Geçirim", color: "#7c3aed", icon: AltRouteRoundedIcon },
};

export const FINANCE_SERVICE_TYPE_CONFIG = {
  VISA_SLOT: { label: "Wiza Kwotasy", color: "#0891b2", icon: FlightRoundedIcon },
  HOTEL_ALLOTMENT: { label: "Otel Basyşy", color: "#db2777", icon: HotelRoundedIcon },
  FLIGHT_QUOTA: { label: "Uçuş Bloki", color: "#2563eb", icon: ConnectingAirportsRoundedIcon },
  TOUR_PACKAGE: { label: "Tur Bukjasy", color: "#7c3aed", icon: BusinessCenterRoundedIcon },
  TRANSFER: { label: "Transfer", color: "#ea580c", icon: WorkRoundedIcon },
};
