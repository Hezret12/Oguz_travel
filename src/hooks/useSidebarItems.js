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
  Building2,
  Contact2,
  FileText,
  Package,
  FileCheck,
  Languages,
  PlaneTakeoff,
  BarChart3,
  ClipboardCheck,
  UtensilsCrossed,
  Wallet,
  Boxes,
  ArrowLeftRight,
  PieChart,
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
      },
      {
        id: "tasks",
        text: t("sidebar.tasks"),
        path: PATHS.TASKS,
        icon: createElement(CheckSquare, { size: 20, strokeWidth: 2.2 }),
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
            icon: createElement(Building2, { size: 18, strokeWidth: 2.2 }),
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
        text: t("sidebar.packages", "Bukjalar"),
        path: PATHS.PACKAGES,
        icon: createElement(Package, { size: 20, strokeWidth: 2.2 }),
        alwaysVisible: true,
      },
      {
        id: "reports",
        isGroup: true,
        text: t("sidebar.reports"),
        icon: createElement(BarChart3, { size: 20, strokeWidth: 2.2 }),
        children: [
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
            text: t("sidebar.reportReferralLetter", t("sidebar.referalLetters")),
            path: PATHS.REPORTS.REFERRAL_LETTER,
            icon: createElement(FileText, { size: 18, strokeWidth: 2.2 }),
          },
        ],
      },
      {
        id: "cafeteria",
        text: t("sidebar.cafeteria"),
        path: PATHS.CAFETERIA,
        icon: createElement(UtensilsCrossed, { size: 20, strokeWidth: 2.2 }),
      },
      {
        id: "finance",
        isGroup: true,
        text: t("sidebar.finance", "Maliýe we Ammar"),
        icon: createElement(Wallet, { size: 20, strokeWidth: 2.2 }),
        alwaysVisible: true,
        children: [
          {
            id: "finance-lots",
            text: t("sidebar.financeLots", "Partiýalar we Ammar"),
            path: PATHS.FINANCE.LOTS,
            icon: createElement(Boxes, { size: 18, strokeWidth: 2.2 }),
            alwaysVisible: true,
          },
          {
            id: "finance-cash-flow",
            text: t("sidebar.cashFlow", "Pul Akymy"),
            path: PATHS.FINANCE.CASH_FLOW,
            icon: createElement(ArrowLeftRight, { size: 18, strokeWidth: 2.2 }),
            alwaysVisible: true,
          },
          {
            id: "finance-overview",
            text: t("sidebar.financeOverview", "Maliýe Hasabaty"),
            path: PATHS.FINANCE.OVERVIEW,
            icon: createElement(PieChart, { size: 18, strokeWidth: 2.2 }),
            alwaysVisible: true,
          },
        ],
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
