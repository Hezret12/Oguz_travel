import { useMemo } from "react";
import * as yup from "yup";
import dayjs from "dayjs";
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

  // Every one of the ~20 schemas below used to get rebuilt on every render of
  // every component that calls this hook (typing a single character in any
  // Add/Edit form re-ran all of them) — memoize on `t`, the only thing they
  // actually depend on.
  return useMemo(() => {
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
    bgn_departure: stringOptionalValidSchema(),
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
      .transform((value, originalValue) => {
        if (originalValue === "" || originalValue === null || originalValue === undefined || String(originalValue).trim() === "-") {
          return undefined;
        }
        const num = Number(originalValue);
        return Number.isFinite(num) ? num : undefined;
      })
      .typeError("")
      .required(""),
    sale_price: yup
      .number()
      .nullable()
      .transform((value, originalValue) => {
        if (originalValue === "" || originalValue === null || originalValue === undefined || String(originalValue).trim() === "-") {
          return undefined;
        }
        const num = Number(originalValue);
        return Number.isFinite(num) ? num : undefined;
      })
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
      .transform((value, originalValue) => {
        if (originalValue === "" || originalValue === null || originalValue === undefined || String(originalValue).trim() === "-") {
          return undefined;
        }
        const num = Number(originalValue);
        return Number.isFinite(num) ? num : undefined;
      })
      .typeError("")
      .required(""),
    total_price: yup
      .number()
      .nullable()
      .transform((value, originalValue) => {
        if (originalValue === "" || originalValue === null || originalValue === undefined || String(originalValue).trim() === "-") {
          return undefined;
        }
        const num = Number(originalValue);
        return Number.isFinite(num) ? num : undefined;
      })
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
    expense_price: yup.number().nullable().transform((v, o) => o === "" ? null : v).typeError(t("validation.requiredNumber") || "San bolmaly").optional(),
    note: stringOptionalValidSchema(),
  });

  const addTranslator = yup.object({
    fullName: yup
      .string()
      .trim()
      .required(t("validation.required") || "Hökman girizilmeli"),
  });

  const editTranslator = yup.object({
    guid: guidRequiredValidSchema(),
    fullName: yup
      .string()
      .trim()
      .required(t("validation.required") || "Hökman girizilmeli"),
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

  // Shared by the create and edit task forms. `dueDate` differs between them:
  // a new task may not be created already overdue, but an existing overdue task
  // still has to be editable (that is how it gets moved to "completed").
  const taskBaseFields = {
    title: stringRequiredValidSchema(t("validation.required")),
    description: stringOptionalValidSchema(),
    assignee_guid: yup
      .mixed()
      .test("task-assignee-required", t("validation.required"), (val) =>
        Array.isArray(val) ? val.length > 0 : Boolean(val),
      ),
    priority: stringRequiredValidSchema(t("validation.required")),
    status: yup
      .number()
      .typeError(t("validation.required"))
      .required(t("validation.required")),
  };

  const addTask = yup.object({
    ...taskBaseFields,
    dueDate: yup
      .mixed()
      .nullable()
      .test("task-due-not-past", t("task.validation.dueDateInPast"), (val) => {
        if (!val) return true;
        const parsed = dayjs(val);
        return !parsed.isValid() || !parsed.isBefore(dayjs(), "day");
      }),
  });

  const editTask = yup.object({
    ...taskBaseFields,
    dueDate: yup.mixed().nullable(),
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

  // Money inputs arrive as strings; empty means 0.
  const salaryMoney = () =>
    yup
      .number()
      .transform((value, original) => (original === "" || original == null ? 0 : value))
      .typeError(t("validation.invalidNumber"))
      .min(0, t("salary.validation.notNegative"));

  const salary = yup.object({
    month: yup.string().nullable().required(t("salary.validation.monthRequired")),
    employee_guid: yup.string().required(t("salary.validation.employeeRequired")),
    base_salary: yup
      .number()
      .transform((value, original) => (original === "" ? undefined : value))
      .typeError(t("validation.invalidNumber"))
      .min(0, t("salary.validation.notNegative"))
      .required(t("salary.validation.baseSalaryRequired")),
    work_days: yup
      .number()
      .transform((value, original) => (original === "" ? undefined : value))
      .typeError(t("validation.invalidNumber"))
      .integer(t("salary.validation.wholeNumber"))
      .min(1, t("salary.validation.workDaysRange"))
      .max(31, t("salary.validation.workDaysRange"))
      .required(t("validation.required")),
    worked_days: yup
      .number()
      .transform((value, original) => (original === "" ? undefined : value))
      .typeError(t("validation.invalidNumber"))
      .integer(t("salary.validation.wholeNumber"))
      .min(0, t("salary.validation.notNegative"))
      .max(yup.ref("work_days"), t("salary.validation.workedDaysExceed"))
      .required(t("validation.required")),
    card_amount: salaryMoney(),
    advance: salaryMoney(),
    cafeteria_credit: salaryMoney(),
    loan: salaryMoney(),
    bonus: salaryMoney(),
    bonus_type: yup.string().oneOf(["fixed", "percent"]),
    sales_amount: salaryMoney(),
    bonus_percent: yup
      .number()
      .transform((value, original) => (original === "" || original == null ? undefined : value))
      .typeError(t("validation.invalidNumber"))
      .when("bonus_type", {
        is: "percent",
        then: (schema) =>
          schema
            .required(t("salary.validation.percentRequired"))
            .min(0, t("salary.validation.percentRange"))
            .max(100, t("salary.validation.percentRange")),
        otherwise: (schema) => schema.notRequired(),
      }),
    paid_amount: salaryMoney(),
    paid_date: yup.string().nullable(),
    note: stringOptionalValidSchema(),
  });

  const addOffice = yup.object({
    fullName_tk: yup
      .string()
      .trim()
      .required(t("validation.required") || "Hökman girizilmeli"),
    fullName_ru: stringOptionalValidSchema(),
    fullName_en: stringOptionalValidSchema(),
    shortName_tk: stringOptionalValidSchema(),
    shortName_ru: stringOptionalValidSchema(),
    shortName_en: stringOptionalValidSchema(),
  });

  const editOffice = yup.object({
    guid: guidRequiredValidSchema(),
    fullName_tk: yup
      .string()
      .trim()
      .required(t("validation.required") || "Hökman girizilmeli"),
    fullName_ru: stringOptionalValidSchema(),
    fullName_en: stringOptionalValidSchema(),
    shortName_tk: stringOptionalValidSchema(),
    shortName_ru: stringOptionalValidSchema(),
    shortName_en: stringOptionalValidSchema(),
  });

  const addDepartment = yup.object({
    name_tk: yup
      .string()
      .trim()
      .required(t("validation.required") || "Hökman girizilmeli"),
    name_ru: stringOptionalValidSchema(),
    name_en: stringOptionalValidSchema(),
  });

  const editDepartment = yup.object({
    guid: guidRequiredValidSchema(),
    name_tk: yup
      .string()
      .trim()
      .required(t("validation.required") || "Hökman girizilmeli"),
    name_ru: stringOptionalValidSchema(),
    name_en: stringOptionalValidSchema(),
  });

  const addPosition = yup.object({
    name_tk: yup
      .string()
      .trim()
      .required(t("validation.required") || "Hökman girizilmeli"),
    name_ru: stringOptionalValidSchema(),
    name_en: stringOptionalValidSchema(),
  });

  const editPosition = yup.object({
    guid: guidRequiredValidSchema(),
    name_tk: yup
      .string()
      .trim()
      .required(t("validation.required") || "Hökman girizilmeli"),
    name_ru: stringOptionalValidSchema(),
    name_en: stringOptionalValidSchema(),
  });

  const cashTransaction = yup.object({
    type: yup.string().oneOf(["INCOME", "EXPENSE"]).required(t("validation.required")),
    amount: yup
      .number()
      .transform((value, original) => (original === "" ? undefined : value))
      .typeError(t("validation.invalidNumber"))
      .moreThan(0, t("validation.invalidNumber"))
      .required(t("validation.required")),
    currency: yup.string().required(t("validation.required")),
    datetime: yup.string().nullable().required(t("validation.dateRequired")),
    category_guid: yup.string().nullable(),
    receiver_opr_guid: yup.string().nullable(),
    description: yup.string().nullable(),
    giver: yup.string().nullable().max(255),
    receiver: yup.string().nullable().max(255),
    company: yup.string().nullable().max(255),
  });

  const addCategory = yup.object({
    name_tk: yup
      .string()
      .trim()
      .required(t("validation.required") || "Hökman girizilmeli"),
    name_ru: stringOptionalValidSchema(),
    name_en: stringOptionalValidSchema(),
  });

  const editCategory = yup.object({
    guid: guidRequiredValidSchema(),
    name_tk: yup
      .string()
      .trim()
      .required(t("validation.required") || "Hökman girizilmeli"),
    name_ru: stringOptionalValidSchema(),
    name_en: stringOptionalValidSchema(),
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
    salary,
    addOffice,
    editOffice,
    addDepartment,
    editDepartment,
    addPosition,
    editPosition,
    addCategory,
    editCategory,
    cashTransaction,
    editTranslator,
    addTask,
    editTask,
  };
  }, [
    t,
    passwordRequiredValidSchema,
    phoneNumberOptionalValidSchema,
    phoneNumberRequiredValidSchema,
    stringOptionalValidSchema,
    stringRequiredValidSchema,
    guidRequiredValidSchema,
  ]);
};



