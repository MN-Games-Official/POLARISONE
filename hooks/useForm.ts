'use client';

import { useState, useCallback } from 'react';
import {
  useForm as useReactHookForm,
  type UseFormProps,
  type FieldValues,
  type UseFormReturn,
  type SubmitHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';

interface UseEnhancedFormOptions<T extends FieldValues>
  extends Omit<UseFormProps<T>, 'resolver'> {
  schema: ZodType<T>;
  onSubmit: SubmitHandler<T>;
}

interface UseEnhancedFormReturn<T extends FieldValues>
  extends UseFormReturn<T> {
  isSubmitting: boolean;
  submitError: string | null;
  handleFormSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function useEnhancedForm<T extends FieldValues>(
  options: UseEnhancedFormOptions<T>
): UseEnhancedFormReturn<T> {
  const { schema, onSubmit, ...formOptions } = options;

  const form = useReactHookForm<T>({
    ...formOptions,
    resolver: zodResolver(schema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Wraps onSubmit to track submission state and capture async errors
  // from the caller's onSubmit handler (e.g. API failures).
  const wrappedSubmit: SubmitHandler<T> = useCallback(
    async (data, event) => {
      setSubmitError(null);
      setIsSubmitting(true);
      try {
        await onSubmit(data, event);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setSubmitError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit]
  );

  const handleFormSubmit = useCallback(
    (e?: React.BaseSyntheticEvent) => form.handleSubmit(wrappedSubmit)(e),
    [form, wrappedSubmit]
  );

  return {
    ...form,
    isSubmitting,
    submitError,
    handleFormSubmit,
  };
}
