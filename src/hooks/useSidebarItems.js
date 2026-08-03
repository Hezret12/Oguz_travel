import { useMemo, createElement } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  CheckSquare,
  Bell,
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
} from "lucide-react";
import TurkishAirlinesIcon from "../assets/icons/turkishAirlines.svg";

export const useSidebarItems = () => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        text: t("sidebar.adminDashboard"),
        path: "/",
        icon: createElement(LayoutDashboard, { size: 20, strokeWidth: 2.2 }),
      },
      {
        text: t("sidebar.tasks"),
        path: "/tasks",
        icon: createElement(CheckSquare, { size: 20, strokeWidth: 2.2 }),
      },
      {
        text: t("sidebar.notifications"),
        path: "/notifications",
        icon: createElement(Bell, { size: 20, strokeWidth: 2.2 }),
      },
      {
        isGroup: true,
        text: t("sidebar.employee"),
        icon: createElement(UserCog, { size: 20, strokeWidth: 2.2 }),
        children: [
          {
            text: t("sidebar.employees"),
            path: "/employee",
            icon: createElement(UserCheck, { size: 18, strokeWidth: 2.2 }),
          },
          {
            text: t("sidebar.users"),
            path: "/employee/users",
            icon: createElement(Users, { size: 18, strokeWidth: 2.2 }),
          },
        ],
      },
      {
        isGroup: true,
        text: t("sidebar.ticket"),
        icon: createElement(Ticket, { size: 20, strokeWidth: 2.2 }),
        children: [
          {
            text: t("sidebar.ticketB2B"),
            path: "/ticket/b2b",
            icon: createElement(Building2, { size: 18, strokeWidth: 2.2 }),
          },
          {
            text: t("sidebar.ticketTurkishAirlines"),
            path: "/ticket/turkish-airlines",
            icon: createElement("img", {
              src: TurkishAirlinesIcon,
              alt: "Turkish Airlines",
              style: { width: 30, height: 28, objectFit: "contain" },
            }),
          },
        ],
      },
      {
        text: t("sidebar.clients"),
        icon: createElement(Contact2, { size: 20, strokeWidth: 2.2 }),
        path: "/clients",
      },
      {
        isGroup: true,
        text: t("sidebar.visaApplications"),
        icon: createElement(FileText, { size: 20, strokeWidth: 2.2 }),
        children: [
          {
            text: t("sidebar.visaApplications"),
            path: "/visa/applications",
            icon: createElement(FileText, { size: 18, strokeWidth: 2.2 }),
          },
          {
            text: t("sidebar.visa.package"),
            path: "/visa/package",
            icon: createElement(Package, { size: 18, strokeWidth: 2.2 }),
          },
        ],
      },
      {
        text: t("sidebar.translation"),
        path: "/translation",
        icon: createElement(Languages, { size: 20, strokeWidth: 2.2 }),
      },
      {
        text: t("sidebar.outbound"),
        path: "/outbound",
        icon: createElement(PlaneTakeoff, { size: 20, strokeWidth: 2.2 }),
      },
      {
        isGroup: true,
        text: t("sidebar.reports"),
        icon: createElement(BarChart3, { size: 20, strokeWidth: 2.2 }),
        children: [
          {
            text: t("sidebar.reportTurkishAirlines"),
            path: "/reports/turkish-airlines",
            icon: createElement("img", {
              src: TurkishAirlinesIcon,
              alt: "Turkish Airlines",
              style: { width: 30, height: 28, objectFit: "contain" },
            }),
          },
          {
            text: t("sidebar.referalLetters"),
            path: "/reports/referral-letter",
            icon: createElement(FileCheck, { size: 18, strokeWidth: 2.2 }),
          },
        ],
      },
      {
        text: t("sidebar.visaIntake"),
        path: "/intake",
        icon: createElement(ClipboardCheck, { size: 20, strokeWidth: 2.2 }),
      }
    ],
    [t],
  );
};

export const useNavItems = useSidebarItems;
