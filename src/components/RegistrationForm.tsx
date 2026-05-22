import { useState, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { registrationSchema, registrationSteps, type RegistrationFormData } from '@/lib/registration.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

import { en } from '@/i18n/en';
import { ta } from '@/i18n/ta';

interface RegistrationFormProps {
  onSuccess?: () => void;
  onSubmit?: (data: RegistrationFormData) => Promise<void>;
  language?: 'en' | 'ta';
}

const translations = { en, ta };

export function RegistrationForm({
  onSuccess,
  onSubmit,
  language = 'en',
}: RegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const t = translations[language].registration;

  const form = useForm<RegistrationFormData>({
    validatorAdapter: zodValidator(),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: undefined as any,
      dateOfBirth: '',
      height: '',
      city: '',
      district: '',
      state: '',
      country: 'India',
      education: '',
      profession: '',
      salary: '',
      community: '',
      email: '',
      phoneNumber: '',
      aboutMe: '',
      fatherName: '',
      motherName: '',
      brothers: 0,
      sisters: 0,
      familyStatus: '',
      familyValues: '',
      expectationAge: { min: 18, max: 50 },
      expectationHeight: '',
      expectationEducation: '',
      expectationProfession: '',
      expectationCommunity: true,
      agreedToTerms: false,
      agreedToPrivacy: false,
    },
    onSubmit: async ({ value }) => {
      setSubmitting(true);
      try {
        if (onSubmit) {
          await onSubmit(value);
        }
        toast.success(t.success);
        onSuccess?.();
      } catch (error) {
        console.error('Registration error:', error);
        toast.error(error instanceof Error ? error.message : t.error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const currentStepData = registrationSteps[currentStep];
  const totalSteps = registrationSteps.length;

  const canGoNext = useMemo(() => {
    const fieldsToValidate = currentStepData?.fields || [];
    return fieldsToValidate.every((field) => {
      const fieldValue = form.getFieldValue(field as any);
      if (typeof fieldValue === 'string') return fieldValue.trim().length > 0;
      if (typeof fieldValue === 'boolean') return fieldValue;
      if (typeof fieldValue === 'number') return fieldValue !== undefined;
      if (typeof fieldValue === 'object' && fieldValue !== null) {
        return Object.values(fieldValue).every((v) => v !== undefined && v !== '');
      }
      return fieldValue !== undefined && fieldValue !== '';
    });
  }, [currentStep, form]);

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await form.handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-display text-maroon-deep">{t.title}</h2>
          <p className="text-sm text-maroon/60">
            {t.breadcrumb.replace('{current}', `${currentStep + 1}`).replace('{total}', `${totalSteps}`)}
          </p>
        </div>
        
        {/* Step indicator bar */}
        <div className="w-full h-2 bg-gold/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-saffron to-gold"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Form content */}
      <AnimatePresence mode="wait">
        <motion.form
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
          className="space-y-6"
        >
          {/* Step content based on current step */}
          <StepContent
            step={currentStep}
            form={form}
            t={t}
            language={language}
            translations={translations}
          />

          {/* Action buttons */}
          <div className="flex gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || submitting}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t.previous}
            </Button>
            <Button
              type="submit"
              disabled={submitting || !canGoNext}
              className="flex-1 bg-gradient-royal hover:shadow-gold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {currentStep === totalSteps - 1 ? t.submitting : t.next}
                </>
              ) : (
                <>
                  {currentStep === totalSteps - 1 ? t.submit : t.next}
                  {currentStep < totalSteps - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </AnimatePresence>
    </div>
  );
}

interface StepContentProps {
  step: number;
  form: any;
  t: any;
  language: string;
  translations: any;
}

function StepContent({ step, form, t, language, translations }: StepContentProps) {
  switch (step) {
    case 0: // Basic Info
      return (
        <div className="space-y-6">
          <FormField
            form={form}
            name="firstName"
            label={t.firstName}
            placeholder="John"
            required
          />
          <FormField
            form={form}
            name="lastName"
            label={t.lastName}
            placeholder="Doe"
            required
          />
          <FormFieldSelect
            form={form}
            name="gender"
            label={t.gender}
            options={[
              { value: 'groom', label: t.groom },
              { value: 'bride', label: t.bride },
            ]}
            required
          />
          <FormField
            form={form}
            name="dateOfBirth"
            label={t.dateOfBirth}
            type="date"
            required
          />
        </div>
      );
    case 1: // Physical
      return (
        <div className="space-y-6">
          <FormField
            form={form}
            name="height"
            label={t.height}
            placeholder={t.heightPlaceholder}
            required
          />
        </div>
      );
    case 2: // Location
      return (
        <div className="space-y-6">
          <FormField
            form={form}
            name="city"
            label={t.city}
            placeholder="Chennai"
            required
          />
          <FormField
            form={form}
            name="district"
            label={t.district}
            placeholder="Chennai"
            required
          />
          <FormField
            form={form}
            name="state"
            label={t.state}
            placeholder="Tamil Nadu"
            required
          />
        </div>
      );
    case 3: // Professional
      return (
        <div className="space-y-6">
          <FormFieldSelect
            form={form}
            name="education"
            label={t.education}
            options={Object.entries(t.educationOptions).map(([key, value]: any) => ({
              value: key,
              label: value,
            }))}
            required
          />
          <FormField
            form={form}
            name="profession"
            label={t.profession}
            placeholder="Software Engineer"
            required
          />
          <FormFieldSelect
            form={form}
            name="salary"
            label={t.salary}
            options={Object.entries(t.salaryOptions).map(([key, value]: any) => ({
              value: key,
              label: value,
            }))}
            required
          />
        </div>
      );
    case 4: // Community
      return (
        <div className="space-y-6">
          <FormField
            form={form}
            name="community"
            label={t.community}
            placeholder="Nagarathar"
            required
          />
        </div>
      );
    case 5: // Contact
      return (
        <div className="space-y-6">
          <FormField
            form={form}
            name="email"
            label={t.email}
            type="email"
            placeholder="you@example.com"
            required
          />
          <FormField
            form={form}
            name="phoneNumber"
            label={t.phoneNumber}
            type="tel"
            placeholder="1234567890"
            required
          />
        </div>
      );
    case 6: // Personal
      return (
        <div className="space-y-6">
          <FormFieldTextarea
            form={form}
            name="aboutMe"
            label={t.aboutMe}
            placeholder={t.aboutMePlaceholder}
          />
        </div>
      );
    case 7: // Family
      return (
        <div className="space-y-6">
          <FormField
            form={form}
            name="fatherName"
            label={t.fatherName}
            placeholder="Father's name"
          />
          <FormField
            form={form}
            name="motherName"
            label={t.motherName}
            placeholder="Mother's name"
          />
          <FormFieldNumber
            form={form}
            name="brothers"
            label={t.brothers}
          />
          <FormFieldNumber
            form={form}
            name="sisters"
            label={t.sisters}
          />
          <FormField
            form={form}
            name="familyStatus"
            label={t.familyStatus}
            placeholder="e.g., Business, Service"
          />
          <FormField
            form={form}
            name="familyValues"
            label={t.familyValues}
            placeholder="e.g., Traditional, Modern"
          />
        </div>
      );
    case 8: // Expectations
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormFieldNumber
              form={form}
              name="expectationAge.min"
              label={`${t.expectationAge} - ${t.expectationMin}`}
            />
            <FormFieldNumber
              form={form}
              name="expectationAge.max"
              label={`${t.expectationAge} - ${t.expectationMax}`}
            />
          </div>
          <FormField
            form={form}
            name="expectationHeight"
            label={t.expectationHeight}
            placeholder={t.heightPlaceholder}
          />
          <FormField
            form={form}
            name="expectationEducation"
            label={t.expectationEducation}
            placeholder="e.g., Bachelor's or higher"
          />
          <FormField
            form={form}
            name="expectationProfession"
            label={t.expectationProfession}
            placeholder="e.g., Doctor, Engineer"
          />
          <FormFieldCheckbox
            form={form}
            name="expectationCommunity"
            label={t.expectationCommunity}
          />
        </div>
      );
    case 9: // Agreement
      return (
        <div className="space-y-6">
          <FormFieldCheckbox
            form={form}
            name="agreedToTerms"
            label={t.agreedToTerms}
          />
          <FormFieldCheckbox
            form={form}
            name="agreedToPrivacy"
            label={t.agreedToPrivacy}
          />
        </div>
      );
    default:
      return null;
  }
}

interface FormFieldProps {
  form: any;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

function FormField({
  form,
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
}: FormFieldProps) {
  return (
    <form.Field
      name={name as any}
      children={(field: any) => (
        <div className="space-y-2">
          <Label htmlFor={name} className="text-sm font-semibold text-maroon">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            className={cn(
              'border-gold/30 focus:border-saffron focus:ring-saffron/30',
              field.state.meta.errors.length > 0 && 'border-red-500 focus:ring-red-500/30'
            )}
          />
          {field.state.meta.errors.length > 0 && (
            <p className="text-xs text-red-500">{field.state.meta.errors[0]}</p>
          )}
        </div>
      )}
    />
  );
}

function FormFieldSelect({
  form,
  name,
  label,
  options,
  required = false,
}: Omit<FormFieldProps, 'type' | 'placeholder'> & {
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <form.Field
      name={name as any}
      children={(field: any) => (
        <div className="space-y-2">
          <Label htmlFor={name} className="text-sm font-semibold text-maroon">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <Select value={field.state.value} onValueChange={field.handleChange}>
            <SelectTrigger id={name} className="border-gold/30 focus:border-saffron">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.state.meta.errors.length > 0 && (
            <p className="text-xs text-red-500">{field.state.meta.errors[0]}</p>
          )}
        </div>
      )}
    />
  );
}

function FormFieldTextarea({
  form,
  name,
  label,
  placeholder,
  required = false,
}: Omit<FormFieldProps, 'type'>) {
  return (
    <form.Field
      name={name as any}
      children={(field: any) => (
        <div className="space-y-2">
          <Label htmlFor={name} className="text-sm font-semibold text-maroon">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id={name}
            placeholder={placeholder}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            className="border-gold/30 focus:border-saffron focus:ring-saffron/30 min-h-24"
          />
          {field.state.meta.errors.length > 0 && (
            <p className="text-xs text-red-500">{field.state.meta.errors[0]}</p>
          )}
        </div>
      )}
    />
  );
}

function FormFieldNumber({
  form,
  name,
  label,
  required = false,
}: Omit<FormFieldProps, 'type' | 'placeholder'>) {
  return (
    <form.Field
      name={name as any}
      children={(field: any) => (
        <div className="space-y-2">
          <Label htmlFor={name} className="text-sm font-semibold text-maroon">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={name}
            type="number"
            min="0"
            value={field.state.value || ''}
            onChange={(e) => field.handleChange(parseInt(e.target.value, 10) || 0)}
            onBlur={field.handleBlur}
            className="border-gold/30 focus:border-saffron focus:ring-saffron/30"
          />
          {field.state.meta.errors.length > 0 && (
            <p className="text-xs text-red-500">{field.state.meta.errors[0]}</p>
          )}
        </div>
      )}
    />
  );
}

function FormFieldCheckbox({
  form,
  name,
  label,
}: Omit<FormFieldProps, 'type' | 'placeholder' | 'required'>) {
  return (
    <form.Field
      name={name as any}
      children={(field: any) => (
        <div className="flex items-center space-x-3">
          <Checkbox
            id={name}
            checked={field.state.value}
            onCheckedChange={field.handleChange}
          />
          <Label htmlFor={name} className="text-sm font-medium text-maroon cursor-pointer">
            {label}
          </Label>
          {field.state.meta.errors.length > 0 && (
            <p className="text-xs text-red-500">{field.state.meta.errors[0]}</p>
          )}
        </div>
      )}
    />
  );
}

function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
