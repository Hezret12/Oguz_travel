import { useMemo, createElement } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupIcon from "@mui/icons-material/Group";
import { useTranslation } from "react-i18next";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ContactEmergencyRoundedIcon from "@mui/icons-material/ContactEmergencyRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import FlightRoundedIcon from "@mui/icons-material/FlightRounded";
import ContactEmergencyIcon from "@mui/icons-material/ContactEmergency";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
export const useSidebarItems = () => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        text: t("sidebar.adminDashboard"),
        path: "/",
        icon: createElement(DashboardIcon),
      },
      {
        isGroup: true,
        text: t("sidebar.employee"),
        icon: createElement(PersonRoundedIcon),
        children: [
          {
            text: t("sidebar.employees"),
            path: "/employee",
            icon: createElement(ContactEmergencyRoundedIcon),
          },
          {
            text: t("sidebar.users"),
            path: "/employee/users",
            icon: createElement(GroupIcon),
          },
        ],
      },
      {
        isGroup: true,
        text: t("sidebar.ticket", "Ticket"),
        icon: createElement(ConfirmationNumberRoundedIcon),
        children: [
          {
            text: t("sidebar.ticketB2B", "B2B"),
            path: "/ticket/b2b",
            icon: createElement(ConfirmationNumberRoundedIcon),
          },
          {
            text: t("sidebar.ticketTurkishAirlines", "Turkish Airlines"),
            path: "/ticket/turkish-airlines",
            icon: createElement(FlightRoundedIcon),
          },
        ],
      },
      {
        text: t("sidebar.clients"),
        icon: createElement(PeopleIcon),
        path: "/clients"
      },
      {
        isGroup: true,
        text: t("sidebar.visaApplications"),
        icon: createElement(ContactEmergencyIcon),
        children: [
          {
            text: t("sidebar.visaApplications"),
            path: "/visa/applications",
            icon: createElement(ContactEmergencyIcon),
          },
          {
            text: t("sidebar.referalLetters"),
            path: "/visa/referal-letters",
            icon: createElement(NoteAddIcon),
          },
        ],
      },
      {
        text: t("sidebar.settings"),
        path: "/settings",
        icon: createElement(SettingsIcon),
      },
    ],
    [t],
  );
};

export const useNavItems = useSidebarItems;
