import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useValidShemaConst } from "./useValidShemaConst";

export const useValidShema = () => {
  const { t } = useTranslation();
  const {
    dateRequiredValidSchema,
    emailRequiredValidSchema,
    numberRequiredValidSchema,
    passwordRequiredValidSchema,
    phoneNumberOptionalValidSchema,
    phoneNumberRequiredValidSchema,
    stringOptionalValidSchema,
    stringRequiredValidSchema,
  } = useValidShemaConst();

  const loginValidSchema = yup.object({
    phone: phoneNumberRequiredValidSchema({
      requiredMessage: t("pages.login.validation.phoneNumberRequired", "Phone number is required"),
      lengthMessage: t("pages.login.validation.phoneNumberLength", "Phone number must be exactly 8 digits"),
      invalidMessage: t("pages.login.validation.phoneNumberInvalid", "Invalid phone number"),
    }),
    password: passwordRequiredValidSchema({
      requiredMessage: t("pages.login.validation.passwordRequired", "Password is required"),
      minLength: 6,
      minMessage: t("pages.login.validation.passwordTooShort", "Password is too short"),
      maxLength: 20,
      maxMessage: t("pages.login.validation.passwordMaxLength", "Password is too long"),
    }),
  });

  const addEmployee = yup.object({
    fullName: stringRequiredValidSchema(t("pages.employee.validation.fullNameRequired", "Full name is required")),
    phoneNumber: phoneNumberRequiredValidSchema({
      requiredMessage: t("pages.employee.validation.phoneNumberRequired", "Phone number is required"),
      lengthMessage: t("pages.employee.validation.phoneNumberLength", "Phone number must be 8 digits"),
      invalidMessage: t("pages.employee.validation.phoneNumberInvalid", "Invalid phone number"),
    }),
    gmail: emailRequiredValidSchema({
      requiredMessage: t("pages.employee.validation.gmailRequired", "Email is required"),
      invalidMessage: t("pages.employee.validation.gmailInvalid", "Invalid email address"),
    }),
    departmentId: stringRequiredValidSchema(t("pages.employee.validation.departmentRequired", "Department is required")),
    positionId: stringRequiredValidSchema(t("pages.employee.validation.positionRequired", "Position is required")),
    officeId: stringRequiredValidSchema(t("pages.employee.validation.officeRequired", "Office is required")),
  });

  const addClient = yup.object({
    fullName: stringRequiredValidSchema(t("pages.clients.validation.fullNameRequired", "Full name is required")),
    phoneNumber: phoneNumberRequiredValidSchema({
      requiredMessage: t("pages.clients.validation.phoneNumberRequired", "Phone number is required"),
      lengthMessage: t("pages.clients.validation.phoneNumberLength", "Phone number must be exactly 8 digits"),
      invalidMessage: t("pages.clients.validation.phoneNumberInvalid", "Invalid phone number"),
    }),
    dateOfBirth: dateRequiredValidSchema(t("pages.clients.validation.dateOfBirthRequired", "Date of birth is required")),
    passportNumber: stringRequiredValidSchema(t("pages.clients.validation.passportNumberRequired", "Passport number is required")),
    passportExpiryDate: dateRequiredValidSchema(t("pages.clients.validation.passportExpiryDateRequired", "Passport expiry date is required")),
    passportCountryOfIssue: stringRequiredValidSchema(t("pages.clients.validation.passportCountryOfIssueRequired", "Passport country of issue is required")),
    gender: stringRequiredValidSchema(t("pages.clients.validation.genderRequired", "Gender is required")),
  });

  const addReferralLetter = yup.object({
    arzaNo: stringRequiredValidSchema(t("pages.referralLetter.validation.arzaNoRequired", "Referral number is required")),
    operator: stringRequiredValidSchema(t("pages.referralLetter.validation.operatorRequired", "Operator is required")),
    ofis: stringOptionalValidSchema(),
    agent: stringOptionalValidSchema(),
    agentTel: phoneNumberOptionalValidSchema({
      invalidMessage: t("pages.referralLetter.validation.agentTelInvalid", "Invalid phone number"),
    }),
    name: stringRequiredValidSchema(t("pages.referralLetter.validation.nameRequired", "Name is required")),
    surname: stringRequiredValidSchema(t("pages.referralLetter.validation.surnameRequired", "Surname is required")),
    yolagcyTel: phoneNumberOptionalValidSchema({
      invalidMessage: t("pages.referralLetter.validation.yolagcyTelInvalid", "Invalid phone number"),
    }),
    gender: stringRequiredValidSchema(t("pages.referralLetter.validation.genderRequired", "Gender is required")),
    dateOfBirth: dateRequiredValidSchema(t("pages.referralLetter.validation.dateOfBirthRequired", "Date of birth is required")),
    passportNumber: stringRequiredValidSchema(t("pages.referralLetter.validation.passportNumberRequired", "Passport number is required")),
    destinationCountry: stringRequiredValidSchema(t("pages.referralLetter.validation.destinationCountryRequired", "Destination country is required")),
    tranzit: stringOptionalValidSchema(),
    syhNo: stringOptionalValidSchema(),
    departureDate: dateRequiredValidSchema(t("pages.referralLetter.validation.departureDateRequired", "Departure date is required")),
    returnDate: dateRequiredValidSchema(t("pages.referralLetter.validation.returnDateRequired", "Return date is required")),
    price: numberRequiredValidSchema({
      typeMessage: t("pages.referralLetter.validation.numberRequired", "Enter a valid number"),
      requiredMessage: t("pages.referralLetter.validation.priceRequired", "Price is required"),
    }),
    contractNo: stringOptionalValidSchema(),
    contractDate: dateRequiredValidSchema(t("pages.referralLetter.validation.contractDateRequired", "Contract date is required")),
    note: stringOptionalValidSchema(),
    syhHighlighted: yup.boolean().default(false),
  });

  const addB2BTicket = yup.object({
    clientId: stringRequiredValidSchema(t("pages.ticket.b2b.validation.clientRequired", "Client is required")),
    issueDate: dateRequiredValidSchema(t("pages.ticket.b2b.validation.issueDateRequired", "Issue date is required")),
    operator: stringRequiredValidSchema(t("pages.ticket.b2b.validation.operatorRequired", "Operator is required")),
    office: stringRequiredValidSchema(t("pages.ticket.b2b.validation.officeRequired", "Office is required")),
    operatorTwo: stringRequiredValidSchema(t("pages.ticket.b2b.validation.operatorTwoRequired", "Secondary operator is required")),
    agent: yup.string().nullable(),
    agentFullName: stringRequiredValidSchema(t("pages.ticket.b2b.validation.agentFullNameRequired", "Agent full name is required")),
    agentPhoneNumber: phoneNumberRequiredValidSchema({
      requiredMessage: t("pages.ticket.b2b.validation.agentPhoneNumberRequired", "Agent phone number is required"),
      lengthMessage: t("pages.ticket.b2b.validation.agentPhoneNumberLength", "Phone number must be exactly 8 digits"),
      invalidMessage: t("pages.ticket.b2b.validation.agentPhoneNumberInvalid", "Invalid phone number"),
    }),
    pnr: stringRequiredValidSchema(t("pages.ticket.b2b.validation.pnrRequired", "PNR is required")),
    status: stringRequiredValidSchema(t("pages.ticket.b2b.validation.statusRequired", "Status is required")),
    airline: stringRequiredValidSchema(t("pages.ticket.b2b.validation.airlineRequired", "Airline is required")),
    route: stringRequiredValidSchema(t("pages.ticket.b2b.validation.routeRequired", "Route is required")),
    cabinClass: stringRequiredValidSchema(t("pages.ticket.b2b.validation.cabinClassRequired", "Class is required")),
    tripType: stringRequiredValidSchema(t("pages.ticket.b2b.validation.tripTypeRequired", "Trip type is required")),
    flightDate: dateRequiredValidSchema(t("pages.ticket.b2b.validation.flightDateRequired", "Flight date is required")),
    netFare: numberRequiredValidSchema({
      typeMessage: t("pages.ticket.b2b.validation.numberRequired", "Enter a valid number"),
      requiredMessage: t("pages.ticket.b2b.validation.netFareRequired", "Net fare is required"),
    }),
    saleFare: numberRequiredValidSchema({
      typeMessage: t("pages.ticket.b2b.validation.numberRequired", "Enter a valid number"),
      requiredMessage: t("pages.ticket.b2b.validation.saleFareRequired", "Sale fare is required"),
    }),
    card: stringRequiredValidSchema(t("pages.ticket.b2b.validation.cardRequired", "Card is required")),
    note: yup.string().nullable(),
  });

  const addTurkishAirlinesTicket = yup.object({
    clientId: stringRequiredValidSchema(t("pages.ticket.b2b.validation.clientRequired", "Client is required")),
    fullName: stringRequiredValidSchema(t("pages.clients.validation.fullNameRequired", "Full name is required")),
    phoneNumber: phoneNumberRequiredValidSchema({
      requiredMessage: t("pages.clients.validation.phoneNumberRequired", "Phone number is required"),
      lengthMessage: t("pages.clients.validation.phoneNumberLength", "Phone number must be exactly 8 digits"),
      invalidMessage: t("pages.clients.validation.phoneNumberInvalid", "Invalid phone number"),
    }),
    dateOfBirth: dateRequiredValidSchema(t("pages.clients.validation.dateOfBirthRequired", "Date of birth is required")),
    passportNumber: stringRequiredValidSchema(t("pages.clients.validation.passportNumberRequired", "Passport number is required")),
    passportCountryOfIssue: stringRequiredValidSchema(t("pages.clients.validation.passportCountryOfIssueRequired", "Passport country of issue is required")),
    passportExpiryDate: dateRequiredValidSchema(t("pages.clients.validation.passportExpiryDateRequired", "Passport expiry date is required")),
    milesAndSmiles: stringOptionalValidSchema(),
    date: dateRequiredValidSchema(t("validation.dateRequired", "Date is required")),
    operatorSelection: stringRequiredValidSchema(t("pages.ticket.b2b.validation.operatorRequired", "Operator is required")),
    operatorTwoSelection: stringRequiredValidSchema(t("pages.ticket.b2b.validation.operatorTwoRequired", "Secondary operator is required")),
    agentFullName: stringRequiredValidSchema(t("pages.ticket.b2b.validation.agentFullNameRequired", "Agent full name is required")),
    agentPhoneNumber: phoneNumberRequiredValidSchema({
      requiredMessage: t("pages.ticket.b2b.validation.agentPhoneNumberRequired", "Agent phone number is required"),
      lengthMessage: t("pages.ticket.b2b.validation.agentPhoneNumberLength", "Phone number must be exactly 8 digits"),
      invalidMessage: t("pages.ticket.b2b.validation.agentPhoneNumberInvalid", "Invalid phone number"),
    }),
    status: stringRequiredValidSchema(t("pages.ticket.b2b.validation.statusRequired", "Status is required")),
    pnr: stringRequiredValidSchema(t("pages.ticket.b2b.validation.pnrRequired", "PNR is required")),
    ticketNo: stringRequiredValidSchema(t("validation.required", "Required")),
    route: stringRequiredValidSchema(t("pages.ticket.b2b.validation.routeRequired", "Route is required")),
    cabinClass: stringRequiredValidSchema(t("pages.ticket.b2b.validation.cabinClassRequired", "Class is required")),
    flightDate: dateRequiredValidSchema(t("pages.ticket.b2b.validation.flightDateRequired", "Flight date is required")),
    totalAmount: numberRequiredValidSchema({
      typeMessage: t("pages.ticket.b2b.validation.numberRequired", "Enter a valid number"),
      requiredMessage: t("validation.required", "Required"),
    }),
    baseFare: numberRequiredValidSchema({
      typeMessage: t("pages.ticket.b2b.validation.numberRequired", "Enter a valid number"),
      requiredMessage: t("validation.required", "Required"),
    }),
    adjustedFare: numberRequiredValidSchema({
      typeMessage: t("pages.ticket.b2b.validation.numberRequired", "Enter a valid number"),
      requiredMessage: t("validation.required", "Required"),
    }),
    receivedAmount: numberRequiredValidSchema({
      typeMessage: t("pages.ticket.b2b.validation.numberRequired", "Enter a valid number"),
      requiredMessage: t("validation.required", "Required"),
    }),
    returnedAmount: numberRequiredValidSchema({
      typeMessage: t("pages.ticket.b2b.validation.numberRequired", "Enter a valid number"),
      requiredMessage: t("validation.required", "Required"),
    }),
    cashier: stringRequiredValidSchema(t("validation.required", "Required")),
    note: stringOptionalValidSchema(),
  });

  const addUser = yup.object({
    isExternalUser: yup.boolean().default(false),
    employeeId: stringRequiredValidSchema(t("pages.users.validation.employeeRequired", "Employee is required")).when("isExternalUser", {
      is: true,
      then: (schema) => schema.nullable().notRequired(),
    }),
    phoneNumber: phoneNumberRequiredValidSchema({
      requiredMessage: t("pages.users.validation.phoneNumberRequired", "Phone number is required"),
      lengthMessage: t("pages.users.validation.phoneNumberLength", "Phone number must be 8 digits"),
      invalidMessage: t("pages.users.validation.phoneNumberInvalid", "Invalid phone number (must start with 61/62/63/64/65/71/12 and have 8 digits)"),
    }),
    password: passwordRequiredValidSchema({
      requiredMessage: t("pages.users.validation.passwordRequired", "Password is required"),
      minLength: 6,
      minMessage: t("pages.users.validation.passwordTooShort", "Password is too short (min 6 characters)"),
      maxLength: 20,
      maxMessage: t("pages.users.validation.passwordTooLong", "Password is too long (max 20 characters)"),
    }),
    isActive: yup.boolean().default(true),
    permissions: yup.array().of(yup.string()).default([]),
  });

  return {
    addB2BTicket,
    addTurkishAirlinesTicket,
    addClient,
    addEmployee,
    addReferralLetter,
    addUser,
    loginValidSchema,
  };
};



