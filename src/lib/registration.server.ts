import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { registrationSchema, type RegistrationFormData } from '@/lib/registration.schema';

export const registerUser = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => registrationSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      // Validate the data with Zod schema (already validated by inputValidator)
      const validated = data as RegistrationFormData;

      // Here you would:
      // 1. Create a user in Supabase Auth
      // 2. Store the profile data in Supabase database
      // 3. Send verification email/OTP
      // For now, we'll just validate and return success

      console.log('Registration data validated:', validated);

      // TODO: Implement Supabase integration
      // const { data: authData, error: authError } = await supabase.auth.signUp({
      //   email: validated.email,
      //   password: generateSecurePassword(),
      //   options: {
      //     data: {
      //       firstName: validated.firstName,
      //       lastName: validated.lastName,
      //     },
      //   },
      // });

      return {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
      };
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
        };
      }
      throw new Error('Failed to register. Please try again.');
    }
  });

export const validateEmail = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.string().email().parse(input))
  .handler(async ({ data: email }) => {
    try {
      const emailSchema = registrationSchema.shape.email;
      const validated = emailSchema.parse(email);
      
      // TODO: Check if email exists in Supabase
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .select('id')
      //   .eq('email', validated)
      //   .single();

      return {
        valid: true,
        available: true, // TODO: Set based on database check
      };
    } catch (error) {
      return {
        valid: false,
        available: false,
        message: error instanceof Error ? error.message : 'Invalid email',
      };
    }
  });

export const validatePhoneNumber = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.string().regex(/^[0-9]{10}$/).parse(input))
  .handler(async ({ data: phoneNumber }) => {
    try {
      const phoneSchema = registrationSchema.shape.phoneNumber;
      const validated = phoneSchema.parse(phoneNumber);

      // TODO: Check if phone exists in Supabase
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .select('id')
      //   .eq('phone_number', validated)
      //   .single();

      return {
        valid: true,
        available: true, // TODO: Set based on database check
      };
    } catch (error) {
      return {
        valid: false,
        available: false,
        message: error instanceof Error ? error.message : 'Invalid phone number',
      };
    }
  });
