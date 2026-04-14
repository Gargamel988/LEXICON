import * as z from 'zod';

/**
 * Ortak Şifre Kuralları
 * - En az 6 karakter
 * - En az bir büyük harf
 * - En az bir küçük harf
 * - En az bir rakam
 * - En az bir özel karakter (@$!%*?&)
 */
export const passwordSchema = z.string()
  .min(6, 'Şifre en az 6 karakter olmalıdır')
  .regex(/[A-Z]/, 'En az bir büyük harf içermelidir')
  .regex(/[a-z]/, 'En az bir küçük harf içermelidir')
  .regex(/[0-9]/, 'En az bir rakam içermelidir')
  .regex(/[^A-Za-z0-9]/, 'En az bir özel karakter (@$!%*?&) içermelidir');

/**
 * Kayıt Ol Şeması
 */
export const registerSchema = z.object({
  username: z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: passwordSchema,
  terms: z.boolean().refine(val => val === true, 'Koşulları kabul etmelisiniz'),
});

/**
 * Giriş Yap Şeması
 */
export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(1, 'Şifre gereklidir'), // Giriş yaparken çok katı kurala gerek yok, login başarısızlığı zaten dönecektir
});

export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
