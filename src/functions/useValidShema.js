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
  });

  const addClient = yup.object({
    gender: stringRequiredValidSchema(t("pages.clients.validation.genderRequired", "Gender is required")),
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



