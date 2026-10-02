import { useMemo, createElement } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  CheckSquare,
  Bell,
  UserCircle,
  UserCog,
  UserCheck,
  Users,
  Ticket,
  TicketsPlane,
  Contact2,
  FileText,
  Package,
  FileCheck,
  Languages,
  PlaneTakeoff,
  ClipboardCheck,
  UtensilsCrossed,
  Wallet,
  ArrowLeftRight,
  LayoutGrid,
  Building,
  ChartNoAxesCombined,
  Award,
  WalletMinimal,
  MapPinHouse,
  Globe,
  Landmark,
} from "lucide-react";
import TurkishAirlinesIcon from "../assets/icons/turkishAirlines.svg";
import { PATHS } from "../routes/paths";

export const useSidebarItems = () => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        id: "dashboard",
        text: t("sidebar.adminDashboard"),
        path: PATHS.ROOT,
        icon: createElement(LayoutDashboard, { size: 20, strokeWidth: 2.2 }),
        // Shown to everyone (their own office's figures), yet still granted
        // in the access tab: the permission opens every office.
        openToAll: true,
      },
      {
        id: "tasks",
        text: t("sidebar.tasks"),
        path: PATHS.TASKS,
        icon: createElement(CheckSquare, { size: 20, strokeWidth: 2.2 }),
      },
      {
        id: "finance",
        isGroup: true,
        text: t("sidebar.finance", "Maliýe"),
        icon: createElement(Wallet, { size: 20, strokeWidth: 2.2 }),
        children: [
          {
            id: "finance-cash-flow",
            text: t("sidebar.cashFlow", "Pul Akymy"),
            path: PATHS.FINANCE.CASH_FLOW,
            icon: createElement(ArrowLeftRight, { size: 18, strokeWidth: 2.2 }),
            alwaysVisible: true,
          },
          {
            id: "finance-offices",
            text: t("sidebar.financeOffices"),
            path: PATHS.FINANCE.OFFICES,
            icon: createElement(ChartNoAxesCombined, { size: 18, strokeWidth: 2.2 }),
          },
          {
            id: "finance-office-cash",
            text: t("sidebar.officeCash"),
            path: PATHS.FINANCE.OFFICE_CASH,
            icon: createElement(Landmark, { size: 18, strokeWidth: 2.2 }),
          },
          {
            id: "finance-salary",
            text: t("sidebar.salary"),
            path: PATHS.FINANCE.SALARY,
            icon: createElement(WalletMinimal, { size: 18, strokeWidth: 2.2 }),
          },
          {
            id: "report-turkish-airlines",
            text: t("sidebar.reportTurkishAirlines"),
            path: PATHS.REPORTS.TURKISH_AIRLINES,
            icon: createElement("img", {
              src: TurkishAirlinesIcon,
              alt: "Turkish Airlines",
              style: { width: 30, height: 28, objectFit: "contain" },
            }),
          },
          {
            id: "report-referral-letter",
            text: t("sidebar.reportReferralLetter"),
            path: PATHS.REPORTS.REFERRAL_LETTER,
            icon: createElement(FileText, { size: 18, strokeWidth: 2.2 }),
          },
        ],
      },
      {
        id: "clients",
        text: t("sidebar.clients"),
        icon: createElement(Contact2, { size: 20, strokeWidth: 2.2 }),
        path: PATHS.CLIENTS,
      },
      {
        id: "visa",
        isGroup: true,
        text: t("sidebar.visaApplications"),
        icon: createElement(FileText, { size: 20, strokeWidth: 2.2 }),
        children: [
          {
            id: "visa-applications",
            text: t("sidebar.visaApplications"),
            path: PATHS.VISA.APPLICATIONS,
            icon: createElement(FileText, { size: 18, strokeWidth: 2.2 }),
          },
          {
            id: "visa-package",
            text: t("sidebar.visa.package"),
            path: PATHS.VISA.PACKAGE,
            icon: createElement(Package, { size: 18, strokeWidth: 2.2 }),
          },
        ],
      },
      {
        id: "visa-intake",
        text: t("sidebar.visaIntake"),
        path: PATHS.INTAKE,
        icon: createElement(ClipboardCheck, { size: 20, strokeWidth: 2.2 }),
      },
      {
        id: "ticket",
        isGroup: true,
        text: t("sidebar.ticket"),
        icon: createElement(Ticket, { size: 20, strokeWidth: 2.2 }),
        children: [
          {
            id: "ticket-b2b",
            text: t("sidebar.ticketB2B"),
            path: PATHS.TICKET.B2B,
            icon: createElement(TicketsPlane, { size: 18, strokeWidth: 2.2 }),
          },
          {
            id: "ticket-turkish-airlines",
            text: t("sidebar.ticketTurkishAirlines"),
            path: PATHS.TICKET.TURKISH_AIRLINES,
            icon: createElement("img", {
              src: TurkishAirlinesIcon,
              alt: "Turkish Airlines",
              style: { width: 30, height: 28, objectFit: "contain" },
            }),
          },
        ],
      },
      {
        id: "translation",
        text: t("sidebar.translation"),
        path: PATHS.TRANSLATION,
        icon: createElement(Languages, { size: 20, strokeWidth: 2.2 }),
      },
      {
        id: "professional-translation",
        isGroup: true,
        text: t("sidebar.general"),
        icon: createElement(LayoutGrid, { size: 20, strokeWidth: 2.2 }),
        children: [
          {
            id: "pt-office",
            text: t("sidebar.office"),
            path: PATHS.PROFESSIONAL_TRANSLATION.OFFICE,
            icon: createElement(MapPinHouse, { size: 18, strokeWidth: 2.2 }),
          },
          {
            id: "pt-department",
            text: t("sidebar.department"),
            path: PATHS.PROFESSIONAL_TRANSLATION.DEPARTMENT,
            icon: createElement(Building, { size: 18, strokeWidth: 2.2 }),
          },
          {
            id: "pt-position",
            text: t("sidebar.position"),
            path: PATHS.PROFESSIONAL_TRANSLATION.POSITION,
            icon: createElement(Award, { size: 18, strokeWidth: 2.2 }),
          },
          {
            id: "pt-translator",
            text: t("sidebar.translator"),
            path: PATHS.PROFESSIONAL_TRANSLATION.TRANSLATOR,
            icon: createElement(Languages, { size: 18, strokeWidth: 2.2 }),
          },
          {
            id: "pt-referral-country",
            text: t("sidebar.referralCountry"),
            path: PATHS.PROFESSIONAL_TRANSLATION.REFERRAL_COUNTRY,
            icon: createElement(Globe, { size: 18, strokeWidth: 2.2 }),
          },
        ],
      },
      {
        id: "referal-letters",
        text: t("sidebar.referalLetters"),
        path: PATHS.REFERRAL_LETTERS,
        icon: createElement(FileCheck, { size: 20, strokeWidth: 2.2 }),
      },
      {
        id: "outbound",
        text: t("sidebar.outbound"),
        path: PATHS.OUTBOUND,
        icon: createElement(PlaneTakeoff, { size: 20, strokeWidth: 2.2 }),
      },
      {
        id: "packages",
        text: t("sidebar.packages"),
        path: PATHS.PACKAGES,
        icon: createElement(Package, { size: 20, strokeWidth: 2.2 }),
        alwaysVisible: true,
      },
      {
        id: "cafeteria",
        text: t("sidebar.cafeteria"),
        path: PATHS.CAFETERIA,
        icon: createElement(UtensilsCrossed, { size: 20, strokeWidth: 2.2 }),
      },
      {
        id: "employee",
        isGroup: true,
        text: t("sidebar.employee"),
        icon: createElement(UserCog, { size: 20, strokeWidth: 2.2 }),
        children: [
          {
            id: "employees",
            text: t("sidebar.employees"),
            path: PATHS.EMPLOYEE.EMPLOYEES,
            icon: createElement(UserCheck, { size: 18, strokeWidth: 2.2 }),
          },
          {
            id: "users",
            text: t("sidebar.users"),
            path: PATHS.EMPLOYEE.USERS,
            icon: createElement(Users, { size: 18, strokeWidth: 2.2 }),
          },
        ],
      },
      {
        id: "notifications",
        text: t("sidebar.notifications"),
        path: PATHS.NOTIFICATIONS,
        icon: createElement(Bell, { size: 20, strokeWidth: 2.2 }),
      },
      {
        id: "profile",
        text: t("sidebar.profile"),
        path: PATHS.PROFILE,
        icon: createElement(UserCircle, { size: 20, strokeWidth: 2.2 }),
      },
    ],
    [t],
  );
};

export const useNavItems = useSidebarItems;
