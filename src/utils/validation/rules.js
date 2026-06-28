import { z } from 'zod';

// Common Regular Expressions
export const REGEX_PATTERNS = {
  phone: /^(\+?90|0)?5[0-9]{9}$/,
  tcNo: /^[1-9]{1}[0-9]{9}[02468]{1}$/,
  passport: /^[A-Z0-9]{7,9}$/,
  numbersOnly: /^[0-9]+$/,
};

/**
 * Advanced T.C. Kimlik Number Algorithm Checker
 */
export const isValidTcNo = (value) => {
  if (!value || value.length !== 11) return false;
  
  const digits = value.split('').map(Number);
  
  // Sum of odd digits (1, 3, 5, 7, 9) and even digits (2, 4, 6, 8)
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  
  // 10th digit validation
  const tenthDigit = (oddSum * 7 - evenSum) % 10;
  if (tenthDigit !== digits[9]) return false;
  
  // 11th digit validation
  const totalSum = digits.slice(0, 10).reduce((acc, curr) => acc + curr, 0);
  const eleventhDigit = totalSum % 10;
  if (eleventhDigit !== digits[10]) return false;
  
  return true;
};

/**
 * Creates reusable Zod validation primitives (building blocks)
 * Can be instantiated with a translation function `t` for full i18n support.
 */
export const getValidationRules = (t = (key, fallback) => fallback) => {
  return {
    // Required String Helper
    requiredString: (fieldName) =>
      z.string({ required_error: t('validation.required', `${fieldName || 'Bu alan'} zorunludur`) })
       .trim()
       .min(1, t('validation.required', `${fieldName || 'Bu alan'} zorunludur`)),

    // Required Number Helper
    requiredNumber: (fieldName) =>
      z.number({ 
        required_error: t('validation.requiredNumber', `${fieldName || 'Bu alan'} rakam olmalıdır`),
        invalid_type_error: t('validation.invalidNumber', 'Lütfen geçerli bir sayı giriniz')
      }),

    // Reusable Email Rule
    email: z
      .string()
      .min(1, t('validation.emailRequired', 'E-posta adresi zorunludur'))
      .email(t('validation.emailInvalid', 'Geçersiz e-posta adresi girdiniz')),

    // Reusable Password Rule (Factory)
    password: (minLength = 6) =>
      z.string()
       .min(1, t('validation.passwordRequired', 'Şifre alanı zorunludur'))
       .min(minLength, t('validation.passwordMin', `Şifre en az ${minLength} karakter olmalıdır`)),

    // Reusable Phone Rule
    phone: z
      .string()
      .min(1, t('validation.phoneRequired', 'Telefon numarası zorunludur'))
      .regex(REGEX_PATTERNS.phone, t('validation.phoneInvalid', 'Geçersiz telefon numarası (örn: 5xx xxx xx xx)')),

    // Reusable T.C. Kimlik Rule
    tcNo: z
      .string()
      .min(1, t('validation.tcNoRequired', 'T.C. Kimlik Numarası zorunludur'))
      .refine(isValidTcNo, {
        message: t('validation.tcNoInvalid', 'Geçersiz T.C. Kimlik Numarası algoritmik kontrolü başarısız'),
      }),

    // Reusable Passport Rule
    passport: z
      .string()
      .min(1, t('validation.passportRequired', 'Pasaport numarası zorunludur'))
      .regex(REGEX_PATTERNS.passport, t('validation.passportInvalid', 'Pasaport geçersiz (A-Z ve rakamlar)')),
  };
};
