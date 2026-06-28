import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { TURKMEN_MOBILE_DIGITS_REGEX } from "../utils/phone";

export const useValidSchema = () => {
  const { t: tLogin } = useTranslation();

  const loginValidSchema = yup.object({
    phone: yup
      .string()
      .required(tLogin("login.phoneNumberRequired"))
      .length(8, tLogin("login.phoneNumberLength"))
      .matches(TURKMEN_MOBILE_DIGITS_REGEX, tLogin("login.phoneNumberInvalid")),
    password: yup
      .string()
      .required(tLogin("login.passwordRequired"))
      .min(6, tLogin("login.passwordTooShort"))
      .max(20, tLogin("login.passwordMaxLength")),
  });

  const addEmployee = yup.object({
    fullName: yup.string().required(tLogin("employee.fullNameRequired")),
    phoneNumber: yup
      .string()
      .required(tLogin("employee.phoneNumberRequired"))
      .length(8, tLogin("employee.phoneNumberLength"))
      .matches(
        TURKMEN_MOBILE_DIGITS_REGEX,
        tLogin("employee.phoneNumberInvalid"),
      ),
  });

  const addClient = yup.object({
    fullName: yup.string().required(tLogin("clients.validation.fullNameRequired", "Full name is required")),
    phoneNumber: yup
      .string()
      .required(tLogin("clients.validation.phoneNumberRequired", "Phone number is required"))
      .length(8, tLogin("clients.validation.phoneNumberLength", "Phone number must be exactly 8 digits"))
      .matches(
        TURKMEN_MOBILE_DIGITS_REGEX,
        tLogin("clients.validation.phoneNumberInvalid", "Invalid phone number"),
      ),
    dateOfBirth: yup.string().required(tLogin("clients.validation.dateOfBirthRequired", "Date of birth is required")),
    passportNumber: yup.string().required(tLogin("clients.validation.passportNumberRequired", "Passport number is required")),
    passportExpiryDate: yup
      .string()
      .required(tLogin("clients.validation.passportExpiryDateRequired", "Passport expiry date is required")),
    passportCountryOfIssue: yup
      .string()
      .required(tLogin("clients.validation.passportCountryOfIssueRequired", "Passport country of issue is required")),
    gender: yup.string().required(tLogin("clients.validation.genderRequired", "Gender is required")),
  });

  const addB2BTicket = yup.object({
    clientId: yup.string().required(tLogin("ticket.b2b.validation.clientRequired", "Client is required")),
    issueDate: yup.string().required(tLogin("ticket.b2b.validation.issueDateRequired", "Issue date is required")),
    operator: yup.string().required(tLogin("ticket.b2b.validation.operatorRequired", "Operator is required")),
    office: yup.string().required(tLogin("ticket.b2b.validation.officeRequired", "Office is required")),
    operatorTwo: yup.string().required(tLogin("ticket.b2b.validation.operatorTwoRequired", "Secondary operator is required")),
    agent: yup.string().required(tLogin("ticket.b2b.validation.agentRequired", "Agent is required")),
    pnr: yup.string().required(tLogin("ticket.b2b.validation.pnrRequired", "PNR is required")),
    status: yup.string().required(tLogin("ticket.b2b.validation.statusRequired", "Status is required")),
    airline: yup.string().required(tLogin("ticket.b2b.validation.airlineRequired", "Airline is required")),
    route: yup.string().required(tLogin("ticket.b2b.validation.routeRequired", "Route is required")),
    cabinClass: yup.string().required(tLogin("ticket.b2b.validation.cabinClassRequired", "Class is required")),
    tripType: yup.string().required(tLogin("ticket.b2b.validation.tripTypeRequired", "Trip type is required")),
    flightDate: yup.string().required(tLogin("ticket.b2b.validation.flightDateRequired", "Flight date is required")),
    netFare: yup
      .number()
      .typeError(tLogin("ticket.b2b.validation.numberRequired", "Enter a valid number"))
      .required(tLogin("ticket.b2b.validation.netFareRequired", "Net fare is required")),
    saleFare: yup
      .number()
      .typeError(tLogin("ticket.b2b.validation.numberRequired", "Enter a valid number"))
      .required(tLogin("ticket.b2b.validation.saleFareRequired", "Sale fare is required")),
    card: yup.string().required(tLogin("ticket.b2b.validation.cardRequired", "Card is required")),
    note: yup.string().nullable(),
  });

  return {
    loginValidSchema,
    addEmployee,
    addClient,
    addB2BTicket,
  };
};
