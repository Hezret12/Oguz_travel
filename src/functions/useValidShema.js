import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useValidShemaConst } from "./useValidShemaConst";

export const useValidShema = () => {
  const { t } = useTranslation();
  const {
    passwordRequiredValidSchema,
    phoneNumberOptionalValidSchema,
    phoneNumberRequiredValidSchema,
    stringOptionalValidSchema,
    stringRequiredValidSchema,
    guidRequiredValidSchema,
  } = useValidShemaConst();

  const loginValidSchema = yup.object({
    phone: phoneNumberRequiredValidSchema({
      requiredMessage: t("login.validation.phoneNumberRequired"),
      lengthMessage: t("login.validation.phoneNumberLength"),
      invalidMessage: t("login.validation.phoneNumberInvalid"),
    }),
    password: passwordRequiredValidSchema({
      requiredMessage: t("login.validation.passwordRequired"),
      minLength: 5,
      minMessage: t("login.validation.passwordTooShort"),
      maxLength: 20,
      maxMessage: t("login.validation.passwordMaxLength"),
    }),
  });

  const addEmployee = yup.object({
    fullName: stringRequiredValidSchema(t("employee.validation.fullNameRequired")),
     phone_number: phoneNumberRequiredValidSchema({
      requiredMessage: t("users.validation.phoneNumberRequired"),
      lengthMessage: t("users.validation.phoneNumberLength"),
      invalidMessage: t("users.validation.phoneNumberInvalid"),
    }),
  });

  const editEmployee = yup.object({
    fullName: stringRequiredValidSchema(t("employee.validation.fullNameRequired")),
    phone_number: phoneNumberRequiredValidSchema({
      requiredMessage: t("users.validation.phoneNumberRequired"),
      lengthMessage: t("users.validation.phoneNumberLength"),
      invalidMessage: t("users.validation.phoneNumberInvalid"),
    }),
    guid: guidRequiredValidSchema(),
  });

  const clientValidShema = yup.object({
    fullName: stringRequiredValidSchema(t("employee.validation.fullNameRequired")),
    phone_number: phoneNumberOptionalValidSchema({
      invalidMessage: t("users.validation.phoneNumberInvalid"),
    }),
  });

  const addReferralLetter = yup.object({
    note: stringOptionalValidSchema(),
  });

  const addVisa = yup.object({
    is_paid: yup.boolean().optional(),
  });

  const addB2BTicket = yup.object({
    client_guid: yup
      .string()
      .nullable()
      .required(""),
    assignment_opr_guid: yup
      .string()
      .nullable()
      .required(""),
    receiver_opr_guid: yup
      .string()
      .nullable()
      .required(""),
    status_guid: yup
      .string()
      .nullable()
      .required(""),
    net_price: yup
      .number()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue === null || originalValue === undefined
          ? undefined
          : Number(originalValue)
      )
      .typeError("")
      .required(""),
    sale_price: yup
      .number()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue === null || originalValue === undefined
          ? undefined
          : Number(originalValue)
      )
      .typeError("")
      .required(""),
  });

  const addTurkishAirlinesTicket = yup.object({
    client_guid: yup
      .string()
      .nullable()
      .transform((val, orig) => (!orig || !String(orig).trim() ? undefined : String(orig).trim()))
      .required(""),
    assignment_opr_guid: yup
      .string()
      .nullable()
      .transform((val, orig) => (!orig || !String(orig).trim() ? undefined : String(orig).trim()))
      .required(""),
    receiver_opr_guid: yup
      .string()
      .nullable()
      .transform((val, orig) => (!orig || !String(orig).trim() ? undefined : String(orig).trim()))
      .required(""),
    ticket_number: yup
      .string()
      .nullable()
      .transform((val, orig) => (!orig || !String(orig).trim() ? undefined : String(orig).trim()))
      .required(""),
    base_fare: yup
      .number()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue === null || originalValue === undefined
          ? undefined
          : Number(originalValue)
      )
      .typeError("")
      .required(""),
    total_price: yup
      .number()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue === null || originalValue === undefined
          ? undefined
          : Number(originalValue)
      )
      .typeError("")
      .required(""),
    status_guid: yup
      .string()
      .nullable()
      .transform((val, orig) => (!orig || !String(orig).trim() ? undefined : String(orig).trim()))
      .required(""),
    office_guid: yup
      .string()
      .nullable()
      .transform((val, orig) => (!orig || !String(orig).trim() ? undefined : String(orig).trim()))
      .required(""),
    note: stringOptionalValidSchema(),
  });

  const addUser = yup.object({
    isExternalUser: yup.boolean().default(false),
    permissions: yup
      .array()
      .of(yup.string())
      .min(1, t("users.validation.permissionsRequired", "At least one permission is required"))
      .required(t("users.validation.permissionsRequired", "At least one permission is required")),
    employee_guid: yup.string().when("isExternalUser", {
      is: false,
      then: (schema) => schema.required(t("users.validation.employeeRequired", "Employee is required")),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
    phone_number: phoneNumberRequiredValidSchema({
      requiredMessage: t("users.validation.phoneNumberRequired", "Phone number is required"),
      lengthMessage: t("users.validation.phoneNumberLength", "Phone number must be exactly 8 digits"),
      invalidMessage: t("users.validation.phoneNumberInvalid", "Invalid phone number"),
    }),
    password: yup
      .string()
      .required(t("users.validation.passwordRequired", "Password is required"))
      .min(6, t("users.validation.passwordTooShort", "Password is too short (min 6 characters)")),
  });

  const editUser = yup.object({
    isExternalUser: yup.boolean().default(false),
    permissions: yup
      .array()
      .of(yup.string())
      .min(1, t("users.validation.permissionsRequired"))
      .required(t("users.validation.permissionsRequired")),
    employee_guid: yup.string().when("isExternalUser", {
      is: false,
      then: (schema) => schema.required(t("users.validation.employeeRequired", "Employee is required")),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
    phone_number: phoneNumberRequiredValidSchema({
      requiredMessage: t("users.validation.phoneNumberRequired", "Phone number is required"),
      lengthMessage: t("users.validation.phoneNumberLength", "Phone number must be exactly 8 digits"),
      invalidMessage: t("users.validation.phoneNumberInvalid", "Invalid phone number"),
    }),
    password: yup
      .string()
      .nullable()
      .notRequired()
      .test("len", t("users.validation.passwordTooShort", "Password is too short (min 6 characters)"), (val) => {
        if (!val) return true;
        return val.length >= 6;
      }),
  });

  const addTranslation = yup.object({
    received_day: yup.string().nullable().required(t("validation.required") || "Hökman girizilmeli"),
    client_guid: yup.string().nullable().required(t("validation.required") || "Hökman girizilmeli"),
    opr_guid: yup.string().nullable().required(t("validation.required") || "Hökman girizilmeli"),
    page_count: yup.number().nullable().typeError(t("validation.requiredNumber") || "San bolmaly").required(t("validation.required") || "Hökman girizilmeli"),
    price: yup.number().nullable().typeError(t("validation.requiredNumber") || "San bolmaly").required(t("validation.required") || "Hökman girizilmeli"),
    profit: yup.number().nullable().transform((v, o) => o === "" ? null : v).typeError(t("validation.requiredNumber") || "San bolmaly").optional(),
    note: stringOptionalValidSchema(),
  });

  const addTranslator = yup.object({
    fullName: stringRequiredValidSchema(t("employee.validation.fullNameRequired")),
  });

  const addOutbound = yup.object({
    application_date: yup.string().nullable().required(t("validation.required") || "Hökman girizilmeli"),
    opr_guid: yup.string().nullable().required(t("validation.required") || "Hökman girizilmeli"),
    client_name: yup.string().required(t("validation.required") || "Hökman girizilmeli"),
    prepared_opr_guid: yup.string().nullable().required(t("validation.required") || "Hökman girizilmeli"),
    net_fare: yup.number().nullable().typeError(t("validation.requiredNumber") || "San bolmaly").required(t("validation.required") || "Hökman girizilmeli"),
    price: yup.number().nullable().typeError(t("validation.requiredNumber") || "San bolmaly").required(t("validation.required") || "Hökman girizilmeli"),
  });

  const addNotification = yup.object({
    title: stringRequiredValidSchema(t("validation.required")),
    description: stringRequiredValidSchema(t("validation.required")),
    assignee_guids: yup
      .mixed()
      .test("assignee-validation", t("validation.required"), (val) => {
        if (val === true) return true;
        if (Array.isArray(val) && val.length > 0) return true;
        return false;
      }),
  });

  const addCafeteriaTransaction = yup.object({
    type: yup
      .boolean()
      .typeError(t("cafeteria.validation.typeRequired"))
      .required(t("cafeteria.validation.typeRequired")),
    amount: yup
      .number()
      .typeError(t("cafeteria.validation.amountRequired"))
      .positive(t("cafeteria.validation.amountPositive"))
      .required(t("cafeteria.validation.amountRequired")),
    date: stringRequiredValidSchema(t("cafeteria.validation.dateRequired")),
    description: stringOptionalValidSchema(),
  });

  return {
    addB2BTicket,
    addTurkishAirlinesTicket,
    clientValidShema,
    addEmployee,
    editEmployee,
    addReferralLetter,
    addVisa,
    addUser,
    editUser,
    loginValidSchema,
    addTranslation,
    addTranslator,
    addOutbound,
    addNotification,
    addCafeteriaTransaction,
  };
};



