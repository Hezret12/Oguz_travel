import * as yup from 'yup';
import { useLocale } from '../hooks/useLocale';

export function useValidSchmsConsts() {
  const { t } = useLocale();

  // Name required
  const nameReqValidSchema = yup.object({
    tk: yup.string().required(t('required')).min(3, t('min3Chars')).max(50, t('max50Chars')),
    ru: yup.string().required(t('required')).min(3, t('min3Chars')).max(50, t('max50Chars')),
  });

  // Description optional
  const descOptValidSchema = yup.object({
    tk: yup.string().notRequired(),
    ru: yup.string().notRequired(),
  });

  // Description required
  const descReqValidSchema = yup.object({
    tk: yup.string().required(t('required')),
    ru: yup.string().required(t('required')),
  });

  // Number optional
  const numOptValidSchema = yup.string().matches(/^\d+$/, t('onlyNums')).notRequired();

  // Number required
  const numReqValidSchema = yup
    .string()
    .matches(/^\d+(\.\d+)?$/, t('onlyNums'))
    .required(t('required'))
    .max(10, t('max10Digs'));

  // Number with . required
  const numWithDotReqValidSchema = yup
    .string()
    .matches(/^\d+(\.\d+)?$/, t('onlyNums'))
    .required(t('required'))
    .max(10, t('max10Digs'));

  // Number with . optional
  const numWithDotOptValidSchema = yup
    .string()
    .matches(/^\d+(\.\d+)?$/, t('onlyNums'))
    .notRequired()
    .max(10, t('max10Digs'));

  // Guid required
  const guidReqValidSchema = yup.string().required(t('required'));

  // Code required
  const codeReqValidSchema = yup
    .string()
    .required(t('required'))
    .max(20, t('max20Chars'))
    .matches(/^[A-Za-z\s]+$/, t('onlyLetters'));

  // Contact optional
  const contOptValidSchema = yup
    .object({
      name: yup.string().notRequired(),
      phone: yup
        .string()
        .transform((value) => (value === '' ? null : value))
        .nullable()
        .matches(/^(61|62|63|64|65|71|12)\d{6}$/, t('invalidPhone')),
    })
    .notRequired();

  const numrequired = yup
    .number()
    .min(0, '0-dan uly bolmaly')
    .max(1000, '1000-den kiçi bolmaly')
    .required('Hökman dolduryp geçiň')
    .typeError('Dogry sany giriziň');

  return {
    numrequired,
    nameReqValidSchema,
    descOptValidSchema,
    guidReqValidSchema,
    numOptValidSchema,
    descReqValidSchema,
    numReqValidSchema,
    codeReqValidSchema,
    contOptValidSchema,
    numWithDotReqValidSchema,
    numWithDotOptValidSchema,
  };
}
