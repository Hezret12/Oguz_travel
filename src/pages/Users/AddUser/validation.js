import * as yup from "yup";
import { TURKMEN_MOBILE_DIGITS_REGEX } from "../../../utils/phone";

export const getValidationSchema = (isEdit, t) => {
  return yup.object().shape({
    isExternalUser: yup.boolean().default(false),
    employeeId: yup.string().when("isExternalUser", {
      is: true,
      then: (schema) => schema.nullable().notRequired(),
      otherwise: (schema) =>
        schema.required(t("pages.users.validation.employeeRequired") ?? "Employee is required"),
    }),
    phoneNumber: yup
      .string()
      .required(t("pages.users.validation.phoneNumberRequired") ?? "Phone number is required")
      .length(8, t("pages.users.validation.phoneNumberLength") ?? "Phone number must be 8 digits")
      .matches(
        TURKMEN_MOBILE_DIGITS_REGEX,
        t("pages.users.validation.phoneNumberInvalid") ?? "Invalid phone number (must start with 61/62/63/64/65/71/12 and have 8 digits)",
      ),
    password: isEdit
      ? yup.string().nullable().notRequired()
      : yup
          .string()
          .required(t("pages.users.validation.passwordRequired") ?? "Password is required")
          .min(6, t("pages.users.validation.passwordTooShort") ?? "Password is too short (min 6 characters)"),
    isActive: yup.boolean().default(true),
    permissions: yup.array().of(yup.string()).default([]),
  });
};

