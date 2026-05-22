import { z } from 'zod';

export const registrationSchema = z.object({
  // Basic Info
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  gender: z.enum(['bride', 'groom'], {
    errorMap: () => ({ message: 'Please select your gender' }),
  }),
  dateOfBirth: z
    .string()
    .refine((date) => {
      const age = new Date().getFullYear() - new Date(date).getFullYear();
      return age >= 18 && age <= 100;
    }, 'You must be between 18 and 100 years old'),
  
  // Physical Info
  height: z
    .string()
    .refine((h) => /^\d+'\d+"$/.test(h) || /^[0-9.]+\s*cm$/.test(h), 'Please enter height in format (e.g., 5\'10" or 178cm)'),
  
  // Location
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters'),
  district: z
    .string()
    .min(2, 'District must be at least 2 characters')
    .max(50, 'District must be less than 50 characters'),
  state: z
    .string()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must be less than 50 characters'),
  country: z.string().default('India'),

  // Professional & Education
  education: z
    .string()
    .min(1, 'Please select education level'),
  profession: z
    .string()
    .min(2, 'Profession must be at least 2 characters')
    .max(100, 'Profession must be less than 100 characters'),
  salary: z
    .string()
    .min(1, 'Please select salary range'),
  
  // Community & Culture
  community: z
    .string()
    .min(1, 'Please select community'),
  
  // Contact
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'),
  
  // Personal
  aboutMe: z
    .string()
    .min(10, 'About me must be at least 10 characters')
    .max(500, 'About me must be less than 500 characters')
    .optional()
    .nullable(),
  
  // Family
  fatherName: z
    .string()
    .min(2, 'Father name must be at least 2 characters')
    .max(50, 'Father name must be less than 50 characters')
    .optional()
    .nullable(),
  motherName: z
    .string()
    .min(2, 'Mother name must be at least 2 characters')
    .max(50, 'Mother name must be less than 50 characters')
    .optional()
    .nullable(),
  brothers: z
    .number()
    .int()
    .min(0, 'Cannot have negative brothers')
    .default(0),
  sisters: z
    .number()
    .int()
    .min(0, 'Cannot have negative sisters')
    .default(0),
  familyStatus: z
    .string()
    .optional()
    .nullable(),
  familyValues: z
    .string()
    .optional()
    .nullable(),
  
  // Expectations
  expectationAge: z
    .object({
      min: z.number().int().min(18, 'Minimum age must be 18').default(18),
      max: z.number().int().max(100, 'Maximum age must be 100').default(50),
    })
    .refine((data) => data.min <= data.max, {
      message: 'Minimum age must be less than maximum age',
      path: ['min'],
    })
    .optional(),
  expectationHeight: z
    .string()
    .optional()
    .nullable(),
  expectationEducation: z
    .string()
    .optional()
    .nullable(),
  expectationProfession: z
    .string()
    .optional()
    .nullable(),
  expectationCommunity: z
    .boolean()
    .default(true),
  
  // Agreement
  agreedToTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  agreedToPrivacy: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must agree to the privacy policy',
    }),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Step definitions for the wizard
export const registrationSteps = [
  {
    id: 'basic-info',
    label: 'Basic Info',
    fields: ['firstName', 'lastName', 'gender', 'dateOfBirth'],
  },
  {
    id: 'physical',
    label: 'Physical Details',
    fields: ['height'],
  },
  {
    id: 'location',
    label: 'Location',
    fields: ['city', 'district', 'state'],
  },
  {
    id: 'professional',
    label: 'Professional',
    fields: ['education', 'profession', 'salary'],
  },
  {
    id: 'community',
    label: 'Community',
    fields: ['community'],
  },
  {
    id: 'contact',
    label: 'Contact',
    fields: ['email', 'phoneNumber'],
  },
  {
    id: 'personal',
    label: 'About You',
    fields: ['aboutMe'],
  },
  {
    id: 'family',
    label: 'Family',
    fields: ['fatherName', 'motherName', 'brothers', 'sisters', 'familyStatus', 'familyValues'],
  },
  {
    id: 'expectations',
    label: 'Expectations',
    fields: ['expectationAge', 'expectationHeight', 'expectationEducation', 'expectationProfession', 'expectationCommunity'],
  },
  {
    id: 'agreement',
    label: 'Agreement',
    fields: ['agreedToTerms', 'agreedToPrivacy'],
  },
];
