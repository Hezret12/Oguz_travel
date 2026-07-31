import { useMemo, createElement } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import GroupIcon from "@mui/icons-material/Group";
import { useTranslation } from "react-i18next";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ContactEmergencyRoundedIcon from "@mui/icons-material/ContactEmergencyRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import ContactEmergencyIcon from "@mui/icons-material/ContactEmergency";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import TranslateIcon from "@mui/icons-material/Translate";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import AssessmentIcon from "@mui/icons-material/Assessment";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import TurkishAirlinesIcon from "../assets/icons/turkishAirlines.svg";

export const useSidebarItems = () => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        text: t("sidebar.adminDashboard"),
        path: "/",
        icon: createElement(DashboardIcon),
        iconColor: "#3B82F6", // Sky Blue
      },
      {
        text: t("sidebar.tasks", "Tasks"),
        path: "/tasks",
        icon: createElement(AssignmentRoundedIcon),
        iconColor: "#2563EB", // TaskFlow Blue
      },
      {
        text: t("notifications.title", "Bildirişler"),
        path: "/notifications",
        icon: createElement(NotificationsActiveIcon),
        iconColor: "#14B8A6", // Teal
      },
      {
        isGroup: true,
        text: t("sidebar.employee"),
        icon: createElement(PersonRoundedIcon),
        iconColor: "#8B5CF6", // Purple
        children: [
          {
            text: t("sidebar.employees"),
            path: "/employee",
            icon: createElement(ContactEmergencyRoundedIcon),
            iconColor: "#8B5CF6",
          },
          {
            text: t("sidebar.users"),
            path: "/employee/users",
            icon: createElement(GroupIcon),
            iconColor: "#A855F7",
          },
        ],
      },
      {
        isGroup: true,
        text: t("sidebar.ticket", "Ticket"),
        icon: createElement(ConfirmationNumberRoundedIcon),
        iconColor: "#10B981", // Emerald Green
        children: [
          {
            text: t("sidebar.ticketB2B", "B2B"),
            path: "/ticket/b2b",
            icon: createElement(ConfirmationNumberRoundedIcon),
            iconColor: "#10B981",
          },
          {
            text: t("sidebar.ticketTurkishAirlines", "Turkish Airlines"),
            path: "/ticket/turkish-airlines",
            icon: createElement("img", {
              src: TurkishAirlinesIcon,
              alt: "Turkish Airlines",
              style: { width: 32, height: 30, objectFit: "contain" },
            }),
            iconColor: "#E11D48",
          },
        ],
      },
      {
        text: t("sidebar.clients"),
        icon: createElement(PeopleIcon),
        path: "/clients",
        iconColor: "#06B6D4", // Cyan
      },
      {
        isGroup: true,
        text: t("sidebar.visaApplications"),
        icon: createElement(ContactEmergencyIcon),
        iconColor: "#6366F1", // Indigo
        children: [
          {
            text: t("sidebar.visaApplications"),
            path: "/visa/applications",
            icon: createElement(ContactEmergencyIcon),
            iconColor: "#6366F1",
          },
          {
            text: t("sidebar.visa.package"),
            path: "/visa/package",
            icon: createElement(NoteAddIcon),
            iconColor: "#818CF8",
          },
        ],
      },
      {
        text: t("sidebar.referalLetters"),
        path: "/visa/referal-letters",
        icon: createElement(NoteAddIcon),
        iconColor: "#F59E0B", // Amber Gold
      },
      {
        text: t("sidebar.translation"),
        path: "/translation",
        icon: createElement(TranslateIcon),
        iconColor: "#14B8A6", // Teal
      },
      {
        text: t("outbound.title") || "Outbound",
        path: "/outbound",
        icon: createElement(FlightTakeoffIcon),
        iconColor: "#EC4899", // Pink
      },
      {
        isGroup: true,
        text: t("sidebar.reports"),
        icon: createElement(AssessmentIcon),
        iconColor: "#F97316", // Orange
        children: [
          {
            text: t("sidebar.reportTurkishAirlines"),
            path: "/reports/turkish-airlines",
            icon: createElement("img", {
              src: TurkishAirlinesIcon,
              alt: "Turkish Airlines",
              style: { width: 32, height: 30, objectFit: "contain" },
            }),
            iconColor: "#E11D48",
          },
        ],
      },
      {
        text: t("sidebar.visaIntake"),
        path: "/intake",
        icon: createElement(AssignmentRoundedIcon),
        iconColor: "#3B82F6", // Blue
      }
    ],
    [t],
  );
};

export const useNavItems = useSidebarItems;
