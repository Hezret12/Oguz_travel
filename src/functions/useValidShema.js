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
    guidRequiredValidSchema
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
    fullName: stringRequiredValidSchema(t("pages.employee.validation.fullNameRequired")),
     phone_number: phoneNumberRequiredValidSchema({
      requiredMessage: t("pages.users.validation.phoneNumberRequired"),
      lengthMessage: t("pages.users.validation.phoneNumberLength"),
      invalidMessage: t("pages.users.validation.phoneNumberInvalid"),
    }),
  });

    const editEmployee = yup.object({
    fullName: stringRequiredValidSchema(t("pages.employee.validation.fullNameRequired")),
     phone_number: phoneNumberRequiredValidSchema({
      requiredMessage: t("pages.users.validation.phoneNumberRequired"),
      lengthMessage: t("pages.users.validation.phoneNumberLength"),
      invalidMessage: t("pages.users.validation.phoneNumberInvalid"),
    }),
    guid: guidRequiredValidSchema
  })

  const clientValidShema = yup.object({
    fullName: stringRequiredValidSchema(t("pages.employee.validation.fullNameRequired")),
    phone_number: phoneNumberOptionalValidSchema({
      invalidMessage: t("pages.users.validation.phoneNumberInvalid"),
    }),
  });

  const addReferralLetter = yup.object({
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
      .min(1, t("pages.users.validation.permissionsRequired", "At least one permission is required"))
      .required(t("pages.users.validation.permissionsRequired", "At least one permission is required")),
    employee_guid: yup.string().when("isExternalUser", {
      is: false,
      then: (schema) => schema.required(t("pages.users.validation.employeeRequired", "Employee is required")),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
    phone_number: phoneNumberRequiredValidSchema({
      requiredMessage: t("pages.users.validation.phoneNumberRequired", "Phone number is required"),
      lengthMessage: t("pages.users.validation.phoneNumberLength", "Phone number must be exactly 8 digits"),
      invalidMessage: t("pages.users.validation.phoneNumberInvalid", "Invalid phone number"),
    }),
    password: yup
      .string()
      .required(t("pages.users.validation.passwordRequired", "Password is required"))
      .min(6, t("pages.users.validation.passwordTooShort", "Password is too short (min 6 characters)")),
  });

  const editUser = yup.object({
    isExternalUser: yup.boolean().default(false),
    permissions: yup
      .array()
      .of(yup.string())
      .min(1, t("pages.users.validation.permissionsRequired"))
      .required(t("pages.users.validation.permissionsRequired")),
    employee_guid: yup.string().when("isExternalUser", {
      is: false,
      then: (schema) => schema.required(t("pages.users.validation.employeeRequired", "Employee is required")),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
    phone_number: phoneNumberRequiredValidSchema({
      requiredMessage: t("pages.users.validation.phoneNumberRequired", "Phone number is required"),
      lengthMessage: t("pages.users.validation.phoneNumberLength", "Phone number must be exactly 8 digits"),
      invalidMessage: t("pages.users.validation.phoneNumberInvalid", "Invalid phone number"),
    }),
    password: yup
      .string()
      .nullable()
      .notRequired()
      .test("len", t("pages.users.validation.passwordTooShort", "Password is too short (min 6 characters)"), (val) => {
        if (!val) return true;
        return val.length >= 6;
      }),
  });

  return {
    addB2BTicket,
    addTurkishAirlinesTicket,
    clientValidShema,
    addEmployee,
    editEmployee,
    addReferralLetter,
    addUser,
    editUser,
    loginValidSchema,
  };
};



