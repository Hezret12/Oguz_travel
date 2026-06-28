import { z } from 'zod';
import { getValidationRules } from './rules';

/**
 * Creates page-specific Zod validation schemas.
 * Can be instantiated with a translation function `t` for full multi-language (i18n) support.
 * 
 * @param {Function} t - i18next translation function
 */
export const createValidationSchemas = (t) => {
  const rules = getValidationRules(t);

  return {
    // -----------------------------------------
    // 1. LOGIN PAGE VALIDATION SCHEMA
    // -----------------------------------------
    loginSchema: z.object({
      email: rules.email,
      password: rules.password(6),
      role: z.enum(['user', 'agent', 'admin']).default('user'),
    }),

    // -----------------------------------------
    // 2. REGISTER / SIGN UP PAGE VALIDATION SCHEMA
    // -----------------------------------------
    registerSchema: z.object({
      fullName: rules.requiredString(t('fields.fullName', 'Ad Soyad')),
      email: rules.email,
      phone: rules.phone,
      password: rules.password(8),
      confirmPassword: z.string().min(1, t('validation.confirmPasswordRequired', 'Şifre tekrarı zorunludur')),
    }).refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordsDoNotMatch', 'Şifreler birbiriyle eşleşmiyor'),
      path: ['confirmPassword'], // Show error on the confirmPassword field
    }),

    // -----------------------------------------
    // 3. PASSENGER INFORMATION SCHEMA (Common for Travel App)
    // -----------------------------------------
    passengerSchema: z.object({
      firstName: rules.requiredString(t('fields.firstName', 'Ad')),
      lastName: rules.requiredString(t('fields.lastName', 'Soyad')),
      gender: z.enum(['male', 'female', 'other'], {
        errorMap: () => ({ message: t('validation.genderRequired', 'Lütfen cinsiyet seçiniz') })
      }),
      nationality: z.enum(['TR', 'OTHER']).default('TR'),
      
      // Dynamic validation: TC No is required for TR citizens, Passport for others
      identityNumber: z.string().optional(),
      passportNumber: z.string().optional(),
    }).superRefine((data, ctx) => {
      const rulesInstance = getValidationRules(t);

      if (data.nationality === 'TR') {
        if (!data.identityNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.tcNoRequired', 'T.C. Kimlik Numarası zorunludur'),
            path: ['identityNumber'],
          });
        } else {
          // Perform algorithmic check
          const tcResult = rulesInstance.tcNo.safeParse(data.identityNumber);
          if (!tcResult.success) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: tcResult.error.errors[0].message,
              path: ['identityNumber'],
            });
          }
        }
      } else {
        if (!data.passportNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.passportRequired', 'Pasaport numarası zorunludur'),
            path: ['passportNumber'],
          });
        } else {
          const passportResult = rulesInstance.passport.safeParse(data.passportNumber);
          if (!passportResult.success) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: passportResult.error.errors[0].message,
              path: ['passportNumber'],
            });
          }
        }
      }
    }),

    // -----------------------------------------
    // 4. CONTACT / SUPPORT PAGE VALIDATION SCHEMA
    // -----------------------------------------
    contactSchema: z.object({
      fullName: rules.requiredString(t('fields.fullName', 'Ad Soyad')),
      email: rules.email,
      phone: rules.phone,
      subject: rules.requiredString(t('fields.subject', 'Konu')),
      message: rules.requiredString(t('fields.message', 'Mesaj'))
        .min(10, t('validation.messageMin', 'Mesajınız en az 10 karakter olmalıdır')),
    }),

    // -----------------------------------------
    // 5. FLIGHT/HOTEL BOOKING SEARCH SCHEMA
    // -----------------------------------------
    bookingSearchSchema: z.object({
      from: rules.requiredString(t('fields.departure', 'Kalkış Noktası')),
      to: rules.requiredString(t('fields.destination', 'Varış Noktası')),
      departureDate: rules.requiredString(t('fields.departureDate', 'Gidiş Tarihi')),
      returnDate: z.string().optional(),
      passengers: z.number().min(1, t('validation.minPassengers', 'En az 1 yolcu seçilmelidir')).max(9),
    }).refine((data) => {
      if (!data.returnDate) return true;
      // Ensure return date is equal or after departure date
      return new Date(data.returnDate) >= new Date(data.departureDate);
    }, {
      message: t('validation.invalidReturnDate', 'Dönüş tarihi gidiş tarihinden önce olamaz'),
      path: ['returnDate'],
    }),
  };
};

/**
 * Static Validation Schemas
 * Standard schemas preloaded with default Turkish error messages.
 * Ideal for components that do not require multi-language translations.
 */
export const validationSchemas = createValidationSchemas((key, fallback) => fallback);
