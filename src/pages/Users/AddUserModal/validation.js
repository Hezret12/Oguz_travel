import * as yup from "yup";
import { TURKMEN_MOBILE_DIGITS_REGEX } from "../../../utils/phone";

export const getValidationSchema = (isEdit, t) => {
  return yup.object().shape({
    employeeId: yup
      .string()
      .required(t("users.validation.employeeRequired") ?? "Employee is required"),
    phoneNumber: yup
      .string()
      .required(t("users.validation.phoneNumberRequired") ?? "Phone number is required")
      .length(8, t("users.validation.phoneNumberLength") ?? "Phone number must be 8 digits")
      .matches(
        TURKMEN_MOBILE_DIGITS_REGEX,
        t("users.validation.phoneNumberInvalid") ?? "Invalid phone number (must start with 61/62/63/64/65/71/12 and have 8 digits)"
      ),
    password: isEdit
      ? yup.string().nullable().notRequired()
      : yup
          .string()
          .required(t("users.validation.passwordRequired") ?? "Password is required")
          .min(6, t("users.validation.passwordTooShort") ?? "Password is too short (min 6 characters)"),
    isActive: yup.boolean().default(true),
    permissions: yup.array().of(yup.string()).default([]),
  });
};
