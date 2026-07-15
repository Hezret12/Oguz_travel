import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { TURKMEN_MOBILE_DIGITS_REGEX } from "../utils/phone";

const PHONE_LENGTH = 8;

export const useValidShemaConst = () => {
  const { t } = useTranslation();

  const stringRequiredValidSchema = (message = t("validation.required", "Required")) =>
    yup.string().required(message);

  const stringOptionalValidSchema = () => yup.string().notRequired();

  const emailRequiredValidSchema = ({
    requiredMessage = t("validation.emailRequired", "Email is required"),
    invalidMessage = t("validation.emailInvalid", "Invalid email address"),
  } = {}) => yup.string().required(requiredMessage).email(invalidMessage);

  const dateRequiredValidSchema = (message = t("validation.dateRequired", "Date is required")) =>
    yup.string().required(message);

  const phoneNumberRequiredValidSchema = ({
    requiredMessage = t("validation.phoneRequired"),
    invalidMessage = t("validation.phoneInvalid"),
  } = {}) =>
    yup
      .string()
      .required(requiredMessage)
      .test("is-valid-phone", invalidMessage, (value) => {
        if (!value) return false;
        const digits = value.startsWith("+993") ? value.slice(4) : value;
        return digits.length === PHONE_LENGTH && TURKMEN_MOBILE_DIGITS_REGEX.test(digits);
      });

  const phoneNumberOptionalValidSchema = ({
    invalidMessage = t("validation.phoneInvalid", "Invalid phone number"),
  } = {}) =>
    yup
      .string()
      .transform((value) => (value === "" ? null : value))
      .nullable()
      .notRequired()
      .test("is-valid-phone-optional", invalidMessage, (value) => {
        if (value === null || value === undefined || value === "") return true;
        const digits = value.startsWith("+993") ? value.slice(4) : value;
        return digits.length === PHONE_LENGTH && TURKMEN_MOBILE_DIGITS_REGEX.test(digits);
      });

  const passwordRequiredValidSchema = ({
    requiredMessage = t("validation.passwordRequired", "Password is required"),
    minLength = 6,
    minMessage = t("validation.passwordMin", "Password is too short"),
    maxLength = 20,
    maxMessage = t("validation.passwordMax", "Password is too long"),
  } = {}) =>
    yup
      .string()
      .required(requiredMessage)
      .min(minLength, minMessage)
      .max(maxLength, maxMessage);

  const numberRequiredValidSchema = ({
    typeMessage = t("validation.numberRequired", "Enter a valid number"),
    requiredMessage = t("validation.required", "Required"),
  } = {}) =>
    yup.number().typeError(typeMessage).required(requiredMessage);

  const numberOptionalValidSchema = ({
    typeMessage = t("validation.numberRequired", "Enter a valid number"),
  } = {}) => yup.number().typeError(typeMessage).notRequired();

  const decimalNumberRequiredValidSchema = ({
    typeMessage = t("validation.numberRequired", "Enter a valid number"),
    requiredMessage = t("validation.required", "Required"),
  } = {}) =>
    yup
      .string()
      .matches(/^\d+(\.\d+)?$/, t("validation.onlyNumbers", "Only numbers are allowed"))
      .required(requiredMessage)
      .typeError(typeMessage);

  const decimalNumberOptionalValidSchema = ({
    typeMessage = t("validation.numberRequired", "Enter a valid number"),
  } = {}) =>
    yup
      .string()
      .matches(/^\d+(\.\d+)?$/, t("validation.onlyNumbers", "Only numbers are allowed"))
      .notRequired()
      .typeError(typeMessage);

  const guidRequiredValidSchema = (message = t("validation.required", "Required")) =>
    yup.string().required(message);

  const codeRequiredValidSchema = ({
    requiredMessage = t("validation.required", "Required"),
    maxMessage = t("validation.max20Chars", "Must be 20 characters or less"),
    lettersMessage = t("validation.onlyLetters", "Only letters are allowed"),
  } = {}) =>
    yup
      .string()
      .required(requiredMessage)
      .max(20, maxMessage)
      .matches(/^[A-Za-z\s]+$/, lettersMessage);

  const contactOptionalValidSchema = ({
    invalidMessage = t("validation.phoneInvalid", "Invalid phone number"),
  } = {}) =>
    yup
      .object({
        name: yup.string().notRequired(),
        phone: phoneNumberOptionalValidSchema({ invalidMessage }),
      })
      .notRequired();

  return {
    codeRequiredValidSchema,
    contactOptionalValidSchema,
    dateRequiredValidSchema,
    decimalNumberOptionalValidSchema,
    decimalNumberRequiredValidSchema,
    emailRequiredValidSchema,
    guidRequiredValidSchema,
    numberOptionalValidSchema,
    numberRequiredValidSchema,
    passwordRequiredValidSchema,
    phoneNumberOptionalValidSchema,
    phoneNumberRequiredValidSchema,
    stringOptionalValidSchema,
    stringRequiredValidSchema,
  };
};
