import { Grid } from "@mui/material";
import CustomDatePicker from "../../components/CustomDatePicker";
import CustomTextField from "../../components/CustomTextField";
import GlobalEmployeeAutocomplete from "../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import { formatExcelDate } from "../../functions/excelExportHelper";
import { formatYhNumber } from "../../functions/yhNumber";
export { exportReferralLetterExcel } from "./functions/exportReferralLetterExcel";

export const REFERRAL_LETTER_EXCEL_BANNER =
  'OGUZABAT Hojalyk Jemgyýetiniň "OGUZTRAVEL" syýahatçylyk bölümi tarapyndan daşary ýurtlara ugradylan syýahatçylar baradaky hasabat';

export const REFERRAL_LETTER_EXCEL_RIGHT_HEADER = "";

export const REFERRAL_LETTER_EXCEL_DEFAULT_VALUES = {
  departure_date_from: null,
  departure_date_to: null,
  contract_date_from: null,
  contract_date_to: null,
  destination_country: "",
  received_opr_guid: null,
};

export const renderReferralLetterFilterFields = ({ control }) => (
  <>
    <Grid size={{ xs: 12, sm: 6 }}>
      <CustomDatePicker
        name="departure_date_from"
        control={control}
        label="Gidiş senesi (Başlangyç)"
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <CustomDatePicker
        name="departure_date_to"
        control={control}
        label="Gidiş senesi (Soňky)"
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6 }}>
      <CustomDatePicker
        name="contract_date_from"
        control={control}
        label="Şertnama senesi (Başlangyç)"
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <CustomDatePicker
        name="contract_date_to"
        control={control}
        label="Şertnama senesi (Soňky)"
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6 }}>
      <CustomTextField
        name="destination_country"
        control={control}
        label="Gidýän ýurdy"
        placeholder="Meselem: Türkiýe, Özbegistan"
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6 }}>
      <GlobalEmployeeAutocomplete
        name="received_opr_guid"
        control={control}
        label="Operator"
      />
    </Grid>
  </>
);

export const REFERRAL_LETTER_EXCEL_COLUMNS = [
  {
    header: "T/b",
    width: 6,
    align: "center",
    accessor: (_row, index) => index + 1,
  },
  {
    header: "Arza №",
    width: 10,
    align: "center",
    accessor: (row) => row.application_number || "",
  },
  {
    header: "Ofis",
    width: 8,
    align: "center",
    accessor: () => "",
  },
  {
    header: "Syýahatçynyň F.A.A.",
    width: 32,
    align: "left",
    accessor: (row) => row.client?.fullName || row.fullName || "",
  },
  {
    header: "Jynsy",
    width: 9,
    align: "center",
    accessor: (row) => {
      const g = row.client?.gender;
      if (g === "Male" || g === "erkek" || g === "Erkek") return "erkek";
      if (g === "Female" || g === "aýal" || g === "Aýal" || g === "ayal") return "aýal";
      return g || "";
    },
  },
  {
    header: "Doglan senesi",
    width: 14,
    align: "center",
    accessor: (row) => formatExcelDate(row.client?.dateOfBirth),
  },
  {
    header: "Passport №",
    width: 14,
    align: "center",
    accessor: (row) => row.client?.passport_number || "",
  },
  {
    header: "Gidýän ýurdy",
    width: 16,
    align: "center",
    accessor: (row) => row.destination_country || "",
  },
  {
    header: "BGN Gidiş",
    width: 14,
    align: "center",
    accessor: (row) => row.bgn_departure || row.tranzit || "",
  },
  {
    header: "S-ÝH №",
    width: 13,
    align: "center",
    accessor: (row) => formatYhNumber(row.travel_document_number),
  },
  {
    header: "Gidiş wagty",
    width: 13,
    align: "center",
    accessor: (row) => formatExcelDate(row.departure_date),
  },
  {
    header: "Gelýän wagty",
    width: 13,
    align: "center",
    accessor: (row) => formatExcelDate(row.return_date),
  },
  {
    header: "Bahasy (TMT)",
    width: 15,
    align: "center",
    accessor: (row) => {
      if (row.price == null) return "";
      const val = Number(row.price).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `${val} ${row.currency || "TMT"}`;
    },
  },
  {
    header: "Operator",
    width: 14,
    align: "center",
    accessor: () => "Oguzabat",
  },
  {
    header: "AGENT",
    width: 12,
    align: "center",
    accessor: (row) => row.agent?.name || (typeof row.agent === "string" ? row.agent : ""),
  },
  {
    header: "Şertnama №",
    width: 14,
    align: "center",
    accessor: (row) => row.contract_number || "",
  },
  {
    header: "Şertnama sene",
    width: 14,
    align: "center",
    accessor: (row) => formatExcelDate(row.contract_date),
  },
];
