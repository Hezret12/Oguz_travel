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
      requiredMessage: t("pages.login.validation.phoneNumberRequired"),
      lengthMessage: t("pages.login.validation.phoneNumberLength"),
      invalidMessage: t("pages.login.validation.phoneNumberInvalid"),
    }),
    password: passwordRequiredValidSchema({
      requiredMessage: t("pages.login.validation.passwordRequired"),
      minLength: 5,
      minMessage: t("pages.login.validation.passwordTooShort"),
      maxLength: 20,
      maxMessage: t("pages.login.validation.passwordMaxLength"),
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
    guid: guidRequiredValidSchema
  })

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
    client_guid: yup.string().nullable().required(t("validation.required") || "Hökman girizilmeli"),
    index_number: yup.string().nullable().required(t("validation.required") || "Hökman girizilmeli"),
    datetime: yup.string().nullable().required(t("validation.required") || "Hökman girizilmeli"),
    received_opr_guid: yup.string().nullable().required(t("validation.required") || "Hökman girizilmeli"),
    note: stringOptionalValidSchema(),
  });

  const addB2BTicket = yup.object({
   
  });

  const addTurkishAirlinesTicket = yup.object({
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
  };
};



