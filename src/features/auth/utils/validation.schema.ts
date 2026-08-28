import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .refine(
      (value) =>
        value.endsWith('@auroramy.com'),
      {
        message:
          'Email must end with @auroramy.com'
      }
    ),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(
      8,
      'Password must be at least 8 characters'
    )
})

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .endsWith(
      '@auroramy.com',
      'Email must end with @auroramy.com'
    ),

  password: z
    .string()
    .min(
      8,
      'Password must be at least 8 characters'
    ),

  confirmPassword: z
    .string()
})
.refine(
  (data) =>
    data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
)
